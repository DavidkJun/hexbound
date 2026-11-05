# Fight screen

Figma: Screens page → frame `FightScreen` · Snapshot: [`fight.png`](fight.png) · Status: draft (stage 0 wireframe, updated after the stage 0 review)

## Purpose

A short turn-based fight against one enemy. Each turn the player sees the enemy's next move and decides how to spend 3 energy on a hand of 5 cards. The screen must make the enemy's intent, the player's energy and each card's cost readable at a glance.

## Elements

Rectangles are `x, y, w, h` on the 1280 × 720 canvas.

| Name | Rect | Shows (reads) | Does (sends) |
|---|---|---|---|
| `TopBar` | 0, 0, 1280, 56 | Same as on the map | `DeckButton`, `MenuButton` |
| `FightModifiers` | 24, 72, auto, 34 | Effects on this fight from the map (terrain crossed, places visited). One pill per effect, in a row going right. The effect texts come from the game rules; the mockup's pill is a placeholder. Example: ice gives "Chilled: −1 energy on turn 1" | Hover → full text |
| `TurnCounter` | 1136, 76, 120, 27 | "Turn N", Cinzel `text.h3`, text right-aligned in the box, so the right edge is always x 1256 | — |
| `EnemyIntent` | 580, 104, 120, 40 | Enemy's next move: intent icon (`intent-*`, `size.icon.sm`, in `color.intent.*`) and value, inside a pill with a border in the same colour. Always visible | — |
| `EnemySprite` | 540, 152, 200, 200 | Enemy art (`art/enemy-<id>.png`) | — |
| `EnemyName` | centred on x 640, y 360 | Enemy name, Cinzel `text.h3` | — |
| `EnemyHealthBar` | 520, 392, 240, 20 | Health fill in `color.resource.health`; `EnemyHealthText` "current / max" centred on it | — |
| `EnemyBlock` | right edge x 512, y 384, auto, 36 | The enemy's block: the block `ResourceChip`, like `PlayerBlock`, right next to the health bar. Hidden when the enemy's block is 0 | — |
| `EnemyStatus` | centred on x 640, y 420 | Status pills: keyword icon (`size.icon.xs`) + text, e.g. "Chill 1", in the keyword colour | Hover → keyword text |
| `BossSignature` | 400, 454, 480, 16 | **Boss fights only.** The boss's signature move, the same text as in the map's `BossPanel`: `text.small`, `color.text.muted`, centred. Not drawn in other fights | — |
| `PlayerSprite` | 160, 200, 160, 160 | Wayfarer art | — |
| `PlayerHealthBar` | 140, 372, 200, 20 | Health; `PlayerHealthText` centred on it | — |
| `PlayerBlock` | 140, 402, auto, 36 | Current block; hidden when block is 0 | — |
| `PlayerStatus` | 140, 446, auto, 26 | The player's status pills (Chill, Freeze…), same look as `EnemyStatus`, in a row going right. Hidden when the player has no status | Hover → keyword text |
| `EnergyOrb` | 40, 520, 96, 96 | Energy "current/max" in `color.resource.energy` | — |
| `Hand` | 266, 504, 748, 196 | Cards in hand (`HandCard1`…`HandCard5`) | Click a card → play it |
| `DrawPile` | 24, 632, 96, 72 | Cards left to draw | Click → list of the pile |
| `ExhaustPile` | 1056, 632, 96, 72 | Exhausted cards | Click → list |
| `DiscardPile` | 1160, 632, 96, 72 | Discarded cards | Click → list |
| `EndTurnButton` | 1096, 536, 160, 56 | Primary button "End turn" | End turn |

## Dynamic elements

- **Hand**: cards are `size.card.*` (140 × 196) with a `space.md` (12) gap, the row centred on x 640, top at y 504.
  - With 5 cards the row is exactly the `Hand` rect.
  - With more than 5 (Draw effects), the gap shrinks, down to cards overlapping, so the row stays inside x 266–1014.
  - **The hand holds at most 10 cards.** A card drawn into a full hand goes straight to the discard pile, with a short "Hand full" message above `Hand` (`text.small`, `color.text.muted`, 1.5 s). The 10-card limit is the tester's suggestion for G-37 (PM).
- **Hovered card**: moves up 24 px and is drawn above its neighbours.
- **Card that costs more than the current energy**: `opacity.disabled`, not clickable.
- **Card look**: the `Card` component in Figma → Foundations.
  - frame colour `color.card.<family>`
  - cost circle in `color.resource.energy`
  - family icon (`size.icon.xs`) and label at the bottom
- **Intent with several effects** (e.g. attack + Chill):
  - the main effect's icon and value, as above
  - each extra effect as a `size.icon.xs` icon in its own colour, to the right of the value
  - the pill grows to fit and stays centred on x 640
- **Intent values:**
  - attack and block show their number
  - a buff or debuff shows its stack count, e.g. "2"
  - an effect with no number shows the icon only

  Which buffs exist depends on G-42 (PM).

## States

| State | Look |
|---|---|
| Enemy's turn | `EndTurnButton` disabled; hand cards not clickable |
| No playable card left | All hand cards dimmed; `EndTurnButton` gets a `stroke.focus` outline in `color.text.primary` |
| Chilled turn (ice hazard or Chill) | `FightModifiers` pill with a `color.keyword.chill` border and text; `EnergyOrb` shows the reduced energy, e.g. 2/3 |
| Draw pile empty when drawing | Discard shuffles into draw; `DrawPile` count highlights briefly |
| Draw and discard both empty | `DrawPile` shows 0 and nothing is drawn. No message |
| Hand full when drawing | See Hand above |
| Boss fight | `BossSignature` shown |
| Fight won | "Victory" banner over the enemy for about 1 s, then Card reward |
| Fight lost | Death and retry screen, or Run over if no lives are left |

## Acceptance checklist

- [ ] Every element above is present, named as above, at its rect
- [ ] Enemy intent is visible at every moment of the player's turn
- [ ] Enemy block shows next to the enemy's health bar whenever it's above 0
- [ ] In a boss fight, the signature move is visible all the time
- [ ] Hand of 5 fits the `Hand` rect exactly; 6–10 cards stay inside x 266–1014
- [ ] Unaffordable cards are dimmed and can't be played
- [ ] Map effects on this fight appear in `FightModifiers`
- [ ] All states above can be reached and look as described
- [ ] Colours, fonts and sizes only from tokens.json
- [ ] Screenshot at 1280 × 720 matches `fight.png`

## Not designed yet

- Pile list overlay, keyword tooltip and the Victory banner: stage 1.

Until these are designed, build them as plain `color.bg.panel` boxes with a `TODO(design):` comment. Don't style them.
