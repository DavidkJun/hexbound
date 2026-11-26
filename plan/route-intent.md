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

## Map 2: Frostpeak Pass

Level 2 tests route and food planning. Hazard: ice (slow, 2 food per step, and **Chilled** in the next fight: Chill 1, so 1 less energy on the first turn). Boss: Frost giant (`frost-giant`). Ice is the short way, so the map asks every time: pay food and energy to save steps, or walk around.

### The three routes

| | Direct | Safe | Rich |
|---|---|---|---|
| Steps | 10 | 13 | 12 |
| Ice tiles | 2 | none | 1 |
| Food | 12 | 13 | 13 |
| Fights before the boss | 2 monsters + the elite | 2 monsters | 1 monster |
| Other locations | — | the village | 2 chests, the shrine, a mystery |
| What it costs | health: the elite fought Chilled | food: the most steps | food: 2 spare steps at most |
| Expected state at the boss | most cards and gold, a key, lowest health | highest health, food bought at the village | a blessing, chest loot, the fewest fights |

`startFood` is **15**: the direct route's 12 plus 3 spare steps. The safe and the rich route leave 2.

### Rules for the layout

1. **Corners.** Start and boss in opposite corners, 10 steps apart, as on map 1.
2. **Ice before a fight.** On the direct route, the second ice tile comes right before the elite, so the elite is fought Chilled. That is the price of the short way (pillar 2).
3. **Every ice tile can be walked around,** at the cost of more steps. No route is forced over ice.
4. **Village and food.** The village sits on the safe route and sells food, so a player can take the safe route to the village and then cut over to the rich route with bought food. The routes cross at least once after the village.
5. **Elite and locked chest.** As on map 1: one `["elite"]` slot on the direct route, at least 3 steps from the start; one `["locked-chest"]` slot on or 1 step off the rich route, 2–3 steps from the direct route.
6. **Slots.** About the same as map 1: 3–4 `["monster"]`, 1 `["elite"]`, 1 `["locked-chest"]`, 2 `["chest"]`, 1 `["shrine"]`, 1–2 `["mystery"]`, plus one or two mixed slots off the routes.
7. **`intendedRoutes`** in the map file are exactly these three routes.

## Map 3: Ashen Citadel

Level 3 tests whether the deck has a real direction. Hazard: lava (4 damage on entering the tile, block doesn't count, it can kill; normal food cost). Boss: Ember dragon (`ember-dragon`). Food is not the problem here: health is. Lava is the short way, and more fights stand between the player and the dragon than on the earlier maps.

### The three routes

| | Direct | Safe | Rich |
|---|---|---|---|
| Steps | 10 | 12 | 11–12 |
| Lava tiles | 2 (8 damage) | none | 1 (4 damage) |
| Food | 10 | 12 | 11–12 |
| Fights before the boss | 3 monsters + the elite | 2 monsters | 2 monsters |
| Other locations | — | the village | 2 chests, the shrine, a mystery |
| What it costs | health: lava and the most fights | food: the most steps | health: one lava tile |
| Expected state at the boss | the strongest deck, a key, lowest health | highest health after a rest | a blessing, chest loot |

`startFood` is **13**: the direct route's 10 plus 3 spare steps.

### Rules for the layout

1. **Corners.** Start and boss in opposite corners, 10 steps apart.
2. **Lava is never forced.** Every lava tile can be walked around. A player with low health must always have a lava-free way to the boss.
3. **No lava right before the boss.** The last 2 tiles before the boss tile are not lava, so the player is never pushed into the final fight by a hazard they can't see coming.
4. **Village late.** The village sits on the safe route, in the second half of the map, so resting there (Rested, 5 block) carries into one of the last fights.
5. **Elite and locked chest.** As on maps 1 and 2. The locked chest is the last chance to use a key, since keys don't matter after level 3.
6. **Slots.** One more fight than maps 1 and 2: 4–5 `["monster"]`, 1 `["elite"]`, 1 `["locked-chest"]`, 2 `["chest"]`, 1 `["shrine"]`, 1–2 `["mystery"]`.
7. **`intendedRoutes`** in the map file are exactly these three routes.

If a rule here can't fit on a 9×7 grid together with the others, tell me which one, and I'll decide which gives way.
