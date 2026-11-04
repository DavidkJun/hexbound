/**
 * TC-DES: the designer's files agree with each other and with ui-rules.md.
 * Specs (screens/*.md) ↔ layout.json ↔ tokens.json ↔ assets/. Code will be built from these, so a
 * mismatch here becomes a wrong screen later.
 */
import { globSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { readJson, readText } from './helpers';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
type Tree = { [key: string]: string | number | Tree };

const tokens = readJson<Tree>('design/tokens.json');
const layout = readJson<{ screen: { width: number; height: number }; screens: Record<string, Record<string, Rect>> }>(
  'design/layout.json',
);
const screen = { width: 1280, height: 720 };

const inside = (inner: Rect, outer: Rect, tol = 0.01) =>
  inner.x >= outer.x - tol &&
  inner.y >= outer.y - tol &&
  inner.x + inner.w <= outer.x + outer.w + tol &&
  inner.y + inner.h <= outer.y + outer.h + tol;

/** Element rows of a spec table: `| \`Name\` | <rect text> | ...`. */
function specRows(path: string): { name: string; rect: string }[] {
  return readText(path)
    .split('\n')
    .map((line) => /^\|\s*`([A-Z][A-Za-z0-9]*)`\s*\|\s*([^|]+?)\s*\|/.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ name: m[1] ?? '', rect: m[2] ?? '' }));
}

function resolveToken(path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => (node as Tree | undefined)?.[key], tokens);
}

describe('TC-DES-01 layout.json', () => {
  it('TC-DES-01a declares the 1280 × 720 screen from ui-rules.md §1', () => {
    expect(layout.screen).toEqual(screen);
    expect(resolveToken('size.screen.width')).toBe(1280);
    expect(resolveToken('size.screen.height')).toBe(720);
  });
  it('TC-DES-01b every rect on every screen is inside the 1280 × 720 canvas', () => {
    for (const [screenName, elements] of Object.entries(layout.screens)) {
      for (const [name, rect] of Object.entries(elements)) {
        expect(inside(rect, { x: 0, y: 0, w: screen.width, h: screen.height }), `${screenName}.${name}`).toBe(true);
      }
    }
  });
  it('TC-DES-01c every element name is PascalCase (ui-rules.md §4)', () => {
    for (const elements of Object.values(layout.screens)) {
      for (const name of Object.keys(elements)) expect(name).toMatch(/^[A-Z][A-Za-z0-9]*$/);
    }
  });
  it('TC-DES-01d the TopBar is identical on every screen that has it', () => {
    const names = ['TopBar', 'HealthChip', 'FoodChip', 'GoldChip', 'LivesChip', 'KeysChip', 'BlessingsRow', 'LevelName', 'DeckButton', 'MenuButton'];
    const map = layout.screens.MapScreen ?? {};
    for (const [screenName, elements] of Object.entries(layout.screens)) {
      for (const name of names) expect(elements[name], `${screenName}.${name}`).toEqual(map[name]);
    }
  });
});

describe('TC-DES-02 TopBar (screens.md "Always on screen")', () => {
  const m = layout.screens.MapScreen ?? {};
  const bar = m.TopBar as Rect;
  const left = ['HealthChip', 'FoodChip', 'GoldChip', 'LivesChip', 'KeysChip', 'BlessingsRow'];

  it('TC-DES-02a is 1280 × 56 at the top and matches the topbar height token', () => {
    expect(bar).toEqual({ x: 0, y: 0, w: 1280, h: 56 });
    expect(resolveToken('size.topbar.height')).toBe(56);
  });
  it('TC-DES-02b padding 16 left and right', () => {
    expect(m.HealthChip?.x).toBe(16);
    expect((m.MenuButton?.x ?? 0) + (m.MenuButton?.w ?? 0)).toBe(1280 - 16);
  });
  it('TC-DES-02c 12 px gap between items', () => {
    for (let i = 1; i < left.length; i++) {
      const a = m[left[i - 1] ?? ''] as Rect;
      const b = m[left[i] ?? ''] as Rect;
      expect(b.x - (a.x + a.w), `${left[i - 1]} → ${left[i]}`).toBe(12);
    }
    expect((m.MenuButton?.x ?? 0) - ((m.DeckButton?.x ?? 0) + (m.DeckButton?.w ?? 0))).toBe(12);
  });
  it('TC-DES-02d every item is vertically centred in the bar', () => {
    for (const name of [...left, 'LevelName', 'DeckButton', 'MenuButton']) {
      const r = m[name] as Rect;
      expect(r.y + r.h / 2, name).toBeCloseTo(28, 0);
    }
  });
  it('TC-DES-02e LevelName is centred in the space between BlessingsRow and DeckButton', () => {
    const from = (m.BlessingsRow?.x ?? 0) + (m.BlessingsRow?.w ?? 0) + 12;
    const to = (m.DeckButton?.x ?? 0) - 12;
    expect((m.LevelName?.x ?? 0) + (m.LevelName?.w ?? 0) / 2).toBeCloseTo((from + to) / 2, 0);
  });
  it('TC-DES-02f the two buttons are 48 high (size.button.height)', () => {
    expect(m.DeckButton?.h).toBe(resolveToken('size.button.height'));
    expect(m.MenuButton?.h).toBe(resolveToken('size.button.height'));
  });
});

describe('TC-DES-03 screen specs agree with layout.json', () => {
  const specs = [
    ['design/screens/map.md', 'MapScreen'],
    ['design/screens/fight.md', 'FightScreen'],
  ] as const;

  it.each(specs)('TC-DES-03a every element in %s exists in layout.json', (path, screenName) => {
    const elements = layout.screens[screenName] ?? {};
    for (const { name } of specRows(path)) expect(elements[name], name).toBeDefined();
  });

  it.each(specs)('TC-DES-03b every fixed rect "x, y, w, h" in %s equals layout.json', (path, screenName) => {
    const elements = layout.screens[screenName] ?? {};
    for (const { name, rect } of specRows(path)) {
      const m = /^([\d.]+),\s*([\d.]+),\s*([\d.]+|auto),\s*([\d.]+)$/.exec(rect);
      if (!m) continue;
      const got = elements[name] as Rect;
      expect(got.x, `${name}.x`).toBeCloseTo(Number(m[1]), 1);
      expect(got.y, `${name}.y`).toBeCloseTo(Number(m[2]), 1);
      if (m[3] !== 'auto') expect(got.w, `${name}.w`).toBeCloseTo(Number(m[3]), 1);
      expect(got.h, `${name}.h`).toBeCloseTo(Number(m[4]), 1);
    }
  });

  it('TC-DES-03c "centred on x 640" elements of the fight screen are centred on 640', () => {
    const f = layout.screens.FightScreen ?? {};
    for (const name of ['EnemyName', 'EnemyStatus', 'EnemyIntent', 'EnemySprite', 'EnemyHealthBar']) {
      const r = f[name] as Rect;
      expect(Math.abs(r.x + r.w / 2 - 640), name).toBeLessThanOrEqual(1);
    }
    expect(f.EnemyName?.y).toBe(360);
    expect(f.EnemyStatus?.y).toBe(420);
  });

  // fight.md: TurnCounter "right-aligned to x 1256, y 76". layout.json: x 1180 + w 70 = 1250.
  it.fails('BUG-005 TC-DES-03d TurnCounter is right-aligned to x 1256 as fight.md says', () => {
    const r = layout.screens.FightScreen?.TurnCounter as Rect;
    expect(r.x + r.w).toBe(1256);
  });

  it('TC-DES-03e the map side panel is a 16 px stack of 304-wide children (map.md SidePanel)', () => {
    const m = layout.screens.MapScreen ?? {};
    const panel = m.SidePanel as Rect;
    const stack = ['BossPanel', 'RouteSummary', 'TileDetails', 'Legend'].map((n) => m[n] as Rect);
    expect(stack[0]?.y).toBe(panel.y + 16);
    for (const [i, r] of stack.entries()) {
      expect(r.x).toBe(panel.x + 16);
      expect(r.w).toBe(304);
      expect(inside(r, panel)).toBe(true);
      const prev = stack[i - 1];
      if (prev) expect(r.y - (prev.y + prev.h)).toBe(16);
    }
    expect(inside(m.GoButton as Rect, m.RouteSummary as Rect)).toBe(true);
    expect(inside(m.ClearRouteButton as Rect, m.RouteSummary as Rect)).toBe(true);
  });

  it('TC-DES-03f the map grid and tooltip mockup stay inside MapArea', () => {
    const m = layout.screens.MapScreen ?? {};
    for (const name of ['HexGrid', 'RoutePreview', 'PlayerToken', 'TileTooltip']) {
      expect(inside(m[name] as Rect, m.MapArea as Rect), name).toBe(true);
    }
    expect(m.RoutePreview).toEqual(m.HexGrid);
  });

  it('TC-DES-03g a hand of 5 cards is exactly the Hand rect: 140 × 196 with 12 px gaps (fight.md)', () => {
    const f = layout.screens.FightScreen ?? {};
    const hand = f.Hand as Rect;
    const cardsInHand = [1, 2, 3, 4, 5].map((i) => f[`HandCard${i}`] as Rect);
    expect(cardsInHand[0]?.x).toBe(hand.x);
    expect((cardsInHand[4]?.x ?? 0) + (cardsInHand[4]?.w ?? 0)).toBe(hand.x + hand.w);
    expect(hand.x + hand.w / 2).toBe(640);
    for (const [i, c] of cardsInHand.entries()) {
      expect(c.w).toBe(resolveToken('size.card.width'));
      expect(c.h).toBe(resolveToken('size.card.height'));
      const prev = cardsInHand[i - 1];
      if (prev) expect(c.x - (prev.x + prev.w)).toBe(12);
    }
  });

  it('TC-DES-03h EndTurnButton uses the end-turn size tokens (160 × 56)', () => {
    const r = layout.screens.FightScreen?.EndTurnButton as Rect;
    expect(r.w).toBe(resolveToken('size.button.end-turn.width'));
    expect(r.h).toBe(resolveToken('size.button.end-turn.height'));
  });

  it('TC-DES-03i static fight elements do not overlap each other', () => {
    const f = layout.screens.FightScreen ?? {};
    const names = ['FightModifiers', 'TurnCounter', 'EnemyIntent', 'EnemySprite', 'PlayerSprite', 'PlayerHealthBar', 'PlayerBlock', 'EnergyOrb', 'Hand', 'DrawPile', 'ExhaustPile', 'DiscardPile', 'EndTurnButton', 'EnemyHealthBar'];
    const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = f[names[i] ?? ''] as Rect;
        const b = f[names[j] ?? ''] as Rect;
        expect(overlap(a, b), `${names[i]} × ${names[j]}`).toBe(false);
      }
    }
  });

  it('TC-DES-03j a hovered card (24 px up) does not cover EnemyStatus or the health bars', () => {
    const f = layout.screens.FightScreen ?? {};
    const hovered = { ...(f.Hand as Rect), y: (f.Hand?.y ?? 0) - 24 };
    for (const name of ['EnemyStatus', 'EnemyHealthBar', 'PlayerBlock']) {
      const r = f[name] as Rect;
      expect(r.y + r.h, name).toBeLessThanOrEqual(hovered.y);
    }
  });
});

describe('TC-DES-04 every token a spec names exists in tokens.json', () => {
  const docs = ['design/ui-rules.md', 'design/screens.md', 'design/screens/map.md', 'design/screens/fight.md', 'design/visual-direction.md'];

  /** `bg.panel` in a spec means `color.bg.panel`; `text.small` means the size token. */
  const exists = (ref: string) => {
    const path = ref.replace(/^tokens\./, '').replace(/\.\*$/, '');
    return [path, `color.${path}`].some((p) => resolveToken(p) !== undefined);
  };

  it.each(docs)('TC-DES-04a %s', (doc) => {
    const refs = [...readText(doc).matchAll(/`([a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+(?:\.\*)?)`/g)]
      .map((m) => m[1] ?? '')
      .filter((ref) => !/\.(md|png|json|svg|css|ts|woff2)$/.test(ref) && !ref.includes('/'));
    const missing = [...new Set(refs)].filter((ref) => !exists(ref));
    expect(missing).toEqual([]);
  });

  it('TC-DES-04b every colour token is a #RRGGBB value', () => {
    const walk = (node: Tree, path: string[]): void => {
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === 'object') walk(v, [...path, k]);
        else expect(String(v), [...path, k].join('.')).toMatch(/^#[0-9A-F]{6}$/);
      }
    };
    walk(tokens.color as Tree, ['color']);
  });

  it('TC-DES-04c every land has ground, hazard and accent colours (map-format.md land)', () => {
    for (const land of ['whisperwood', 'frostpeak', 'ashen']) {
      for (const part of ['ground', 'hazard', 'accent']) expect(resolveToken(`color.land.${land}.${part}`)).toBeDefined();
    }
  });

  // ui-rules.md §2: never type a pixel size; a missing value is added as a token. screens.md and
  // map.md ask for paddings of 6 and 10 px, which are not in tokens.space, so code must hard-code them.
  it.fails('BUG-006 TC-DES-04d every padding the specs ask for is a tokens.space value', () => {
    const space = Object.values(tokens.space as Tree);
    const paddings = [
      ...readText('design/screens.md').matchAll(/padding (\d+)\/(\d+)(?: \((\d+) on the left\))?/g),
      ...readText('design/screens/map.md').matchAll(/padding (\d+)\/(\d+)/g),
    ].flatMap((m) => m.slice(1).filter(Boolean).map(Number));
    expect(paddings.length).toBeGreaterThan(0);
    expect(paddings.filter((p) => !space.includes(p))).toEqual([]);
  });
});

describe('TC-DES-06 colour contrast (WCAG 2.1: text 4.5:1, large text and graphics 3:1)', () => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
  };
  const contrast = (a: string, b: string) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
  };
  const c = (path: string) => String(resolveToken(`color.${path}`));
  const lands = ['whisperwood', 'frostpeak', 'ashen'];

  it.each([
    ['text.primary', 'bg.base'],
    ['text.primary', 'bg.panel'],
    ['text.primary', 'bg.raised'],
    ['text.muted', 'bg.panel'],
    ['text.muted', 'bg.raised'],
    ['text.inverse', 'accent.primary'],
  ])('TC-DES-06a UI text %s on %s is at least 4.5:1', (fg, bg) => {
    expect(contrast(c(fg), c(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['energy', 'block', 'food', 'gold', 'key'])('TC-DES-06b resource.%s icons on chips (bg.raised) are at least 3:1', (r) => {
    expect(contrast(c(`resource.${r}`), c('bg.raised'))).toBeGreaterThanOrEqual(3);
  });

  // Terrain colour must not be the only signal (ui-rules.md §8) — the marker word covers that —
  // but a slow tile should still stand out at a glance. Ice on Frostpeak is 1.29:1 against ground.
  it.fails.each(lands)('BUG-011 TC-DES-06c %s hazard tiles stand out from ground by at least 3:1', (land) => {
    expect(contrast(c(`land.${land}.ground`), c(`land.${land}.hazard`))).toBeGreaterThanOrEqual(3);
  });

  // 13 px text (text.small) needs 4.5:1. map.md labels are text.primary-coloured in map.png.
  it.fails.each([
    ['detail label text.primary on whisperwood ground', 'text.primary', 'land.whisperwood.ground'],
    ['marker text.primary on ashen lava', 'text.primary', 'land.ashen.hazard'],
    ['detail label text.primary on frostpeak ground', 'text.primary', 'land.frostpeak.ground'],
    ['accent.danger price/route text on bg.raised', 'accent.danger', 'bg.raised'],
  ])('BUG-012 TC-DES-06d %s is at least 4.5:1', (_, fg, bg) => {
    expect(contrast(c(fg), c(bg))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('TC-DES-05 assets (ui-rules.md §7, visual-direction.md Icons)', () => {
  const groups: Record<string, string[]> = {
    loc: ['start', 'monster', 'elite', 'chest', 'locked-chest', 'village', 'shrine', 'mystery', 'boss'],
    res: ['health', 'food', 'gold', 'lives', 'energy', 'block', 'key'],
    kw: ['freeze', 'chill', 'exhaust', 'draw'],
    family: ['weapon', 'spell', 'armour', 'item'],
    intent: ['attack', 'block', 'buff', 'debuff'],
  };
  const expected = Object.entries(groups).flatMap(([g, names]) => names.map((n) => `${g}-${n}.svg`));
  const onDisk = globSync('assets/icons/*.svg').map((p) => p.split('/').at(-1) ?? '');
  const credits = readText('assets/icons/CREDITS.md');

  it('TC-DES-05a all 28 icons in the list exist, and no others', () => {
    expect(expected).toHaveLength(28);
    expect(new Set(onDisk)).toEqual(new Set(expected));
  });
  it.each(expected)('TC-DES-05b %s is credited in CREDITS.md with an author', (icon) => {
    const row = credits.split('\n').find((l) => l.includes(`\`${icon}\``));
    expect(row).toBeDefined();
    expect(row).toMatch(/\|\s*(Lorc|Delapouite|Skoll|Faithtoken)\s*\|\s*$/);
  });
  it.each(expected)('TC-DES-05c %s is one colour, tintable (fill="currentColor", no hard-coded colour)', (icon) => {
    const svg = readText(`assets/icons/${icon}`);
    expect(svg).toContain('currentColor');
    expect(svg).not.toMatch(/fill="#|stroke="#|style="[^"]*fill:\s*#/);
  });
  it('TC-DES-05d every asset file name is kebab-case', () => {
    for (const path of globSync('assets/**/*.*')) {
      const name = path.split('/').at(-1) ?? '';
      if (/^(LICENSE|CREDITS)/.test(name)) continue;
      expect(name, path).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+$/);
    }
  });
  it('TC-DES-05e every file in assets/ and design/ is under 1 MB (no Git LFS)', () => {
    for (const path of [...globSync('assets/**/*.*'), ...globSync('design/**/*.*')]) {
      expect(statSync(path).size, path).toBeLessThan(1024 * 1024);
    }
  });
  it('TC-DES-05f fonts.css declares the families named in tokens.font and its files exist', () => {
    const css = readText('assets/fonts/fonts.css');
    const families = new Set([...css.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]));
    expect(families).toEqual(new Set([resolveToken('font.heading'), resolveToken('font.body')]));
    for (const m of css.matchAll(/url\(\.\/([^)]+)\)/g)) expect(statSync(`assets/fonts/${m[1] ?? ''}`).isFile()).toBe(true);
    expect(statSync('assets/fonts/LICENSE-cinzel.txt').isFile()).toBe(true);
    expect(statSync('assets/fonts/LICENSE-inter.txt').isFile()).toBe(true);
  });
  it('TC-DES-05g fonts are local: no font CDN in fonts.css or index.html', () => {
    for (const path of ['assets/fonts/fonts.css', 'index.html']) expect(readText(path)).not.toMatch(/fonts\.googleapis|fonts\.gstatic|cdn/);
  });
  it('TC-DES-05h Inter covers Cyrillic, Cinzel does not (open language question in CLAUDE.md)', () => {
    const css = readText('assets/fonts/fonts.css');
    const cinzel = /font-family: 'Cinzel'[\s\S]*?unicode-range:([^;]+);/.exec(css)?.[1] ?? '';
    expect(cinzel).not.toContain('U+0400');
    expect(css).toMatch(/font-family: 'Inter'[\s\S]*?U\+0400-045F/);
  });
});
