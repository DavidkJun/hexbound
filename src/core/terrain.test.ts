import { describe, expect, it } from 'vitest';
import { routeFoodCost, terrainAt } from './terrain';

const map = {
  hazard: 'swamp',
  terrain: [
    '.s.......',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
    '.........',
  ],
} as const;

describe('terrainAt', () => {
  it('reads normal tiles and the level hazard', () => {
    expect(terrainAt(map, [0, 0])).toBe('normal');
    expect(terrainAt(map, [1, 0])).toBe('swamp');
  });
});

describe('routeFoodCost', () => {
  it('costs 1 per normal step and 2 per slow step', () => {
    expect(
      routeFoodCost(map, [
        [0, 0],
        [1, 0],
        [2, 0],
      ]),
    ).toBe(3);
  });

  it("doesn't charge for the tile the walk starts on", () => {
    expect(
      routeFoodCost(map, [
        [1, 0],
        [2, 0],
      ]),
    ).toBe(1);
  });
});
