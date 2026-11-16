# Levels

Owner: UI / Level designer.

- Grid rules (orientation, coordinates, tile size, neighbours): [`../ui-rules.md` → Hex grid](../ui-rules.md#5-hex-grid)
- Map file format: [`map-format.md`](map-format.md). Example: [`data/levels/_example.json`](../../data/levels/_example.json)
- Grid sketch with coordinates: [`hex-grid.png`](hex-grid.png) (Figma → Levels page → `HexGridSketch`)

| Level | File | Status |
|---|---|---|
| 1. Whisperwood (swamp, Goblin chief) | [`data/levels/whisperwood.json`](../../data/levels/whisperwood.json) | done: built to `plan/route-intent.md`, see below |
| 2. Frostpeak Pass (ice, Frost giant) | `data/levels/frostpeak.json` | stage 2 |
| 3. Ashen Citadel (lava, Ember dragon) | `data/levels/ashen-citadel.json` | stage 2 |

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
