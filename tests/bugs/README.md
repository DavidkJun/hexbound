# Bug log

Owner: Tester. Every report follows the fields of the team's issue template (`.github/ISSUE_TEMPLATE/bug_report.yml`): build and seed, severity, steps, expected, actual, evidence. Each one is also a GitHub issue with the `bug` label, assigned to its owner.

**Who closes:** the assignee fixes it and links the fix. The tester re-runs the linked test (an `it.fails` test turns red), turns it into a regression test and closes the issue.

**Severity** (from the issue template): **Blocker**: the run (or the stage) can't continue · **Major**: a rule or screen is wrong, but it can go on · **Minor**: looks wrong, or a small inconvenience.

**Automated bugs** have an `it.fails('BUG-0xx …')` test. It passes while the bug exists, and **fails the moment the bug is fixed**. Then it becomes a normal test named `… (regression BUG-0xx)`.

## Open

| ID | Issue | Severity | Owner | Summary | Test | Found |
|---|---|---|---|---|---|---|
| [BUG-009](BUG-009.md) | [#11](https://github.com/DavidkJun/hexbound/issues/11) | Major (process) | Repo owner (`DavidkJun`) | `main` is not protected; reviews are not enforced | TC-S0-08 | 2026-11-04 |
| [BUG-010](BUG-010.md) | [#12](https://github.com/DavidkJun/hexbound/issues/12) | Minor | PM (`DavidkJun`) | The design PDF can't be searched or copied (fonts without a Unicode map) | design review | 2026-11-04 |
| [BUG-013](BUG-013.md) | — | Minor | Programmer (`alomj`) | A normal or elite enemy is accepted as the boss (new map rule 10) | TC-MAP-10d | 2026-11-05 |
| [BUG-014](BUG-014.md) | — | Minor | Programmer (`alomj`); a question for UI / LD (`koksha19`) | A missing `levels.json` is not a data error (new map rule, N-06) | TC-MAP-12d | 2026-11-05 |
| [BUG-015](BUG-015.md) | — | Minor | Programmer (`alomj`) | An `allow` list that repeats a type is accepted (new map rule 7) | TC-MAP-07f | 2026-11-05 |
| [BUG-016](BUG-016.md) | — | Minor | UI / LD (`koksha19`) | `BlessingsRow` (96 px) is too narrow for the 4 slots the spec asks for | TC-DES-02g | 2026-11-05 |

## Fixed and verified

All retested on 2026-11-05 against main 73f39a3 and the deployed build. Evidence: [`../results/stage-0/retest/`](../results/stage-0/retest/README.md).

| ID | Issue | Severity | Owner | Summary | Fixed in | Regression test |
|---|---|---|---|---|---|---|
| [BUG-008](BUG-008.md) | [#10](https://github.com/DavidkJun/hexbound/issues/10) | Blocker (stage 0 exit) | `DavidkJun`, `alomj` | The deployed build link returned 404 | Pages on, PR #2 merged | TC-S0-07, TC-S0-18 |
| [BUG-001](BUG-001.md) | [#3](https://github.com/DavidkJun/hexbound/issues/3) | Major | `alomj` | An enemy with `random` weights `{}` passed the data check | a7351f2 | TC-DATA-03h |
| [BUG-007](BUG-007.md) | [#9](https://github.com/DavidkJun/hexbound/issues/9) | Major | `alomj` | Node < 22.12: install "succeeded", then everything crashed | 5e9931f | TC-S0-03 |
| [BUG-002](BUG-002.md) | [#4](https://github.com/DavidkJun/hexbound/issues/4) | Minor | `alomj` | A level listed twice in `levels.json` was accepted | eb2997a | TC-MAP-12c |
| [BUG-003](BUG-003.md) | [#5](https://github.com/DavidkJun/hexbound/issues/5) | Minor | `alomj` | Two moves with one id in an enemy were accepted | a2ad415 | TC-DATA-03i |
| [BUG-004](BUG-004.md) | [#6](https://github.com/DavidkJun/hexbound/issues/6) | Minor | `alomj` | The out-of-grid error didn't show the coordinate | 2cc4570 | TC-MAP-04e, TC-E2E-06a |
| [BUG-005](BUG-005.md) | [#7](https://github.com/DavidkJun/hexbound/issues/7) | Minor | `koksha19` | `TurnCounter` ended at x 1250 instead of 1256 | abced2c | TC-DES-03d |
| [BUG-006](BUG-006.md) | [#8](https://github.com/DavidkJun/hexbound/issues/8) | Minor | `koksha19` | Paddings of 6 and 10 px were not tokens | abced2c | TC-DES-04d |
| [BUG-011](BUG-011.md) | [#13](https://github.com/DavidkJun/hexbound/issues/13) | Minor | `koksha19` | Hazard tiles barely stood out (ice 1.29:1) | abced2c | TC-DES-06c |
| [BUG-012](BUG-012.md) | [#14](https://github.com/DavidkJun/hexbound/issues/14) | Minor | `koksha19` | 13 px text below 4.5:1 on tiles and in danger states | abced2c | TC-DES-06d–f |

**Totals:** 16 found, 10 fixed and verified, 6 open (1 Major, 5 Minor). Open by owner: 3 Programmer, 2 PM / repo owner, 1 UI / LD.
