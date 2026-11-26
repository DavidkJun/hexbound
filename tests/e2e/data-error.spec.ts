/**
 * TC-E2E-06: a broken map file fails on load with a clear full-screen message naming the file,
 * field and problem (ui-rules.md §9, screens.md "Loading or bad data file").
 *
 * Works on a throw-away copy of the project, so no file owned by another role is touched:
 * the copy gets a real level whisperwood.json with two mistakes, is built, and is served on :4174.
 */
import { expect, test } from '@playwright/test';
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../..', import.meta.url));
const tokens = JSON.parse(readFileSync(join(repo, 'design/tokens.json'), 'utf8')) as {
  text: { h2: number };
  color: { text: { danger: string } };
};
const rgb = (hex: string) =>
  `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')})`;
const OUT = join(repo, process.env.E2E_OUT ?? 'tests/results/latest');
const SHOTS = join(OUT, 'screenshots');

// Builds its own broken copy, so it only runs against the local build.
test.skip(Boolean(process.env.E2E_BASE_URL), 'needs a local build of a broken copy');
const PORT = 4174;
let copy = '';
let server: ChildProcess | undefined;

async function waitForServer(url: string) {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`${url} did not start`);
}

test.beforeAll(async () => {
  test.setTimeout(120_000);
  copy = mkdtempSync(join(tmpdir(), 'hexbound-e2e-'));
  const skip = new Set(['node_modules', '.git', 'dist', 'tests']);
  cpSync(repo, copy, { recursive: true, filter: (src) => !skip.has(src.slice(repo.length).split('/')[0] ?? '') });
  symlinkSync(join(repo, 'node_modules'), join(copy, 'node_modules'));

  const example = JSON.parse(readFileSync(join(repo, 'data/levels/_example.json'), 'utf8')) as Record<string, unknown>;
  const broken = { ...example, id: 'whisperwood', startFood: 5, start: [0, 7] };
  writeFileSync(join(copy, 'data/levels/whisperwood.json'), JSON.stringify(broken, null, 2));
  writeFileSync(join(copy, 'data/levels/levels.json'), JSON.stringify(['whisperwood']));

  // The copy has no .git, so pass the commit the way CI does; BuildInfo then shows a real build id.
  const sha = execSync('git rev-parse HEAD', { cwd: repo, encoding: 'utf8' }).trim();
  execSync('npx vite build --logLevel error', {
    cwd: copy,
    stdio: 'inherit',
    env: { ...process.env, GITHUB_SHA: sha },
  });
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: copy, stdio: 'ignore', detached: true });
  await waitForServer(`http://localhost:${PORT}/`);
});

test.afterAll(() => {
  if (server?.pid) process.kill(-server.pid);
  if (copy) rmSync(copy, { recursive: true, force: true });
});

/**
 * The screen as design/screens.md → System screens specifies it since #15. PR #38 builds it; until it
 * is merged the build still shows the stage 0 screen, so on main this test is an expected failure.
 * E2E_AFTER_38=1 checks a build that has #38 (and, once #38 is merged, the flag goes away).
 */
const pending38 = process.env.E2E_AFTER_38 !== '1';

test('TC-E2E-06a a broken real level shows DataErrorScreen as screens.md specifies', async ({ page }) => {
  test.fail(pending38, 'waits for #38 (system screens)');
  await page.goto(`http://localhost:${PORT}/?seed=7`);
  const screen = page.locator('#DataErrorScreen');
  await expect(screen).toBeVisible();
  await expect(screen.locator('h1')).toHaveText('Data error');
  const title = await screen.locator('h1').evaluate((el) => {
    const css = getComputedStyle(el);
    return { family: css.fontFamily, size: css.fontSize, color: css.color };
  });
  expect(title.family).toContain('Cinzel');
  expect(title.size).toBe(`${tokens.text.h2}px`);
  expect(title.color).toBe(rgb(tokens.color.text.danger));
  // One line per problem: "file · field: message".
  await expect(screen.locator('li')).toContainText([
    'data/levels/whisperwood.json · start[1]: tile 0,7 is outside the grid (col 0–8, row 0–6)',
  ]);
  await expect(page.locator('#BuildInfo')).toHaveText(/^build [0-9a-f]{7} · seed 7$/); // stays visible
  await expect(page.locator('#HexGrid')).toHaveCount(0); // the game does not start on bad data
  await page.screenshot({ path: join(SHOTS, 'e2e-06-data-error.png') });
});

test('TC-E2E-06b the same problem is reported by `npm run check:data` in the terminal', () => {
  let output = '';
  try {
    execSync('npx tsx scripts/check-data.ts', { cwd: copy, encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    output = `${e.stdout ?? ''}${e.stderr ?? ''}`;
    expect(e.status).toBe(1);
  }
  expect(output).toContain('data/levels/whisperwood.json › start[1]');
  writeFileSync(join(OUT, 'check-data-broken-map.txt'), output);
});
