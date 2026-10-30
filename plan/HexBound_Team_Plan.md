# Hexbound — Team Plan

Who does what, in which order, and who hands what to whom. The game itself is described in the design document (`HexBound_DD.pdf`); this plan only covers how the four of us get from an idea to a released game.

The plan is written in terms of *kinds of work* (rules, data, screens, maps, builds, test results), not specific features. If a card, a location or a level changes, the plan still holds — only the contents of the handoffs change.

---

## 1. Roles in one line

| Role | Owns | Final say on |
|---|---|---|
| **PM / Game designer** | The design, the task board, priorities, game content (cards, enemies, events, blessings, numbers) | What the game is; tie-breaks |
| **UI / Level designer** | Visual style, all screens and visual feedback, the three hand-made maps, art | How the game looks and reads |
| **Programmer** | Code architecture, game systems, data-file format, builds and deployment | How the game is built |
| **Tester** | Testable rules, testing, playtests, balance checks against targets | Whether a thing is done and works as designed |

---

## 2. How work flows between us

Every feature, at every stage, travels the same path:

```
 PM / GD ──design──► Tester ──testable rules──► Programmer ◄──screens, maps── UI / LD
    ▲                                                │
    │                                              build
    │                                                ▼
    └──────── playtest results, rule problems ─── Tester ──bugs──► owner of the bug
```

In words:

1. **PM / GD → Tester.** The game designer describes a feature or writes content. The tester turns it into testable rules: exact numbers, edge cases, "what happens if…". Unclear points go back to the game designer, not straight into code.
2. **Tester → Programmer.** The programmer builds from the testable rules, not from the raw idea.
3. **PM / GD → Programmer.** Content (cards, enemies, events…) is handed over as data files in the format the programmer defined, never as code.
4. **UI / LD ↔ Programmer.** The UI / level designer builds screens on top of the game state the programmer exposes, and hands over maps as data files. The two agree on that boundary early and keep it stable.
5. **Programmer → Tester.** Every finished piece reaches the tester as a playable build with a note on what changed.
6. **Tester → everyone.** Bugs go to whoever owns the broken thing. Balance and playtest results go to the game designer, who decides what changes — and the loop starts again.

### What counts as a handoff

A handoff is finished only when all three are true:

1. The thing is where the receiver can find it (the task board, the repository, the shared folder).
2. The receiver has been told, with a link.
3. The receiver has looked at it and either confirmed it is usable or said what is missing.

If you are waiting on someone for more than two days, say so in the team chat or at the weekly sync. Do not wait silently.

### When something changes

A change to the design always goes through the same order: **PM / GD updates the design → Tester updates the rules → owners of the affected work are told on the board.** No one changes rules directly in code or in a screen because "it felt better" — suggest it to the game designer instead.

---

## 3. Stages at a glance

| Stage | Goal | PM / GD | UI / LD | Programmer | Tester | Done when |
|---|---|---|---|---|---|---|
| **0. Kick-off** (~5%) | Agree on what and how | Present design, close questions, task board | Visual direction, screen list, hex grid sketch | Tech stack, repo, structure, data format | Find gaps in design, playtest checklist | Decisions made, board ready, project runs |
| **1. First level** (~25%) | Level 1 playable | Level-1 content, tutorial fight | Map + fight screens, map 1 | Map, movement, food, combat core | Test each system, first route check | Someone who didn't build it finishes level 1 |
| **2. Full game** (~30%) | Whole run playable | All content, prices | Remaining screens, maps 2–3 | Remaining locations, hazards, lives, score | Regression, look for exploits | Full run, no blocking bugs |
| **3. Balance** (~20%) | Game plays as designed | Analyse results, tune numbers and maps | Fix readability issues | Bug fixes, debug panel, fight simulator | Outside playtests vs targets | Run is 35–45 min, no route always wins |
| **4. Polish** (~12%) | Game feels finished | Pick nice-to-haves, final texts | Consistent art, hit feedback, UI pass | Extras, performance, browsers | Full regression, second playtest | Feature freeze |
| **5. Release** (~8%) | Shipped and presented | Final doc, report, presentation | Screenshots and visuals | Release build, deployment | Acceptance against must-have list | Deployed, presentation ready |

A stage ends only when its "done when" check passes. Every stage ends with a playable build that the whole team tries.

---

## 4. Stages in detail

Each stage lists the goal, what each role does, and the handoffs. Handoffs are listed roughly in the order they should happen inside the stage — the early ones unblock the late ones.

### Stage 0 — Kick-off and decisions (~5%, ~25 h)

**Goal:** everyone knows what we are building and how. Nothing is built yet beyond an empty project that runs.

- **PM / GD** — presents the design, collects questions, makes the final calls, splits the must-have list into tasks on the board.
- **UI / LD** — picks the visual direction, lists every screen, sketches the hex grid and the two main screens (map and fight).
- **Programmer** — picks the tech stack, sets up the repository, the project structure and the data-file format; gets an empty build running.
- **Tester** — reviews the design for gaps and contradictions; turns the design pillars into a playtest checklist.

| From | To | What | Unblocks |
|---|---|---|---|
| PM / GD | Everyone | Design walkthrough | All stage-0 work |
| Tester | PM / GD | List of gaps and open questions | Final answers in the design document |
| PM / GD | Everyone | Answers; updated design document | Stage 1 rules and content |
| UI / LD ↔ Programmer | each other | Hex grid shape, screen size, how screens read game state, asset naming | Map and fight screens in stage 1 |
| Programmer | Everyone | Repository access, run instructions, link to the running build | Everyone's stage-1 work |
| Programmer | PM / GD, UI / LD | Data-file format (content and maps) | Level-1 content and map 1 |
| UI / LD | PM / GD | Visual direction for approval | Art and screens |
| UI / LD | Tester | Screen list and sketches | Gap review of the screens |
| PM / GD | Everyone | Task board for stage 1 | Stage 1 |

**Done when:** decisions made, task board ready, project builds and runs.

### Stage 1 — Playable first level (~25%, ~76 h)

**Goal:** level 1 can be played from the start tile to the boss.

- **PM / GD** — writes level-1 content (starter deck, enemies, boss) and the tutorial fight.
- **UI / LD** — map screen and fight screen; the first map with its three routes.
- **Programmer** — map, movement and food; then the combat core (intents, energy, hand, keywords).
- **Tester** — tests each system as it lands; first check that the routes are real choices.

| From | To | What | Unblocks |
|---|---|---|---|
| PM / GD | Tester | Rules for movement, food and combat | Testable rules |
| Tester | Programmer, PM / GD | Testable rules: exact numbers, edge cases | Map and combat code |
| Programmer | UI / LD | What game state and actions the screens can use | Map and fight screens |
| PM / GD | Programmer | Level-1 content as data files | Combat with real cards and enemies |
| UI / LD | Programmer | Map 1 as a data file; map and fight screens | Playable level |
| PM / GD | UI / LD | Route intent for map 1 (direct / safe / rich) | Map 1 layout |
| Programmer | Tester | A build for each finished system, with what changed | Testing |
| Tester | Owner of the broken thing | Bug reports | Fixes |
| Tester | PM / GD | First notes on route choices | Map and content adjustments |

**Done when:** a teammate who did not build it can finish level 1.

### Stage 2 — Full game loop and content (~30%, ~88 h)

**Goal:** a full run from the first level to the final boss.

- **PM / GD** — final lists of all content (cards, enemies, blessings, events, bounties) and prices.
- **UI / LD** — all remaining screens (village, shop, shrine, event, reward, score…); maps for levels 2 and 3.
- **Programmer** — all remaining locations and systems (elites and keys, villages, shrines, events, hazards, lives, score).
- **Tester** — regression testing after each feature; looks for exploits in the rules.

| From | To | What | Unblocks |
|---|---|---|---|
| PM / GD | Tester | Rules for the remaining locations and systems | Testable rules |
| Tester | Programmer | Testable rules | Remaining systems |
| PM / GD | Programmer | Full content as data files | Complete run |
| PM / GD | UI / LD | Route intent and hazards for maps 2 and 3 | Maps 2 and 3 |
| UI / LD | Tester | Maps 2 and 3 | Check food and route math before code depends on them |
| UI / LD | Programmer | Remaining screens and maps | Complete run |
| Programmer | Tester | Builds per feature | Regression testing |
| Tester | PM / GD | Exploits and rule problems | Rule fixes |
| Tester | Owners | Bug reports | Fixes |

**Done when:** a full run from level 1 to the final boss is possible with no blocking bugs.

### Stage 3 — Playtests and balance (~20%, ~60 h)

**Goal:** the game plays the way the design says it should.

- **PM / GD** — reads playtest results; adjusts numbers first, maps second.
- **UI / LD** — fixes readability and layout problems found in playtests.
- **Programmer** — bug fixes; a debug panel and a fight simulator for balance checks.
- **Tester** — runs playtests with people outside the team; compares results with the design targets.

| From | To | What | Unblocks |
|---|---|---|---|
| Programmer | PM / GD, Tester | Debug panel and fight simulator (first thing in the stage) | Fast balance checks |
| Tester | PM / GD | Playtest results compared to targets | Balance decisions |
| Tester | UI / LD | Readability and layout problems | UI fixes |
| PM / GD | Programmer (via data files) | Number changes | Next playtest |
| PM / GD | UI / LD | Map changes, if numbers alone are not enough | Next playtest |
| Tester | Owners | Bug reports | Fixes |

**Done when:** a full run takes 35–45 minutes and no single route always wins.

### Stage 4 — Polish (~12%, ~40 h)

**Goal:** the game feels finished. Nothing new after this stage.

- **PM / GD** — picks which nice-to-haves fit the remaining time; final text pass.
- **UI / LD** — consistent art set, hit feedback, final UI pass.
- **Programmer** — implements the chosen extras; performance and browser checks.
- **Tester** — full regression pass and a second playtest.

| From | To | What | Unblocks |
|---|---|---|---|
| PM / GD | Everyone | Chosen nice-to-haves (first thing in the stage) | Polish work |
| PM / GD | UI / LD, Programmer | Final texts | Final screens |
| UI / LD | Programmer | Final art and feedback effects | Integration |
| Programmer | Tester | Build with extras | Regression, second playtest |
| Tester | PM / GD | Regression and playtest results | Feature-freeze decision |

**Done when:** feature freeze — from here on only bug fixes.

### Stage 5 — Release and defence (~8%, ~27 h)

**Goal:** the game is online and the presentation is ready.

- **PM / GD** — final design document, report and presentation.
- **UI / LD** — screenshots and visuals for the presentation.
- **Programmer** — release build and deployment; last fixes.
- **Tester** — final acceptance test against the must-have list.

| From | To | What | Unblocks |
|---|---|---|---|
| Programmer | Everyone | Release build and its link | Acceptance test, screenshots |
| Tester | PM / GD, Programmer | Acceptance results against the must-have list | Last fixes, report |
| UI / LD | PM / GD | Screenshots and visuals | Presentation |

**Done when:** the game is deployed and the presentation is ready.

---

## 5. Every stage, every week

- **Weekly sync**, led by the PM: what was handed off, what is blocked, what is next.
- **One task board.** Every task has an owner. A handoff is a task moving to the next person.
- **Review before merge.** Every change is looked at by another team member.
- **Content lives in data files**, so balance can be tuned without touching code.
- **New ideas go to the nice-to-have list**, not into the current stage.

---

## 6. Stage briefs

Each stage has one short brief per role with the concrete tasks for that stage. Briefs for stage 0:

- `Stage0_UI_Level_Designer.txt`
- `Stage0_Programmer.txt`
- `Stage0_Tester.txt`
