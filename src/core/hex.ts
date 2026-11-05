/** Hex grid maths from design/ui-rules.md §5: flat-top tiles in odd-q offset coordinates. */

export const GRID_COLS = 9;
export const GRID_ROWS = 7;

/** A tile as `[col, row]`, the same shape the map files use. */
export type Hex = readonly [col: number, row: number];

const NEIGHBOUR_OFFSETS: Record<'even' | 'odd', readonly Hex[]> = {
  even: [
    [1, -1],
    [1, 0],
    [-1, -1],
    [-1, 0],
    [0, -1],
    [0, 1],
  ],
  odd: [
    [1, 0],
    [1, 1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
  ],
};

export function sameHex(a: Hex, b: Hex): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** Text form of a tile, for map keys and error messages. */
export function hexKey([col, row]: Hex): string {
  return `${col},${row}`;
}

/** Every tile of the grid, column by column. */
export function allHexes(): Hex[] {
  return Array.from({ length: GRID_COLS }, (_, col) =>
    Array.from({ length: GRID_ROWS }, (_, row): Hex => [col, row]),
  ).flat();
}

export function isInGrid([col, row]: Hex): boolean {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}

/** The tiles next to `hex`, without any that fall outside the grid. */
export function neighbours([col, row]: Hex): Hex[] {
  return NEIGHBOUR_OFFSETS[col % 2 === 0 ? 'even' : 'odd']
    .map(([dCol, dRow]): Hex => [col + dCol, row + dRow])
    .filter(isInGrid);
}

export function areNeighbours(a: Hex, b: Hex): boolean {
  return neighbours(a).some((hex) => sameHex(hex, b));
}

/** Number of steps between two tiles, ignoring terrain. */
export function distance(a: Hex, b: Hex): number {
  const [aq, ar] = toAxial(a);
  const [bq, br] = toAxial(b);
  return (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs(aq + ar - bq - br)) / 2;
}

function toAxial([col, row]: Hex): readonly [q: number, r: number] {
  return [col, row - (col - (col & 1)) / 2];
}
