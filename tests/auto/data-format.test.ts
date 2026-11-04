/**
 * TC-DATA: content data files against data/README.md (cards, enemies, blessings, events, effects).
 * Built on the `_example.json` files: each test breaks one thing and expects a named problem.
 */
import { describe, expect, it } from 'vitest';
import { gameFiles, problemsOf, readJson, withFile } from './helpers';

type Json = Record<string, unknown>;
const CARDS = 'data/cards/_example.json';
const ENEMIES = 'data/enemies/_example.json';
const BLESSINGS = 'data/blessings/_example.json';
const EVENTS = 'data/events/_example.json';

const cards = readJson<Json[]>(CARDS);
const enemies = readJson<Json[]>(ENEMIES);
const blessings = readJson<Json[]>(BLESSINGS);
const events = readJson<Json[]>(EVENTS);

/** Problems after replacing the first entry of `path` with `entry`. */
function firstEntry(path: string, list: Json[], entry: Json) {
  return problemsOf(withFile(path, [entry, ...list.slice(1)]));
}
const fields = (problems: readonly { field: string }[]) => problems.map((p) => p.field);
const card = (changes: Json) => ({ ...structuredClone(cards[0]), ...changes });
const enemy = (changes: Json) => ({ ...structuredClone(enemies[0]), ...changes });

describe('TC-DATA-01 cards', () => {
  it.each(['weapon', 'spell', 'armour', 'item'])('TC-DATA-01a accepts the family %s', (family) => {
    expect(firstEntry(CARDS, cards, card({ family }))).toEqual([]);
  });
  it.each(['armor', 'Weapon', 'curse'])('TC-DATA-01b rejects the family "%s"', (family) => {
    expect(fields(firstEntry(CARDS, cards, card({ family })))).toEqual(['[0].family']);
  });
  it('TC-DATA-01c accepts cost 0 (boundary) and rejects -1 and 1.5', () => {
    expect(firstEntry(CARDS, cards, card({ cost: 0 }))).toEqual([]);
    expect(fields(firstEntry(CARDS, cards, card({ cost: -1 })))).toEqual(['[0].cost']);
    expect(fields(firstEntry(CARDS, cards, card({ cost: 1.5 })))).toEqual(['[0].cost']);
  });
  it('TC-DATA-01d rejects a card with no effects', () => {
    expect(fields(firstEntry(CARDS, cards, card({ effects: [] })))).toEqual(['[0].effects']);
  });
  it('TC-DATA-01e rejects an empty name and an empty text', () => {
    expect(fields(firstEntry(CARDS, cards, card({ name: '' })))).toEqual(['[0].name']);
    expect(fields(firstEntry(CARDS, cards, card({ text: '' })))).toEqual(['[0].text']);
  });
  it.each(['Strike', 'strike_1', 'ice shard', '-strike'])('TC-DATA-01f rejects the id "%s" (not kebab-case)', (id) => {
    expect(fields(firstEntry(CARDS, cards, card({ id })))).toEqual(['[0].id']);
  });
  it('TC-DATA-01g rejects the same id used twice in one file', () => {
    const copy = { ...structuredClone(cards[1]), id: cards[0]?.id };
    const problems = problemsOf(withFile(CARDS, [cards[0], copy, ...cards.slice(2)]));
    expect(fields(problems)).toEqual(['[1].id']);
  });
  it('TC-DATA-01h rejects an empty cards file', () => {
    expect(problemsOf(withFile(CARDS, []))).not.toEqual([]);
  });
  it('TC-DATA-01i the same id may be used by a card and a blessing (ids are unique per folder)', () => {
    const blessing = { ...structuredClone(blessings[0]), id: cards[0]?.id };
    expect(problemsOf(withFile(BLESSINGS, [blessing, ...blessings.slice(1)]))).toEqual([]);
  });
});

describe('TC-DATA-02 effects (one shared vocabulary)', () => {
  const amountTypes = [
    'dealDamage', 'gainBlock', 'gainEnergy', 'draw', 'applyFreeze', 'applyChill',
    'heal', 'loseHealth', 'gainFood', 'loseFood', 'gainGold', 'loseGold',
  ];
  it.each(amountTypes)('TC-DATA-02a accepts %s with amount 1 (boundary)', (type) => {
    expect(firstEntry(CARDS, cards, card({ effects: [{ type, amount: 1 }] }))).toEqual([]);
  });
  it.each(amountTypes)('TC-DATA-02b rejects %s with amount 0', (type) => {
    expect(firstEntry(CARDS, cards, card({ effects: [{ type, amount: 0 }] }))).not.toEqual([]);
  });
  it('TC-DATA-02c rejects an amount that is missing, negative, a fraction or a string', () => {
    for (const amount of [undefined, -2, 2.5, '3']) {
      expect(firstEntry(CARDS, cards, card({ effects: [{ type: 'dealDamage', amount }] }))).not.toEqual([]);
    }
  });
  it('TC-DATA-02d accepts exhaust without an amount and rejects it with one', () => {
    expect(firstEntry(CARDS, cards, card({ effects: [{ type: 'dealDamage', amount: 1 }, { type: 'exhaust' }] }))).toEqual([]);
    expect(firstEntry(CARDS, cards, card({ effects: [{ type: 'exhaust', amount: 1 }] }))).not.toEqual([]);
  });
  it.each(['dealdamage', 'damage', 'gainShield', 'applyBurn'])('TC-DATA-02e rejects the unknown effect "%s"', (type) => {
    expect(firstEntry(CARDS, cards, card({ effects: [{ type, amount: 1 }] }))).not.toEqual([]);
  });
});

describe('TC-DATA-03 enemies', () => {
  it.each(['normal', 'elite'])('TC-DATA-03a accepts kind %s without a signature', (kind) => {
    const { signature: _drop, ...rest } = enemy({ kind }) as Json & { signature?: unknown };
    expect(firstEntry(ENEMIES, enemies, rest)).toEqual([]);
  });
  it('TC-DATA-03b requires a signature on a boss', () => {
    const { signature: _drop, ...rest } = enemy({ kind: 'boss' }) as Json & { signature?: unknown };
    expect(fields(firstEntry(ENEMIES, enemies, rest))).toEqual(['[0].signature']);
  });
  it('TC-DATA-03c rejects a cycle that names a move the enemy does not have', () => {
    const problems = firstEntry(ENEMIES, enemies, enemy({ pattern: { type: 'cycle', order: ['bite', 'roar'] } }));
    expect(fields(problems)).toEqual(['[0].pattern.order[1]']);
  });
  it('TC-DATA-03d rejects an empty cycle', () => {
    expect(firstEntry(ENEMIES, enemies, enemy({ pattern: { type: 'cycle', order: [] } }))).not.toEqual([]);
  });
  it('TC-DATA-03e rejects random weights of 0', () => {
    expect(firstEntry(ENEMIES, enemies, enemy({ pattern: { type: 'random', weights: { bite: 0 } } }))).not.toEqual([]);
  });
  it.each(['attack', 'block', 'buff', 'debuff'])('TC-DATA-03f accepts the intent %s', (intent) => {
    const moves = structuredClone(enemies[0]?.moves) as Json[];
    if (moves[0]) moves[0].intent = intent;
    expect(firstEntry(ENEMIES, enemies, enemy({ moves }))).toEqual([]);
  });
  it('TC-DATA-03g rejects health 0', () => {
    expect(fields(firstEntry(ENEMIES, enemies, enemy({ health: 0 })))).toEqual(['[0].health']);
  });

  // An enemy whose pattern can pick no move has no intent to show (ui-rules.md §8: the intent is
  // always visible). The loader accepts it, so the fight would break at run time.
  it.fails('BUG-001 TC-DATA-03h rejects random weights with no moves at all', () => {
    expect(firstEntry(ENEMIES, enemies, enemy({ pattern: { type: 'random', weights: {} } }))).not.toEqual([]);
  });

  // Two moves with one id: the cycle `order` and the signature can't tell them apart.
  const moves = structuredClone(enemies[0]?.moves) as Json[];
  const onlyFirst = { type: 'cycle', order: [moves[0]?.id] };
  it('TC-DATA-03i-control the same enemy with two distinct move ids is valid', () => {
    expect(firstEntry(ENEMIES, enemies, enemy({ moves: [moves[0], moves[1]], pattern: onlyFirst }))).toEqual([]);
  });
  it.fails('BUG-003 TC-DATA-03i rejects two moves with the same id in one enemy', () => {
    const copy = { ...structuredClone(moves[1]), id: moves[0]?.id };
    expect(firstEntry(ENEMIES, enemies, enemy({ moves: [moves[0], copy], pattern: onlyFirst }))).not.toEqual([]);
  });
});

describe('TC-DATA-04 blessings', () => {
  it.each(['onPickup', 'levelStart', 'fightStart', 'turnStart'])('TC-DATA-04a accepts the trigger %s', (trigger) => {
    expect(problemsOf(withFile(BLESSINGS, [{ ...blessings[0], trigger }, ...blessings.slice(1)]))).toEqual([]);
  });
  it('TC-DATA-04b rejects an unknown trigger', () => {
    const problems = problemsOf(withFile(BLESSINGS, [{ ...blessings[0], trigger: 'onDeath' }, ...blessings.slice(1)]));
    expect(fields(problems)).toEqual(['[0].trigger']);
  });
});

describe('TC-DATA-05 events', () => {
  const event = () => structuredClone(events[0]) as Json & { choices: Json[] };

  it('TC-DATA-05a rejects an event with one choice (needs at least two)', () => {
    const e = event();
    e.choices = e.choices.slice(0, 1);
    expect(fields(problemsOf(withFile(EVENTS, [e])))).toEqual(['[0].choices']);
  });
  it.each([
    [[50, 49], false],
    [[50, 51], false],
    [[100], true],
    [[1, 99], true],
    [[34, 33, 33], true],
  ])('TC-DATA-05b chances %j → valid: %s (must add up to 100)', (chances, valid) => {
    const e = event();
    e.choices[0] = {
      ...e.choices[0],
      outcomes: chances.map((chance) => ({ chance, text: 'x', effects: [] })),
    };
    const problems = problemsOf(withFile(EVENTS, [e]));
    expect(problems.length === 0).toBe(valid);
  });
  it('TC-DATA-05c rejects a chance of 0 and of 101', () => {
    for (const chance of [0, 101]) {
      const e = event();
      e.choices[0] = { ...e.choices[0], outcomes: [{ chance, text: 'x', effects: [] }] };
      expect(problemsOf(withFile(EVENTS, [e]))).not.toEqual([]);
    }
  });
  it('TC-DATA-05d accepts a cost in gold, food and health, and rejects other costs', () => {
    const e = event();
    e.choices[0] = { ...e.choices[0], cost: { gold: 1, food: 1, health: 1 } };
    expect(problemsOf(withFile(EVENTS, [e]))).toEqual([]);
    e.choices[0] = { ...e.choices[0], cost: { lives: 1 } };
    expect(problemsOf(withFile(EVENTS, [e]))).not.toEqual([]);
  });
});

describe('TC-DATA-06 the real game data (empty in stage 0)', () => {
  it('TC-DATA-06a the game files that exist load without problems', () => {
    expect(problemsOf(gameFiles)).toEqual([]);
  });
});
