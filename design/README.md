# Design

Owner: UI / Level designer. Everything about how Hexbound looks and how its maps are built.

**Figma (source of truth for visuals):** https://www.figma.com/design/yO4H87NpPMV2u7rOcO0qRz
Pages: **Foundations** (style, palette, type, components) · **Screens** (one 1280 × 720 frame per screen) · **Levels** (hex grid, maps).

The repo copy is what the code is built from. Figma is where it's designed.

## What's here

| File | What | Status |
|---|---|---|
| [`ui-rules.md`](ui-rules.md) | Fixed rules for all UI code: screen size, tokens, layout, names, hex grid, assets | fixed |
| [`tokens.json`](tokens.json) | Colours, fonts, font sizes, spacing, radii, sizes (exported from Figma variables) | v0 |
| `layout.json` | Rectangle of every named element on every screen (exported from Figma) | **not exported yet** |
| [`visual-direction.md`](visual-direction.md) | Chosen style, palette, lands, card families, icon list | draft, waiting for PM approval |
| [`screens.md`](screens.md) | Every screen, top bar, states every screen handles | draft, for tester review |
| [`screens/map.md`](screens/map.md) + [`map.png`](screens/map.png) | Map screen spec and snapshot | draft |
| [`screens/fight.md`](screens/fight.md) + [`fight.png`](screens/fight.png) | Fight screen spec and snapshot | draft |
| [`screens/_template.md`](screens/_template.md) | Template for every new screen spec | — |
| [`levels/`](levels/) | Hex grid sketch, map file format, list of maps | format fixed, maps not started |
| [`foundations.png`](foundations.png) | Snapshot of the Foundations page (palette, type, components) | v0 |

## How a design reaches the code

1. Design in Figma, following the rules on the Foundations cover:
   - screens are `<Name>Screen` frames of exactly 1280 × 720
   - elements the code places have PascalCase names
   - colours, fonts and sizes come only from variables
2. Export:
   - **tokens.json and layout.json**: run the *Hexbound Export* plugin (below) and download both files into `design/`.
   - **Snapshots**: select the screen frame → Export → PNG 1× → save as `design/screens/<name>.png`.
3. Write or update the screen spec in `design/screens/<name>.md`, starting from `_template.md`.
4. Open a pull request. Whoever builds the screen works from the spec + `tokens.json` + `layout.json`, and checks the result against the PNG.
5. The UI / Level designer reviews every pull request that changes a screen.

## Hexbound Export plugin

A small Figma plugin in [`tools/figma-export/`](../tools/figma-export/). It works on the free Figma plan; Figma's REST API only exposes variables on the Enterprise plan.

- **Install once:** Figma desktop app → open the Hexbound file → menu → Plugins → Development → *Import plugin from manifest…* → pick `tools/figma-export/manifest.json`.
- **Run:** Plugins → Development → *Hexbound Export* → **Export** → *Download tokens.json* and *Download layout.json* → move both into `design/`, replacing the old ones.
- If it lists errors (wrong frame size, a name used twice), fix them in Figma and export again.

## To do next (UI / Level designer)

- [ ] Share the Figma file with the team (view access is enough).
- [ ] Run the export plugin for the first time and commit `layout.json`.
- [ ] Re-export two snapshots taken before small Figma tweaks:
  - `fight.png`: `EnemyName` and `EnemyStatus` are now centred on x 640
  - `levels/hex-grid.png`: the ice marker now reads "slow·chill"
- [ ] In Figma, change the `FightModifiers` placeholder from "Swamp mud" to an ice example, and re-export `fight.png`.
- [ ] Add Figma variables for the values in [ui-rules.md → 2a](ui-rules.md#2a-values-not-in-tokensjson-yet) and export tokens.json again.
- [ ] Get the visual direction approved by the PM.
- [ ] Send `screens.md` and the two wireframes to the tester.
- [ ] Send `ui-rules.md` and `levels/map-format.md` to the programmer.
