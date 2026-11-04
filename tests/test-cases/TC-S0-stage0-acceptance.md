# TC-S0: stage 0 acceptance (manual + automated)

Checks the stage 0 "done when" of every role's brief, so the team knows what really works.

**Run:** 2026-11-04 by the Tester, on build b9977c9 (PR #2 `feat/stage-0-project-setup`, merged with nothing else) and design commit 41ce590. Windows 11 + WSL2 Ubuntu, Node 24.22.2 (`.nvmrc`) and Node 22.4.1, Chromium 141 headless (Playwright 1.56.1).

**Result:** 18 cases: 14 passed · 3 failed (BUG-007, BUG-008, BUG-009) · 1 blocked (the deployed build can't be tested until BUG-008 is fixed).

| ID | Priority | Requirement | Steps | Expected | Result | Evidence |
|---|---|---|---|---|---|---|
| TC-S0-01 | High | The repository is reachable by everyone (Prog §2) | `git clone git@github.com:DavidkJun/hexbound.git` | Clones; public repository | PASS | `06-deploy-and-repo.log` (`visibility: public`) |
| TC-S0-02 | High | README explains what the game is, how to run it, how to contribute (Prog §2) | Read `README.md` on PR #2 | All 3 parts present, plus stack, structure and commands | PASS | `README.md` @ b9977c9 |
| TC-S0-03 | High | Teammates can run it locally (Prog "done when") | 1. Node 24: `npm ci`, `npm run dev`, open the link. 2. Node 22.4: the same | 1. The grid shows. 2. Works, or a clear "Node too old" message | **FAIL** (step 2) | `01-programmer-check.log`, `04-node-22.4-repro.log`, [BUG-007](../bugs/BUG-007.md) |
| TC-S0-04 | High | One code style, checked automatically (Prog §2) | `npm run check` (typecheck, lint, format, 61 unit tests, data check) | Exit 0 | PASS | `01-programmer-check.log` |
| TC-S0-05 | High | The build works (Prog §2) | `npm run build` | `dist/` created, exit 0 | PASS | `02-build.log` |
| TC-S0-06 | High | "Shows something, e.g. an empty hex grid drawn from a map data file" (Prog "done when") | Open the build at 1280 × 720 | The 9 × 7 grid of `_example.json`, swamp tiles marked "slow" | PASS | TC-E2E-01..03, `screenshots/e2e-01-map-1280x720.png` |
| TC-S0-07 | High | A deployed link opens in the browser (Prog §2, "done when") | Open https://davidkjun.github.io/hexbound/ | The playable build | **FAIL** | `06-deploy-and-repo.log` (HTTP 404, `has_pages: false`), [BUG-008](../bugs/BUG-008.md) |
| TC-S0-08 | High | `main` protected: PR + 1 approval (Prog §2) | GitHub API `branches/main` | `protected: true` | **FAIL** | `06-deploy-and-repo.log`, [BUG-009](../bugs/BUG-009.md) |
| TC-S0-09 | Medium | CI runs on every PR (Prog §2) | GitHub API `actions/runs` | A CI run on PR #2 | PASS | `06-deploy-and-repo.log` (`CI … pull_request completed success`) |
| TC-S0-10 | High | Bug report template: build or commit, steps, expected, actual, screenshot (Prog §2, Tester §4) | Read `.github/ISSUE_TEMPLATE/bug_report.yml` | All 5 fields, plus severity | PASS | template @ b9977c9 (also has Blocker / Major / Minor) |
| TC-S0-11 | Medium | PR template: what changed, how to test (Prog §2) | Read `.github/pull_request_template.md` | Both parts | PASS | template @ b9977c9 |
| TC-S0-12 | High | The tester knows which build they test (Tester §4) | Open the game; look at the bottom-left | `build <commit> · seed <n>`, the commit equals `git rev-parse --short HEAD` | PASS | TC-E2E-04a, `screenshots/e2e-04-build-info.png` |
| TC-S0-13 | High | Runs repeat with a seed (Tester §4, Prog §3) | Open `?seed=42` twice; unit-test 100 seeds | Same screen, same game state | PASS | TC-E2E-04d, TC-SEED-01a |
| TC-S0-14 | High | A bad data file fails with a clear message (Prog §4, ui-rules §9) | Copy of the project with a broken `whisperwood.json` | A full-screen error with file + field; `check:data` exits 1 | PASS, with a remark ([BUG-004](../bugs/BUG-004.md)) | TC-E2E-06, `screenshots/e2e-06-data-error.png` |
| TC-S0-15 | Medium | Game logic knows nothing of the screen; one RNG; no hand-typed colours (Prog §3, ui-rules §2) | Plant 4 violations in a copy and run ESLint | 4 errors | PASS | `08-lint-negative.log` |
| TC-S0-16 | Medium | All content in data files, with an example of each type (Prog §4) | `npm run check:data`; read `data/README.md` | Examples for card, enemy, blessing, event, level; all valid | PASS | `01-programmer-check.log` (`examples: ok (4 cards, 3 enemies, 2 blessings, 1 events, 1 levels)`) |
| TC-S0-17 | Low | Shipped dependencies have no known vulnerabilities | `npm audit --omit=dev` | 0 | PASS (10 moderate in dev-only tooling, `typescript-eslint`) | `05-npm-audit.log` |
| TC-S0-18 | High | Deployed build passes the e2e smoke | `npm --prefix tests run e2e` against Pages | 20/20 | BLOCKED by BUG-008 | — |
