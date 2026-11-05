/**
 * Seeded random numbers (mulberry32). The generator's state is a plain number stored in the game
 * state, so the game logic stays pure and a run with the same seed always plays the same way.
 */

export type RngState = number;

export interface Rolled<T> {
  readonly value: T;
  readonly rng: RngState;
}

export function seedRng(seed: number): RngState {
  return seed >>> 0;
}

/** A float in [0, 1). */
export function nextFloat(rng: RngState): Rolled<number> {
  const next = (rng + 0x6d2b79f5) >>> 0;
  let mixed = Math.imul(next ^ (next >>> 15), next | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return { value: ((mixed ^ (mixed >>> 14)) >>> 0) / 2 ** 32, rng: next };
}

/** One item of a non-empty list, each equally likely. */
export function pick<T>(rng: RngState, items: readonly T[]): Rolled<T> {
  const { value, rng: next } = nextFloat(rng);
  const item = items[Math.floor(value * items.length)];
  if (item === undefined) throw new RangeError('pick() needs a non-empty list');
  return { value: item, rng: next };
}
