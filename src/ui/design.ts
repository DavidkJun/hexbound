import layoutJson from '../../design/layout.json';
import tokensJson from '../../design/tokens.json';

/** The bridge to design/: every colour, size and position on screen comes through here. */

export const tokens = tokensJson;

/** Rectangles of named elements per screen: `layout.MapScreen.HexGrid`. */
export const layout = layoutJson.screens;

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Inline style that places an element exactly at its layout.json rectangle. */
export function rectStyle({ x, y, w, h }: Rect) {
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  } as const;
}

interface TokenTree {
  readonly [name: string]: string | number | TokenTree;
}

/** Numeric tokens are pixels, except these. */
const UNITLESS_TOKENS = /^(opacity|font-weight)-/;

/**
 * Tokens as CSS variables, so stylesheets can use them too: `color.resource.food` becomes
 * `--color-resource-food`, `text.h1` becomes `--text-h1: 40px`.
 */
export function cssVariables(
  tree: TokenTree = tokens,
  prefix = '',
): [name: string, value: string][] {
  return Object.entries(tree).flatMap(([key, value]): [string, string][] => {
    const name = `${prefix}${key}`;
    if (typeof value === 'object') return cssVariables(value, `${name}-`);
    const unit = typeof value === 'number' && !UNITLESS_TOKENS.test(name) ? 'px' : '';
    return [[`--${name}`, `${value}${unit}`]];
  });
}

export function applyTokens(element: HTMLElement): void {
  for (const [name, value] of cssVariables()) element.style.setProperty(name, value);
}
