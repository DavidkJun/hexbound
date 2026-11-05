# Evidence: stage 0 retest

**Date:** 2026-11-05 (≈ 22:00, +02:00).

**Why:** the programmer merged PR #2 with fixes for BUG-001–004 and BUG-007. The UI / Level designer merged PR #15: fixes for BUG-005, 006, 011 and 012, answers to the screen review in `design/reviews/stage-0-answers.md`, and three new map rules. The repository owner switched on GitHub Pages.

**Under test:**

- main 73f39a3, inside the tester's branch at merge 89e72ee. That merge was later re-made as 1552895 with a shorter commit title and the same files, so the logs that name 89e72ee describe the same code
- the deployed build https://davidkjun.github.io/hexbound/ (build 73f39a3)

**Environment:** as in [`../../../test-plan.md`](../../../test-plan.md) §6. The first run's evidence in [`..`](../README.md) is kept unchanged.

## Summary

| Run | Result | File |
|---|---|---|
| Programmer's `npm run check` | exit 0, 67 unit tests (61 + 6 for the fixes) | [01-programmer-check.log](01-programmer-check.log) |
| Tester acceptance suite (Vitest) | 316 run: 311 pass + 5 expected-fail tests for the new bugs BUG-013, 014, 015, 016 | [03-auto-acceptance.log](03-auto-acceptance.log), [auto-junit.xml](auto-junit.xml) |
| BUG-007 on Node 22.4 | `npm ci` now stops with EBADENGINE and names the versions it needs | [04-node-22.4-retest.log](04-node-22.4-retest.log) |
| Deployed link, repo settings, CI | Pages 200, `has_pages: true`, deploy of 73f39a3 green; `main` still not protected | [06-deploy-and-repo-retest.log](06-deploy-and-repo-retest.log) |
| E2E on the local build | 20 / 20 pass | [07-e2e-local.log](07-e2e-local.log), [local/e2e-junit.xml](local/e2e-junit.xml), [local/e2e-report](local/e2e-report/index.html) |
| E2E on the **deployed** build | 18 / 18 pass, 2 skipped by design (the data error test builds a local broken copy) | [07-e2e-deployed.log](07-e2e-deployed.log), [deployed/e2e-junit.xml](deployed/e2e-junit.xml), [deployed/e2e-report](deployed/e2e-report/index.html) |
| `check:data` on a broken map | exit 1, `start[1]: tile 0,7 is outside the grid (col 0–8, row 0–6)` | [local/check-data-broken-map.txt](local/check-data-broken-map.txt) |
| Every executed check, one row each | 356 rows | [test-run-report.md](test-run-report.md) |

## What the retest showed

**Verified and closed:**

| Bug | Retest result |
|---|---|
| BUG-001 | Fixed: `TC-DATA-03h` |
| BUG-002 | Fixed: `TC-MAP-12c` |
| BUG-003 | Fixed: `TC-DATA-03i` |
| BUG-004 | Fixed: `TC-MAP-04e`, `TC-E2E-06a` |
| BUG-005 | Fixed: `TC-DES-03d` |
| BUG-006 | Fixed: `TC-DES-04d` |
| BUG-007 | Fixed: the Node 22.4 log above |
| BUG-008 | Fixed: the deployed e2e run |
| BUG-011 | Fixed: `TC-DES-06c` |
| BUG-012 | Fixed, measured on the new pairs the designer named: `TC-DES-06d`–`06f` |

The 7 automated ones are now regression tests.

**Still open:**

- BUG-009: `main` not protected
- BUG-010: the design PDF is unchanged

**New:**

- [BUG-013](../../../bugs/BUG-013.md), [BUG-014](../../../bugs/BUG-014.md), [BUG-015](../../../bugs/BUG-015.md): the three map rules added in PR #15 (N-05, N-06, N-07) are not checked by the loader yet. BUG-014 also asks the designer to confirm the wording.
- [BUG-016](../../../bugs/BUG-016.md): `BlessingsRow` is 96 px, but the answer to S-15 asks for 4 slots of 28 px.

**For stage 1, not a regression:** the build still draws terrain markers as bare text. `map.md` now asks for dark label pills; this is covered by TC-MAPSCR-21.

## Screenshots

| File | Shows |
|---|---|
| [deployed/screenshots/e2e-01-map-1280x720.png](deployed/screenshots/e2e-01-map-1280x720.png) | The deployed build with the new land colours, "build 73f39a3 · seed 123" |
| [local/screenshots/e2e-06-data-error.png](local/screenshots/e2e-06-data-error.png) | The data error screen with the new out-of-grid message (BUG-004 fixed) |
| `local/screenshots/`, `deployed/screenshots/` `e2e-05-*` | Scaling to 5 window sizes, local and deployed |

**Rerun:**

```sh
QA_OUT=tests/results/stage-0/retest npx vitest run --config tests/auto/vitest.config.ts
E2E_OUT=tests/results/stage-0/retest/local npm --prefix tests run e2e
E2E_BASE_URL=https://davidkjun.github.io/hexbound/ E2E_COMMIT=$(git rev-parse origin/main) \
  E2E_OUT=tests/results/stage-0/retest/deployed npm --prefix tests run e2e
node tests/tools/junit-to-md.mjs stage-0/retest local/e2e-junit.xml deployed/e2e-junit.xml
```
