# Fight screen

Figma: Screens page → frame `FightScreen` · Snapshot: [`fight.png`](fight.png) · Status: draft (stage 0 wireframe)

## Purpose

A short turn-based fight against one enemy. Each turn the player sees the enemy's next move and decides how to spend 3 energy on a hand of 5 cards. The screen must make the enemy's intent, the player's energy and each card's cost readable at a glance.

## Elements

Rectangles are `x, y, w, h` on the 1280 × 720 canvas.

| Name | Rect | Shows (reads) | Does (sends) |
|---|---|---|---|
| `TopBar` | 0, 0, 1280, 56 | Same as on the map | `DeckButton`, `MenuButton` |
| `FightModifiers` | 24, 72, auto, 34 | Effects on this fight from the map (terrain crossed, places visited). One pill per effect, in a row going right. The effect texts come from the game rules; the mockup's pill is a placeholder. Example: ice gives "Chilled: −1 energy on turn 1" | Hover → full text |
| `TurnCounter` | right-aligned to x 1256, y 76 | "Turn N", Cinzel h3 | — |
| `EnemyIntent` | 580, 104, 120, 40 | Enemy's next move: kind (ATK / BLK / BUFF / debuff name) and value. Always visible | — |
| `EnemySprite` | 540, 152, 200, 200 | Enemy art (`art/enemy-<id>.png`) | — |
| `EnemyName` | centred on x 640, y 360 | Enemy name, Cinzel h3 | — |
| `EnemyHealthBar` | 520, 392, 240, 20 | Health fill in `resource.health`; `EnemyHealthText` "current / max" centred on it | — |
| `EnemyStatus` | centred on x 640, y 420 | Status pills, e.g. "Chill 1", "Freeze", in the keyword colour | Hover → keyword text |
| `PlayerSprite` | 160, 200, 160, 160 | Wayfarer art | — |
| `PlayerHealthBar` | 140, 372, 200, 20 | Health; `PlayerHealthText` centred on it | — |
| `PlayerBlock` | 140, 402, auto, 32 | Current block; hidden when block is 0 | — |
| `EnergyOrb` | 40, 520, 96, 96 | Energy "current/max" in `resource.energy` | — |
| `Hand` | 266, 504, 748, 196 | Cards in hand (`HandCard1`…`HandCard5`) | Click a card → play it |
| `DrawPile` | 24, 632, 96, 72 | Cards left to draw | Click → list of the pile |
| `ExhaustPile` | 1056, 632, 96, 72 | Exhausted cards | Click → list |
| `DiscardPile` | 1160, 632, 96, 72 | Discarded cards | Click → list |
| `EndTurnButton` | 1096, 536, 160, 56 | Primary button "End turn" | End turn |

## Dynamic elements

- **Hand**: cards are 140 × 196 (`size.card.*`) with a 12 px gap, the row centred on x 640, top at y 504. With 5 cards the row is exactly the `Hand` rect. With more than 5 (Draw effects), the gap shrinks, down to cards overlapping, so the row stays inside x 266–1014.
- **Hovered card**: moves up 24 px and is drawn above its neighbours.
- **Card that costs more than the current energy**: 40% opacity, not clickable.
- **Card look**: the `Card` component in Figma → Foundations. Frame colour = `color.card.<family>`, cost circle in `resource.energy`, family label at the bottom.

## States

| State | Look |
|---|---|
| Enemy's turn | `EndTurnButton` disabled; hand cards not clickable |
| No playable card left | All hand cards dimmed; `EndTurnButton` gets a 3 px `text.primary` outline |
| Chilled turn (ice hazard or Chill) | `FightModifiers` pill with a `keyword.chill` border and text; `EnergyOrb` shows the reduced energy, e.g. 2/3 |
| Draw pile empty when drawing | Discard shuffles into draw; `DrawPile` count highlights briefly |
| Fight won | "Victory" banner over the enemy for about 1 s, then Card reward |
| Fight lost | Death and retry screen, or Run over if no lives are left |

## Acceptance checklist

- [ ] Every element above is present, named as above, at its rect
- [ ] Enemy intent is visible at every moment of the player's turn
- [ ] Hand of 5 fits the `Hand` rect exactly; 6+ cards stay inside x 266–1014
- [ ] Unaffordable cards are dimmed and can't be played
- [ ] Map effects on this fight appear in `FightModifiers`
- [ ] All states above can be reached and look as described
- [ ] Colours, fonts and sizes only from tokens.json
- [ ] Screenshot at 1280 × 720 matches `fight.png`

## Not designed yet

- Player status effects (Chill/Freeze on the player): stage 1, probably a pill row under `PlayerBlock`.
- Pile list overlay, keyword tooltip and the Victory banner: stage 1.

Until these are designed, build them as plain `bg.panel` boxes with a `TODO(design):` comment. Don't style them.
