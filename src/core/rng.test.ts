import { describe, expect, it } from 'vitest';
import {
  nextFloat,
  pick,
  pickWeighted,
  rollInt,
  sample,
  seedRng,
  shuffle,
  type RngState,
} from './rng';

function floats(seed: number, count: number): number[] {
  let rng: RngState = seedRng(seed);
  return Array.from({ length: count }, () => {
    const roll = nextFloat(rng);
    rng = roll.rng;
    return roll.value;
  });
}

describe('nextFloat', () => {
  it('gives the same numbers for the same seed', () => {
    expect(floats(42, 20)).toEqual(floats(42, 20));
  });

  it('gives different numbers for a different seed', () => {
    expect(floats(42, 20)).not.toEqual(floats(43, 20));
  });

  it('stays in [0, 1)', () => {
    for (const value of floats(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('pick', () => {
  it('can pick every item', () => {
    const items = ['a', 'b', 'c'];
    let rng = seedRng(1);
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const roll = pick(rng, items);
      rng = roll.rng;
      seen.add(roll.value);
    }
    expect(seen).toEqual(new Set(items));
  });

  it('refuses an empty list', () => {
    expect(() => pick(seedRng(1), [])).toThrow(RangeError);
  });
});

describe('rollInt', () => {
  it('stays within both ends and reaches each of them', () => {
    const rolls = new Set<number>();
    let rng = seedRng(5);
    for (let i = 0; i < 200; i++) {
      const roll = rollInt(rng, 10, 15);
      rolls.add(roll.value);
      rng = roll.rng;
    }
    expect([...rolls].sort((a, b) => a - b)).toEqual([10, 11, 12, 13, 14, 15]);
  });
});

describe('shuffle and sample', () => {
  it('shuffles into a different order with the same items, the same way for a seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    const { value } = shuffle(seedRng(2), items);
    expect([...value].sort()).toEqual(items);
    expect(value).not.toEqual(items);
    expect(shuffle(seedRng(2), items)).toEqual(shuffle(seedRng(2), items));
  });

  it('samples different items, as many as there are at most', () => {
    expect(new Set(sample(seedRng(1), ['a', 'b', 'c', 'd'], 3).value).size).toBe(3);
    expect(sample(seedRng(1), ['a', 'b'], 3).value).toHaveLength(2);
  });
});

describe('pickWeighted', () => {
  it('picks by weight', () => {
    const counts = { often: 0, rarely: 0 };
    let rng = seedRng(3);
    for (let i = 0; i < 400; i++) {
      const roll = pickWeighted(rng, [
        ['often', 3],
        ['rarely', 1],
      ] as const);
      counts[roll.value]++;
      rng = roll.rng;
    }
    expect(counts.often).toBeGreaterThan(counts.rarely * 2);
    expect(counts.rarely).toBeGreaterThan(0);
  });
});
