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

/** A whole number from `min` to `max`, both included. */
export function rollInt(rng: RngState, min: number, max: number): Rolled<number> {
  const { value, rng: next } = nextFloat(rng);
  return { value: min + Math.floor(value * (max - min + 1)), rng: next };
}

/** The items in a random order. */
export function shuffle<T>(rng: RngState, items: readonly T[]): Rolled<T[]> {
  let state = rng;
  const keyed = items.map((item) => {
    const roll = nextFloat(state);
    state = roll.rng;
    return { item, key: roll.value };
  });
  keyed.sort((a, b) => a.key - b.key);
  return { value: keyed.map(({ item }) => item), rng: state };
}

/** Up to `count` different items of the list, in a random order. */
export function sample<T>(rng: RngState, items: readonly T[], count: number): Rolled<T[]> {
  const { value, rng: next } = shuffle(rng, items);
  return { value: value.slice(0, count), rng: next };
}

/** One item, each as likely as its weight. The weights are positive. */
export function pickWeighted<T>(
  rng: RngState,
  entries: readonly (readonly [T, number])[],
): Rolled<T> {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  const { value, rng: next } = nextFloat(rng);
  let left = value * total;
  for (const [item, weight] of entries) {
    left -= weight;
    if (left < 0) return { value: item, rng: next };
  }
  const last = entries.at(-1);
  if (!last) throw new RangeError('pickWeighted() needs a non-empty list');
  return { value: last[0], rng: next };
}
