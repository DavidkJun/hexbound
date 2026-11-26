# Evidence: stage 0 retest 2

**Date:** 2026-11-15 (≈ 21:50, +02:00).

**Why:**

- The repository owner protected `main` (BUG-009, #11).
- The PM's PR #21 makes the design PDF searchable (BUG-010, #12).
- The programmer's PR #36 fixes BUG-013 and BUG-015.
- The programmer reviewed the tester's PR #20 and asked for changes.

`main` is still 73f39a3: since it is protected, nothing is merged before a review. So the fixes are checked on their PR branches, by running the tester's suites in a worktree of each branch.

## Summary

| Run | Under test | Result | File |
|---|---|---|---|
| Acceptance suite | main 73f39a3 + tests | 309 pass + 5 expected-fail tests (BUG-013 ×2, 014, 015, 016) | [03-auto-main.log](03-auto-main.log), [main/auto-junit.xml](main/auto-junit.xml) |
| Acceptance suite | PR #36 (`fix/stage-1` b87e7f0) | Exactly the 3 BUG-013/015 tests turn red, which means those bugs are fixed; nothing else changes | [03-auto-pr36.log](03-auto-pr36.log), [pr36-loader-messages.txt](pr36-loader-messages.txt) |
| Acceptance suite | PR #38 (`feat/stage-1-system-screens` 3a2db69, contains #36 and #37) | The same 3, plus `TC-DATA-02a` for `applyFreeze` (in #37 Freeze has no amount, DD 4.7). Both are expected; the tests are flipped when the PRs are merged | [03-auto-pr38.log](03-auto-pr38.log) |
| E2E | main 73f39a3 + tests | 25 / 25. The 5 checks that wait for #38 (`DataErrorScreen` spec, `WindowTooSmall`) are expected failures | [07-e2e-main.log](07-e2e-main.log), [main/e2e-report](main/e2e-report/index.html) |
| E2E with `E2E_AFTER_38=1` | PR #38 build | 25 / 25: "Data error" in Cinzel `text.h2` `color.text.danger`, "file · field: message", `BuildInfo` visible; `WindowTooSmall` below 960 × 540, not at 960 × 540, and the game comes back when the window grows | [07-e2e-pr38.log](07-e2e-pr38.log), [pr38/e2e-junit.xml](pr38/e2e-junit.xml), [pr38/screenshots/](pr38/screenshots/) |
| BUG-009 | GitHub API | `protected: true` | [09-bug-009-retest.log](09-bug-009-retest.log) |
| BUG-010 | `plan/HexBound_DD.pdf` on PR #21 | Text extracts: 10 pages, "Freeze" 5 times | [10-bug-010-pdf-text.txt](10-bug-010-pdf-text.txt) |

## Changes to the tests from the review of PR #20

- **TC-E2E-06a:** asserts the `DataErrorScreen` spec. The throw-away copy now gets the commit through `GITHUB_SHA`, as CI does, because it has no `.git`.
- **New TC-E2E-07:** `WindowTooSmall`.
- **TC-MAP-04a:** only checks the two free corners. Before, the two corners that hold the start and the boss returned early and checked nothing.
- **TC-MAP-02:** compares only the fields of rule 2, so the new rule "enemies of the level's land" (#29, in #38) can't break it.
- **Data tests:** compare only the problems of the file under test, so the tutorial checks of #37 can't break them.
- **Windows paths:** normalised in TC-DES-05a, TC-DES-05d and TC-SEED-03d.
- **TC-SEED-02d:** now named after what it asserts (all 4 deals).
