import { describe, expect, it } from 'vitest';
import { nextFloat, pick, seedRng, type RngState } from './rng';

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
