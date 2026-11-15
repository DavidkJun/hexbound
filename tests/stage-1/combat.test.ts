/**
 * Combat rules FIGHT-nn (tests/rules/stage-1-combat.md) against the combat core of PR #39.
 * Content: the programmer's fixed test content (src/core/test-content.ts): Strike 6, Defend 5,
 * Ice Shard 4 + Chill 1, Ration (0, +2 food, Exhaust), rat 20 H (bite 8, bite 8, burrow 5 block).
 * Expected numbers are worked out here from the rules, not read from the code.
 */
import { describe, expect, it } from 'vitest';
import type { Content } from '../../src/core/content';
import {
  canPlay,
  endTurn,
  intentOf,
  playCard,
  startFight,
  type Battle,
  type FightSetup,
  type FightState,
} from '../../src/core/fight';
import { seedRng } from '../../src/core/rng';
import { starterDeck as runStarterDeck } from '../../src/core/run';
import { starterDeck, testContent } from '../../src/core/test-content';

const resources = { health: 60, maxHealth: 60, gold: 20, food: 10 };

/** Test content plus a few cards and enemies the rules need and the fixture doesn't have. */
const content: Content = (() => {
  const cards = new Map(testContent.catalogue.cards);
  const base = testContent.catalogue.cards.get('strike');
  if (!base) throw new Error('fixture changed: no strike');
  const add = (id: string, cost: number, effects: object[]) =>
    cards.set(id, { ...base, id, name: id, rarity: 'common', copies: undefined, cost, effects } as never);
  add('bloodletting', 0, [{ type: 'loseHealth', amount: 3 }]);
  add('double-hit', 1, [{ type: 'dealDamage', amount: 3 }, { type: 'dealDamage', amount: 3 }]);
  add('draw-two', 0, [{ type: 'draw', amount: 2 }]);
  add('patch', 0, [{ type: 'heal', amount: 5 }]);
  const enemies = new Map(testContent.catalogue.enemies);
  const rat = testContent.catalogue.enemies.get('rat');
  if (!rat) throw new Error('fixture changed: no rat');
  enemies.set('chiller', {
    ...rat,
    id: 'chiller',
    health: 50,
    moves: [{ id: 'numb', name: 'numb', intent: 'debuff', effects: [{ type: 'applyChill', amount: 2 }] }],
    pattern: { type: 'cycle', order: ['numb'] },
  } as never);
  enemies.set('dummy', {
    ...rat,
    id: 'dummy',
    health: 99,
    moves: [{ id: 'wait', name: 'wait', intent: 'block', effects: [{ type: 'gainBlock', amount: 1 }] }],
    pattern: { type: 'cycle', order: ['wait'] },
  } as never);
  return { ...testContent, catalogue: { ...testContent.catalogue, cards, enemies } };
})();

function start(enemy = 'rat', setup: Partial<FightSetup> = {}): Battle {
  return startFight(content, { enemy, deck: starterDeck, resources, rng: seedRng(7), ...setup });
}

/** The battle with some fight fields set by hand, to reach an exact situation. */
function withFight(battle: Battle, change: Partial<FightState>): Battle {
  return { ...battle, fight: { ...battle.fight, ...change } };
}

function play(battle: Battle, id: string): Battle {
  const i = battle.fight.hand.indexOf(id);
  if (i < 0) throw new Error(`${id} not in hand: ${battle.fight.hand.join(', ')}`);
  return playCard(content, battle, i);
}

describe('FIGHT-0x fight start', () => {
  it('FIGHT-02 the whole deck goes into the draw pile, shuffled by the seed; 5 are drawn', () => {
    const b = start();
    expect(b.fight.hand).toHaveLength(5);
    expect(b.fight.drawPile).toHaveLength(5);
    expect([...b.fight.hand, ...b.fight.drawPile].sort()).toEqual([...starterDeck].sort());
    expect(b.fight.discard).toEqual([]);
    expect(b.fight.exhausted).toEqual([]);
    expect(start().fight).toEqual(b.fight); // same seed, same fight
    const orders = new Set([1, 2, 3, 4, 5].map((s) => start('rat', { rng: seedRng(s) }).fight.hand.join()));
    expect(orders.size).toBeGreaterThan(1);
  });
  it('FIGHT-03 Chilled → turn 1 has 2/3 energy; Rested → turn 1 starts with 5 block; both together', () => {
    expect(start('rat', { chilled: true }).fight.player.energy).toBe(2);
    expect(start('rat', { rested: true }).fight.player.block).toBe(5);
    const both = start('rat', { chilled: true, rested: true }).fight.player;
    expect([both.energy, both.block, both.chill]).toEqual([2, 5, 0]);
  });
  it('FIGHT-04 the starter deck is 4 Strike, 4 Defend, 1 Ice Shard, 1 Ration', () => {
    const deck = runStarterDeck(testContent);
    const count = (id: string) => deck.filter((c) => c === id).length;
    expect(deck).toHaveLength(10);
    expect([count('strike'), count('defend'), count('ice-shard'), count('ration')]).toEqual([4, 4, 1, 1]);
  });
});

describe('FIGHT-1x player turn', () => {
  it('FIGHT-10 block from the fight start is kept on turn 1, and reset at the start of turn 2', () => {
    let b = start('dummy', { rested: true });
    expect(b.fight.player.block).toBe(5);
    b = withFight(b, { player: { ...b.fight.player, block: 15 } });
    b = endTurn(content, b);
    expect(b.fight.turn).toBe(2);
    expect(b.fight.player.block).toBe(0);
  });
  it('FIGHT-11 energy is 3 minus Chill, never below 0, and Chill is then removed', () => {
    let b = start('dummy');
    b = withFight(b, { player: { ...b.fight.player, chill: 1 } });
    b = endTurn(content, b);
    expect([b.fight.player.energy, b.fight.player.chill]).toEqual([2, 0]);
    b = withFight(b, { player: { ...b.fight.player, chill: 4 } });
    b = endTurn(content, b);
    expect([b.fight.player.energy, b.fight.player.chill]).toEqual([0, 0]);
  });
  it('FIGHT-12 every player turn draws 5', () => {
    let b = start('dummy');
    for (let turn = 1; turn <= 4; turn++) {
      expect(b.fight.hand).toHaveLength(5);
      b = endTurn(content, b);
    }
  });
  it('FIGHT-13 a cycle pattern loops: bite, bite, burrow, bite', () => {
    let b = start('rat', { resources: { ...resources, health: 999, maxHealth: 999 } });
    const intents: string[] = [];
    for (let turn = 1; turn <= 4; turn++) {
      intents.push(b.fight.enemy.intent);
      b = endTurn(content, b);
    }
    expect(intents).toEqual(['bite', 'bite', 'burrow', 'bite']);
  });
  it('FIGHT-14 a card needs its cost in energy; a 0-cost card plays at 0 energy', () => {
    let b = withFight(start(), { hand: ['strike', 'ration'], player: { ...start().fight.player, energy: 0 } });
    expect(canPlay(content, b.fight, 0)).toBe(false);
    expect(playCard(content, b, 0)).toBe(b); // nothing happens
    expect(canPlay(content, b.fight, 1)).toBe(true);
    b = withFight(b, { player: { ...b.fight.player, energy: 1 } });
    b = play(b, 'strike');
    expect(b.fight.player.energy).toBe(0);
  });
  it('FIGHT-15 / FIGHT-52 a played card goes to the discard pile; an Exhaust card to the exhaust pile', () => {
    let b = withFight(start(), { hand: ['strike', 'ration'], discard: [], exhausted: [] });
    b = play(play(b, 'strike'), 'ration');
    expect(b.fight.discard).toEqual(['strike']);
    expect(b.fight.exhausted).toEqual(['ration']);
    expect(b.resources.food).toBe(12);
  });
  it('FIGHT-16 End turn discards the whole hand; unused energy does not carry over', () => {
    let b = withFight(start('dummy'), { discard: [] });
    const hand = [...b.fight.hand];
    b = endTurn(content, b);
    expect(b.fight.player.energy).toBe(3);
    // The 5 old cards went to the discard pile (unless the draw reshuffled them back).
    expect(b.fight.discard.length + b.fight.drawPile.length + b.fight.hand.length).toBe(10);
    expect(hand.every((c) => [...b.fight.discard, ...b.fight.drawPile, ...b.fight.hand].includes(c))).toBe(true);
  });
  it('FIGHT-17 gainEnergy goes above 3 for that turn only', () => {
    let b = withFight(start('dummy'), { hand: ['surge'] });
    b = play(b, 'surge');
    expect(b.fight.player.energy).toBe(5);
    b = endTurn(content, b);
    expect(b.fight.player.energy).toBe(3);
  });
});

describe('FIGHT-2x draw, hand and reshuffle', () => {
  it('FIGHT-20 a card drawn into a full hand (10) goes to the discard pile', () => {
    let b = withFight(start(), {
      hand: ['draw-two', ...Array<string>(9).fill('defend')],
      drawPile: ['strike', 'strike', 'strike'],
      discard: [],
    });
    b = play(b, 'draw-two'); // hand 9 after playing, +1 → 10, the 2nd draw is discarded
    expect(b.fight.hand).toHaveLength(10);
    expect(b.fight.discard.filter((c) => c === 'strike')).toHaveLength(1);
    expect(b.fight.drawPile).toHaveLength(1);
  });
  it('FIGHT-21 drawing from an empty draw pile shuffles the discard pile in first', () => {
    let b = withFight(start(), { hand: ['draw-two'], drawPile: [], discard: ['strike', 'defend', 'defend'] });
    b = play(b, 'draw-two');
    expect(b.fight.hand).toHaveLength(2);
    expect(b.fight.drawPile.length + b.fight.hand.length).toBe(3);
    expect(b.fight.discard).toEqual(['draw-two']); // only the card just played
  });
  it('FIGHT-22 draw and discard both empty: nothing is drawn', () => {
    let b = withFight(start(), { hand: ['draw-two'], drawPile: [], discard: [] });
    b = play(b, 'draw-two');
    expect(b.fight.hand).toEqual([]);
  });
  it('FIGHT-23 a turn-start draw that runs out midway reshuffles midway', () => {
    let b = withFight(start('dummy'), { hand: [], drawPile: ['strike', 'strike'], discard: ['defend', 'defend', 'defend', 'defend', 'defend'] });
    b = endTurn(content, b);
    expect(b.fight.hand.slice(0, 2)).toEqual(['strike', 'strike']);
    expect(b.fight.hand).toHaveLength(5);
    expect(b.fight.drawPile).toHaveLength(2);
  });
  it('FIGHT-24 exhausted cards are never reshuffled', () => {
    let b = withFight(start(), { hand: ['ration', 'draw-two'], drawPile: [], discard: ['strike'] });
    b = play(play(b, 'ration'), 'draw-two');
    expect(b.fight.exhausted).toEqual(['ration']);
    expect([...b.fight.hand, ...b.fight.drawPile]).not.toContain('ration');
  });
});

describe('FIGHT-3x damage and block', () => {
  const rat = (b: Battle, change: Partial<FightState['enemy']>) => withFight(b, { enemy: { ...b.fight.enemy, ...change } });

  it('FIGHT-30 enemy damage = amount + strength − Chill, never below 0', () => {
    const b = start(); // intent: bite 8
    const after = (change: Partial<FightState['enemy']>) => 60 - endTurn(content, rat(b, change)).resources.health;
    expect(after({})).toBe(8);
    expect(after({ chill: 1 })).toBe(7);
    expect(after({ chill: 1, strength: 2 })).toBe(9);
    expect(after({ chill: 9 })).toBe(0);
  });
  it('FIGHT-31 the player’s Chill never lowers the player’s damage', () => {
    let b = withFight(start('dummy'), { hand: ['strike'] });
    b = withFight(b, { player: { ...b.fight.player, chill: 1 } });
    b = play(b, 'strike');
    expect(b.fight.enemy.health).toBe(99 - 6);
  });
  it('FIGHT-32 block absorbs damage first', () => {
    const b = start();
    const hit = (block: number) => endTurn(content, withFight(b, { player: { ...b.fight.player, block } }));
    expect(60 - hit(5).resources.health).toBe(3);
    expect(60 - hit(10).resources.health).toBe(0);
  });
  it('FIGHT-33 loseHealth ignores block', () => {
    let b = withFight(start(), { hand: ['bloodletting'] });
    b = withFight(b, { player: { ...b.fight.player, block: 5 } });
    b = play(b, 'bloodletting');
    expect([b.resources.health, b.fight.player.block]).toEqual([57, 5]);
  });
  it('FIGHT-34 gainBlock adds up', () => {
    let b = withFight(start(), { hand: ['defend', 'defend'] });
    b = play(play(b, 'defend'), 'defend');
    expect(b.fight.player.block).toBe(10);
  });
  it('FIGHT-35 block the enemy gains on its turn protects it during the player’s next turn', () => {
    let b = start('dummy'); // its move: gain 1 block
    b = endTurn(content, b);
    expect(b.fight.enemy.block).toBe(1);
    b = withFight(b, { hand: ['strike'] });
    b = play(b, 'strike');
    expect([b.fight.enemy.block, b.fight.enemy.health]).toEqual([0, 99 - 5]);
  });
  it('FIGHT-36 healing never goes above max health', () => {
    let b = withFight(start('rat', { resources: { ...resources, health: 58 } }), { hand: ['patch', 'patch'] });
    b = play(b, 'patch');
    expect(b.resources.health).toBe(60);
    b = withFight({ ...b, resources: { ...b.resources, health: 50 } }, {});
    b = play(b, 'patch');
    expect(b.resources.health).toBe(55);
  });
});

describe('FIGHT-4x / 5x enemy turn, keywords and statuses', () => {
  it('FIGHT-41 enemy turn: its Chill goes down by 1 after the move', () => {
    let b = withFight(start(), { enemy: { ...start().fight.enemy, chill: 2 } });
    b = endTurn(content, b);
    expect(60 - b.resources.health).toBe(6);
    expect(b.fight.enemy.chill).toBe(1);
  });
  it('FIGHT-42 the enemy does exactly the move it showed', () => {
    let b = start();
    const shown = b.fight.enemy.intent;
    b = endTurn(content, b);
    expect(shown).toBe('bite');
    expect(60 - b.resources.health).toBe(8);
  });
  it('FIGHT-50 Freeze: the enemy skips its move, its pattern moves on, Freeze does not stack', () => {
    let b = withFight(start(), { hand: ['deep-freeze', 'deep-freeze'] });
    b = play(b, 'deep-freeze');
    expect(intentOf(content, b.fight).frozen).toBe(true);
    b = play(b, 'deep-freeze'); // second Freeze: still one skip
    b = endTurn(content, b);
    expect(b.resources.health).toBe(60); // skipped
    expect(b.fight.enemy.frozen).toBe(false);
    expect(b.fight.enemy.intent).toBe('bite'); // the 2nd bite: the skipped move counts as used
    b = endTurn(content, b);
    expect(60 - b.resources.health).toBe(8); // not frozen any more
    expect(b.fight.enemy.intent).toBe('burrow');
  });
  it('FIGHT-53 Chill on the enemy adds up and lowers each attack, then goes down by 1', () => {
    let b = withFight(start(), { hand: ['ice-shard', 'ice-shard'], player: { ...start().fight.player, energy: 3 } });
    b = play(play(b, 'ice-shard'), 'ice-shard');
    expect(b.fight.enemy.chill).toBe(2);
    expect(b.fight.enemy.health).toBe(20 - 8);
    b = endTurn(content, b);
    expect(60 - b.resources.health).toBe(6);
    expect(b.fight.enemy.chill).toBe(1);
  });
  it('FIGHT-54 Chill on the player lowers the next turn’s energy, then is removed', () => {
    let b = start('chiller'); // numb: Chill 2 on the player
    b = endTurn(content, b);
    expect([b.fight.player.energy, b.fight.player.chill]).toEqual([1, 0]);
  });
  it('FIGHT-55 Draw N draws now, with the hand limit and reshuffle (see FIGHT-20, 21)', () => {
    let b = withFight(start(), { hand: ['flurry'], drawPile: ['strike', 'defend'] });
    b = play(b, 'flurry');
    expect(b.fight.hand).toEqual(['strike']);
  });
  it('FIGHT-56 strength adds up and adds to each attack of that side', () => {
    let b = withFight(start('dummy'), { hand: ['war-cry', 'war-cry', 'strike'], player: { ...start('dummy').fight.player, energy: 3 } });
    b = play(play(play(b, 'war-cry'), 'war-cry'), 'strike');
    expect(b.fight.enemy.health).toBe(99 - 10);
    // An enemy buff: brute roars (+2 strength), then smashes 10 → 12.
    let e = startFight(content, { enemy: 'brute', deck: starterDeck, resources, rng: seedRng(1) });
    e = endTurn(content, e);
    e = endTurn(content, e);
    expect(60 - e.resources.health).toBe(12);
  });
  it('FIGHT-56 (Q-C2) strength applies to each dealDamage effect of a card', () => {
    let b = withFight(start('dummy'), { hand: ['war-cry', 'double-hit'] });
    b = play(play(b, 'war-cry'), 'double-hit');
    expect(b.fight.enemy.health).toBe(99 - 10);
  });
});

describe('FIGHT-6x intent', () => {
  it('FIGHT-60 an attack intent shows the damage it will really deal', () => {
    const b = start();
    expect(intentOf(content, b.fight).value).toBe(8);
    expect(intentOf(content, withFight(b, { enemy: { ...b.fight.enemy, chill: 1, strength: 3 } }).fight).value).toBe(10);
  });
  it('FIGHT-61 (Q-C1) the intent updates at once when the player applies Chill', () => {
    let b = withFight(start(), { hand: ['ice-shard'] });
    b = play(b, 'ice-shard');
    expect(intentOf(content, b.fight).value).toBe(7);
  });
  it('FIGHT-62 a frozen enemy’s intent says so', () => {
    let b = withFight(start(), { hand: ['deep-freeze'] });
    b = play(b, 'deep-freeze');
    expect(intentOf(content, b.fight).frozen).toBe(true);
  });
});

describe('FIGHT-7x fight end', () => {
  it('FIGHT-70 the fight ends the moment the enemy reaches 0, even mid-card', () => {
    let b = withFight(start(), { hand: ['double-hit', 'strike'], enemy: { ...start().fight.enemy, health: 3 } });
    b = play(b, 'double-hit');
    expect(b.fight.outcome).toBe('won');
    expect(b.fight.hand).toEqual(['strike']); // the rest of the turn doesn't happen
    expect(playCard(content, b, 0)).toBe(b);
    expect(endTurn(content, b)).toBe(b);
  });
  it('FIGHT-70 the player losing on the enemy turn ends the fight as lost', () => {
    const b = endTurn(content, start('rat', { resources: { ...resources, health: 8 } }));
    expect([b.fight.outcome, b.resources.health]).toEqual(['lost', 0]);
  });
  it('FIGHT-71 overkill and exact kills both win with health shown as 0', () => {
    for (const health of [6, 4]) {
      let b = withFight(start(), { hand: ['strike'], enemy: { ...start().fight.enemy, health } });
      b = play(b, 'strike');
      expect([b.fight.outcome, b.fight.enemy.health]).toEqual(['won', 0]);
    }
  });
});
