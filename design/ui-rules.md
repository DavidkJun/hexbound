# UI rules

Owner: UI / Level designer. These are fixed decisions. Code that draws anything on screen follows them. To change one, ask the UI / Level designer; don't work around it in code.

## 1. Screen size and scaling

- The game always lays out on a fixed logical canvas of **1280 × 720**.
- The whole canvas is scaled uniformly to fit the browser window, keeping the 16:9 ratio. Leftover space is filled with `color.bg.base`.
- Desktop browsers only. Smallest supported window: 960 × 540 (scale 0.75).
- Every position and size in the design is in logical canvas pixels. There is no responsive layout: an element is never moved or resized because the window changed.

## 2. Tokens: colours, fonts, sizes

- All colours, font families, font sizes, spacing, radii and fixed sizes come from [`tokens.json`](tokens.json). It is exported from the Figma variables.
- Code imports `tokens.json` and reads values from it, e.g. `tokens.color.resource.food`. **Never type a hex colour, font name or pixel size that exists in tokens.json.**
- If a value you need is missing, ask the UI / Level designer to add a variable. Don't invent one.
- Token names map 1:1 to Figma variable names: `color/resource/food` in Figma is `color.resource.food` in JSON.

## 3. Layout: where things go

- [`layout.json`](layout.json) holds the rectangle `{x, y, w, h}` of every named element on every screen, relative to the screen's top-left corner. It's exported from Figma:
  ```json
  { "screens": { "FightScreen": { "EndTurnButton": { "x": 1096, "y": 536, "w": 160, "h": 56 } } } }
  ```
- **Static elements** (TopBar, EndTurnButton, SidePanel, EnergyOrb…) are placed exactly at their `layout.json` rectangle.
- **Dynamic elements** (hand cards, the player token, tooltips, route steps) appear in `layout.json` at the position used in the mockup. Their real placement follows the rule written in that screen's spec.
- Until `layout.json` contains a screen, use the numbers in that screen's spec.
- In every rect and position, `x` and `y` are the **top-left corner**. "Centred on x 640, y 360" means centred horizontally on x 640, with its top edge at y 360. "Right-aligned to x 1256" means its right edge is at x 1256.

## 2a. Which token to use where

| What | Token |
|---|---|
| Font weights | `font.weight.heading` (Cinzel) · `font.weight.number` · `font.weight.card-title` · `font.weight.body` |
| Line height | not a token: font default ("auto") |
| Disabled / unaffordable | `opacity.disabled` (0–1) |
| Tiles more than 2 steps from the player | `opacity.far-tile` |
| Strokes | `stroke.border` with `line.default` · `stroke.hex` with `bg.base` · `stroke.card` with the family colour · `stroke.route` with `accent.primary` · `stroke.orb` with `resource.energy` |
| Intent colours | `color.intent.attack / block / buff / debuff` |
| Icon sizes | `size.icon.location` (circle) with a `size.icon.glyph` icon inside · `size.icon.sm` in chips and intents · `size.icon.card-family` on cards · `size.token.player` · `size.badge.step` |
| `EndTurnButton` | `size.button.end-turn.*` (160 × 56), deliberately bigger than the normal `size.button.height` |

## 4. Names

- Every element the code places has a **PascalCase** name: `TopBar`, `EndTurnButton`, `EnemyIntent`.
- The same name is used in the Figma layer, in the screen spec and in the code (component name, class, or DOM id).
- Figma layers with lowercase names (`spacer`, `hex-3-4`) are decoration or repeated parts and are not exported.
- Also not exported:
  - Figma's automatic names (`Vector`, `Rectangle`, `Frame`, `Group`…)
  - text layers still named after their own text
  - any name that appears more than once on a screen. The exporter reports these; rename the layers.

## 5. Hex grid

- **Flat-top** hexes. Each map is **9 columns × 7 rows**.
- Coordinates are `[col, row]`, `col` 0–8 left to right, `row` 0–6 top to bottom, in the **"odd-q"** offset layout: odd columns are pushed down by half a hex.
- Hex radius (centre to corner) `R` = `tokens.size.hex.radius` = 46 px. A hex is `2R` × `√3·R` = 92 × 79.674 px. Compute with `√3·R` in code; the rounded numbers here are only for reading.
- Tile centre, relative to the `HexGrid` element:
  `x = R + col × 1.5R`, `y = √3·R/2 + row × √3·R`, plus `√3·R/2` to `y` when `col` is odd.
  With R = 46: `x = 46 + col × 69`, `y = 39.84 + row × 79.67` (+ 39.84 for odd `col`).
- Whole grid: 644 × 597.6 px. On the map screen `HexGrid` sits at `x 150, y 89`.
- Neighbours of `[c, r]` (drop any that fall outside the grid):
  - even `c`: `[c+1, r-1] [c+1, r] [c-1, r-1] [c-1, r] [c, r-1] [c, r+1]`
  - odd `c`: `[c+1, r] [c+1, r+1] [c-1, r] [c-1, r+1] [c, r-1] [c, r+1]`
- Distance: convert to axial (`q = c`, `r' = r - (c - (c & 1)) / 2`) and use the hex distance. Reference: Red Blob Games hex grid guide, "odd-q".
- Corner to opposite corner is 10 steps, matching the design doc's "9–10 steps".

## 6. How screens work with the game

- A screen **reads** the game state and **sends actions** (e.g. `moveTo([3,4])`, `playCard(cardId)`, `endTurn()`). It never changes the game state directly.
- Each screen spec lists the state it reads and the actions it sends. If the code doesn't expose something a screen needs, ask the programmer. Don't compute game rules inside a screen.

## 7. Assets

```
assets/
  icons/   SVG, one colour, tinted by code from tokens
  ui/      panels, card frames, buttons (SVG or PNG)
  art/     player, enemies, bosses, level backgrounds (PNG)
  fonts/   Cinzel, Inter: variable woff2 + fonts.css (@font-face), OFL licence files
```

- File names: kebab-case, `<group>-<name>[-<variant>].<ext>`.
  - `icons/loc-elite.svg`, `icons/loc-locked-chest.svg`
  - `icons/res-food.svg`, `icons/res-health.svg`
  - `icons/kw-chill.svg`, `icons/kw-exhaust.svg`
  - `icons/family-spell.svg`
  - `ui/card-frame-weapon.png`
  - `art/enemy-bog-rat.png`, `art/boss-goblin-chief.png`
  - `art/terrain-swamp.png`
- Fonts: load `assets/fonts/fonts.css`, never a font CDN. Its family names match `tokens.font.*`. Cinzel has Latin letters only; Inter has Latin and Cyrillic.
- Raster art is exported at **2×** its on-screen size (a 200 × 200 enemy slot gets a 400 × 400 PNG), so it stays sharp when the canvas scales up.
- Icons come from game-icons.net (CC BY 3.0). Every icon used is listed in `assets/icons/CREDITS.md`, and the game shows a credits screen.
- Git LFS is not used. Keep every file under 1 MB.

## 8. Readability

- Colour is never the only signal. Card family has a frame colour **and** a family label/icon. Slow terrain has a colour **and** a marker. A disabled button is dimmed to 40% **and** doesn't react to clicks.
- Numbers (health, food, gold, damage, costs) always use Inter Bold.
- The enemy's next move (`EnemyIntent`) and the boss's signature move are always visible, never hidden behind hover.

## 9. Maps

- Maps are data files written by the UI / Level designer, in the format in [`levels/map-format.md`](levels/map-format.md).
- They live in `data/levels/<level-id>.json`. Code loads them and checks them; code never edits them.
- A broken map file must fail on load with a clear message (file, field, coordinate), not silently.

## 10. When is a screen done

1. Everything in the screen spec's checklist is true.
2. A screenshot of the running screen at 1280 × 720 matches `design/screens/<screen>.png` in layout, colours and text.
3. The UI / Level designer has reviewed the pull request.
