# Screen list and wireframes: review

Owner: Tester. For: UI / Level designer (and the programmer, where noted). Stage 0, task 2 of `plan/Stage0_Tester.txt`.

Reviewed: `design/screens.md`, `design/screens/map.md` + `map.png`, `design/screens/fight.md` + `fight.png`, `design/ui-rules.md`, `design/tokens.json`, `design/layout.json`, `design/visual-direction.md`, `design/levels/map-format.md`, `data/levels/_example.json` (commit `41ce590`).

How: read every spec against the screen list and the design document. Checked `layout.json` against the specs automatically (`tests/auto/design-consistency.test.ts`). Checked the mockup numbers by hand: tile positions, distances, route food cost.

**Answered 2026-11-05.** The UI / Level designer answered every S- and N-point and fixed the 4 design bugs in [`design/reviews/stage-0-answers.md`](../../design/reviews/stage-0-answers.md) (main abced2c). The Status columns below are retested; where a point has an automated check, it is named. The look of most answers waits for the PM's answer to the G-question in "Depends on".

**What is already good** (checked, no action needed):

- The screen list covers every location type in the DD.
- `map.png` agrees with `_example.json` and with the hex formulas. Swamp tiles, route steps 1–5, the "6 food" cost, and the distances "2 steps away" / "more than 2 tiles away" are all correct.
- `layout.json` matches every fixed rect in both specs. The TopBar gaps (12), paddings (16), side panel stack (16) and the hand of 5 (140 × 196, 12 gap) are exact.
- Every token named in the specs exists in `tokens.json`. All 28 icons exist and are credited, and they are tintable (`currentColor`).

## 1. Missing states and elements

| ID | Screen | What is missing | Why it matters | Suggestion | Depends on | Status |
|---|---|---|---|---|---|---|
| S-01 | Fight | **No enemy block element.** Enemies gain block (example `bog-rat` Burrow, the boss's Rally), but only `PlayerBlock` exists. | The player can't see why an attack did less damage. | Add `EnemyBlock` next to `EnemyHealthBar`, like `PlayerBlock`. | — | Answered, verified (TC-DES-03k, TC-DES-03i/j) |
| S-02 | Fight | **Boss signature move not shown during the boss fight.** ui-rules §8 says it is "always visible", but only the map's `BossPanel` shows it. | The rule from ui-rules is broken in the boss fight. | A `BossSignature` line under `EnemyName`, shown in boss fights only. | — | Answered, verified (TC-DES-03l) |
| S-03 | Fight | Player statuses (Chill/Freeze on the player) are "stage 1, probably…". | Ice chill and enemy debuff intents both need it in stage 1. | Design it before the combat core is built. | G-39, G-40 | Answered, verified (TC-DES-03i/j); behaviour waits for G-39/G-40 |
| S-04 | Fight | Intent for a move with several effects, and what number a buff/debuff intent shows. | `EnemyIntent` has room for one icon and one value. | Main icon + value, plus small extra icons. | G-42, G-43 | Answered |
| S-05 | Map | **Look of a visited or cleared tile** is not defined. | Every move changes it. The player must see where they have been. | E.g. a dimmed icon, or the icon removed and a small "✓". | G-13 | Answered |
| S-06 | Map | Feedback when stepping on lava (damage) or ice (chilled), and a "Chilled" status between the ice tile and the next fight. | The map changing the next fight is pillar 2, and it isn't visible on the map. | A floating "−4" on the token, and a "Chilled" pill in the TopBar or on the token. | G-20, G-21 | Answered |
| S-07 | Map | What the route looks like after walking stops at a location: kept, cleared, or re-checked for food. | Happens after every location. | Keep the rest of the route and re-run the food check. | G-15 | Answered |
| S-08 | Map | State: route goes onto the boss tile — confirmation. | Prevents an accidental boss fight. | A dialog, "Fight the Goblin chief now?". | G-18 | Answered |
| S-09 | Death and retry | Death **outside** a fight (lava, event health cost, 0 food). `screens.md` only has "Fight lost → Death". | One more path into the screen; the cause text differs. | Add a "Died on the map / in an event" state with the cause. | G-04, G-09 | Answered |
| S-10 | Card reward | The reward after an **elite** (key + better card) and after the **boss** is not shown on any screen. | The player must see that they got a key. | Show "+1 key" on Card reward for elites. | G-24, G-33 | Answered |
| S-11 | Village | States: rest at full health; an active bounty (where is it shown afterwards? the TopBar has no bounty slot); bounty completed or failed. | All need a look. | Disable Rest at full health. Add a bounty chip to the TopBar. | G-27, G-29 | Answered |
| S-12 | Shrine | Is skipping allowed? A blessing already owned? | The screen has "Pick 1" only. | — | G-30 | Answered |
| S-13 | Mystery event | "Can't afford" in `screens.md` covers gold, food and energy, but events also cost **health**. What about a choice that would kill the player? | A missing state. | Disable the choice and show "Would kill you". | G-31 | Answered |
| S-14 | Pause menu | **Restart level**: a confirmation, and whether it costs a life. | A possible exploit. | A confirm dialog that shows "costs 1 life". | G-06 | Answered |
| S-15 | TopBar | **`BlessingsRow` fits 3 icons (96 px)**, but a run can collect more: 3 shrines + 3 locked chests + events. | Overflow is undefined. | Shrink to 20 px or show "+N" after 3. | — | Answered; layout.json doesn't fit it: [BUG-016](../bugs/BUG-016.md) |
| S-16 | All | A window smaller than 960 × 540, or a phone. | ui-rules §1 supports ≥ 960 × 540 on desktop only; there is no message below that. | A full-screen "Window too small / desktop only" message. | — | Answered |
| S-17 | Credits | CC BY 3.0 requires attribution **wherever the icons are shown**. The build is public on GitHub Pages from stage 1, but Credits is planned for stage 4. | A licence problem in stages 1–3. | A credits line or link in the main menu (or footer) from stage 1. | — | Answered |
| S-18 | Fight | Draw and discard both empty (everything exhausted): no draw. | An edge case of `DrawPile`. | `DrawPile` shows 0 and nothing happens. | G-38 | Answered |
| S-19 | Fight | Hand size above the maximum (Draw effects): where do extra cards go? | `fight.md` allows overlapping but sets no maximum. | — | G-37 | Answered |
| S-20 | Map | The detail-label colour on the light Frostpeak ground is not defined. `HexGrid.css` switches only the terrain marker to `text.inverse`. | `text.primary` on Frostpeak ground is 1.27:1, which is unreadable (BUG-012). | Specify the label colour per land. | — | Answered, verified (TC-DES-06d–f) |

## 2. Defects found in the design files

These are logged as bugs in [`../bugs/`](../bugs/README.md), with automated tests that fail on purpose until they are fixed (`it.fails`).

| Bug | Severity | Summary | Status |
|---|---|---|---|
| [BUG-005](../bugs/BUG-005.md) | Minor | `TurnCounter` in `layout.json` ends at x 1250; `fight.md` says right-aligned to x 1256. | Fixed, verified |
| [BUG-006](../bugs/BUG-006.md) | Minor | The specs ask for paddings of 6 and 10 px (chips, tooltip), which are not in `tokens.space`. Code would have to hard-code them, against ui-rules §2. | Fixed, verified |
| [BUG-011](../bugs/BUG-011.md) | Minor | Hazard tiles barely stand out from ground: Frostpeak ice 1.29:1, Whisperwood swamp 1.85:1, Ashen lava 2.35:1 (graphics target 3:1). | Fixed, verified (3.29 / 3.13 / 3.61:1) |
| [BUG-012](../bugs/BUG-012.md) | Minor | 13 px text below 4.5:1: labels on Whisperwood ground 3.35, on Frostpeak ground 1.27, the marker on lava 3.06, and danger text on chips 3.47. | Fixed, verified (label pill 15.37:1, `text.danger` 4.82:1) |
| [BUG-016](../bugs/BUG-016.md) | Minor | Found in the retest: `BlessingsRow` is 96 px, too narrow for the 4 slots of S-15. | Open |

## 3. Smaller notes

- **N-01.** The same prefix names two different things in the specs: `text.primary` (a colour, `color.text.primary`) and `text.small` (a font size). Readers and code can confuse them. Suggest writing full paths in the specs (`color.text.primary`). → **Answered: full token paths in the specs.**
- **N-02.** Some sizes in the specs are not tokens: the player token ring (3 px), the route inset (3 px), the end-turn outline (3 px), and the status icon (14 px, which equals `size.icon.card-family` but is named differently). Either add tokens or say which token to reuse. → **Answered: new tokens `stroke.token`, `stroke.focus`, `size.route.inset`, `size.icon.xs` (all present; TC-DES-04a).**
- **N-03.** `intent.debuff` and `keyword.chill` are the same colour (#B9DDF0), and `land.frostpeak.hazard`, `land.frostpeak.accent` and `keyword.freeze` are all #8EC3DE. This is fine if intended, but a Chill pill and a debuff intent will look the same. → **Answered: intended.**
- **N-04.** The visual-direction note about icons (`kw-draw` vs `kw-exhaust`, the ankh for lives) is confirmed in `map.png`: the lives icon reads as crossed swords at 20 px. I support swapping it. → **Answered: both icons swapped; credits updated (TC-DES-05b).**
- **N-05.** `map-format.md` rule 10 only checks that `boss.enemy` exists. The loader also accepts a **normal** enemy as a boss (checked: `bog-rat` passes). Suggest: "…is an existing enemy with `kind: "boss"`". → **Accepted into map rule 10; the loader doesn't check it yet: [BUG-013](../bugs/BUG-013.md).**
- **N-06.** `map-format.md` says the game "loads exactly" the levels in `levels.json`. Today a real level file without a `levels.json` loads silently, in file-name order. Suggest an error, "levels.json is missing", for the game set. *(Programmer.)* → **Accepted, with a dev-only exception; not implemented yet, and the wording needs a decision: [BUG-014](../bugs/BUG-014.md).**
- **N-07.** An `allow` list may repeat a type (`["monster", "monster", "chest"]`) and the loader accepts it, which makes monster twice as likely. Decide whether that is an intended way to weight slots or a mistake to reject. → **Rejected as weights; repeats are now an error by map rule 7, not checked yet: [BUG-015](../bugs/BUG-015.md).**
