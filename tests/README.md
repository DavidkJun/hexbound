# Tests

Owner: Tester. Everything here is the tester's work. It reads the other roles' files but never changes them.

## Stage 0 deliverables

| What | For | File |
|---|---|---|
| Gaps and open questions in the design document (48 + 3 contradictions) | PM | [design-review/design-doc-gaps.md](design-review/design-doc-gaps.md) |
| Missing screens and states, design-file defects (20 + 7 notes), all answered and retested | UI / LD | [design-review/screens-review.md](design-review/screens-review.md) |
| Playtest checklist (pillars + DD targets) and playtest table | Everyone | [playtest/](playtest/README.md) |
| Bug reporting, build and seed, test levels | Programmer, everyone | [test-plan.md](test-plan.md) |
| Test cases + traceability | Everyone | [test-cases/](test-cases/README.md) |
| Bug reports (16: 10 fixed and verified, 6 open), also GitHub issues | Owners | [bugs/](bugs/README.md) |
| Automated tests (316 acceptance + 20 e2e, also run on the deployed build) | — | [auto/](auto/), [e2e/](e2e/) |
| Evidence: logs, JUnit, HTML report, screenshots, run report; first run and retest | Everyone | [results/stage-0/](results/stage-0/README.md), [results/stage-0/retest/](results/stage-0/retest/README.md) |

## Run the automated tests

You need Node 24 (`nvm use`) and the project installed (`npm ci` in the repository root).

```sh
npm --prefix tests ci                  # once: the tester's tools (Playwright, pngjs)
npm --prefix tests run browsers        # once: download Chromium for Playwright (~100 MB)

npm --prefix tests run auto            # acceptance tests (Vitest), ~2 s
npm --prefix tests run e2e             # build + browser smoke tests (Playwright), ~20 s
node tests/tools/junit-to-md.mjs latest    # results/latest/test-run-report.md
```

**Options** (environment variables):

| Variable | Used by | What it does |
|---|---|---|
| `QA_OUT` | `auto` | Folder for the JUnit report (default `tests/results/latest`, not committed). Set it to record evidence: `QA_OUT=tests/results/stage-1` |
| `E2E_OUT` | `e2e` | Folder for the reports and screenshots (default `tests/results/latest`, not committed) |
| `E2E_BASE_URL` | `e2e` | Test an already deployed build instead of a local one, e.g. `https://davidkjun.github.io/hexbound/` |
| `E2E_COMMIT` | `e2e` | The commit the deployed build should show in its corner (default: local `HEAD`) |

The full retest commands are in [results/stage-0/retest/README.md](results/stage-0/retest/README.md).

**What the results mean:**

- A test named `BUG-0xx …` is an expected failure: it passes while the bug is there.
- When one of them turns red, the bug was fixed. Turn it into a normal test and close the bug.
- The e2e HTML report is in `results/latest/e2e-report/` (`npx --prefix tests playwright show-report tests/results/latest/e2e-report`); recorded runs keep theirs in `results/<stage>/`.

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
  results/<stage>/    evidence of every recorded run (results/latest: plain runs, not committed)
```
