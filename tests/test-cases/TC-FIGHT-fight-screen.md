# TC-FIGHT: fight screen and combat core (stage 1)

Written in stage 0 from `design/screens/fight.md`, `fight.png`, `ui-rules.md` and `data/README.md`. **Status of all: Not run** (not built yet). Cases 25–26 were updated and 29–31 added on 2026-11-05 from the designer's answers. The cases marked `G-xx` wait for the PM's answer in [`../design-review/design-doc-gaps.md`](../design-review/design-doc-gaps.md).

**Setup:** a fight with `bog-rat` (health 20; cycle bite 8 → bite 8 → burrow +5 block) and the starter deck. Seeded with `?seed=1`, 1280 × 720.

| ID | Priority | Title | Steps | Expected | Auto? |
|---|---|---|---|---|---|
| TC-FIGHT-01 | High | The layout matches the spec | Screenshot vs `fight.png` | Every element at its `layout.json` rect | e2e |
| TC-FIGHT-02 | High | The intent is visible all turn | Start of turn; play 2 cards; hover a card | `EnemyIntent` shows the attack icon + "8" in `intent.attack` the whole time | e2e |
| TC-FIGHT-03 | High | The intent follows the pattern | End turn × 3 | Intents: attack 8, attack 8, block 5, then attack 8 again (the cycle repeats) | unit + e2e |
| TC-FIGHT-04 | High | Energy | Turn 1 | `EnergyOrb` 3/3; a 1-cost card → 2/3 | e2e |
| TC-FIGHT-05 | High | An unaffordable card | 0 energy left; click a 1-cost card | Card at 40%; the click does nothing | e2e |
| TC-FIGHT-06 | High | Boundary: a 0-cost card at 0 energy | Play `Ration` (cost 0) | Playable | e2e |
| TC-FIGHT-07 | High | A hand of 5 fits exactly | Start of turn | 5 cards at `HandCard1..5`, 12 px gaps, x 266–1014 | e2e |
| TC-FIGHT-08 | Medium | A hand of 6+ stays inside the area | Play a Draw 2 card | Cards overlap; the row stays inside x 266–1014 | e2e |
| TC-FIGHT-09 | Medium | Hover | Hover a card | It moves up 24 px and is drawn on top | e2e |
| TC-FIGHT-10 | High | Block absorbs damage | Gain 5 block; the enemy attacks for 8 | Health −3; block 0; `PlayerBlock` hidden at 0 | unit + e2e |
| TC-FIGHT-11 | High | Block resets | Gain 5 block, don't use it; next turn | Per G-36 | unit (after G-36) |
| TC-FIGHT-12 | High | Unplayed cards at turn end | End turn with 3 cards in hand | Per G-37 (suggested: all discarded) | unit (after G-37) |
| TC-FIGHT-13 | High | The draw pile reshuffles | Empty the draw pile; draw | Discard shuffles into draw; the `DrawPile` count highlights; the order follows the seed | unit + e2e |
| TC-FIGHT-14 | Medium | Draw and discard both empty | Exhaust everything; draw | Per G-38 / S-18 | unit |
| TC-FIGHT-15 | High | Exhaust | Play `Ration` | It goes to `ExhaustPile`, not the discard; it's back in the deck after the fight | unit + e2e |
| TC-FIGHT-16 | High | Chill on the enemy | Play `Ice Shard` | `EnemyStatus` "Chill 1" pill in `keyword.chill`; the effect per G-40 | unit (after G-40) |
| TC-FIGHT-17 | High | Freeze | Apply Freeze | Per G-39 | unit (after G-39) |
| TC-FIGHT-18 | High | Chilled turn from the ice hazard | Cross ice, then fight | `FightModifiers` "Chilled: −1 energy on turn 1"; `EnergyOrb` 2/3 on turn 1 only | e2e |
| TC-FIGHT-19 | High | The enemy's turn | End turn | `EndTurnButton` disabled, the hand not clickable, until the player's turn | e2e |
| TC-FIGHT-20 | High | No playable card | 0 energy, only 1-cost cards | All dimmed; `EndTurnButton` gets a 3 px `text.primary` outline | e2e |
| TC-FIGHT-21 | High | Win | Bring the enemy to 0 | A "Victory" banner for ~1 s, then Card reward; gold added | e2e |
| TC-FIGHT-22 | High | Loss with lives left | Lose all health, lives 3 | Death and retry; lives 2 after retry; state per G-05 | e2e |
| TC-FIGHT-23 | High | Loss with no lives | Lose at lives 0 (or 1, per G-08) | Run over | e2e |
| TC-FIGHT-24 | Medium | Overkill and exact kill (boundaries) | Enemy at 6 health: deal 6; separately deal 10 | Both win; health shown as 0, never negative | unit |
| TC-FIGHT-25 | Medium | Enemy block shown | The enemy uses burrow | `EnemyBlock` chip with "5", right edge at x 512, centred on `EnemyHealthBar`; hidden again at 0 | e2e |
| TC-FIGHT-26 | Medium | The boss signature is visible in the boss fight | Fight `goblin-chief`, then a normal enemy | `BossSignature` at 400, 454, 480, 16: the same text as the map's `BossPanel`, `text.small`, `color.text.muted`, centred. Not drawn in the normal fight | e2e |
| TC-FIGHT-27 | Medium | Fight length target | 10 normal fights with the starter deck (simulator, stage 3) | 2–4 turns on average (DD target) | simulator |
| TC-FIGHT-28 | Low | Piles can be inspected | Click the draw, discard and exhaust piles | A list overlay (not designed yet: a plain `bg.panel` box) | manual |
| TC-FIGHT-29 | Medium | Player status pills | The enemy applies Chill to the player | A pill row at `PlayerStatus` (140, 446), the same look as `EnemyStatus`; hidden with no status. Effect waits for G-40 | e2e |
| TC-FIGHT-30 | Medium | Hand full (boundary) | Hold 10 cards; play a Draw 1 card | The card goes to the discard pile; "Hand full" above `Hand` in `text.small`, `color.text.muted` for 1.5 s; 10 cards still fit inside x 266–1014. The limit waits for G-37 | unit + e2e |
| TC-FIGHT-31 | Medium | Intent with an extra effect | An enemy move that deals damage and applies Chill | One pill: the attack icon + value, then a 14 px `kw-chill` icon; the pill grows and stays centred on x 640. Waits for G-43 | e2e |
