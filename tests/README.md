# Tests

Owner: Tester. Everything here is the tester's work. It reads the other roles' files but never changes them.

## Stage 0 deliverables

| What | For | File |
|---|---|---|
| Gaps and open questions in the design document (48 + 3 contradictions) | PM | [design-review/design-doc-gaps.md](design-review/design-doc-gaps.md) |
| Missing screens and states, design-file defects (20 + 7 notes) | UI / LD | [design-review/screens-review.md](design-review/screens-review.md) |
| Playtest checklist (pillars + DD targets) and playtest table | Everyone | [playtest/](playtest/README.md) |
| Bug reporting, build and seed, test levels | Programmer, everyone | [test-plan.md](test-plan.md) |
| Test cases + traceability | Everyone | [test-cases/](test-cases/README.md) |
| Bug reports (12) | Owners | [bugs/](bugs/README.md) |
| Automated tests (307 acceptance + 20 e2e) | — | [auto/](auto/), [e2e/](e2e/) |
| Evidence: logs, JUnit, HTML report, screenshots, run report | Everyone | [results/stage-0/](results/stage-0/) |

## Run the automated tests

You need Node 24 (`nvm use`) and the project installed (`npm ci` in the repository root).

```sh
npm --prefix tests ci                  # once: the tester's tools (Playwright, pngjs)
npm --prefix tests run browsers        # once: download Chromium for Playwright (~100 MB)

npm --prefix tests run auto            # acceptance tests (Vitest), ~2 s
npm --prefix tests run e2e             # build + browser smoke tests (Playwright), ~20 s
node tests/tools/junit-to-md.mjs stage-0   # rebuild results/stage-0/test-run-report.md
```

**What the results mean:**

- A test named `BUG-0xx …` is an expected failure: it passes while the bug is there.
- When one of them turns red, the bug was fixed. Turn it into a normal test and close the bug.
- The e2e HTML report is in `results/stage-0/e2e-report/` (`npx --prefix tests playwright show-report tests/results/stage-0/e2e-report`).

## Layout

```
tests/
  README.md           this file
  test-plan.md        strategy, levels, entry/exit, bug flow, agreements
  design-review/      stage 0 reviews of the design document and the screens
  test-cases/         test case tables (manual + links to automated)
  bugs/               bug reports, one file each, plus an index
  playtest/           checklist and table for playtests
  auto/               Vitest acceptance tests (own config: auto/vitest.config.ts)
  e2e/                Playwright tests of the real build
  tools/              helpers (JUnit → Markdown report)
  results/<stage>/    evidence of every run
```
