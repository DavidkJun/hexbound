import type { Effect } from '../data/schema';
import { cardOf, enemyOf, type Content, type Move } from './content';
import { pickWeighted, shuffle, type RngState } from './rng';

/**
 * The combat core: plan/HexBound_DD.md 4.6 and 4.7. Every function takes a battle and returns the
 * next one, so the game logic stays pure and a seed always replays the same fight.
 */

/** The run's resources a fight can change: health by damage, gold and food by card effects. */
export interface Resources {
  readonly health: number;
  readonly maxHealth: number;
  readonly gold: number;
  readonly food: number;
}

/** What both sides of a fight have, all cleared when the fight ends. */
export interface Side {
  readonly block: number;
  readonly strength: number;
  readonly chill: number;
}

export interface FightEnemy extends Side {
  readonly id: string;
  readonly health: number;
  readonly maxHealth: number;
  /** Skips its next move. Freeze doesn't stack. */
  readonly frozen: boolean;
  /** Moves used or skipped so far, which is where a `cycle` pattern is. */
  readonly movesTaken: number;
  /** The id of the move it shows now and does on its turn. */
  readonly intent: string;
}

export interface FightPlayer extends Side {
  readonly energy: number;
}

export interface FightState {
  readonly enemy: FightEnemy;
  readonly player: FightPlayer;
  /** Card ids. The next card drawn is the first. */
  readonly drawPile: readonly string[];
  readonly hand: readonly string[];
  readonly discard: readonly string[];
  readonly exhausted: readonly string[];
  /** 1 on the first player turn. */
  readonly turn: number;
  readonly outcome: 'ongoing' | 'won' | 'lost';
  readonly tutorial: boolean;
}

/** A fight together with the run's resources and random generator, which it uses and changes. */
export interface Battle {
  readonly fight: FightState;
  readonly resources: Resources;
  readonly rng: RngState;
}

export interface FightSetup {
  readonly enemy: string;
  /** The player's deck: card ids, one per card. */
  readonly deck: readonly string[];
  readonly resources: Resources;
  readonly rng: RngState;
  /** Fight modifiers from the map (DD 4.4). */
  readonly chilled?: boolean;
  readonly rested?: boolean;
  /** The tutorial's first draws, in order. The rest of the deck is shuffled under them. */
  readonly scriptedDraws?: readonly string[];
}

/** What the enemy shows above it (DD 4.7 → Intent). */
export interface Intent {
  readonly move: Move;
  /** Damage it will really deal for an attack, else the first effect's amount. */
  readonly value: number | undefined;
  /** The move's other effects, shown as small icons after the value. */
  readonly extras: readonly Effect[];
  readonly frozen: boolean;
}

type ResourceEffect = Extract<
  Effect,
  { type: 'heal' | 'loseHealth' | 'gainFood' | 'loseFood' | 'gainGold' | 'loseGold' }
>;

/** Fight start: the deck shuffled into the draw pile, the modifiers applied, the first turn. */
export function startFight(content: Content, setup: FightSetup): Battle {
  const { numbers } = content;
  const enemy = enemyOf(content, setup.enemy);
  const { scripted, rest } = takeScripted(setup.deck, setup.scriptedDraws ?? []);
  const shuffled = shuffle(setup.rng, rest);

  const fight: FightState = {
    enemy: {
      id: enemy.id,
      health: enemy.health,
      maxHealth: enemy.health,
      block: 0,
      strength: 0,
      chill: 0,
      frozen: false,
      movesTaken: 0,
      intent: '',
    },
    player: {
      block: setup.rested ? numbers.village.restedBlock : 0,
      strength: 0,
      chill: setup.chilled ? numbers.hazards.iceChill : 0,
      energy: 0,
    },
    drawPile: [...scripted, ...shuffled.value],
    hand: [],
    discard: [],
    exhausted: [],
    turn: 0,
    outcome: 'ongoing',
    tutorial: scripted.length > 0,
  };
  return startPlayerTurn(content, { fight, resources: setup.resources, rng: shuffled.rng });
}

/** Plays the card at `handIndex`. Does nothing if the fight is over or energy is short. */
export function playCard(content: Content, battle: Battle, handIndex: number): Battle {
  if (!canPlay(content, battle.fight, handIndex)) return battle;
  const { fight } = battle;
  const id = fight.hand[handIndex] ?? '';
  const card = cardOf(content, id);

  let next = withFight(battle, {
    ...fight,
    hand: fight.hand.filter((_, i) => i !== handIndex),
    player: { ...fight.player, energy: fight.player.energy - card.cost },
  });
  for (const effect of card.effects) {
    next = applyPlayerEffect(content, next, effect);
    if (next.fight.outcome !== 'ongoing') break;
  }

  // After it is played, the card goes to the discard pile, or out of the fight with Exhaust.
  const exhausts = card.effects.some(({ type }) => type === 'exhaust');
  const after = next.fight;
  return withFight(
    next,
    exhausts
      ? { ...after, exhausted: [...after.exhausted, id] }
      : { ...after, discard: [...after.discard, id] },
  );
}

/** Whether the card at `handIndex` can be played now. */
export function canPlay(content: Content, fight: FightState, handIndex: number): boolean {
  const id = fight.hand[handIndex];
  return (
    fight.outcome === 'ongoing' &&
    id !== undefined &&
    cardOf(content, id).cost <= fight.player.energy
  );
}

/** End turn: the hand is discarded and energy lost, the enemy acts, the next turn starts. */
export function endTurn(content: Content, battle: Battle): Battle {
  const { fight } = battle;
  if (fight.outcome !== 'ongoing') return battle;

  const ended = withFight(battle, {
    ...fight,
    hand: [],
    discard: [...fight.discard, ...fight.hand],
    player: { ...fight.player, energy: 0 },
  });
  const afterEnemy = enemyTurn(content, ended);
  return afterEnemy.fight.outcome === 'ongoing' ? startPlayerTurn(content, afterEnemy) : afterEnemy;
}

export function intentOf(content: Content, fight: FightState): Intent {
  const { enemy } = fight;
  const move = moveOf(content, enemy);
  const [main, ...extras] = move.effects;
  let value: number | undefined;
  if (main?.type === 'dealDamage') value = attackDamage(main.amount, enemy);
  else if (main && 'amount' in main) value = main.amount;
  return { move, value, extras, frozen: enemy.frozen };
}

// Turns

/** Player turn steps 1–4 of DD 4.6: block, energy, draw, then the enemy's intent. */
function startPlayerTurn(content: Content, battle: Battle): Battle {
  const { fight } = battle;
  const { player } = fight;
  const started = withFight(battle, {
    ...fight,
    turn: fight.turn + 1,
    player: {
      ...player,
      // On the first turn, block from the fight start (Rested, blessings) is kept.
      block: fight.turn === 0 ? player.block : 0,
      energy: Math.max(0, content.numbers.fight.energyPerTurn - player.chill),
      chill: 0,
    },
  });
  return chooseIntent(content, draw(content, started, content.numbers.fight.cardsPerTurn));
}

function chooseIntent(content: Content, battle: Battle): Battle {
  const { enemy } = battle.fight;
  const { pattern } = enemyOf(content, enemy.id);
  if (pattern.type === 'cycle') {
    const intent = pattern.order[enemy.movesTaken % pattern.order.length] ?? '';
    return withEnemy(battle, { ...enemy, intent });
  }
  const roll = pickWeighted(battle.rng, Object.entries(pattern.weights));
  return { ...withEnemy(battle, { ...enemy, intent: roll.value }), rng: roll.rng };
}

/** Its block resets; it does the move it showed unless frozen; then its Chill goes down by 1. */
function enemyTurn(content: Content, battle: Battle): Battle {
  const enemy = { ...battle.fight.enemy, block: 0 };
  let next = withEnemy(battle, enemy);
  if (enemy.frozen) {
    next = withEnemy(next, { ...enemy, frozen: false });
  } else {
    for (const effect of moveOf(content, enemy).effects) {
      next = applyEnemyEffect(next, effect);
      if (next.fight.outcome !== 'ongoing') return next;
    }
  }
  const after = next.fight.enemy;
  return withEnemy(next, {
    ...after,
    chill: Math.max(0, after.chill - 1),
    movesTaken: after.movesTaken + 1,
  });
}

/** Draws one card at a time: a full hand sends it to the discard pile, an empty pile reshuffles. */
function draw(content: Content, battle: Battle, count: number): Battle {
  let { fight, rng } = battle;
  for (let i = 0; i < count; i++) {
    if (fight.drawPile.length === 0) {
      if (fight.discard.length === 0) break;
      const reshuffled = shuffle(rng, fight.discard);
      rng = reshuffled.rng;
      fight = { ...fight, drawPile: reshuffled.value, discard: [] };
    }
    const [card, ...drawPile] = fight.drawPile;
    if (card === undefined) break;
    fight =
      fight.hand.length < content.numbers.fight.handLimit
        ? { ...fight, drawPile, hand: [...fight.hand, card] }
        : { ...fight, drawPile, discard: [...fight.discard, card] };
  }
  return { ...battle, fight, rng };
}

// Effects. Damage and statuses hit the opponent; everything else is for whoever uses the effect,
// except the run's resources (health, food, gold), which are always the player's.

function applyPlayerEffect(content: Content, battle: Battle, effect: Effect): Battle {
  const { player, enemy } = battle.fight;
  switch (effect.type) {
    case 'dealDamage':
      return hitEnemy(battle, effect.amount + player.strength);
    case 'gainBlock':
      return withPlayer(battle, { ...player, block: player.block + effect.amount });
    case 'gainEnergy':
      return withPlayer(battle, { ...player, energy: player.energy + effect.amount });
    case 'draw':
      return draw(content, battle, effect.amount);
    case 'gainStrength':
      return withPlayer(battle, { ...player, strength: player.strength + effect.amount });
    case 'applyFreeze':
      return withEnemy(battle, { ...enemy, frozen: true });
    case 'applyChill':
      return withEnemy(battle, { ...enemy, chill: enemy.chill + effect.amount });
    case 'exhaust':
      return battle; // playCard moves the card out of the fight once all its effects are done
    case 'heal':
    case 'loseHealth':
    case 'gainFood':
    case 'loseFood':
    case 'gainGold':
    case 'loseGold':
      return applyResourceEffect(battle, effect);
  }
}

function applyEnemyEffect(battle: Battle, effect: Effect): Battle {
  const { player, enemy } = battle.fight;
  switch (effect.type) {
    case 'dealDamage':
      return hitPlayer(battle, attackDamage(effect.amount, enemy));
    case 'gainBlock':
      return withEnemy(battle, { ...enemy, block: enemy.block + effect.amount });
    case 'gainStrength':
      return withEnemy(battle, { ...enemy, strength: enemy.strength + effect.amount });
    case 'applyChill':
      return withPlayer(battle, { ...player, chill: player.chill + effect.amount });
    // Enemies have no energy, hand or deck, and never apply Freeze (the data check refuses it).
    case 'gainEnergy':
    case 'draw':
    case 'applyFreeze':
    case 'exhaust':
      return battle;
    case 'heal':
    case 'loseHealth':
    case 'gainFood':
    case 'loseFood':
    case 'gainGold':
    case 'loseGold':
      return applyResourceEffect(battle, effect);
  }
}

function applyResourceEffect(battle: Battle, effect: ResourceEffect): Battle {
  const { resources } = battle;
  switch (effect.type) {
    case 'heal':
      return withResources(battle, {
        ...resources,
        health: Math.min(resources.maxHealth, resources.health + effect.amount),
      });
    case 'loseHealth':
      return loseHealth(battle, effect.amount);
    case 'gainFood':
      return withResources(battle, { ...resources, food: resources.food + effect.amount });
    case 'loseFood':
      return withResources(battle, {
        ...resources,
        food: Math.max(0, resources.food - effect.amount),
      });
    case 'gainGold':
      return withResources(battle, { ...resources, gold: resources.gold + effect.amount });
    case 'loseGold':
      return withResources(battle, {
        ...resources,
        gold: Math.max(0, resources.gold - effect.amount),
      });
  }
}

/** An enemy attack: + its strength − its Chill, never below 0. */
function attackDamage(amount: number, enemy: FightEnemy): number {
  return Math.max(0, amount + enemy.strength - enemy.chill);
}

/** Block absorbs damage first; the fight ends the moment health reaches 0. */
function hitEnemy(battle: Battle, damage: number): Battle {
  const { enemy } = battle.fight;
  const absorbed = Math.min(enemy.block, Math.max(0, damage));
  const health = Math.max(0, enemy.health - (Math.max(0, damage) - absorbed));
  const next = withEnemy(battle, { ...enemy, block: enemy.block - absorbed, health });
  return health === 0 ? withFight(next, { ...next.fight, outcome: 'won' }) : next;
}

function hitPlayer(battle: Battle, damage: number): Battle {
  const { player } = battle.fight;
  const absorbed = Math.min(player.block, damage);
  const blocked = withPlayer(battle, { ...player, block: player.block - absorbed });
  return loseHealth(blocked, damage - absorbed);
}

/** Health lost past block, as `loseHealth` does. */
function loseHealth(battle: Battle, amount: number): Battle {
  const health = Math.max(0, battle.resources.health - amount);
  const next = withResources(battle, { ...battle.resources, health });
  return health === 0 ? withFight(next, { ...next.fight, outcome: 'lost' }) : next;
}

// Helpers

/** Takes the scripted cards out of the deck, one copy each, in their order. */
function takeScripted(deck: readonly string[], scriptedDraws: readonly string[]) {
  const rest = [...deck];
  const scripted: string[] = [];
  for (const id of scriptedDraws) {
    const i = rest.indexOf(id);
    if (i === -1) continue;
    rest.splice(i, 1);
    scripted.push(id);
  }
  return { scripted, rest };
}

function moveOf(content: Content, enemy: FightEnemy): Move {
  const move = enemyOf(content, enemy.id).moves.find(({ id }) => id === enemy.intent);
  if (!move) throw new Error(`enemy "${enemy.id}" has no move "${enemy.intent}"`);
  return move;
}

function withFight(battle: Battle, fight: FightState): Battle {
  return { ...battle, fight };
}

function withEnemy(battle: Battle, enemy: FightEnemy): Battle {
  return withFight(battle, { ...battle.fight, enemy });
}

function withPlayer(battle: Battle, player: FightPlayer): Battle {
  return withFight(battle, { ...battle.fight, player });
}

function withResources(battle: Battle, resources: Resources): Battle {
  return { ...battle, resources };
}
