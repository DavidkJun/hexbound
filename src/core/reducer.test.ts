import { describe, expect, it } from 'vitest';
import exampleLevel from '../../data/levels/_example.json';
import { levelSchema } from '../data/schema';
import { reduce } from './reducer';
import { createGame } from './state';

const map = levelSchema.parse(exampleLevel);

function startedGame(seed: number) {
  return reduce(createGame(seed), { type: 'startLevel', map });
}

describe('startLevel', () => {
  it('puts the player on the start tile', () => {
    expect(startedGame(1).level?.playerAt).toEqual(map.start);
  });

  it('keeps fixed locations and deals one allowed location into every slot', () => {
    const locations = startedGame(1).level?.locations ?? [];

    expect(locations).toHaveLength(map.fixed.length + map.slots.length);
    expect(locations).toEqual(expect.arrayContaining(map.fixed));
    for (const slot of map.slots) {
      const dealt = locations.find(({ at }) => at === slot.at);
      expect(slot.allow).toContain(dealt?.type);
    }
  });

  it('deals the same way for the same seed', () => {
    expect(startedGame(7)).toEqual(startedGame(7));
  });

  it('deals differently across seeds', () => {
    const deals = [1, 2, 3, 4, 5, 6, 7, 8].map((seed) =>
      JSON.stringify(startedGame(seed).level?.locations),
    );
    expect(new Set(deals).size).toBeGreaterThan(1);
  });

  it('moves the random generator on and leaves the old state alone', () => {
    const before = createGame(1);
    const after = reduce(before, { type: 'startLevel', map });

    expect(after.rng).not.toBe(before.rng);
    expect(before).toEqual(createGame(1));
  });
});
