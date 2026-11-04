/**
 * TC-HEX: the hex grid in code against design/ui-rules.md §5 and design/screens/map.md.
 * Expected numbers are computed here from the written formula, not taken from the code.
 */
import { describe, expect, it } from 'vitest';
import { allHexes, areNeighbours, distance, isInGrid, neighbours, type Hex } from '../../src/core/hex';
import { tileCentre } from '../../src/screens/map/hex-layout';
import { readJson } from './helpers';

const tokens = readJson<{ size: { hex: { radius: number } } }>('design/tokens.json');
const layout = readJson<{ screens: Record<string, Record<string, { x: number; y: number; w: number; h: number }>> }>(
  'design/layout.json',
);
const R = tokens.size.hex.radius;
const H = Math.sqrt(3) * R;

/** ui-rules.md §5, written out by hand. */
function specCentre(col: number, row: number) {
  return { x: R + col * 1.5 * R, y: H / 2 + row * H + (col % 2 === 1 ? H / 2 : 0) };
}

/** Brute-force BFS distance over the neighbour lists, as an independent oracle. */
function bfsDistance(a: Hex, b: Hex): number {
  const key = (h: Hex) => `${h[0]},${h[1]}`;
  const seen = new Map([[key(a), 0]]);
  const queue: Hex[] = [a];
  while (queue.length > 0) {
    const current = queue.shift() as Hex;
    const d = seen.get(key(current)) ?? 0;
    if (key(current) === key(b)) return d;
    for (const n of neighbours(current)) {
      if (!seen.has(key(n))) {
        seen.set(key(n), d + 1);
        queue.push(n);
      }
    }
  }
  return Infinity;
}

describe('TC-HEX-01 grid size', () => {
  it('TC-HEX-01a has 9 × 7 = 63 tiles, each once', () => {
    const tiles = allHexes();
    expect(tiles).toHaveLength(63);
    expect(new Set(tiles.map(([c, r]) => `${c},${r}`)).size).toBe(63);
  });
  it('TC-HEX-01b hex radius token is 46 px (ui-rules.md §5)', () => {
    expect(R).toBe(46);
  });
  it('TC-HEX-01c whole grid is 644 × 597.6 px and equals the HexGrid rect in layout.json', () => {
    const width = 2 * R + 8 * 1.5 * R;
    const height = 7 * H + H / 2;
    expect(width).toBe(644);
    expect(height).toBeCloseTo(597.56, 1);
    const rect = layout.screens.MapScreen?.HexGrid;
    expect(rect).toMatchObject({ x: 150, y: 89, w: 644 });
    expect(rect?.h).toBeCloseTo(height, 1);
  });
});

describe('TC-HEX-02 tile centres (map.md acceptance checklist: tiles 0,0 · 1,0 · 8,6)', () => {
  it.each([
    [0, 0, 46, 39.84],
    [1, 0, 115, 79.67],
    [8, 6, 598, 517.87],
  ])('TC-HEX-02a tile %i,%i is centred at x %f, y %f', (col, row, x, y) => {
    const centre = tileCentre([col, row]);
    expect(centre.x).toBeCloseTo(x, 1);
    expect(centre.y).toBeCloseTo(y, 1);
  });
  it('TC-HEX-02b every tile matches the formula in ui-rules.md', () => {
    for (const [col, row] of allHexes()) {
      const got = tileCentre([col, row]);
      const want = specCentre(col, row);
      expect(got.x).toBeCloseTo(want.x, 6);
      expect(got.y).toBeCloseTo(want.y, 6);
    }
  });
  it('TC-HEX-02c odd columns are pushed down by half a hex (odd-q)', () => {
    expect(tileCentre([1, 0]).y - tileCentre([0, 0]).y).toBeCloseTo(H / 2, 6);
    expect(tileCentre([2, 0]).y).toBeCloseTo(tileCentre([0, 0]).y, 6);
  });
  it('TC-HEX-02d every tile lies fully inside the HexGrid rect', () => {
    for (const hex of allHexes()) {
      const { x, y } = tileCentre(hex);
      expect(x - R).toBeGreaterThanOrEqual(-1e-9);
      expect(x + R).toBeLessThanOrEqual(644 + 1e-9);
      expect(y - H / 2).toBeGreaterThanOrEqual(-1e-9);
      expect(y + H / 2).toBeLessThanOrEqual(7 * H + H / 2 + 1e-9);
    }
  });
});

describe('TC-HEX-03 neighbours', () => {
  it('TC-HEX-03a neighbourhood is symmetric: a next to b ⇔ b next to a', () => {
    for (const a of allHexes()) for (const b of neighbours(a)) expect(areNeighbours(b, a)).toBe(true);
  });
  it('TC-HEX-03b every inner tile has 6 neighbours, corners 2 or 3', () => {
    for (const hex of allHexes()) {
      const [c, r] = hex;
      const inner = c > 0 && c < 8 && r > 0 && r < 6;
      if (inner) expect(neighbours(hex)).toHaveLength(6);
    }
    expect(neighbours([0, 0])).toHaveLength(2);
    expect(neighbours([8, 0])).toHaveLength(2);
    expect(neighbours([0, 6])).toHaveLength(3);
    expect(neighbours([8, 6])).toHaveLength(3);
  });
  it('TC-HEX-03c neighbours are exactly the tiles whose centres are √3·R apart (geometry oracle)', () => {
    for (const a of allHexes()) {
      const ca = tileCentre(a);
      const geometric = allHexes().filter((b) => {
        const cb = tileCentre(b);
        return Math.abs(Math.hypot(ca.x - cb.x, ca.y - cb.y) - H) < 1e-6;
      });
      const key = (h: Hex) => `${h[0]},${h[1]}`;
      expect(new Set(neighbours(a).map(key))).toEqual(new Set(geometric.map(key)));
    }
  });
  it('TC-HEX-03d never returns a tile outside the grid', () => {
    for (const a of allHexes()) for (const n of neighbours(a)) expect(isInGrid(n)).toBe(true);
  });
});

describe('TC-HEX-04 distance', () => {
  it('TC-HEX-04a equals the BFS step count for all 63 × 63 pairs', () => {
    for (const a of allHexes()) for (const b of allHexes()) expect(distance(a, b)).toBe(bfsDistance(a, b));
  });
  it('TC-HEX-04b corner to opposite corner is 10 steps (design doc: 9–10)', () => {
    expect(distance([0, 6], [8, 0])).toBe(10);
    expect(distance([0, 0], [8, 6])).toBe(10);
  });
  it('TC-HEX-04c is 0 to itself, 1 to a neighbour, and symmetric', () => {
    for (const a of allHexes()) {
      expect(distance(a, a)).toBe(0);
      for (const n of neighbours(a)) expect(distance(a, n)).toBe(1);
    }
    expect(distance([2, 3], [7, 1])).toBe(distance([7, 1], [2, 3]));
  });
  it('TC-HEX-04d "within 2 tiles" of the mockup player [1,5] matches map.png', () => {
    // map.png: player on [1,5]; chest [3,4] "2 steps away", elite [5,3] "more than 2 tiles away".
    expect(distance([1, 5], [3, 4])).toBe(2);
    expect(distance([1, 5], [5, 3])).toBeGreaterThan(2);
    expect(distance([1, 5], [2, 5])).toBe(1);
    expect(distance([1, 5], [1, 3])).toBe(2);
  });
});
