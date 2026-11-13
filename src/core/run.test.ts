import { describe, expect, it } from 'vitest';
import type { Content } from './content';
import { canPlay } from './fight';
import { distance, hexKey, neighbours, sameHex, type Hex } from './hex';
import { locationAt, routeCost } from './map';
import { reduce, type GameAction } from './reducer';
import { createGame, type GameState, type Phase, type Run } from './state';
import { testContent as content, testMap as map } from './test-content';

// Helpers

function startedRun(seed = 1, withContent: Content = content): GameState {
  return reduce(withContent, createGame(seed), { type: 'startRun' });
}

function dispatch(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((next, action) => reduce(content, next, action), state);
}

function runOf(state: GameState): Run {
  if (!state.run) throw new Error('no run');
  return state.run;
}

function phaseOf(state: GameState): Phase {
  return runOf(state).phase;
}

/** A shortest chain of steps from one tile to another, not counting the first. */
function path(from: Hex, to: Hex): Hex[] {
  const previous = new Map<string, Hex>([[hexKey(from), from]]);
  const queue: Hex[] = [from];
  for (let hex = queue.shift(); hex; hex = queue.shift()) {
    if (sameHex(hex, to)) break;
    for (const next of neighbours(hex)) {
      if (previous.has(hexKey(next))) continue;
      previous.set(hexKey(next), hex);
      queue.push(next);
    }
  }
  const steps: Hex[] = [];
  for (let hex = to; !sameHex(hex, from); hex = previous.get(hexKey(hex)) ?? from)
    steps.unshift(hex);
  return steps;
}

/** Plans a route through the given tiles in turn and walks it. */
function walk(state: GameState, ...via: Hex[]): GameState {
  let from = runOf(state).level.playerAt;
  const route = via.flatMap((to) => {
    const steps = path(from, to);
    from = to;
    return steps;
  });
  return dispatch(state, { type: 'planRoute', route }, { type: 'go' });
}

/** Wins the fight in progress: the enemy at 1 health, a Strike in hand. */
function winFight(state: GameState): GameState {
  const run = runOf(state);
  const { phase } = run;
  if (phase.kind !== 'fight') throw new Error(`not in a fight but in ${phase.kind}`);
  const fight = {
    ...phase.fight,
    hand: ['strike'],
    player: { ...phase.fight.player, energy: 3 },
    enemy: { ...phase.fight.enemy, health: 1, block: 0 },
  };
  const ready = { ...state, run: { ...run, phase: { ...phase, fight } } };
  return dispatch(ready, { type: 'playCard', handIndex: 0 });
}

const notOnLocations = (hex: Hex) =>
  ![...map.fixed, ...map.slots].some(({ at }) => sameHex(at, hex)) && !sameHex(hex, map.boss.at);

// Tests

describe('a new run', () => {
  it('starts with the starter deck and the numbers of DD 4.9', () => {
    const run = runOf(startedRun());
    expect([...run.deck].sort()).toEqual(
      ['defend', 'defend', 'defend', 'defend', 'ice-shard', 'ration']
        .concat(['strike', 'strike', 'strike', 'strike'])
        .sort(),
    );
    expect(run).toMatchObject({ health: 60, maxHealth: 60, gold: 20, keys: 0, lives: 3 });
    expect(run.level).toMatchObject({ food: 12, playerAt: map.start, route: [] });
    expect(run.phase).toEqual({ kind: 'map' });
  });

  it('keeps the fixed locations and deals one allowed type into every slot', () => {
    const { locations } = runOf(startedRun()).level;
    expect(locations).toHaveLength(map.fixed.length + map.slots.length);
    for (const fixed of map.fixed)
      expect(locationAt(runOf(startedRun()).level, fixed.at)?.type).toBe(fixed.type);
    expect(map.slots[0]?.allow).toContain(locations.at(-1)?.type);
  });

  it('deals the details: an enemy of the land and kind, and what a chest holds', () => {
    for (let seed = 0; seed < 20; seed++) {
      const { level } = runOf(startedRun(seed));
      expect(['rat', 'wisp']).toContainEqual(enemyAt(level, [2, 6]));
      expect(enemyAt(level, [6, 6])).toBe('brute');
      const chest = locationAt(level, [0, 4])?.detail;
      expect(chest?.kind === 'chest' && chest.gold >= 10 && chest.gold <= 20).toBe(true);
    }
  });

  it('deals the same way for the same seed, and differently across seeds', () => {
    expect(startedRun(7)).toEqual(startedRun(7));
    const deals = new Set(
      [...Array(20).keys()].map((seed) => JSON.stringify(runOf(startedRun(seed)).level.locations)),
    );
    expect(deals.size).toBeGreaterThan(1);
  });

  it('shows details only within 2 steps of the start', () => {
    for (const { at, seen } of runOf(startedRun()).level.locations) {
      expect(seen).toBe(distance(at, map.start) <= 2);
    }
  });
});

describe('planning a route', () => {
  it('takes a chain of neighbouring tiles that starts next to the player', () => {
    const route = path(map.start, [3, 5]);
    expect(runOf(dispatch(startedRun(), { type: 'planRoute', route })).level.route).toEqual(route);
  });

  it('ignores a route that skips a tile or starts away from the player', () => {
    const state = startedRun();
    expect(dispatch(state, { type: 'planRoute', route: [[0, 4]] })).toBe(state);
    expect(
      dispatch(state, {
        type: 'planRoute',
        route: [
          [1, 6],
          [3, 6],
        ],
      }),
    ).toBe(state);
  });

  it('shows the food and health the route will cost before Go', () => {
    const planned = dispatch(startedRun(), {
      type: 'planRoute',
      route: [
        [1, 6],
        [1, 5],
      ],
    });
    expect(routeCost(content, runOf(planned).level)).toMatchObject({ food: 3, health: 0 });
  });
});

describe('walking', () => {
  it('costs 1 food per step, or 2 onto a slow tile', () => {
    const walked = dispatch(
      startedRun(),
      {
        type: 'planRoute',
        route: [
          [1, 6],
          [1, 5],
        ],
      },
      { type: 'go' },
    );
    expect(runOf(walked).level).toMatchObject({ food: 12 - 3, playerAt: [1, 5], route: [] });
  });

  it('costs 3 health per food it cannot pay for, and never blocks the move', () => {
    const state = startedRun();
    const hungry = {
      ...state,
      run: { ...runOf(state), level: { ...runOf(state).level, food: 1 } },
    };
    // DD 4.2's example: a swamp step with 1 food left sets food to 0 and costs 3 health.
    const planned = dispatch(hungry, { type: 'planRoute', route: [[1, 6]] });
    expect(routeCost(content, runOf(planned).level)).toMatchObject({ food: 1, health: 3 });
    const walked = runOf(dispatch(planned, { type: 'go' }));
    expect(walked.level.food).toBe(0);
    expect(walked.health).toBe(57);
  });

  it('starves to death when the health runs out', () => {
    const state = startedRun();
    const starving = {
      ...state,
      run: { ...runOf(state), health: 3, level: { ...runOf(state).level, food: 0 } },
    };
    const walked = dispatch(starving, { type: 'planRoute', route: [[0, 5]] }, { type: 'go' });
    expect(phaseOf(walked)).toEqual({ kind: 'dead', cause: { kind: 'starved' } });
  });

  it('reveals details within 2 steps, and they stay shown', () => {
    const there = walk(startedRun(), [3, 2]);
    const back = walk({ ...there, run: { ...runOf(there), phase: { kind: 'map' } } }, [0, 6]);
    const near = runOf(there).level.locations.filter(({ at }) => distance(at, [3, 2]) <= 2);
    expect(near.length).toBeGreaterThan(0);
    for (const { at } of near) expect(locationAt(runOf(back).level, at)?.seen).toBe(true);
  });
});

describe('locations', () => {
  it('stops the walk on a monster and starts the fight, keeping the rest of the route', () => {
    const state = dispatch(
      startedRun(),
      {
        type: 'planRoute',
        route: [
          [1, 6],
          [2, 6],
          [3, 6],
        ],
      },
      { type: 'go' },
    );
    const run = runOf(state);
    expect(run.level.playerAt).toEqual([2, 6]);
    expect(run.level.route).toEqual([[3, 6]]);
    expect(run.phase).toMatchObject({ kind: 'fight', source: { kind: 'monster', at: [2, 6] } });
  });

  it('gives gold and a card reward for a won fight, and resolves the tile', () => {
    const won = winFight(walk(startedRun(), [2, 6]));
    const phase = phaseOf(won);
    expect(phase.kind).toBe('reward');
    if (phase.kind !== 'reward') return;
    expect(phase.reward.gold).toBeGreaterThanOrEqual(10);
    expect(phase.reward.cards).toHaveLength(3);
    expect(runOf(won).gold).toBe(20 + phase.reward.gold);
    expect(locationAt(runOf(won).level, [2, 6])?.resolved).toBe(true);

    const picked = dispatch(won, { type: 'pickCard', index: 0 });
    expect(runOf(picked).deck).toHaveLength(11);
    expect(phaseOf(picked)).toEqual({ kind: 'map' });
  });

  it('walks through a resolved tile without stopping', () => {
    const done = dispatch(winFight(walk(startedRun(), [2, 6])), { type: 'skipReward' });
    const through = walk(walk(done, [1, 5]), [3, 6]);
    expect(runOf(through).level.playerAt).toEqual([3, 6]);
    expect(phaseOf(through)).toEqual({ kind: 'map' });
  });

  it('ends the run on a lost fight, naming the enemy', () => {
    const fighting = walk(startedRun(), [2, 6]);
    const dying = { ...fighting, run: { ...runOf(fighting), health: 1 } };
    const phase = phaseOf(dispatch(dying, { type: 'endTurn' }));
    const enemy = enemyAt(runOf(fighting).level, [2, 6]);
    expect(phase).toEqual({ kind: 'dead', cause: { kind: 'fight', enemy } });
  });

  it('makes the first monster fight of a new run the tutorial, once', () => {
    const tutorial = {
      enemy: 'wisp',
      drawOrder: ['ration', 'ice-shard', 'strike', 'defend', 'strike'],
      hints: { intent: 'i', energy: 'e', block: 'b', endTurn: 't' },
    };
    const withTutorial = { ...content, catalogue: { ...content.catalogue, tutorial } };
    const go = (state: GameState, to: Hex) =>
      [{ type: 'planRoute', route: path(runOf(state).level.playerAt, to) }, { type: 'go' }].reduce(
        (next, action) => reduce(withTutorial, next, action as GameAction),
        state,
      );
    const first = go(startedRun(1, withTutorial), [2, 6]);
    const phase = phaseOf(first);
    expect(phase).toMatchObject({
      kind: 'fight',
      fight: { tutorial: true, enemy: { id: 'wisp' } },
    });
    if (phase.kind === 'fight') expect(phase.fight.hand).toEqual(tutorial.drawOrder);
    expect(runOf(first).tutorialDone).toBe(true);
  });

  it('opens a chest: its gold now, and its bonus', () => {
    const opened = walk(startedRun(), [0, 4]);
    const phase = phaseOf(opened);
    const chest = locationAt(runOf(startedRun()).level, [0, 4])?.detail;
    expect(phase.kind).toBe('reward');
    if (phase.kind !== 'reward' || chest?.kind !== 'chest') return;
    expect(runOf(opened).gold).toBe(20 + chest.gold);
    const bonus = { cards: phase.reward.cards.length === 3, food: phase.reward.food === 3 };
    expect(chest.bonus === 'health' || bonus[chest.bonus]).toBe(true);
    expect(locationAt(runOf(opened).level, [0, 4])?.resolved).toBe(true);
  });

  it('leaves a locked chest locked without a key, and opens it with one', () => {
    const locked = walk(startedRun(), [4, 6]);
    expect(phaseOf(locked)).toEqual({ kind: 'map' });
    expect(locationAt(runOf(locked).level, [4, 6])?.resolved).toBe(false);

    const withKey = { ...locked, run: { ...runOf(locked), keys: 1 } };
    const opened = walk(walk(withKey, [3, 6]), [4, 6]);
    expect(runOf(opened).keys).toBe(0);
    expect(phaseOf(opened)).toMatchObject({ kind: 'reward' });
    expect(locationAt(runOf(opened).level, [4, 6])?.resolved).toBe(true);
  });

  it('gives a key for an elite', () => {
    const route = [
      [5, 5],
      [6, 6],
    ] as Hex[];
    const near = walk(startedRun(), [5, 5]);
    const fighting = dispatch(
      { ...near, run: { ...runOf(near), phase: { kind: 'map' } } },
      { type: 'planRoute', route: route.slice(1) },
      { type: 'go' },
    );
    expect(runOf(winFight(fighting)).keys).toBe(1);
  });
});

describe('the boss', () => {
  const nextToBoss: Hex = [7, 0];
  const atBossDoor = () => {
    const state = startedRun();
    const route = path(map.start, nextToBoss).filter(notOnLocations);
    const run = runOf(state);
    return {
      ...state,
      run: { ...run, level: { ...run.level, playerAt: route.at(-1) ?? nextToBoss } },
    };
  };

  it('asks before the step onto the boss tile', () => {
    const asked = walk(atBossDoor(), map.boss.at);
    expect(phaseOf(asked)).toEqual({ kind: 'bossConfirm' });
    expect(runOf(asked).level.playerAt).not.toEqual(map.boss.at);
  });

  it('stays put and clears the route when the player says no', () => {
    const stayed = dispatch(walk(atBossDoor(), map.boss.at), { type: 'cancelBoss' });
    expect(phaseOf(stayed)).toEqual({ kind: 'map' });
    expect(runOf(stayed).level.route).toEqual([]);
  });

  it('fights the boss on yes, and the level is won after its reward', () => {
    const fighting = dispatch(walk(atBossDoor(), map.boss.at), { type: 'confirmBoss' });
    expect(phaseOf(fighting)).toMatchObject({ kind: 'fight', source: { kind: 'boss' } });
    expect(runOf(fighting).level.playerAt).toEqual(map.boss.at);

    const hurt = { ...fighting, run: { ...runOf(fighting), health: 30 } };
    const won = winFight(hurt);
    expect(phaseOf(won)).toMatchObject({ kind: 'reward', reward: { gold: 40, health: 18 } });
    expect(phaseOf(dispatch(won, { type: 'skipReward' }))).toEqual({ kind: 'levelWon' });
  });
});

describe('actions that do not fit the phase', () => {
  it('change nothing', () => {
    const state = startedRun();
    expect(dispatch(state, { type: 'playCard', handIndex: 0 })).toBe(state);
    expect(dispatch(state, { type: 'endTurn' })).toBe(state);
    expect(dispatch(state, { type: 'pickCard', index: 0 })).toBe(state);
    expect(dispatch(state, { type: 'confirmBoss' })).toBe(state);
    expect(dispatch(createGame(1), { type: 'go' })).toEqual(createGame(1));
  });
});

describe('a whole level', () => {
  /** Every location, then the boss. Like a careless player: any card it can play, then End turn. */
  const waypoints: Hex[] = [[2, 6], [0, 4], [4, 3], [6, 6], [4, 6], map.boss.at];

  function playThrough(seed: number): { end: Phase; fights: number } {
    let state = startedRun(seed);
    let fights = 0;
    const targets = [...waypoints];
    for (let i = 0; i < 600; i++) {
      const phase = phaseOf(state);
      if (phase.kind === 'levelWon' || phase.kind === 'dead') return { end: phase, fights };
      if (phase.kind === 'map') {
        const next = dispatch(state, { type: 'go' });
        const target = targets[0];
        if (next !== state || !target) state = next;
        else {
          state = walk(state, target);
          targets.shift();
        }
        continue;
      }
      if (phase.kind === 'fight' && phase.fight.turn === 1 && phase.fight.hand.length === 5)
        fights++;
      state = dispatch(state, nextAction(phase));
    }
    throw new Error(`seed ${seed} didn't finish the level`);
  }

  const nextAction = (phase: Phase): GameAction => {
    switch (phase.kind) {
      case 'bossConfirm':
        return { type: 'confirmBoss' };
      case 'reward':
        return phase.reward.cards.length > 0
          ? { type: 'pickCard', index: 0 }
          : { type: 'skipReward' };
      case 'fight': {
        const { fight } = phase;
        const playable = fight.hand.findIndex((_, i) => canPlay(content, fight, i));
        return playable === -1 ? { type: 'endTurn' } : { type: 'playCard', handIndex: playable };
      }
      case 'map':
      case 'levelWon':
      case 'dead':
        return { type: 'go' };
    }
  };

  it('always ends in a won level or a death, never stuck, through every kind of location', () => {
    const results = [...Array(25).keys()].map(playThrough);
    for (const { end } of results) expect(['levelWon', 'dead']).toContain(end.kind);
    expect(results.some(({ end }) => end.kind === 'levelWon')).toBe(true);
    expect(Math.max(...results.map(({ fights }) => fights))).toBeGreaterThanOrEqual(3);
  });
});

function enemyAt(level: Run['level'], at: Hex): string | undefined {
  const detail = locationAt(level, at)?.detail;
  return detail?.kind === 'enemy' ? detail.enemy : undefined;
}
