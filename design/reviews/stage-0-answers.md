# Answers to the stage 0 design review

Owner: UI / Level designer. Answers [`tests/design-review/screens-review.md`](https://github.com/DavidkJun/hexbound/blob/test/stage-0/tests/design-review/screens-review.md) and bugs #7, #8, #13, #14. Every answer is already applied to the design files it names.

**Depends on PM** means the look is designed for the tester's suggested answer to that G-question. If the PM decides otherwise, the spec changes with it.

## Bugs

| Bug | Fix | Where |
|---|---|---|
| BUG-005 (#7) `TurnCounter` ends at 1250 | Its text box is now 1136, 76, 120, 27 with the text right-aligned, so it always ends at x 1256 | `fight.md`, `layout.json`, Figma |
| BUG-006 (#8) paddings of 6 and 10 px | Snapped to the scale: chips padding 8/12 (8 on the left), tooltip padding 8/12. Chips are now 36 high | `screens.md`, `map.md`, `layout.json`, Figma |
| BUG-011 (#13) hazard tiles barely stand out | New land colours. Hazard against ground: Whisperwood 3.29:1, Frostpeak 3.13:1, Ashen 3.61:1 | `tokens.json`, `visual-direction.md`, Figma |
| BUG-012 (#14) small text below 4.5:1 | (1) Every label and marker on a tile now sits on a dark pill (`color.label.bg`), so on every land it is `color.text.primary` on `color.bg.base`, 15.4:1. (2) New `color.text.danger` #F07A7A for warning text: 4.82:1 on `bg.raised`, 5.74:1 on `bg.panel`. `color.accent.danger` stays for fills and borders only | `map.md`, `screens.md`, `ui-rules.md` §2a and §8, `tokens.json`, Figma |

**For the tests:** the BUG-012 test still measures `color.text.primary` straight on the land ground. With the pill, the pair to test is `color.text.primary` on `color.label.bg`. The danger pair to test is `color.text.danger` on `color.bg.raised` and on `color.bg.panel`.

## Screens review

| ID | Decision | Where | Depends on PM |
|---|---|---|---|
| S-01 | New `EnemyBlock`: the block chip, right edge at x 512, centred on the enemy's health bar, hidden at 0 | `fight.md`, `fight.png` | — |
| S-02 | New `BossSignature`: one muted line under the enemy status, 400, 454, 480, 16, boss fights only | `fight.md`, `fight.png` | — |
| S-03 | New `PlayerStatus`: a pill row at 140, 446, same look as `EnemyStatus` | `fight.md`, `fight.png` | G-39, G-40 (what the statuses do) |
| S-04 | Main icon + value; each extra effect as a 14 px icon after the value; the pill grows and stays centred. Buffs and debuffs show their stack count | `fight.md` → Dynamic elements | G-42, G-43 |
| S-05 | Visited tile: an 8 px muted dot in the centre. A resolved location loses its icon and shows the dot; a village keeps its icon | `map.md` → Dynamic elements | G-13 |
| S-06 | Lava: a rising "−N" in `color.text.danger` over the token. Ice: a Chilled badge on the token until the next fight, plus a line in `TileDetails` | `map.md` → Feedback on the map | G-20, G-21 |
| S-07 | The rest of the route is kept, renumbered from 1, and its food is checked again | `map.md` → Route planning 5 | G-15 |
| S-08 | A confirm dialog before stepping onto the boss tile. The dialog is a shared overlay, specified in `screens.md` | `map.md` → Route planning 6, `screens.md` | G-18 |
| S-09 | New state: death outside a fight, with the cause ("Burned by lava", "Event: <name>", "Starved") | `screens.md` → States | G-04, G-09 |
| S-10 | Card reward also shows "+1 key" after an elite, and the healing after the boss | `screens.md` → Card reward | G-24, G-33 |
| S-11 | Rest is disabled at full health. Bounties are designed with the Village screen in stage 2 | `screens.md` → States | G-27, G-29 |
| S-12 | The Skip button only appears if the PM allows skipping; owned blessings are never offered | `screens.md` → States | G-30 |
| S-13 | Health costs count as "can't afford"; a choice that would kill is disabled, with "Would kill you" | `screens.md` → States | G-31 |
| S-14 | Restart level asks to confirm: "Restart the level? This costs 1 life." | `screens.md` → States | G-06 |
| S-15 | `BlessingsRow` shows at most 4 slots; from 5 blessings, the 4th is "+N", and hovering it lists the rest | `screens.md` → TopBar | — |
| S-16 | New system screen `WindowTooSmall` below 960 × 540 | `screens.md` → System screens | — |
| S-17 | Credits moves to stage 1, and the main menu gets a footer line with the icon credits | `screens.md` → Screens | — |
| S-18 | Both piles empty: `DrawPile` shows 0, nothing is drawn, no message | `fight.md` → States | G-38 |
| S-19 | The hand holds at most 10 cards; an extra draw goes to the discard pile with "Hand full" | `fight.md` → Dynamic elements | G-37 |
| S-20 | Fixed by the label pills (BUG-012), so the label colour is the same on every land | `map.md` | — |

## Smaller notes

| ID | Decision |
|---|---|
| N-01 | Specs now write full token paths (`color.text.primary`); `ui-rules.md` §2a says so |
| N-02 | New tokens: `stroke.token` (player ring), `stroke.focus` (end-turn outline), `size.route.inset`, `size.icon.xs` (14 px, replaces `size.icon.card-family`, used on cards and status pills) |
| N-03 | Intended. Chill is the only debuff so far, so the debuff intent uses its colour, and the icons tell them apart (cursed star vs snowflake). The Frostpeak hazard is now its own deep blue, so only `land.frostpeak.accent` and `keyword.freeze` share a colour |
| N-04 | `res-lives` is now a soul icon, and `kw-exhaust` is now burning embers, no longer like `kw-draw` |
| N-05 | Accepted. Map rule 10: the boss must be an enemy with `"kind": "boss"` |
| N-06 | Accepted. A missing `levels.json` is a data error. The one exception: local `npm run dev` may show `_example.json` with an "Example map" warning until the first real map exists *(programmer)* |
| N-07 | Rejected as a way to weight slots: a type may appear at most once in an `allow` list. If weights are ever needed, they'll be a new field |

## From the programmer's PR #2

| Question | Answer |
|---|---|
| Terrain marker position (measured 56.5) | Now specified: the label pill's top is at `ty + 54`, centred on the tile (`map.md`) |
| `BuildInfo` | Specified as built: bottom-left, `space.sm` in, `text.small`, `color.text.muted` (`screens.md` → System screens) |
| `DataErrorScreen` | Specified (`screens.md` → System screens) |
| Location circle colours | New tokens `color.location.<type>` |
| Hex stroke inside vs centred | Correct as done: a doubled width in SVG. Now written in `ui-rules.md` §2a |

## Not changed

- `whisperwood.json` (map 1) is stage 1 work, and needs the PM's route intent for map 1 first. I'll tell the tester when it lands, so the TC-LVL tests can run on it.
