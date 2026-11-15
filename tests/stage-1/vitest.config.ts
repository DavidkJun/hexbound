import { defineConfig } from 'vitest/config';

/**
 * Tester acceptance tests for the stage 1 core (rules in tests/rules/). They test code from PRs #39
 * and #40, which isn't in main yet, so they live outside tests/auto and run in a worktree of the
 * programmer's branch. Once those PRs are merged, these files move into tests/auto.
 *
 *   git worktree add <dir> origin/feat/stage-1-map && cp -r tests <dir>/   (then, in <dir>:)
 *   npx vitest run --config tests/stage-1/vitest.config.ts
 */
export default defineConfig({
  test: {
    root: '.',
    include: ['tests/stage-1/**/*.test.ts'],
    reporters: [
      'verbose',
      ['junit', { outputFile: `${process.env.QA_OUT ?? 'tests/results/latest'}/stage-1-junit.xml` }],
    ],
  },
});
