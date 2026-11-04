# Test plan

Owner: Tester. How Hexbound is tested across stages 0–5, and what was agreed with the programmer (stage 0, task 4 of `plan/Stage0_Tester.txt`).

## 1. What is tested, and where the rules come from

The tester tests against **written rules**, never against "what the code does":

| Source | Owner | Tested by |
|---|---|---|
| `plan/HexBound_DD.pdf` → testable rules (from stage 1) | PM → Tester | unit tests on `src/core`, playtests |
| `design/ui-rules.md`, `design/screens/*.md`, `tokens.json`, `layout.json` | UI / LD | TC-DES, TC-E2E, TC-MAPSCR, TC-FIGHT |
| `design/levels/map-format.md` | UI / LD | TC-MAP, TC-LVL |
| `data/README.md` | Programmer | TC-DATA |
| Stage briefs and the team plan ("done when") | PM | TC-S0 (one suite per stage) |

## 2. Test levels

| Level | Tool | What | When it runs |
|---|---|---|---|
| Programmer unit tests | Vitest, `src/**/*.test.ts` | Each module (the programmer's) | `npm run check`, CI on every PR |
| **Tester acceptance tests** | Vitest, `tests/auto/` | Specs → code and data, boundaries and negative cases, design-file consistency | `npm --prefix tests run auto` (proposed: in CI too, see §5) |
| **End-to-end smoke** | Playwright + Chromium, `tests/e2e/` | The real build in a real browser: pixels, layout, scaling, seed, error screen | `npm --prefix tests run e2e`, before every stage build hand-off |
| Manual / exploratory | test cases in `tests/test-cases/` | What can't be automated yet, or isn't built | on every build the programmer hands over |
| Playtests | `tests/playtest/` | The pillars and the DD targets | end of stages 1, 2, 3 (outside players), 4 |

**Known bugs stay visible.** A confirmed bug gets an `it.fails('BUG-0xx …')` test. The suite stays green while the bug exists and goes red when it's fixed, so a fix is noticed and the test becomes a normal one.

## 3. Entry and exit per build

- **Entry:**
    - a build on `main` (or a PR preview) with a note on what changed
    - `npm run check` green
    - the build and seed visible in the corner
- **Exit:**
    - every High test case of the stage passes
    - no open Blocker
    - Major bugs either fixed or accepted by the PM in writing
- **Regression:**
    - the full automated suites on every build
    - the manual cases of the changed areas
    - from stage 2: the full manual pass once per stage

## 4. Bug reports (agreed with the programmer)

- **Where:** GitHub Issues, using the programmer's template `.github/ISSUE_TEMPLATE/bug_report.yml`. Its fields are build and seed, severity, steps, expected, actual and screenshot, which covers everything the tester brief asks for (TC-S0-10).
- **Stage 0 bugs:** issues #3–#14. Each also has a full report in [`bugs/`](bugs/README.md) with the same fields and its evidence.
- **Severity:**
    - Blocker: the run can't continue (or a stage can't close)
    - Major: a rule or screen is wrong
    - Minor: looks wrong, or a small inconvenience
- **Owner:** whoever owns the broken file (see `CLAUDE.md` → Where things are). Rule problems go to the PM.
- **Which build:** the `build <commit> · seed <n>` line in the bottom-left corner (TC-S0-12).
- **Replaying a run:** open the game with `?seed=<n>`. The same seed gives the same game state (TC-SEED-01, TC-E2E-04d). The seed goes in every bug report.

## 5. Proposals to the programmer (not decided yet)

1. Run the tester's suites in CI. Add one step to `.github/workflows/ci.yml`: `npm --prefix tests ci && npm --prefix tests run auto` (Vitest only; e2e needs a browser download, about 100 MB).
2. Add `.npmrc` with `engine-strict=true` (BUG-007).
3. Show the build and seed on the Data error screen too. Today it replaces the whole game, BuildInfo included.
4. From stage 1, a debug query flag (e.g. `?debug`) that prints the game state as JSON. Tester bug reports could then attach it.

## 6. Environment used in stage 0

- **Machine:** Windows 11 + WSL2 Ubuntu (Linux 6.18).
- **Node:** 24.22.2 (`.nvmrc`), and 22.4.1 to reproduce BUG-007.
- **Browser:** Chromium 141 headless, Playwright 1.56.1.
- **Windows tested:** 960 × 540, 1280 × 720, 1280 × 1000, 1366 × 768, 1600 × 720 and 1920 × 1080.
- **Not tested in stage 0:** Firefox, Safari, Edge, real GPUs and high-DPI screens. These come in stage 4 (G-48).
