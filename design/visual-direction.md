# Visual direction

Status: **draft, waiting for PM approval**. Source: Figma → Foundations page → `VisualDirection`, `Palette`, `Type`.

## Options considered

| | Style | Verdict |
|---|---|---|
| **A** | **Flat vector + game-icons.net icons.** Flat fills, no gradients or textures, dark UI so map tiles and cards stand out. | **Chosen.** Cheap for one artist, readable at a glance, easy to recolour per land. game-icons.net has icons in one style for everything we need (monsters, chests, shrines, keys, dragon…). |
| B | Simple pixel art (16/32 px). | Too slow: every sprite drawn by hand, scaling only in whole steps. |
| C | One free asset pack (e.g. Kenney, CC0). | Fastest start, but generic, and breaks style when the pack lacks an icon. |

## Style rules

- Flat fills only. Panels have an 8 px corner radius, cards 12 px.
- Dark UI: backgrounds `color.bg.*`, text `color.text.*`.
- Icons are one colour on a coloured shape. Icons come from game-icons.net (CC BY 3.0, credited in the game).
- Headings use **Cinzel Bold**. Everything else uses **Inter**, and numbers always use Inter Bold.
- Colour is never the only signal (see [ui-rules.md](ui-rules.md#8-readability)).

## Palette

Exact values: [`tokens.json`](tokens.json). Picture: [`foundations.png`](foundations.png).

| Group | Tokens | Use |
|---|---|---|
| Background | `bg.base` #14171F, `bg.panel` #1F2430, `bg.raised` #2A3140, `line.default` #3A4354 | Screen, panels, raised items, borders |
| Text | `text.primary` #F2EDE4, `text.muted` #9AA3B2, `text.inverse` #14171F, `text.danger` #F07A7A | Main text, secondary text, text on light fills, warnings |
| Accent | `accent.primary` #E8B04B (gold), `accent.danger` #E05555, `accent.success` #6CC07A | Main buttons and planned route; danger; success |
| Resources | health #E05555, block #9DB0C4, energy #5FD3E8, food #C98B4E, gold #E8B04B, lives #E86A92, key #D9C38A | Resource icons and numbers |
| Lands | whisperwood ground #7FA05C / swamp #2F4A36 · frostpeak ground #D6E2EA / ice #4A82AE · ashen ground #453834 / lava #EE6A35 (plus an `accent` each). Hazard against ground is at least 3:1 on every land | Map tiles, level intro |
| Card families | weapon #C8553D, spell #8B6CE0, armour #5B8DB8, item #D9A441 | Card frame and family label |
| Keywords | freeze #8EC3DE, chill #B9DDF0, exhaust #8A8F99, draw #F5D05A | Keyword text and icons |

## Lands

| Level | Look | Hazard tile |
|---|---|---|
| 1. Whisperwood | light green ground | dark green swamp, marker "slow" (3.3:1 against the ground) |
| 2. Frostpeak Pass | pale grey-blue ground | deep blue ice, marker "slow·chill" (3.1:1) |
| 3. Ashen Citadel | dark brown ground | bright orange lava, marker "burn" (3.6:1) |

Markers and labels on tiles sit on small dark pills, so they read the same on every land.

## Card families

All cards are 140 × 196. A card has: an energy cost circle (top left), a name, an art box tinted with the family colour, rules text, and the family label at the bottom. The frame colour is the family colour. Picture: [`foundations.png`](foundations.png), right side.

## Icons

28 game-icons.net icons, saved in [`assets/icons/`](../assets/icons/) as `<group>-<name>.svg` (see [ui-rules.md](ui-rules.md#7-assets)). In Figma they are components named `icon/<group>-<name>` (Foundations → `Icons`), and every component uses them.

| Group | Icons |
|---|---|
| Locations (`loc-`) | start, monster, elite, chest, locked-chest, village, shrine, mystery, boss |
| Resources (`res-`) | health, food, gold, lives, energy, block, key |
| Keywords (`kw-`) | freeze, chill, exhaust, draw |
| Card families (`family-`) | weapon, spell, armour, item |
| Intents (`intent-`) | attack, block, buff, debuff |

How they're used:
- Location: a white icon (`size.icon.glyph`) in a coloured circle (`size.icon.location`)
- Resource chips and intents: the icon in the resource or intent colour
- Cards: the family icon next to the family label

Authors and license: [`assets/icons/CREDITS.md`](../assets/icons/CREDITS.md).

After the stage 0 review, `res-lives` is a soul icon (it was an ankh, which read as crossed swords) and `kw-exhaust` is burning embers (it looked like `kw-draw`).
