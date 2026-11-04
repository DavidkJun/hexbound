import { execSync } from 'node:child_process';
import { defineConfig } from 'vitest/config';

/** Short commit hash of this build, shown in the game so the tester knows which build they have. */
function buildCommit(): string {
  try {
    return (process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD', { encoding: 'utf8' })).slice(
      0,
      7,
    );
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  // Relative asset paths: the same build works on GitHub Pages (/hexbound/) and locally.
  base: './',
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit()),
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
