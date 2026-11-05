import { defineConfig } from 'vitest/config';

/**
 * Tester-owned acceptance tests. They check the programmer's code and the designer's files against
 * the written specs (design/ui-rules.md, design/levels/map-format.md, data/README.md, screen specs).
 *
 * Run from the repository root: npx vitest run --config tests/auto/vitest.config.ts
 * QA_OUT: where the JUnit report goes. The default tests/results/latest is not committed, so a plain
 * run never overwrites stage evidence; pass e.g. QA_OUT=tests/results/stage-1 to record a run.
 */
export default defineConfig({
  test: {
    root: '.',
    include: ['tests/auto/**/*.test.ts'],
    reporters: [
      'verbose',
      ['junit', { outputFile: `${process.env.QA_OUT ?? 'tests/results/latest'}/auto-junit.xml` }],
    ],
  },
});
