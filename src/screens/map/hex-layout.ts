import type { Hex } from '../../core/hex';
import { tokens } from '../../ui/design';

/** Where tiles go on screen, from the formula in design/ui-rules.md §5. */

interface Point {
  readonly x: number;
  readonly y: number;
}

const RADIUS = tokens.size.hex.radius;
const HEX_HEIGHT = Math.sqrt(3) * RADIUS;

/** Half the hex height: the distance from a tile's centre to the top of its bounding box. */
export const HEX_HALF_HEIGHT = HEX_HEIGHT / 2;

/** Centre of a tile, relative to the `HexGrid` element. */
export function tileCentre([col, row]: Hex): Point {
  return {
    x: RADIUS + col * 1.5 * RADIUS,
    y: HEX_HALF_HEIGHT + row * HEX_HEIGHT + (col % 2 === 1 ? HEX_HALF_HEIGHT : 0),
  };
}

/** The corners of a flat-top hex around its own centre, as an SVG `points` value. */
export const HEX_CORNERS = Array.from({ length: 6 }, (_, corner) => {
  const angle = (Math.PI / 3) * corner;
  return `${RADIUS * Math.cos(angle)},${RADIUS * Math.sin(angle)}`;
}).join(' ');
