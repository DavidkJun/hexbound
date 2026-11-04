# Bug log

Owner: Tester. Every report follows the fields of the team's issue template (`.github/ISSUE_TEMPLATE/bug_report.yml`): build and seed, severity, steps, expected, actual, evidence. They can be filed as GitHub issues once the owners have seen them.

**Severity** (from the issue template): **Blocker**: the run (or the stage) can't continue · **Major**: a rule or screen is wrong, but it can go on · **Minor**: looks wrong, or a small inconvenience.

**Automated bugs** have an `it.fails('BUG-0xx …')` test. It passes while the bug exists, and **fails the moment the bug is fixed**. Then the test is turned into a normal `it(...)` and the bug is closed.

| ID | Severity | Owner | Summary | Test | Status |
|---|---|---|---|---|---|
| [BUG-008](BUG-008.md) | Blocker (stage 0 exit) | Repo owner + Programmer | The deployed build link returns 404 (Pages not enabled, PR #2 not merged) | TC-S0-07 | Open |
| [BUG-001](BUG-001.md) | Major | Programmer | An enemy with `random` weights `{}` passes the data check (no next move) | TC-DATA-03h | Open |
| [BUG-007](BUG-007.md) | Major | Programmer | Node < 22.12: `npm ci` "succeeds", then test, build and dev crash with a misleading error | TC-S0-03 | Open |
| [BUG-009](BUG-009.md) | Major (process) | Repo owner | `main` is not protected; reviews are not enforced | TC-S0-08 | Open |
| [BUG-002](BUG-002.md) | Minor | Programmer | A level listed twice in `levels.json` is accepted | TC-MAP-12c | Open |
| [BUG-003](BUG-003.md) | Minor | Programmer | Two moves with one id in an enemy are accepted | TC-DATA-03i | Open |
| [BUG-004](BUG-004.md) | Minor | Programmer | The out-of-grid error doesn't show the bad coordinate | TC-MAP-04e, TC-E2E-06a | Open |
| [BUG-005](BUG-005.md) | Minor | UI / LD | `TurnCounter` ends at x 1250 in layout.json; the spec says 1256 | TC-DES-03d | Open |
| [BUG-006](BUG-006.md) | Minor | UI / LD | Paddings of 6 and 10 px in the specs are not tokens | TC-DES-04d | Open |
| [BUG-010](BUG-010.md) | Minor | PM | The design PDF can't be searched or copied (fonts without a Unicode map) | design review | Open |
| [BUG-011](BUG-011.md) | Minor | UI / LD | Hazard tiles barely stand out from ground (ice 1.29:1) | TC-DES-06c | Open |
| [BUG-012](BUG-012.md) | Minor | UI / LD | 13 px text below 4.5:1 on tiles and in danger states | TC-DES-06d | Open |

**Totals:** 12. By severity: 1 Blocker, 3 Major, 8 Minor. By owner: 7 Programmer or repo owner, 4 UI / LD, 1 PM.
