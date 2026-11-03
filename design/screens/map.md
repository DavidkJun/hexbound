# Map screen

Figma: Screens page → frame `MapScreen` · Snapshot: [`map.png`](map.png) · Status: draft (stage 0 wireframe)

## Purpose

The player plans a route across the 9×7 hex map and walks it. The route is the main decision in the game, so the screen must make three things easy to compare: where each route goes, what it costs in food, and what it passes.

## Elements

Rectangles are `x, y, w, h` on the 1280 × 720 canvas.

| Name | Rect | Shows (reads) | Does (sends) |
|---|---|---|---|
| `TopBar` | 0, 0, 1280, 56 | Health, food, gold, lives, keys, blessings, level name | `DeckButton` → Deck view, `MenuButton` → Pause menu |
| `MapArea` | 0, 56, 944, 664 | Container for the grid | — |
| `HexGrid` | 150, 89, 644, 597.6 | All 63 tiles: terrain, location icon, visibility | Click a tile → route planning (below) |
| `PlayerToken` | dynamic, 28 × 28 | Player position | — |
| `RoutePreview` | same rect as `HexGrid` | Planned route: outlined tiles + step numbers | — |
| `TileTooltip` | dynamic | Hovered tile: type, distance or route step, details if visible, reward | — |
| `SidePanel` | 944, 56, 336, 664 | Vertical stack: padding 16, gap 16, every child 304 wide, height fits content | — |
| `BossPanel` | in `SidePanel`, 1st | Boss name (Cinzel, `accent.danger`) and signature move. Always visible from the start | — |
| `RouteSummary` | in `SidePanel`, 2nd | Steps, food cost (slow tiles noted), food left after the route, what the route passes | `GoButton` → walk the route; `ClearRouteButton` → clear it |
| `TileDetails` | in `SidePanel`, 3rd | Selected tile: type, coordinates, distance, details if within 2 tiles | — |
| `Legend` | in `SidePanel`, 4th | Location icons with names | — |

## Dynamic elements

Tile positions follow the hex formula in [ui-rules.md](../ui-rules.md#5-hex-grid). For a tile whose top-left corner inside `HexGrid` is `(tx, ty)`:

- **Location icon**: 36 × 36 at `(tx + 28, ty + 16)`.
- **Detail label** (only within 2 tiles of the player): `text.small`, Inter Semi Bold, centred on the tile at `ty + 54`, e.g. the monster name or the chest contents.
- **PlayerToken**: 28 × 28 circle, `accent.primary` with a 3 px `text.primary` ring, at `(tx + 32, ty + 26)`.
- **Route step**: hex outline inset 3 px, 4 px stroke in `accent.primary`; number badge 22 × 22 (`accent.primary`, number in `text.inverse`) at `(tx + 64, ty + 6)`. Steps are numbered from 1; the player's tile is not numbered.
- **Visibility**: tiles more than 2 steps from the player are drawn at 70% opacity, and their location shows the type icon only. The boss tile always shows the boss.
- **TileTooltip**: panel (`bg.panel`, 1 px `line.default` border, radius 8, padding 10/12), placed to the right of the hovered tile at `(tx + 84, ty + 4)`. If it would leave `MapArea`, it goes on the left side instead.

## Route planning

1. Click a tile next to the player, or next to the last route step, to add it to the route.
2. Click the last step again to remove it. Clicks on tiles that are not next to the last step are ignored.
3. `ClearRouteButton` removes the whole route.
4. `GoButton` walks the route one step at a time. At each step the location is resolved (fight, chest…), and walking stops there.
5. The food cost comes from the game logic (1 per step, 2 on slow terrain). The screen doesn't compute rules itself.

## States

| State | Look |
|---|---|
| No route planned | `RouteSummary` shows "Click a tile next to you to plan a route"; Go and Clear disabled |
| Route costs more food than the player has | Route outlines and step numbers switch to `accent.danger` from the step where food runs out; "Not enough food" in `RouteSummary`; Go disabled |
| Route crosses hazard terrain | `RouteSummary` lists it, e.g. "crosses swamp: +1 food per tile" |
| Food is 0 | Food chip in `TopBar` turns `accent.danger` |
| Walking | Hex clicks ignored; Go shows "Walking…" and is disabled |

## Acceptance checklist

- [ ] Grid is flat-top, 9 × 7, odd columns shifted down, at `HexGrid` rect
- [ ] Tile centres match the formula in ui-rules.md (check tiles 0,0 · 1,0 · 8,6)
- [ ] Start bottom-left, boss top-right; boss name and signature move visible without hovering
- [ ] Only tiles within 2 steps show detail labels; others are at 70% opacity
- [ ] Planned route shows outlines and numbers; food cost and food left update with every click
- [ ] All states above can be reached and look as described
- [ ] Colours, fonts and sizes only from tokens.json
- [ ] Screenshot at 1280 × 720 matches `map.png`
