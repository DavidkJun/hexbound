import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Smoke tests of the real build in a real browser (TC-E2E). Builds the game with `npm run build`,
 * serves dist/ with `vite preview`, then opens it at the design size 1280 × 720.
 *
 * Run: npm --prefix tests run e2e
 */
const repo = fileURLToPath(new URL('../..', import.meta.url));

/**
 * E2E_BASE_URL: test an already deployed build instead (no local server), e.g.
 *   E2E_BASE_URL=https://davidkjun.github.io/hexbound/ E2E_COMMIT=<sha> npm --prefix tests run e2e
 * E2E_OUT: where reports and screenshots go, relative to the repository (default tests/results/latest,
 * not committed).
 */
const remote = process.env.E2E_BASE_URL;
const out = `../../${process.env.E2E_OUT ?? 'tests/results/latest'}`;

export default defineConfig({
  testDir: '.',
  outputDir: `${out}/e2e-artifacts`,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: `${out}/e2e-report`, open: 'never' }],
    ['junit', { outputFile: `${out}/e2e-junit.xml` }],
  ],
  use: {
    baseURL: remote ?? 'http://localhost:4173/',
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } }],
  webServer: remote
    ? undefined
    : {
        command: 'npm run build && npx vite preview --port 4173 --strictPort',
        cwd: repo,
        url: 'http://localhost:4173/',
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
