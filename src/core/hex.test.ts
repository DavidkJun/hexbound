import { describe, expect, it } from 'vitest';
import { allHexes, areNeighbours, distance, GRID_COLS, GRID_ROWS, neighbours } from './hex';

describe('allHexes', () => {
  it('lists every tile once', () => {
    const keys = allHexes().map(String);
    expect(keys).toHaveLength(GRID_COLS * GRID_ROWS);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('neighbours', () => {
  it('follows the even column list from ui-rules.md', () => {
    expect(neighbours([4, 3])).toEqual([
      [5, 2],
      [5, 3],
      [3, 2],
      [3, 3],
      [4, 2],
      [4, 4],
    ]);
  });

  it('follows the odd column list from ui-rules.md', () => {
    expect(neighbours([3, 3])).toEqual([
      [4, 3],
      [4, 4],
      [2, 3],
      [2, 4],
      [3, 2],
      [3, 4],
    ]);
  });

  it('drops tiles outside the grid', () => {
    expect(neighbours([0, 0])).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });
});

describe('distance', () => {
  it('is 10 from corner to opposite corner', () => {
    expect(distance([0, 6], [8, 0])).toBe(10);
  });

  it('agrees with the neighbour lists for every pair of tiles', () => {
    for (const a of allHexes()) {
      for (const b of allHexes()) {
        expect(areNeighbours(a, b)).toBe(distance(a, b) === 1);
      }
    }
  });
});
