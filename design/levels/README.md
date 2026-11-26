# Levels

Owner: UI / Level designer.

- Grid rules (orientation, coordinates, tile size, neighbours): [`../ui-rules.md` → Hex grid](../ui-rules.md#5-hex-grid)
- Map file format: [`map-format.md`](map-format.md). Example: [`data/levels/_example.json`](../../data/levels/_example.json)
- Grid sketch with coordinates: [`hex-grid.png`](hex-grid.png) (Figma → Levels page → `HexGridSketch`)

| Level | File | Status |
|---|---|---|
| 1. Whisperwood (swamp, Goblin chief) | [`data/levels/whisperwood.json`](../../data/levels/whisperwood.json) | done: built to `plan/route-intent.md`, see below |
| 2. Frostpeak Pass (ice, Frost giant) | [`data/levels/frostpeak.json`](../../data/levels/frostpeak.json) | done: built to `plan/route-intent.md`, see below |
| 3. Ashen Citadel (lava, Ember dragon) | [`data/levels/ashen.json`](../../data/levels/ashen.json) | done: built to `plan/route-intent.md`, see below |

## Map 1: Whisperwood

Built to [`plan/route-intent.md`](../../plan/route-intent.md). Coordinates are `[col, row]`. Start `[0, 6]` bottom-left, boss `[8, 0]` top-right, 10 steps apart. `startFood` 13.

| Route | Steps | Swamp | Food | Passes |
|---|---|---|---|---|
| Direct | 10 | 0 | 10 | monster `[1,5]`, elite `[4,3]`, monster `[6,2]` |
| Safe | 12 | 0 | 12 | monster `[1,5]`, village `[1,2]`, monster `[5,0]` |
| Rich | 11 | 2 (`[7,2]`, `[8,2]`) | 13 | monster `[1,5]`, chest `[3,5]`, shrine `[5,4]`, mystery `[6,4]`, chest `[7,3]` |

- **Tutorial fight:** `[1,5]`, a monster-only slot 1 step from the start. All three routes begin with it.
- **Elite:** `[4,3]`, 5 steps from the start, so its details are hidden at first.
- **Village:** `[1,2]`, after the first monster, so the player arrives with about 30 gold.
- **Locked chest:** `[8,3]`, 1 step off the rich route and 2 from the direct route. Start → elite (key) → locked chest → boss costs exactly 13 food: all the spare food.
- **Swamp:** each tile saves 1 step at the same food cost as walking around it, so it's never the cheap way, only the fast one. Every swamp tile can be walked around.
  - `[7,2]` and `[8,2]`: the rich route's way to the boss, which also avoids the direct route's monster at `[6,2]`.
  - `[2,4]`: a shortcut between the safe route at `[1,4]` and the direct route at `[3,3]`.
- **Where the routes meet:** they share only the first tile `[1,5]`, and direct and rich also share `[8,1]` next to the boss. In the middle, direct touches rich around `[4,4]` / `[4,5]` / `[5,4]` and at `[6,2]` / `[7,2]`, so the player can switch, e.g. take the key on the direct route, then go for the locked chest.
- **Optional detours off the routes:** mystery `[3,0]` next to the safe route, `["monster", "chest"]` at `[0,3]`, `["chest", "mystery"]` at `[5,6]`.
- **Slots:** 12, plus the village: 3 monster, 1 elite, 1 locked chest, 2 chest, 1 shrine, 2 mystery, 2 mixed.
- **Ration** (starter card: +1 food, Exhaust) adds at most 1 food per fight. That's up to +3 on the direct route, +2 on safe and +1 on rich. `startFood` stays 13: the rich route needs all of it and has only one fight, and the tests require "direct + 2–4". It does mean a direct-route player who plays Ration every fight has up to 6 spare food. If the food pressure on the direct route turns out too weak in playtests, that's a content change (Ration), not a map change.

## Map 2: Frostpeak Pass

Built to [`plan/route-intent.md`](../../plan/route-intent.md) → Map 2. Start `[0, 0]` top-left, boss `[8, 6]` bottom-right, 10 steps apart. `startFood` 15. Ice costs 2 food per step and makes the next fight Chilled.

| Route | Steps | Ice | Food | Passes |
|---|---|---|---|---|
| Direct | 10 | 2 (`[3,1]`, `[4,2]`) | 12 | monster `[2,1]`, elite `[5,2]`, monster `[7,3]` |
| Safe | 13 | 0 | 13 | monster `[0,2]`, village `[1,4]`, monster `[3,6]` |
| Rich | 12 | 1 (`[3,4]`) | 13 | monster `[0,2]`, chest `[1,2]`, shrine `[3,3]`, mystery `[4,5]`, chest `[6,5]` |

- **Ice before the elite:** the direct route's two ice tiles come right before the elite, so the elite is fought Chilled.
- **Every ice crossing is a real shortcut:**
  - the direct route's pair: 3 steps through, 4 around
  - the rich route's tile: 2 through, 3 around
  - Walking around never costs more food than crossing, so ice only ever buys steps.
- **The rich route's ice** comes after its only fight, so a player who crosses it fights the **Frost giant Chilled**. Walking around costs 1 more step and the same food (13 steps / 13 food, still within 15). That's a real choice; tell me if the PM wants the boss spared.
- **Village and the cut-over:** the safe and rich routes share the first fight at `[0,2]`. After the village `[1,4]` the safe route touches the rich route again at `[2,5]` / `[3,5]`, so a player can buy food at the village and cut over to the chests.
- **Locked chest:** `[4,4]`, 1 step off the rich route and 2 from the direct route. Start → elite (key) → locked chest → boss costs 12 food of 15.
- **Optional detours:** `["mystery", "chest"]` at `[5,0]`, `["monster", "chest"]` at `[8,2]`.
- **Slots:** 12, plus the village: 4 monster, 1 elite, 1 locked chest, 2 chest, 1 shrine, 1 mystery, 2 mixed.

## Map 3: Ashen Citadel

Built to [`plan/route-intent.md`](../../plan/route-intent.md) → Map 3. Start `[8, 0]` top-right, boss `[0, 6]` bottom-left, 10 steps apart. `startFood` 13. Lava costs normal food and deals 4 damage.

| Route | Steps | Lava | Food | Passes |
|---|---|---|---|---|
| Direct | 10 | 2 (`[6,2]`, `[4,3]`): 8 damage | 10 | monster `[8,1]`, monster `[5,2]`, elite `[3,3]`, monster `[2,4]` |
| Safe | 12 | 0 | 12 | monster `[8,1]`, monster `[4,1]`, village `[2,2]` |
| Rich | 12 | 1 (`[6,4]`): 4 damage | 12 | monster `[8,1]`, chest `[7,2]`, shrine `[6,3]`, mystery `[6,5]`, chest `[4,5]`, monster `[3,5]` |

- **Readable at a glance:** safe runs along the top, direct through the middle, rich along the bottom.
- **The first fight:** all three routes start with the monster at `[8,1]`, which keeps the monster slots at 5 while giving direct 3 fights.
- **Lava is never forced:**
  - every lava tile is a straight-line shortcut: 2 steps through, 3 around
  - there's a lava-free way to the boss (the safe route)
  - no lava within 2 tiles of the boss
- **Village late:** `[2,2]` is step 7 of 12 on the safe route, and no fight comes after it before the boss. A rest there (Rested, +5 block) goes straight into the Ember dragon fight.
- **Locked chest:** `[5,4]`, 1 step off the rich route and 2 from the direct route. Start → elite (key) → locked chest → boss costs exactly 13 food, all of `startFood`, as on map 1.
- **Optional detours:** `["mystery", "chest"]` at `[5,0]`, `["monster", "chest"]` at `[1,2]`, both next to the safe route.
- **Slots:** 13, plus the village: 5 monster, 1 elite, 1 locked chest, 2 chest, 1 shrine, 1 mystery, 2 mixed.

## Before maps 2 and 3 can be merged

Each map needs its enemies in the content: a boss (`frost-giant`, `ember-dragon`) with `kind: "boss"`, and at least one normal and one elite enemy with that land. As soon as any game enemies exist (#42), the data check fails on both maps without them: "no enemy with the id …" and "no normal enemy has land …". So the level 2 and 3 enemies have to land with these maps or before them.
