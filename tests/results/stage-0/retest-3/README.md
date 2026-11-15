# Evidence: stage 0 retest 3

**Date:** 2026-11-15, after PR #36 was merged into `main` (b806090).

**Why:** retest 2 verified the BUG-013 and BUG-015 fixes on the PR branch (`fix/stage-1` b87e7f0). This run repeats it on the merge commit in `main` before the issues are closed, then turns the two bug tests into regression tests.

## Summary

| Run | Under test | Result | File |
|---|---|---|---|
| Acceptance suite, tests unchanged | main b806090 + tests from `test/stage-0` | Exactly the 3 BUG-013/015 `it.fails` tests turn red (309 pass, 2 expected-fail), the same as on the PR branch | [01-auto-main-before-flip.log](01-auto-main-before-flip.log), [before/auto-junit.xml](before/auto-junit.xml) |
| Acceptance suite, after the flip | main b806090 + tests with `TC-MAP-07f` and `TC-MAP-10d` as regression tests | 312 pass + 2 expected-fail (BUG-014, BUG-016) | [02-auto-after-flip.log](02-auto-after-flip.log), [after/auto-junit.xml](after/auto-junit.xml) |

## Changes to the tests

- `BUG-015 TC-MAP-07f` → `TC-MAP-07f rejects an allow list that repeats a type (regression BUG-015)`.
- `BUG-013 TC-MAP-10d` (2 cases) → `TC-MAP-10d rejects … as the boss (regression BUG-013)`.

## Result

BUG-013 (#16) and BUG-015 (#18) are fixed in `main` and closed. Open bugs: BUG-014 (#17, wording to confirm), BUG-016 (#19), and BUG-010 (#12), which closes with PR #21.
