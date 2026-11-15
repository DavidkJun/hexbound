# Evidence: stage 1, first pass on the core (tasks #27, #28)

**Date:** 2026-11-15 (≈ 22:05, +02:00).

**Build under test:** PR #40, `feat/stage-1-map` add1641. It holds the whole stage 1 stack: #36 checks, #37 data format, #38 system screens, #39 combat core, #40 run and map.

**Tests:** `tests/stage-1/`, written from the testable rules in [`../../../rules/`](../../../rules/README.md). They run in a worktree of the PR branch, because the code isn't in `main` yet.

## Summary

| Run | Result | File |
|---|---|---|
| Programmer's `npm run check` on the PR | exit 0, 143 unit tests | [00-programmer-check-pr40.log](00-programmer-check-pr40.log) |
| Tester's stage 1 acceptance tests | **69 pass, 0 fail**, 9 `todo` for rules PR #40 leaves for stage 2 | [01-stage-1-on-pr40.log](01-stage-1-on-pr40.log), [stage-1-junit.xml](stage-1-junit.xml) |
| Mutation check: 10 rules broken on purpose in the core | **10 of 10 caught**. The first run missed the sight radius (no location 3 steps from the start); a boundary test was added | [02-mutation-check.log](02-mutation-check.log) |

## What was checked

**Combat (`combat.test.ts`, 37 tests):** FIGHT-02 – FIGHT-71:

- fight start, Chilled and Rested
- the turn order and the first-turn block
- energy and Chill, the draw, the hand limit and the reshuffle
- damage, block and `loseHealth`
- Freeze and the pattern moving on, Chill on both sides, strength
- the live intent
- the fight ending mid-card

**Run and map (`run-map.test.ts`, 32 tests + 9 todo), through `reduce`:**

- the start of the run and of a level
- the seeded deal and enemies of the level's land
- the route chain, food, hunger and starving
- stopping on locations and the rest of the route
- resolved tiles, the locked chest with and without a key
- the boss confirm, visibility within 2 steps
- monster, elite, boss and chest rewards
- the tutorial

## Result

**No defect found** in what the PRs implement. Where the rules leave a question open, the code does what the tester suggested:

- Q-C1: the intent updates at once
- Q-C2: strength applies per `dealDamage`
- Q-C4: an elite is never the tutorial
- Q-M2: a locked chest without a key stops the walk

**Not in this build (PR #40 says so, stage 2 in the team plan):** lava, ice (Chilled), Rested, villages, shrines, events, the locked chest's blessing, lives and retries, the score, the next level. They are `it.todo` tests.

**Still to do for #27 and #28:**

- check map 1 against `plan/route-intent.md` once `whisperwood.json` lands (TC-LVL runs on it automatically)
- measure fight lengths (FIGHT-90) once the level 1 enemies and cards exist (#22, #23)
- play the build by hand once the map and fight screens exist (#33, #34)
