import { defineConfig } from 'vitest/config';

/**
 * Tester-owned acceptance tests. They check the programmer's code and the designer's files against
 * the written specs (design/ui-rules.md, design/levels/map-format.md, data/README.md, screen specs).
 *
 * Run from the repository root: npx vitest run --config tests/auto/vitest.config.ts
 */
export default defineConfig({
  test: {
    root: '.',
    include: ['tests/auto/**/*.test.ts'],
    reporters: ['verbose', ['junit', { outputFile: 'tests/results/stage-0/auto-junit.xml' }]],
  },
});
