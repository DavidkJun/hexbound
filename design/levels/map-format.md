# Map file format

Owner: UI / Level designer. The team plan first gave the map format to the programmer. In stage 0 it was decided that the UI / Level designer defines it, since they write the maps.

Each level is one JSON file in `data/levels/<level-id>.json`, written by hand. A complete, valid example is in [`data/levels/_example.json`](../../data/levels/_example.json).

## Which files are levels

- The game's levels and their order are listed in `data/levels/levels.json`, a plain array of level ids:
  ```json
  ["whisperwood", "frostpeak", "ashen-citadel"]
  ```
  The game loads exactly these files, in this order. It's created together with the first real map.
- Files starting with `_` are examples or drafts. They are never loaded by the game, but the map check still validates them.

Coordinates are always `[col, row]` on the flat-top, odd-q grid from [`../ui-rules.md`](../ui-rules.md#5-hex-grid): `col` 0–8, `row` 0–6.

## Fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Level id, same as the file name: `whisperwood`, `frostpeak`, `ashen-citadel`. |
| `name` | string | Name shown to the player. |
| `land` | `"whisperwood"` \| `"frostpeak"` \| `"ashen"` | Picks the land colours from `tokens.color.land.*`. |
| `hazard` | `"swamp"` \| `"ice"` \| `"lava"` | The level's hazard terrain. |
| `startFood` | number | Food at the start of the level: direct route cost plus about 3 spare steps. |
| `terrain` | 7 strings × 9 characters | Row 0 first. One character per tile, column 0 first. |
| `start` | `[col, row]` | Player start tile. |
| `boss` | `{ "at": [col, row], "enemy": id }` | Boss tile and the boss's enemy id from the content files. |
| `fixed` | list of `{ "at", "type" }` | Locations that are always in the same place. In the design only villages are fixed. |
| `slots` | list of `{ "at", "allow": [types] }` | Marked slots. Each run, the game deals one location into each slot, chosen from `allow`. |
| `intendedRoutes` | `{ "direct", "safe", "rich" }`, each a list of tiles from `start` to `boss` | The three routes the map is built around. The game doesn't use them; the tester and the map check use them for food math. |

### Terrain characters

| Char | Terrain | Food per step onto it | Effect |
|---|---|---|---|
| `.` | normal | 1 | — |
| `s` | swamp | 2 | slow |
| `i` | ice | 2 | slow; chills (−1 energy on the first turn of the next fight) |
| `l` | lava | 1 | deals damage (amount set in the rules) |

The hazard's exact numbers belong to the game rules. This table only says which tiles are which.

### Location types

`monster`, `elite`, `chest`, `locked-chest`, `village`, `shrine`, `mystery`. `start` and `boss` have their own fields.

## Rules a map must pass

The loader checks these and fails with a clear message if one breaks:

1. `id` equals the file name without `.json`.
2. `land` and `hazard` go together: `whisperwood` + `swamp`, `frostpeak` + `ice`, `ashen` + `lava`.
3. `terrain` has exactly 7 strings of exactly 9 characters. The only allowed characters are `.` and the level's own hazard character (`s`, `i` or `l`).
4. Every coordinate is inside the grid.
5. `start` and `boss` are on normal (`.`) tiles. Locations in `fixed` and `slots` may be on hazard tiles.
6. No two of `start`, `boss`, `fixed`, `slots` share a tile.
7. Every `fixed[].type` and every entry of every `allow` list is a location type. `allow` lists are non-empty.
8. Every route in `intendedRoutes` starts at `start`, ends at `boss`, and each step is a neighbour of the previous one.
9. `startFood` is a positive whole number, at least the food cost of the `direct` route. Design target: about 3 more than that cost.
10. Once enemy content files exist: `boss.enemy` is an existing enemy id.

Every rule failing blocks loading, including the `intendedRoutes` rules: a broken map is caught on the first run instead of in a playtest.

## Design targets per map

These come from the design document. Not every one of them can be checked by code:

- Start and boss in opposite corners, 9–10 steps apart.
- Three readable routes: **direct** (short, passes an elite), **safe** (longer, passes a village), **rich** (detour through chests and shrines).
- Every hazard tile can be avoided by a longer route.
- Only the map's own hazard terrain is used on that level.
