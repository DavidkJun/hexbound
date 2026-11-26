# Evidence: stage 0 test run

**Date:** 2026-11-04 (22:30–23:00, +02:00).

**Build under test:** b9977c9 (PR #2 `feat/stage-0-project-setup`, which contains `main` 41ce590), in the tester's branch `test/stage-0`.

**Environment:** see [`../../test-plan.md`](../../test-plan.md) §6.

## Summary

| Run | Result | File |
|---|---|---|
| Programmer's `npm run check` (typecheck, lint, format, 61 unit tests, data) | exit 0 | [01-programmer-check.log](01-programmer-check.log) |
| `npm run build` | exit 0, 131.9 kB JS (41.5 kB gzip) | [02-build.log](02-build.log) |
| Tester acceptance suite (Vitest) | 307 run: 294 pass + 13 expected-fail bug tests, 0 unexpected failures | [03-auto-acceptance.log](03-auto-acceptance.log), [auto-junit.xml](auto-junit.xml) |
| BUG-007 reproduction on Node 22.4 | `npm ci` exit 0, then `npm test` and `npm run build` crash | [04-node-22.4-repro.log](04-node-22.4-repro.log) |
| `npm audit` | 10 moderate, all in dev tooling; 0 in shipped code | [05-npm-audit.log](05-npm-audit.log) |
| Deployed link, repo settings, PRs, CI runs | Pages 404, `main` not protected, CI on PR #2 green | [06-deploy-and-repo.log](06-deploy-and-repo.log) |
| E2E smoke (Playwright, Chromium) | 20 / 20 pass | [07-e2e-smoke.log](07-e2e-smoke.log), [e2e-junit.xml](e2e-junit.xml), [HTML report](e2e-report/index.html) |
| ESLint negative test (4 planted violations) | 4 / 4 caught | [08-lint-negative.log](08-lint-negative.log) |
| `check:data` on a broken map | exit 1, names the file and field | [check-data-broken-map.txt](check-data-broken-map.txt) |
| Every executed check, one row each | 327 rows | [test-run-report.md](test-run-report.md) |

## Screenshots

| File | Shows |
|---|---|
| [e2e-01-map-1280x720.png](screenshots/e2e-01-map-1280x720.png) | The stage 0 build at 1280 × 720: the example map's 9 × 7 grid, 5 swamp tiles marked "slow", "build b9977c9 · seed 123" |
| [e2e-04-build-info.png](screenshots/e2e-04-build-info.png) | The build and seed line used in bug reports |
| [e2e-05-960x540.png](screenshots/e2e-05-960x540.png) … [e2e-05-1920x1080.png](screenshots/e2e-05-1920x1080.png) | Scaling to 5 window sizes, with letterbox and pillarbox bars in `bg.base` |
| [e2e-06-data-error.png](screenshots/e2e-06-data-error.png) | The data error screen for a broken real level; also shows BUG-004 (the message lacks the coordinate) |

Regenerate everything with the commands in [`../../README.md`](../../README.md).
