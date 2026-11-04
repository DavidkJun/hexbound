import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

/**
 * Smoke tests of the real build in a real browser (TC-E2E). Builds the game with `npm run build`,
 * serves dist/ with `vite preview`, then opens it at the design size 1280 × 720.
 *
 * Run: npm --prefix tests run e2e
 */
const repo = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  testDir: '.',
  outputDir: '../results/stage-0/e2e-artifacts',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../results/stage-0/e2e-report', open: 'never' }],
    ['junit', { outputFile: '../results/stage-0/e2e-junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:4173/',
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } } }],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    cwd: repo,
    url: 'http://localhost:4173/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
