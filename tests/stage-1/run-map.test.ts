/**
 * Map and run rules MAP-nn (tests/rules/stage-1-map.md) against the run and map core of PR #40,
 * through `reduce`, the same entry point the screens use. Map: the programmer's test map
 * (src/core/test-content.ts): start [0,6], swamp [1,6], monster [2,6], chest [0,4],
 * locked chest [4,6], elite [6,6], village [0,2], slot [4,3] (monster or chest), boss [8,0].
 * Rules the PR leaves for stage 2 (lava, ice, villages, lives…) are `it.todo`.
 */
import { describe, expect, it } from 'vitest';
import type { Content } from '../../src/core/content';
import { distance, sameHex, type Hex } from '../../src/core/hex';
import { dealLocations, locationAt, routeCost } from '../../src/core/map';
import { reduce, type GameAction } from '../../src/core/reducer';
import { fightReward, offerCards } from '../../src/core/rewards';
import { seedRng } from '../../src/core/rng';
import { createGame, type GameState, type Run } from '../../src/core/state';
import { testContent, testMap } from '../../src/core/test-content';

const content = testContent;
const STARTERS = ['strike', 'defend', 'ice-shard', 'ration'];

function newRun(seed = 1, withContent: Content = content): GameState {
  return reduce(withContent, createGame(seed), { type: 'startRun' });
}
function run(state: GameState): Run {
  if (!state.run) throw new Error('no run');
  return state.run;
}
function act(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((s, a) => reduce(content, s, a), state);
}
/** The state with some run or level fields set by hand, to reach an exact situation. */
function withRun(state: GameState, change: Partial<Run>, level: Partial<Run['level']> = {}): GameState {
  const r = run(state);
  return { ...state, run: { ...r, ...change, level: { ...r.level, ...level } } };
}
const walk = (state: GameState, route: Hex[]) => act(state, { type: 'planRoute', route }, { type: 'go' });

/** Wins the fight in progress: the enemy at 1 health and a Strike in hand. */
function winFight(state: GameState, withContent: Content = content): GameState {
  const r = run(state);
  if (r.phase.kind !== 'fight') throw new Error(`not in a fight: ${r.phase.kind}`);
  const fight = { ...r.phase.fight, hand: ['strike'], enemy: { ...r.phase.fight.enemy, health: 1, block: 0 }, player: { ...r.phase.fight.player, energy: 3 } };
  const s = { ...state, run: { ...r, phase: { ...r.phase, fight } } };
  return reduce(withContent, s, { type: 'playCard', handIndex: 0 });
}

describe('MAP-0x run and level start', () => {
  it('MAP-01 a new run: 60 of 60 health, 20 gold, 3 lives, 0 keys, the 10-card starter deck', () => {
    const r = run(newRun());
    expect([r.health, r.maxHealth, r.gold, r.lives, r.keys, r.deck.length]).toEqual([60, 60, 20, 3, 0, 10]);
  });
  it('MAP-02 / MAP-04 the level starts with startFood (12) on the start tile', () => {
    const r = run(newRun());
    expect(r.level.food).toBe(testMap.startFood);
    expect(r.level.playerAt).toEqual(testMap.start);
  });
  it('MAP-05 every slot gets a type from its allow list, each equally likely (1000 seeds)', () => {
    let monsters = 0;
    for (let seed = 0; seed < 1000; seed++) {
      const slot = locationAt(run(newRun(seed)).level, [4, 3]);
      expect(['monster', 'chest']).toContain(slot?.type);
      if (slot?.type === 'monster') monsters++;
    }
    expect(monsters).toBeGreaterThanOrEqual(450);
    expect(monsters).toBeLessThanOrEqual(550);
  });
  it('MAP-06 the same seed deals the same types and details', () => {
    expect(run(newRun(42)).level.locations).toEqual(run(newRun(42)).level.locations);
  });
  it('MAP-07 a monster tile deals a normal enemy, an elite tile an elite, of the level’s land', () => {
    for (let seed = 0; seed < 50; seed++) {
      const level = run(newRun(seed)).level;
      const enemyAt = (at: Hex) => {
        const d = locationAt(level, at)?.detail;
        return d?.kind === 'enemy' ? content.catalogue.enemies.get(d.enemy) : undefined;
      };
      expect(enemyAt([2, 6])).toMatchObject({ kind: 'normal', land: 'whisperwood' });
      expect(enemyAt([6, 6])).toMatchObject({ kind: 'elite', land: 'whisperwood' });
    }
  });
});

describe('MAP-1x steps and food', () => {
  it('MAP-10 a route must be a chain of neighbours from the player; anything else is ignored', () => {
    const s = newRun();
    expect(run(act(s, { type: 'planRoute', route: [[2, 6]] })).level.route).toEqual([]);
    expect(run(act(s, { type: 'planRoute', route: [[1, 5], [2, 5]] })).level.route).toEqual([[1, 5], [2, 5]]);
  });
  it('MAP-11 a step costs 1 food, 2 onto swamp; the start tile costs nothing', () => {
    const s = walk(newRun(), [[1, 6]]);
    expect(run(s).level.food).toBe(10);
    expect(run(walk(s, [[1, 5]])).level.food).toBe(9);
  });
  it('MAP-12 stepping back onto a visited tile costs the same', () => {
    expect(run(walk(newRun(), [[0, 5], [0, 6]])).level.food).toBe(10);
  });
  it('MAP-13 out of food: never blocked, 3 health per missing food, food stays at 0', () => {
    const at = (food: number, route: Hex[]) => run(walk(withRun(newRun(), {}, { food }), route));
    expect([at(1, [[1, 6]]).level.food, at(1, [[1, 6]]).health]).toEqual([0, 57]);
    expect([at(0, [[0, 5]]).level.food, at(0, [[0, 5]]).health]).toEqual([0, 57]);
    expect(at(0, [[1, 6]]).health).toBe(54);
    expect([at(2, [[1, 6]]).level.food, at(2, [[1, 6]]).health]).toEqual([0, 60]); // boundary
  });
  it('MAP-14 the route preview shows the food and the health cost of every step past the food', () => {
    const s = act(withRun(newRun(), {}, { food: 1 }), { type: 'planRoute', route: [[1, 6], [1, 5]] });
    const cost = routeCost(content, run(s).level);
    expect(cost.steps.map((step) => [step.food, step.health])).toEqual([[1, 3], [0, 3]]);
    expect([cost.food, cost.health]).toEqual([1, 6]);
  });
  it('MAP-15 hunger that brings health to 0 is a death: "Starved"', () => {
    const s = walk(withRun(newRun(), { health: 3 }, { food: 0 }), [[0, 5], [0, 4]]);
    expect(run(s).phase).toEqual({ kind: 'dead', cause: { kind: 'starved' } });
    expect(run(s).level.playerAt).toEqual([0, 5]); // the walk stops where the player died
  });
  it('MAP-16 food above startFood is allowed (Ration in a fight)', () => {
    let s = walk(newRun(), [[1, 6], [2, 6]]);
    const r = run(s);
    if (r.phase.kind !== 'fight') throw new Error('expected a fight');
    s = { ...s, run: { ...r, level: { ...r.level, food: 12 }, phase: { ...r.phase, fight: { ...r.phase.fight, hand: ['ration'] } } } };
    s = act(s, { type: 'playCard', handIndex: 0 });
    expect(run(s).level.food).toBe(14);
  });
});

describe('MAP-2x hazards and fight modifiers', () => {
  it.todo('MAP-20 / 21 lava: 1 food and 4 damage, no block, can kill: "Burned by lava" (stage 2, PR #40 TODO)');
  it.todo('MAP-22 / 23 ice gives Chilled, which does not stack and becomes Chill 1 in the next fight (stage 2)');
  it.todo('MAP-24 a village rest gives Rested: 5 block in the next fight, not stacking (stage 2)');
  it('MAP-25 swamp has no effect besides being slow: the next fight starts without modifiers', () => {
    const s = walk(newRun(), [[1, 6], [2, 6]]);
    const r = run(s);
    if (r.phase.kind !== 'fight') throw new Error('expected a fight');
    expect([r.phase.fight.player.block, r.phase.fight.player.energy]).toEqual([0, 3]);
  });
});

describe('MAP-3x walking and resolving locations', () => {
  it('MAP-30 / 31 the walk stops on a location, which resolves; the rest of the route is kept', () => {
    const s = walk(newRun(), [[1, 6], [2, 6], [3, 6], [3, 5]]);
    const r = run(s);
    expect(r.phase.kind).toBe('fight');
    expect(r.level.playerAt).toEqual([2, 6]);
    expect(r.level.route).toEqual([[3, 6], [3, 5]]);
    expect(run(act(s, { type: 'go' }))).toBe(r); // no walking during a fight (MAP-32)
  });
  it('MAP-33 a resolved tile is empty: walking over it doesn’t stop', () => {
    let s = winFight(walk(newRun(), [[1, 6], [2, 6]]));
    s = act(s, { type: 'skipReward' });
    expect(locationAt(run(s).level, [2, 6])?.resolved).toBe(true);
    s = walk(s, [[1, 6], [2, 6], [3, 6]]);
    expect(run(s).phase.kind).toBe('map');
    expect(run(s).level.playerAt).toEqual([3, 6]);
  });
  it('MAP-34 (Q-M2) a locked chest without a key: the walk stops, nothing happens, it stays locked', () => {
    const s = walk(newRun(), [[1, 5], [2, 5], [3, 5], [4, 6], [5, 6]]);
    const r = run(s);
    expect([r.level.playerAt, r.phase.kind, r.keys]).toEqual([[4, 6], 'map', 0]);
    expect(locationAt(r.level, [4, 6])?.resolved).toBe(false);
  });
  it('MAP-35 a locked chest with a key opens: −1 key, a card reward of 3 different rares, then empty', () => {
    const s = walk(withRun(newRun(), { keys: 1 }), [[1, 5], [2, 5], [3, 5], [4, 6]]);
    const r = run(s);
    if (r.phase.kind !== 'reward') throw new Error(`expected a reward, got ${r.phase.kind}`);
    expect(r.keys).toBe(0);
    expect(new Set(r.phase.reward.cards).size).toBe(3);
    for (const id of r.phase.reward.cards) expect(content.catalogue.cards.get(id)?.rarity).toBe('rare');
    expect(locationAt(r.level, [4, 6])?.resolved).toBe(true);
  });
  it.todo('MAP-35 a locked chest also gives a random blessing the player doesn’t own (stage 2, PR #40 TODO)');
  it.todo('MAP-36 village services once per village per level; food without limit (stage 2)');
  it('MAP-37 the step onto the boss asks first; "Not yet" stays, "Fight" starts the boss fight', () => {
    const near = withRun(newRun(), {}, { playerAt: [7, 0] });
    const asked = walk(near, [[8, 0]]);
    expect(run(asked).phase.kind).toBe('bossConfirm');
    expect(run(asked).level.playerAt).toEqual([7, 0]);
    const stayed = act(asked, { type: 'cancelBoss' });
    expect([run(stayed).phase.kind, run(stayed).level.playerAt]).toEqual(['map', [7, 0]]);
    const fought = act(asked, { type: 'confirmBoss' });
    const r = run(fought);
    expect(r.level.playerAt).toEqual([8, 0]);
    expect(r.phase.kind === 'fight' && r.phase.fight.enemy.id).toBe('chief');
  });
});

describe('MAP-4x visibility', () => {
  it('MAP-40 / 41 types are known; details are seen within 2 steps of the player', () => {
    const level = run(newRun()).level;
    for (const location of level.locations) {
      expect(location.seen).toBe(distance(location.at, testMap.start) <= 2);
    }
    expect(locationAt(level, [2, 6])?.seen).toBe(true); // distance 2
    expect(locationAt(level, [4, 6])?.seen).toBe(false); // distance 4
  });
  it('MAP-41 boundary: a location exactly 3 steps away stays hidden', () => {
    const level = run(walk(newRun(), [[1, 5]])).level;
    expect(distance([1, 5], [4, 6])).toBe(3);
    expect(locationAt(level, [4, 6])?.seen).toBe(false);
  });
  it('MAP-42 once seen, details stay seen after the player walks away', () => {
    const s = walk(newRun(), [[1, 5], [1, 4], [1, 3], [1, 2]]);
    const level = run(s).level;
    expect(distance(level.playerAt, [2, 6])).toBeGreaterThan(2);
    expect(locationAt(level, [2, 6])?.seen).toBe(true);
  });
});

describe('MAP-5x death, retry, lives and score', () => {
  it('MAP-50 / FIGHT-73 losing a fight is a death with the enemy as the cause', () => {
    let s = walk(newRun(), [[1, 6], [2, 6]]);
    const r = run(s);
    if (r.phase.kind !== 'fight') throw new Error('expected a fight');
    // Whatever enemy was dealt, make it the rat about to bite, so the death is certain.
    const fight = { ...r.phase.fight, enemy: { ...r.phase.fight.enemy, id: 'rat', intent: 'bite' }, player: { ...r.phase.fight.player, block: 0 } };
    s = { ...s, run: { ...r, health: 1, phase: { ...r.phase, fight } } };
    s = act(s, { type: 'endTurn' });
    expect(run(s).phase).toEqual({ kind: 'dead', cause: { kind: 'fight', enemy: 'rat' } });
  });
  it.todo('MAP-51 / 52 dying with lives left retries the level from its start; with 0 lives, Run over (stage 2: lives)');
  it.todo('MAP-53 Restart level costs a life and asks first (stage 2)');
  it.todo('MAP-54 score: 1000 per level + 10 per health + 1 per gold + 300 per life (stage 2)');
});

describe('MAP-6x rewards', () => {
  const card = (id: string) => content.catalogue.cards.get(id);

  it('MAP-60 a monster pays 10–15 gold, every value possible, and offers commons', () => {
    const golds = new Set<number>();
    for (let seed = 0; seed < 400; seed++) {
      const reward = fightReward(content, 'monster', 60, seedRng(seed)).value;
      golds.add(reward.gold);
      for (const id of reward.cards) expect(card(id)?.rarity).toBe('common');
    }
    expect([...golds].sort((a, b) => a - b)).toEqual([10, 11, 12, 13, 14, 15]);
  });
  it('MAP-61 an elite pays 25 gold and 1 key, and offers exactly 1 rare among 3', () => {
    for (let seed = 0; seed < 100; seed++) {
      const reward = fightReward(content, 'elite', 60, seedRng(seed)).value;
      expect([reward.gold, reward.keys]).toEqual([25, 1]);
      expect(reward.cards.filter((id) => card(id)?.rarity === 'rare')).toHaveLength(1);
      expect(reward.cards).toHaveLength(3);
    }
  });
  it('MAP-62 a boss pays 40 gold and heals 30% of max health rounded down, never above max', () => {
    expect(fightReward(content, 'boss', 60, seedRng(1)).value.heal).toBe(18);
    expect(fightReward(content, 'boss', 61, seedRng(1)).value.heal).toBe(18);
    let s = act(withRun(newRun(), { health: 50 }, { playerAt: [7, 0] }), { type: 'planRoute', route: [[8, 0]] }, { type: 'go' }, { type: 'confirmBoss' });
    s = winFight(s);
    const r = run(s);
    expect([r.health, r.gold]).toEqual([60, 60]);
    expect(run(act(s, { type: 'skipReward' })).phase.kind).toBe('levelWon');
  });
  it('MAP-63 a card offer has 3 different cards and never a starter card', () => {
    for (const kind of ['monster', 'chest', 'elite', 'boss', 'lockedChest'] as const) {
      for (let seed = 0; seed < 50; seed++) {
        const cards = offerCards(content, kind, seedRng(seed)).value;
        expect(new Set(cards).size).toBe(cards.length);
        expect(cards.some((id) => STARTERS.includes(id))).toBe(false);
      }
    }
  });
  it('MAP-64 a chest: 10–20 gold plus cards, 3 food or 10 health, each about a third (3000 seeds)', () => {
    const bonus = { cards: 0, food: 0, health: 0 };
    for (let seed = 0; seed < 3000; seed++) {
      const chest = dealLocations(content, testMap, seedRng(seed)).value.find((l) => sameHex(l.at, [0, 4]));
      if (chest?.detail.kind !== 'chest') throw new Error('expected a chest');
      expect(chest.detail.gold).toBeGreaterThanOrEqual(10);
      expect(chest.detail.gold).toBeLessThanOrEqual(20);
      bonus[chest.detail.bonus]++;
    }
    for (const n of Object.values(bonus)) {
      expect(n).toBeGreaterThan(900);
      expect(n).toBeLessThan(1110);
    }
  });
  it('MAP-64 a chest’s health never goes above max health', () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = newRun(seed);
      const chest = locationAt(run(s).level, [0, 4]);
      if (chest?.detail.kind !== 'chest' || chest.detail.bonus !== 'health') continue;
      const opened = run(walk(withRun(s, { health: 55 }), [[0, 5], [0, 4]]));
      expect(opened.health).toBe(60);
      return;
    }
    throw new Error('no seed with a health chest');
  });
  it.todo('MAP-65 – 70 village prices, shrine, mystery events, bounty (stage 2)');
});

describe('FIGHT-72 / 8x fights inside the run', () => {
  it('FIGHT-72 cards exhausted in a fight are back in the deck after it', () => {
    let s = walk(newRun(), [[1, 6], [2, 6]]);
    const r = run(s);
    if (r.phase.kind !== 'fight') throw new Error('expected a fight');
    s = { ...s, run: { ...r, phase: { ...r.phase, fight: { ...r.phase.fight, hand: ['ration', 'strike'], enemy: { ...r.phase.fight.enemy, health: 1 } } } } };
    s = act(s, { type: 'playCard', handIndex: 0 }, { type: 'playCard', handIndex: 0 }, { type: 'skipReward' });
    expect(run(s).deck.filter((id) => id === 'ration')).toHaveLength(1);
    expect(run(s).deck).toHaveLength(10);
  });

  const tutor = (() => {
    const rat = content.catalogue.enemies.get('rat');
    if (!rat) throw new Error('fixture changed: no rat');
    const enemies = new Map(content.catalogue.enemies).set('tutor', { ...rat, id: 'tutor', name: 'tutor' });
    const drawOrder = ['strike', 'defend', 'strike', 'defend', 'ice-shard', 'strike', 'defend', 'strike', 'defend', 'ration'];
    const hints = { intent: 'i', energy: 'e', block: 'b', endTurn: 't' };
    return { ...content, catalogue: { ...content.catalogue, enemies, tutorial: { enemy: 'tutor', drawOrder, hints } } } as Content;
  })();
  const walkWith = (c: Content, state: GameState, route: Hex[]) =>
    [{ type: 'planRoute', route } as const, { type: 'go' } as const].reduce((s, a) => reduce(c, s, a), state);

  it('FIGHT-80 / 81 the first monster fight of a new run is the tutorial: its enemy, the scripted first two hands', () => {
    for (const seed of [1, 2]) {
      const r = run(walkWith(tutor, newRun(seed, tutor), [[1, 6], [2, 6]]));
      if (r.phase.kind !== 'fight') throw new Error('expected a fight');
      expect(r.phase.fight.enemy.id).toBe('tutor');
      expect(r.phase.fight.tutorial).toBe(true);
      expect(r.phase.fight.hand).toEqual(['strike', 'defend', 'strike', 'defend', 'ice-shard']);
      expect(r.phase.fight.drawPile.slice(0, 5)).toEqual(['strike', 'defend', 'strike', 'defend', 'ration']);
    }
  });
  it('FIGHT-80 (Q-C4) an elite fought first is not the tutorial', () => {
    const r = run(walkWith(tutor, newRun(1, tutor), [[1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 6]]));
    if (r.phase.kind !== 'fight') throw new Error('expected a fight');
    expect(r.phase.fight.enemy.id).not.toBe('tutor');
    expect([r.phase.fight.tutorial, r.tutorialDone]).toEqual([false, false]);
  });
  it('FIGHT-83 after the tutorial, the next monster fight is a normal one', () => {
    let s = walkWith(tutor, newRun(1, tutor), [[1, 6], [2, 6]]);
    s = reduce(tutor, winFight(s, tutor), { type: 'skipReward' });
    expect(run(s).tutorialDone).toBe(true);
    for (let seed = 0; seed < 200; seed++) {
      const slot = locationAt(run(newRun(seed, tutor)).level, [4, 3]);
      if (slot?.type !== 'monster') continue;
      let t = walkWith(tutor, newRun(seed, tutor), [[1, 6], [2, 6]]);
      t = reduce(tutor, winFight(t, tutor), { type: 'skipReward' });
      t = walkWith(tutor, t, [[3, 5], [3, 4], [4, 4], [4, 3]]);
      const r = run(t);
      if (r.phase.kind !== 'fight') throw new Error('expected a second fight');
      expect([r.phase.fight.enemy.id === 'tutor', r.phase.fight.tutorial]).toEqual([false, false]);
      return;
    }
    throw new Error('no seed deals a monster into the slot');
  });
});
