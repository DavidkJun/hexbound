# Route intent

Owner: PM / Game designer. For: UI / Level designer.

What each map's three routes must offer. The UI / Level designer picks the tiles and writes the map file ([`design/levels/map-format.md`](../design/levels/map-format.md)); this file says what the routes are for. Numbers come from the design document, [`HexBound_DD.md`](HexBound_DD.md) → 4. Rules.

## Map 1: Whisperwood

Level 1 teaches the basics and doubles as the tutorial. Hazard: swamp (slow, 2 food per step, nothing else). Boss: Goblin chief (`goblin-chief`). The routes must be readable at a glance: a first-time player should see the short way past the elite, the long way through the village, and the detour to the chests and the shrine.

### The three routes

| | Direct | Safe | Rich |
|---|---|---|---|
| Steps | 10 (the shortest possible) | 12 | 11–12 |
| Swamp tiles | none | none | 1–2 |
| Food | 10 | 12 | 13, all of `startFood` |
| Fights before the boss | 2 monsters + the elite | 2 monsters | 1 monster |
| Other locations | — | the village | 2 chests, the shrine, a mystery |
| What it costs | health: the hardest fights | time: the most steps | food: no spare steps at all |
| Expected state at the boss | most cards and gold, a key, lowest health | highest health, a village purchase or two | a blessing, chest loot, the fewest fights |

`startFood` is **13**: the direct route's 10 plus 3 spare steps. The safe route leaves 1 spare step; the rich route leaves none, so one wrong step on it already costs health (4.2).

### Rules for the layout

1. **Corners.** Start and boss in opposite corners, 10 steps apart.
2. **Tutorial fight early.** The first location on every route is a `["monster"]` slot within 3 steps of the start. It can be one slot shared by all three routes. It must be monster-only, not a mixed `allow` list, since the tutorial fight happens there.
3. **Elite.** The direct route passes one `["elite"]` slot, at least 3 steps from the start, so its details are hidden at first.
4. **Village.** The fixed village sits on the safe route, with at least one monster slot before it, so the player arrives with about 30 gold: enough for one purchase plus food.
5. **Locked chest.** One `["locked-chest"]` slot on the rich route or 1 step off it, and 2–3 steps away from the direct route. Getting the key on the direct route and then opening the chest should be possible, at the price of most of the spare food.
6. **Swamp.** Swamp sits where cutting through it saves steps but not food, e.g. a shortcut between the safe and the rich route. It is never on the direct route, and every swamp tile can be walked around.
7. **Crossings.** The routes may share the first and the last 1–2 tiles, and should touch at least once in the middle, so the player can change their mind (e.g. direct for the key, then rich for the locked chest).
8. **Slots.** About 11 slots plus the village, like `_example.json`: 3–4 `["monster"]`, 1 `["elite"]`, 1 `["locked-chest"]`, 2 `["chest"]`, 1 `["shrine"]`, 1–2 `["mystery"]`. One or two mixed slots off the routes (e.g. `["chest", "mystery"]`) are welcome as optional detours.
9. **`intendedRoutes`** in the map file are exactly these three routes, so the map check and the tester can verify the food numbers above.

If a rule here can't fit on a 9×7 grid together with the others, tell me which one, and I'll decide which gives way.

## Maps 2 and 3

Frostpeak Pass and Ashen Citadel: stage 2. Their route intent comes with the stage 2 tasks.
