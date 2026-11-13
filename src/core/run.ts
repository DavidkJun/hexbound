import type { Content } from './content';
import { startFight, type Battle, type Resources } from './fight';
import { sameHex, type Hex } from './hex';
import { isRoute, locationAt, see, startLevel, stepCost } from './map';
import { fightReward, offerCards, type FightKind } from './rewards';
import type { RngState } from './rng';
import type { FightSource, GameState, Location, Phase, Reward, Run } from './state';

/**
 * A run across the map, its fights and its rewards: plan/HexBound_DD.md 4.1–4.5. Each function
 * takes the run with its random generator and returns the next one, unchanged if the action
 * doesn't fit the current phase.
 */
export interface RunStep {
  readonly run: Run;
  readonly rng: RngState;
}

/** A new run on the first level, with the starter deck and the starting numbers of DD 4.9. */
export function startRun(content: Content, state: GameState): GameState {
  const map = content.catalogue.levels[0];
  if (!map) return state;
  const { run: start } = content.numbers;
  const level = startLevel(content, map, state.rng);
  return {
    ...state,
    rng: level.rng,
    run: {
      health: start.health,
      maxHealth: start.maxHealth,
      gold: start.gold,
      keys: 0,
      lives: start.lives,
      deck: starterDeck(content),
      levelIndex: 0,
      tutorialDone: false,
      level: level.value,
      phase: { kind: 'map' },
    },
  };
}

/** Every starter card, as many times as its `copies`. */
export function starterDeck({ catalogue }: Content): string[] {
  return [...catalogue.cards.values()].flatMap(({ id, copies }) =>
    Array<string>(copies ?? 0).fill(id),
  );
}

// The map

/** Replaces the planned route. An empty route clears it; a route that isn't a chain is ignored. */
export function planRoute(step: RunStep, route: readonly Hex[]): RunStep {
  const { run } = step;
  if (run.phase.kind !== 'map' || !isRoute(run.level.playerAt, route)) return step;
  return { ...step, run: { ...run, level: { ...run.level, route } } };
}

/**
 * Walks the planned route. The walk stops on entering an unresolved location, which resolves it;
 * the rest of the route is kept. Stepping onto the boss asks first.
 */
export function go(content: Content, step: RunStep): RunStep {
  if (step.run.phase.kind !== 'map') return step;
  let current = step;
  for (const next of step.run.level.route) {
    if (sameHex(next, current.run.level.map.boss.at)) {
      return withPhase(current, { kind: 'bossConfirm' });
    }
    current = walkOnto(content, current, next);
    if (current.run.phase.kind === 'dead') return current;
    const location = locationAt(current.run.level, next);
    if (location && !location.resolved) return enter(content, current, location);
  }
  return current;
}

/** "Fight the boss now?" Yes: the step onto the boss tile, then the fight. */
export function confirmBoss(content: Content, step: RunStep): RunStep {
  if (step.run.phase.kind !== 'bossConfirm') return step;
  const { boss } = step.run.level.map;
  const walked = walkOnto(content, withPhase(step, { kind: 'map' }), boss.at);
  if (walked.run.phase.kind === 'dead') return walked;
  return beginFight(content, walked, 'boss', boss.enemy, boss.at);
}

/** No: the player stays where they are, and the planned route is cleared. */
export function cancelBoss(step: RunStep): RunStep {
  if (step.run.phase.kind !== 'bossConfirm') return step;
  const { run } = step;
  return { ...step, run: { ...run, level: { ...run.level, route: [] }, phase: { kind: 'map' } } };
}

/** One step: food for it, health for the food it can't pay for, and what the player now sees. */
function walkOnto(content: Content, step: RunStep, at: Hex): RunStep {
  const { run } = step;
  const { level } = run;
  const cost = stepCost(content, level.map, level.food, at);
  const health = Math.max(0, run.health - cost.health);
  const walked: Run = {
    ...run,
    health,
    level: see({
      ...level,
      food: level.food - cost.food,
      playerAt: at,
      route: level.route.slice(1),
    }),
  };
  const phase: Phase = health === 0 ? { kind: 'dead', cause: { kind: 'starved' } } : run.phase;
  return { ...step, run: { ...walked, phase } };
}

/** Entering a location always resolves it (DD 4.3, 4.5). */
function enter(content: Content, step: RunStep, location: Location): RunStep {
  switch (location.type) {
    case 'monster':
    case 'elite':
      return location.detail.kind === 'enemy'
        ? beginFight(content, step, location.type, location.detail.enemy, location.at)
        : step;
    case 'chest':
      return openChest(content, step, location);
    case 'locked-chest':
      return openLockedChest(content, step, location);
    // TODO(stage-2): villages, shrines and mystery events. Until then entering one only stops the
    // walk, and the tile stays as it is.
    case 'village':
    case 'shrine':
    case 'mystery':
      return step;
  }
}

/** 10–20 gold, plus a card reward of commons, 3 food or 10 health. */
function openChest(content: Content, step: RunStep, location: Location): RunStep {
  const { detail } = location;
  if (detail.kind !== 'chest') return step;
  const { run } = step;
  const { chest } = content.numbers;
  const cards =
    detail.bonus === 'cards'
      ? offerCards(content, 'chest', step.rng)
      : { value: [], rng: step.rng };
  const food = detail.bonus === 'food' ? chest.food : 0;
  const health = detail.bonus === 'health' ? Math.min(chest.health, run.maxHealth - run.health) : 0;

  const opened: Run = resolveAt(
    {
      ...run,
      gold: run.gold + detail.gold,
      health: run.health + health,
      level: { ...run.level, food: run.level.food + food },
    },
    location.at,
  );
  const reward: Reward = {
    gold: detail.gold,
    keys: 0,
    health,
    food,
    cards: cards.value,
    then: 'map',
  };
  return { run: { ...opened, phase: { kind: 'reward', reward } }, rng: cards.rng };
}

/** Needs a key; without one it does nothing and stays locked, so the player can come back. */
function openLockedChest(content: Content, step: RunStep, location: Location): RunStep {
  const { run } = step;
  if (run.keys === 0) return step;
  // TODO(stage-2): a random blessing the player doesn't own yet, with the shrines.
  const cards = offerCards(content, 'lockedChest', step.rng);
  const reward: Reward = { gold: 0, keys: -1, health: 0, food: 0, cards: cards.value, then: 'map' };
  const opened = resolveAt({ ...run, keys: run.keys - 1 }, location.at);
  return { run: { ...opened, phase: { kind: 'reward', reward } }, rng: cards.rng };
}

// Fights

function beginFight(
  content: Content,
  step: RunStep,
  kind: FightKind,
  enemy: string,
  at: Hex,
): RunStep {
  const { run } = step;
  // The first monster fight of a new run, on level 1, is the tutorial (DD 4.8).
  const first = kind === 'monster' && run.levelIndex === 0 && !run.tutorialDone;
  const tutorial = first ? content.catalogue.tutorial : undefined;
  // TODO(stage-2): Chilled from crossing ice and Rested from a village rest, with the hazards.
  const battle = startFight(content, {
    enemy: tutorial?.enemy ?? enemy,
    deck: run.deck,
    resources: resourcesOf(run),
    rng: step.rng,
    scriptedDraws: tutorial?.drawOrder ?? [],
  });
  const started: Run = {
    ...withResources(run, battle.resources),
    tutorialDone: run.tutorialDone || kind === 'monster',
    phase: { kind: 'fight', fight: battle.fight, source: { kind, at } },
  };
  return { run: started, rng: battle.rng };
}

/** Runs a fight action and moves on when the fight ends: a reward, or death. */
export function inFight(content: Content, step: RunStep, act: (battle: Battle) => Battle): RunStep {
  const { run } = step;
  const { phase } = run;
  if (phase.kind !== 'fight') return step;

  const battle = act({ fight: phase.fight, resources: resourcesOf(run), rng: step.rng });
  if (battle.fight === phase.fight) return step;
  const next: RunStep = { run: withResources(run, battle.resources), rng: battle.rng };
  switch (battle.fight.outcome) {
    case 'ongoing':
      return withPhase(next, { ...phase, fight: battle.fight });
    case 'lost':
      return withPhase(next, {
        kind: 'dead',
        cause: { kind: 'fight', enemy: battle.fight.enemy.id },
      });
    case 'won':
      return winFight(content, next, phase.source);
  }
}

/** Gold, keys and the boss heal now; the card reward next. Winning the boss ends the level. */
function winFight(content: Content, step: RunStep, source: FightSource): RunStep {
  const rolled = fightReward(content, source.kind, step.run.maxHealth, step.rng);
  const { gold, keys, heal, cards } = rolled.value;
  const run = resolveAt(step.run, source.at);
  const health = Math.min(run.maxHealth, run.health + heal);
  const reward: Reward = {
    gold,
    keys,
    health: health - run.health,
    food: 0,
    cards,
    then: source.kind === 'boss' ? 'levelWon' : 'map',
  };
  return {
    run: {
      ...run,
      gold: run.gold + gold,
      keys: run.keys + keys,
      health,
      phase: { kind: 'reward', reward },
    },
    rng: rolled.rng,
  };
}

// Rewards

/** Takes one of the offered cards into the deck. */
export function pickCard(step: RunStep, index: number): RunStep {
  const { phase } = step.run;
  if (phase.kind !== 'reward') return step;
  const card = phase.reward.cards[index];
  if (card === undefined) return step;
  return leave({ ...step, run: { ...step.run, deck: [...step.run.deck, card] } }, phase.reward);
}

/** Skips the card reward, or moves on from a reward with no card to pick. */
export function skipReward(step: RunStep): RunStep {
  const { phase } = step.run;
  return phase.kind === 'reward' ? leave(step, phase.reward) : step;
}

function leave(step: RunStep, reward: Reward): RunStep {
  // TODO(stage-2): after the level is won, the next level, or the score when it was the last.
  return withPhase(step, reward.then === 'levelWon' ? { kind: 'levelWon' } : { kind: 'map' });
}

// Helpers

/** What a fight can change in the run. Food is the level's. */
export function resourcesOf(run: Run): Resources {
  return { health: run.health, maxHealth: run.maxHealth, gold: run.gold, food: run.level.food };
}

function withResources(run: Run, { health, maxHealth, gold, food }: Resources): Run {
  return { ...run, health, maxHealth, gold, level: { ...run.level, food } };
}

function withPhase(step: RunStep, phase: Phase): RunStep {
  return { ...step, run: { ...step.run, phase } };
}

function resolveAt(run: Run, at: Hex): Run {
  const locations = run.level.locations.map((location) =>
    sameHex(location.at, at) ? { ...location, resolved: true } : location,
  );
  return { ...run, level: { ...run.level, locations } };
}
