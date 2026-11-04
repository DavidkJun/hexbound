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
const SHOTS = join(repo, 'tests/results/stage-0/screenshots');
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

  execSync('npx vite build --logLevel error', { cwd: copy, stdio: 'inherit' });
  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: copy, stdio: 'ignore', detached: true });
  await waitForServer(`http://localhost:${PORT}/`);
});

test.afterAll(() => {
  if (server?.pid) process.kill(-server.pid);
  if (copy) rmSync(copy, { recursive: true, force: true });
});

test('TC-E2E-06a a broken real level shows the data error screen with file, field and problem', async ({ page }) => {
  await page.goto(`http://localhost:${PORT}/`);
  const screen = page.locator('#DataErrorScreen');
  await expect(screen).toBeVisible();
  await expect(screen.locator('h1')).toHaveText('Bad data file');
  const items = await screen.locator('li').allTextContents();
  expect(items.some((t) => t.includes('data/levels/whisperwood.json') && t.includes('start[1]'))).toBe(true);
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
  writeFileSync(join(repo, 'tests/results/stage-0/check-data-broken-map.txt'), output);
});
