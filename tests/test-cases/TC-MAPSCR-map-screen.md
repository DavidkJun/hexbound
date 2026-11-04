# TC-MAPSCR: map screen (stage 1)

Written in stage 0 from `design/screens/map.md`, `map.png`, `ui-rules.md` and `map-format.md`, so the screen can be checked as soon as it's built. **Status of all: Not run** (the screen is not built yet).

Where a rule is still open, the case names the gap (`G-xx` in [`../design-review/design-doc-gaps.md`](../design-review/design-doc-gaps.md)). It is finished when the PM answers.

**Setup for all cases:** the build from `main`, window 1280 × 720, `?seed=1`, the level `whisperwood` (until it exists: `_example`). The player starts on [0,6].

| ID | Priority | Title | Steps | Expected | Auto? |
|---|---|---|---|---|---|
| TC-MAPSCR-01 | High | The layout matches the spec | Screenshot; compare with `map.png` | Every element of map.md at its rect; colours from tokens | e2e (pixel and rect checks, like TC-E2E-02/03) |
| TC-MAPSCR-02 | High | Tile centres | Inspect tiles 0,0 · 1,0 · 8,6 | Centres at (196, 128.84), (265, 168.67), (748, 606.87) on the page | e2e |
| TC-MAPSCR-03 | High | The boss is always shown | Load the level; don't hover | `BossPanel`: boss name in `accent.danger`, signature move text; the boss tile shows the boss icon from any distance | e2e |
| TC-MAPSCR-04 | High | Visibility radius 2 | Player on [1,5]; look at [2,5] (1 step), [1,3] (2), [4,5] (3) | Detail labels on [2,5] and [1,3]; [4,5] at 70% opacity, type icon only | e2e |
| TC-MAPSCR-05 | High | Plan a route step by step | Click [1,4], then [2,4], [3,4] | Outlines and badges 1, 2, 3; `RouteSummary`: "3 steps · 4 food (swamp costs 2)", food left updated after each click | e2e |
| TC-MAPSCR-06 | High | Remove the last step | Route of 3; click step 3 | Back to 2 steps; cost updated | e2e |
| TC-MAPSCR-07 | Medium | A click on a tile that is not next to the last step is ignored | Route [1,4]; click [5,0] | Nothing changes; no error | e2e |
| TC-MAPSCR-08 | Medium | Clear the route | Route of 3; Clear | No route; "Click a tile next to you…"; Go and Clear disabled (40%, not clickable) | e2e |
| TC-MAPSCR-09 | High | Not enough food | Food 4; plan 3 normal + 1 swamp step (5 food) | From step 4: outlines and badges in `accent.danger`; "Not enough food"; Go disabled | e2e |
| TC-MAPSCR-10 | High | Boundary: food exactly enough | Food 5; the same route | Everything gold; Go enabled; food left 0 | e2e |
| TC-MAPSCR-11 | High | Walking stops at a location | Route through the monster on [2,5]; Go | The token moves step by step; Go shows "Walking…"; hex clicks are ignored; walking stops on [2,5] and the fight opens | e2e |
| TC-MAPSCR-12 | High | Food is spent per step from the game logic | Walk 2 normal + 1 swamp step | Food −4 in the TopBar | unit (core) + e2e |
| TC-MAPSCR-13 | Medium | Food is 0 | Reach 0 food | Food chip in `accent.danger`; then the rule from G-09 | e2e (after G-09) |
| TC-MAPSCR-14 | Medium | Tooltip placement | Hover [1,3], then [8,3] | It opens right of the tile; at [8,3] it flips to the left side and stays inside `MapArea` | e2e |
| TC-MAPSCR-15 | Medium | The route crosses swamp | Route over [2,4] | "crosses swamp: +1 food per tile" in `RouteSummary` | e2e |
| TC-MAPSCR-16 | Medium | A visited tile | Win the fight on [2,5]; look at the tile | The look from S-05 / G-13 | manual (after G-13) |
| TC-MAPSCR-17 | Medium | The same seed deals the same map | Open `?seed=7` twice | The same icons in the same slots | e2e |
| TC-MAPSCR-18 | Medium | Different seeds deal different maps | `?seed=1` … `?seed=20` | Two-way slots show both types across the seeds | e2e |
| TC-MAPSCR-19 | Low | Keyboard and focus | Tab through the screen | Go and Clear reachable; a visible focus ring | manual |
| TC-MAPSCR-20 | Low | The smallest window | 960 × 540 | Everything scaled by 0.75, readable, no layout change | e2e |
