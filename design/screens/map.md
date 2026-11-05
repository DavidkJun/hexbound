# Map screen

Figma: Screens page → frame `MapScreen` · Snapshot: [`map.png`](map.png) · Status: draft (stage 0 wireframe, updated after the stage 0 review)

## Purpose

The player plans a route across the 9×7 hex map and walks it. The route is the main decision in the game, so the screen must make three things easy to compare: where each route goes, what it costs in food, and what it passes.

## Elements

Rectangles are `x, y, w, h` on the 1280 × 720 canvas.

| Name | Rect | Shows (reads) | Does (sends) |
|---|---|---|---|
| `TopBar` | 0, 0, 1280, 56 | Health, food, gold, lives, keys, blessings, level name | `DeckButton` → Deck view, `MenuButton` → Pause menu |
| `MapArea` | 0, 56, 944, 664 | Container for the grid | — |
| `HexGrid` | 150, 89, 644, 597.6 | All 63 tiles: terrain, location icon, visibility, visited marks | Click a tile → route planning (below) |
| `PlayerToken` | dynamic, 28 × 28 | Player position, plus the Chilled badge when chilled | — |
| `RoutePreview` | same rect as `HexGrid` | Planned route: outlined tiles + step numbers | — |
| `TileTooltip` | dynamic | Hovered tile: type, distance or route step, details if visible, reward, terrain | — |
| `SidePanel` | 944, 56, 336, 664 | Vertical stack: padding 16, gap 16, every child 304 wide, height fits content | — |
| `BossPanel` | in `SidePanel`, 1st | Boss name (Cinzel, `color.accent.danger`) and signature move. Always visible from the start | — |
| `RouteSummary` | in `SidePanel`, 2nd | Steps, food cost (slow tiles noted), food left after the route, what the route passes | `GoButton` → walk the route; `ClearRouteButton` → clear it |
| `TileDetails` | in `SidePanel`, 3rd | Selected tile: type, coordinates, distance, terrain, details if within 2 tiles | — |
| `Legend` | in `SidePanel`, 4th | Location icons with names | — |

## Dynamic elements

Tile positions follow the hex formula in [ui-rules.md](../ui-rules.md#5-hex-grid). For a tile whose top-left corner inside `HexGrid` is `(tx, ty)`:

- **Location icon**: the `LocationIcon` component, `size.icon.location` (36 × 36), at `(tx + 28, ty + 16)`.
  - The circle fill is `color.location.<type>`.
  - The `loc-*` icon in the middle is `size.icon.glyph` (22 px), in `color.text.primary`. On the light `start` and `locked-chest` circles it's `color.text.inverse`.
- **Tile label**: one dark pill per tile, holding either the terrain marker or the detail label.
  - Height `size.label.height` (18), fill `color.label.bg`, radius `radius.sm`, left and right padding `space.xs`.
  - Text is `text.small`, weight `font.weight.label`, in `color.text.primary`. The pill gives it the same contrast on every land.
  - The pill is centred on the tile, with its top at `ty + 54`.
  - **Terrain marker** on slow or hazard tiles: "slow" (swamp), "slow·chill" (ice), "burn" (lava).
  - **Detail label** on location tiles within 2 steps of the player, e.g. the monster name or the chest contents.
  - When a tile has both, it shows the terrain marker only, and the detail goes into `TileTooltip` and `TileDetails`.
- **PlayerToken**: a `size.token.player` circle in `color.accent.primary` with a `stroke.token` ring in `color.text.primary`, at `(tx + 32, ty + 26)`.
- **Chilled badge** on the token (after an ice tile, until the next fight):
  - a `size.icon.badge` circle in `color.label.bg` at the token's top-right corner, overlapping it by 4 px
  - inside it, the `kw-chill` icon at `size.icon.xs` in `color.keyword.chill`
- **Route step**:
  - a hex outline inset by `size.route.inset`, with a `stroke.route` stroke in `color.accent.primary`
  - a number badge, `size.badge.step`, in `color.accent.primary` with the number in `color.text.inverse`, at `(tx + 64, ty + 6)`
  - Steps are numbered from 1; the player's tile isn't numbered.
- **Visibility**: tiles more than 2 steps from the player are drawn at `opacity.far-tile`, and their location shows the type icon only. The boss tile always shows the boss.
- **Visited tile**: a tile the player has stepped on gets a visited dot, a `size.dot.visited` circle in `color.text.muted` at the tile centre `(tx + 46, ty + 39.84)`.
- **Resolved location** (fight won, chest opened, shrine or event used): the location icon is removed, and the tile shows the visited dot. A village stays: its icon remains at full opacity, so it can be visited again.
- **TileTooltip**: a panel placed to the right of the hovered tile at `(tx + 84, ty + 4)`. If it would leave `MapArea`, it goes on the left side instead.
  - Fill `color.bg.panel`, a `stroke.border` border in `color.line.default`, radius `radius.md`.
  - padding 8/12

## Route planning

1. Click a tile next to the player, or next to the last route step, to add it to the route.
2. Click the last step again to remove it. Clicks on tiles that are not next to the last step are ignored.
3. `ClearRouteButton` removes the whole route.
4. `GoButton` walks the route one step at a time. At each step the location is resolved (fight, chest…), and walking stops there.
5. **After walking stops**, the rest of the route is kept and renumbered from 1. The food check runs again: if the rest now costs more food than the player has, it switches to the "not enough food" state.
6. **The boss tile**: when the next step is the boss tile, `GoButton` opens a confirm dialog before stepping on it. The dialog says "Fight the Goblin chief now?", with a "Fight" button (primary) and a "Not yet" button (secondary).
7. The food cost comes from the game logic (1 per step, 2 on slow terrain). The screen doesn't compute rules itself.

Points 5 and 6 and the visited and resolved tile looks follow the tester's suggested answers to G-13, G-15 and G-18 in `tests/design-review/design-doc-gaps.md`. If the PM decides otherwise, this spec changes with it.

## Feedback on the map

| Event | Look |
|---|---|
| Stepping on lava (damage) | "−N" in `text.body`, `font.weight.number`, `color.text.danger`. It starts at the top of `PlayerToken`, rises 24 px and fades out over 600 ms. The health chip in `TopBar` updates when it starts |
| Stepping on ice (chilled) | The Chilled badge appears on `PlayerToken`. The first time, a "Chilled: −1 energy in the next fight" line appears in `TileDetails` |
| Death on the map (lava, an event, 0 food) | Death and retry screen, with the cause (see [screens.md](../screens.md)) |

Lava damage and the ice rule depend on G-20 and G-21 (PM).

## States

| State | Look |
|---|---|
| No route planned | `RouteSummary` shows "Click a tile next to you to plan a route"; Go and Clear disabled |
| Route costs more food than the player has | Route outlines and step numbers switch to `color.accent.danger` from the step where food runs out. "Not enough food" appears in `RouteSummary` in `color.text.danger`. Go disabled |
| Route crosses hazard terrain | `RouteSummary` lists it, e.g. "crosses swamp: +1 food per tile" |
| Food is 0 | The food chip's number in `TopBar` turns `color.text.danger` |
| Walking | Hex clicks ignored; Go shows "Walking…" and is disabled |
| Next step is the boss | Confirm dialog (route planning, point 6) |

## Acceptance checklist

- [ ] Grid is flat-top, 9 × 7, odd columns shifted down, at `HexGrid` rect
- [ ] Tile centres match the formula in ui-rules.md (check tiles 0,0 · 1,0 · 8,6)
- [ ] Start bottom-left, boss top-right; boss name and signature move visible without hovering
- [ ] Only tiles within 2 steps show detail labels; others are at `opacity.far-tile`
- [ ] Every tile label sits on a dark pill, readable on all three lands
- [ ] Visited tiles show the dot; resolved locations lose their icon; villages keep theirs
- [ ] Planned route shows outlines and numbers; food cost and food left update with every click and after every stop
- [ ] Walking onto the boss asks to confirm first
- [ ] All states above can be reached and look as described
- [ ] Colours, fonts and sizes only from tokens.json
- [ ] Screenshot at 1280 × 720 matches `map.png`
