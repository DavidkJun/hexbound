/**
 * TC-E2E: stage 0 "done when" — the build runs in a browser and shows the hex grid drawn from a map
 * data file (plan/Stage0_Programmer.txt), at the fixed 1280 × 720 canvas (design/ui-rules.md §1, §5).
 */
import { expect, test, type Page } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const repo = new URL('../..', import.meta.url);
const json = <T>(path: string): T => JSON.parse(readFileSync(new URL(path, repo), 'utf8')) as T;

const tokens = json<{
  color: { bg: { base: string }; land: Record<string, { ground: string; hazard: string }> };
  size: { hex: { radius: number } };
}>('design/tokens.json');
const level = json<{ land: string; terrain: string[] }>('data/levels/_example.json');
const R = tokens.size.hex.radius;
const H = Math.sqrt(3) * R;
const GRID = { x: 150, y: 89 };
/** Where the build is served: the local `vite preview` by default, or E2E_BASE_URL (e.g. GitHub Pages). */
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:4173/';
const OUT = process.env.E2E_OUT ?? 'tests/results/latest';
const SHOTS = fileURLToPath(new URL(`${OUT}/screenshots`, repo));

const centreOnPage = (col: number, row: number) => ({
  x: GRID.x + R + col * 1.5 * R,
  y: GRID.y + H / 2 + row * H + (col % 2 === 1 ? H / 2 : 0),
});

function pixel(png: PNG, x: number, y: number): string {
  const i = (Math.round(y) * png.width + Math.round(x)) * 4;
  const hex = (v: number | undefined) => (v ?? 0).toString(16).padStart(2, '0').toUpperCase();
  return `#${hex(png.data[i])}${hex(png.data[i + 1])}${hex(png.data[i + 2])}`;
}

async function open(page: Page, query = '?seed=123') {
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('request', (r) => {
    if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) foreign.push(r.url());
  });
  await page.goto(query);
  await page.locator('#HexGrid').waitFor();
  await page.evaluate(() => document.fonts.ready);
  return { errors, foreign };
}

test.describe('TC-E2E-01 the build opens', () => {
  test('TC-E2E-01a page loads with no errors and no requests to other sites (no font CDN)', async ({ page }) => {
    const { errors, foreign } = await open(page);
    expect(errors).toEqual([]);
    expect(foreign).toEqual([]);
    await expect(page).toHaveTitle('Hexbound');
    await page.screenshot({ path: `${SHOTS}/e2e-01-map-1280x720.png` });
  });

  test('TC-E2E-01b Inter and Cinzel are served from assets/fonts', async ({ page }) => {
    const fontRequests: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'font') fontRequests.push(r.url());
    });
    await open(page);
    await page.evaluate(async () => {
      await document.fonts.load('700 20px Cinzel');
      await document.fonts.load('400 16px Inter');
    });
    const loaded = await page.evaluate(() => [document.fonts.check('700 20px Cinzel'), document.fonts.check('16px Inter')]);
    expect(loaded).toEqual([true, true]);
    expect(fontRequests.length).toBeGreaterThan(0);
    for (const url of fontRequests) {
      expect(url.startsWith(BASE)).toBe(true);
      expect(url).toMatch(/\.woff2$/);
    }
  });
});

test.describe('TC-E2E-02 canvas and grid placement (ui-rules.md §1, §5)', () => {
  test('TC-E2E-02a GameCanvas is exactly 1280 × 720 at a 1280 × 720 window', async ({ page }) => {
    await open(page);
    expect(await page.locator('#GameCanvas').boundingBox()).toEqual({ x: 0, y: 0, width: 1280, height: 720 });
  });

  test('TC-E2E-02b HexGrid sits at x 150, y 89, 644 × 597.56 (layout.json)', async ({ page }) => {
    await open(page);
    const box = await page.locator('#HexGrid').boundingBox();
    expect(box?.x).toBeCloseTo(150, 0);
    expect(box?.y).toBeCloseTo(89, 0);
    expect(box?.width).toBeCloseTo(644, 0);
    expect(box?.height).toBeCloseTo(597.56, 0);
  });

  test('TC-E2E-02c draws 63 tiles, flat-top, odd columns pushed down', async ({ page }) => {
    await open(page);
    const tiles = page.locator('#HexGrid polygon.hex-tile');
    await expect(tiles).toHaveCount(63);
    const boxes = await tiles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((b) => ({ w: b.width, h: b.height })));
    for (const b of boxes) {
      expect(b.w).toBeCloseTo(2 * R, 0); // flat-top: wider than tall
      expect(b.h).toBeCloseTo(H, 0);
    }
  });
});

test.describe('TC-E2E-03 terrain drawn from the map file and tokens', () => {
  test('TC-E2E-03a every tile centre has the land colour of its terrain (pixel check on a screenshot)', async ({ page }) => {
    await open(page);
    const png = PNG.sync.read(await page.screenshot());
    const colours = tokens.color.land[level.land];
    if (!colours) throw new Error(`no colours for land ${level.land}`);
    const wrong: string[] = [];
    level.terrain.forEach((line, row) => {
      [...line].forEach((char, col) => {
        const { x, y } = centreOnPage(col, row);
        const want = char === '.' ? colours.ground : colours.hazard;
        const got = pixel(png, x, y);
        if (got !== want) wrong.push(`${col},${row}: ${got} ≠ ${want}`);
      });
    });
    expect(wrong).toEqual([]);
  });

  test('TC-E2E-03b slow tiles carry a word marker too (colour is never the only signal, ui-rules.md §8)', async ({ page }) => {
    await open(page);
    const hazards = level.terrain.join('').replace(/\./g, '').length;
    const markers = page.locator('#HexGrid text.hex-marker');
    await expect(markers).toHaveCount(hazards);
    for (const text of await markers.allTextContents()) expect(text).toBe('slow');
  });

  test('TC-E2E-03c space outside the grid is bg.base', async ({ page }) => {
    await open(page);
    const png = PNG.sync.read(await page.screenshot());
    for (const [x, y] of [[40, 400], [900, 650], [1200, 300]] as const) expect(pixel(png, x, y)).toBe(tokens.color.bg.base);
  });
});

test.describe('TC-E2E-04 build and seed are shown (Stage0_Tester.txt §4)', () => {
  test('TC-E2E-04a BuildInfo shows the commit of this build and the seed from the URL', async ({ page }) => {
    await open(page, '?seed=483921');
    const commit = (process.env.E2E_COMMIT ?? execSync('git rev-parse HEAD', { cwd: repo, encoding: 'utf8' })).trim().slice(0, 7);
    await expect(page.locator('#BuildInfo')).toHaveText(`build ${commit} · seed 483921`);
    const box = await page.locator('#BuildInfo').boundingBox();
    expect((box?.x ?? 999) < 640 && (box?.y ?? 0) > 360).toBe(true); // bottom-left corner
    await page.locator('#BuildInfo').screenshot({ path: `${SHOTS}/e2e-04-build-info.png` });
  });

  test('TC-E2E-04b without ?seed a new seed 0–999999 is chosen and shown', async ({ page }) => {
    await open(page, './');
    const text = (await page.locator('#BuildInfo').textContent()) ?? '';
    const seed = Number(/seed (\d+)$/.exec(text)?.[1]);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(1_000_000);
  });

  test('TC-E2E-04c a seed that is not a number falls back to a new seed instead of breaking', async ({ page }) => {
    const { errors } = await open(page, '?seed=abc');
    expect(errors).toEqual([]);
    await expect(page.locator('#BuildInfo')).toHaveText(/seed \d+$/);
  });

  test('TC-E2E-04d the same seed renders the same screen twice', async ({ page }) => {
    await open(page, '?seed=42');
    const first = await page.locator('#app').innerHTML();
    await page.reload();
    await page.locator('#HexGrid').waitFor();
    expect(await page.locator('#app').innerHTML()).toBe(first);
  });
});

test.describe('TC-E2E-05 scaling to the window (ui-rules.md §1)', () => {
  const cases = [
    { w: 960, h: 540, scale: 0.75, note: 'smallest supported window' },
    { w: 1920, h: 1080, scale: 1.5, note: 'full HD' },
    { w: 1280, h: 1000, scale: 1, note: 'tall window: bars top and bottom' },
    { w: 1600, h: 720, scale: 1, note: 'wide window: bars left and right' },
    { w: 1366, h: 768, scale: Math.min(1366 / 1280, 768 / 720), note: 'common laptop, not exactly 16:9' },
  ];
  for (const c of cases) {
    test(`TC-E2E-05 ${c.w} × ${c.h} (${c.note}) scales by ${c.scale.toFixed(3)}, keeps 16:9 and centres the canvas`, async ({ page }) => {
      await page.setViewportSize({ width: c.w, height: c.h });
      await open(page);
      const box = await page.locator('#GameCanvas').boundingBox();
      expect(box?.width).toBeCloseTo(1280 * c.scale, 0);
      expect(box?.height).toBeCloseTo(720 * c.scale, 0);
      expect((box?.x ?? 0) + (box?.width ?? 0) / 2).toBeCloseTo(c.w / 2, 0);
      expect((box?.y ?? 0) + (box?.height ?? 0) / 2).toBeCloseTo(c.h / 2, 0);
      const png = PNG.sync.read(await page.screenshot());
      expect(pixel(png, 1, 1)).toBe(tokens.color.bg.base); // leftover space is bg.base
      await page.screenshot({ path: `${SHOTS}/e2e-05-${c.w}x${c.h}.png` });
    });
  }

  test('TC-E2E-05f resizing the window after load rescales the canvas', async ({ page }) => {
    await open(page);
    await page.setViewportSize({ width: 960, height: 540 });
    await expect.poll(async () => (await page.locator('#GameCanvas').boundingBox())?.width).toBeCloseTo(960, 0);
  });
});
