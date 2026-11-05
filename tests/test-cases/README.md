# Test cases

Owner: Tester. A test case ID is `TC-<SUITE>-<NN><letter>`. The same ID appears in the test case table, in the automated test's name, and in the run report, so every result traces back to a requirement.

## Suites

| Suite | What it checks | Type | Cases (executions) | Where | Stage 0 (2026-11-04) | Retest (2026-11-05) |
|---|---|---|---|---|---|---|
| TC-S0 | Stage 0 "done when" for every role: run, build, check, deploy, templates, seed, data errors | manual + linked auto | 18 | [TC-S0-stage0-acceptance.md](TC-S0-stage0-acceptance.md) | 14 pass · 3 fail · 1 blocked | 17 pass · 1 fail (BUG-009) |
| TC-MAP | Map file format, rules 1–10 + `levels.json` (`map-format.md`) | auto, Vitest | 13 groups (85) | `tests/auto/map-format.test.ts` | all pass; 2 confirm bugs | all pass (85); 2 regressions + 4 new bug tests (BUG-013, 014, 015) |
| TC-LVL | Design targets of every map: corners, food + 3, routes, avoidable hazards | auto, Vitest | 9 per map | `tests/auto/level-targets.test.ts` | pass on `_example`; runs on each new map | pass |
| TC-HEX | Hex grid: size, centres, neighbours, distance (`ui-rules.md` §5) | auto, Vitest | 4 groups (17) | `tests/auto/hex-grid.test.ts` | all pass | all pass |
| TC-SEED | Seeded replay and slot dealing (Prog §3, Tester §4) | auto, Vitest | 3 groups (16) | `tests/auto/seed-rng.test.ts` | all pass | all pass |
| TC-DATA | Content format: cards, effects, enemies, blessings, events (`data/README.md`) | auto, Vitest | 6 groups (75) | `tests/auto/data-format.test.ts` | all pass; 2 confirm bugs | all pass; 2 regressions |
| TC-DES | Design files agree: layout ↔ specs ↔ tokens ↔ assets, contrast | auto, Vitest | 6 groups (114) | `tests/auto/design-consistency.test.ts` | all pass; 9 confirm bugs | all pass (114); 4 regressions + 1 new bug test (BUG-016) |
| TC-E2E | The real build in Chromium: grid, pixels, build and seed, scaling, data error screen | auto, Playwright | 6 groups (20 per build) | `tests/e2e/*.spec.ts` | 20 / 20 pass | 20 / 20 local; 18 / 18 on the deployed build (+2 skipped by design) |
| TC-MAPSCR | Map screen (stage 1) | manual → e2e | 27 | [TC-MAPSCR-map-screen.md](TC-MAPSCR-map-screen.md) | not run (not built) | not run; 7 cases added from the design answers |
| TC-FIGHT | Fight screen and combat core (stage 1) | manual → unit / e2e | 31 | [TC-FIGHT-fight-screen.md](TC-FIGHT-fight-screen.md) | not run (not built) | not run; 3 cases added, 2 updated |

Every executed automated check, with its result, is listed in [`../results/stage-0/test-run-report.md`](../results/stage-0/test-run-report.md) (first run) and [`../results/stage-0/retest/test-run-report.md`](../results/stage-0/retest/test-run-report.md) (retest).

## Traceability: requirement → test cases

| Requirement (source) | Test cases |
|---|---|
| 1280 × 720 canvas, uniform scale, letterbox in `bg.base`, min 960 × 540 (ui-rules §1) | TC-DES-01a, TC-E2E-02a, TC-E2E-05 (5 windows + live resize) |
| Colours and sizes only from tokens (ui-rules §2) | TC-DES-04a–d, TC-S0-15, TC-E2E-03a, c |
| Positions from layout.json; specs agree (ui-rules §3) | TC-DES-01, 02, 03a–j, TC-E2E-02b |
| PascalCase names (ui-rules §4) | TC-DES-01c, TC-DES-03a |
| Flat-top odd-q 9 × 7, R = 46, centres, neighbours, distance (ui-rules §5) | TC-HEX-01..04, TC-E2E-02c, TC-MAPSCR-02 |
| Screens read state, send actions; core knows no screen (ui-rules §6, Prog §3) | TC-S0-15 (lint), TC-SEED-01c |
| Assets: names, folders, icons + CC BY credits, local fonts, < 1 MB (ui-rules §7) | TC-DES-05a–h, TC-E2E-01a, b |
| Colour never the only signal; readable at a glance (ui-rules §8, UI brief §1) | TC-E2E-03b, TC-DES-06a–d |
| Map file rules 1–10, levels.json (map-format.md) | TC-MAP-00..12, TC-E2E-06 |
| Map design targets (map-format.md, DD) | TC-LVL-01..09 |
| Content format and effects (data/README.md, Prog §4) | TC-DATA-01..06, TC-S0-16 |
| One seeded RNG; same seed = same run (Prog §3, Tester §4) | TC-SEED-01..03, TC-E2E-04a–d, TC-S0-13 |
| A bad data file fails clearly (Prog §4, ui-rules §9, screens.md) | TC-MAP-11, TC-E2E-06a, b, TC-S0-14 |
| Repo, README, lint/format, CI, templates, Pages, branch protection (Prog §2) | TC-S0-01..11, 17, 18 |
| Map screen spec (map.md) | TC-MAPSCR-01..27 |
| Fight screen spec (fight.md) | TC-FIGHT-01..31, TC-DES-03k, 03l |
| DD targets: run 35–45 min, fights 2–4 / 6–10 turns, food +3, gold ≈ 2 purchases, no dominant route | Playtest checklist P-T1..T5 ([../playtest/checklist.md](../playtest/checklist.md)), TC-LVL-02, TC-FIGHT-27 |

## Priority and status

- **Priority:** High = a stage's "done when" depends on it · Medium = a rule or state from a spec · Low = polish or edge.
- **Status:** PASS · FAIL (with a bug ID) · BLOCKED (with the reason) · Not run.
