# Test run report: stage-0/retest

Generated from `auto-junit.xml` and `local/e2e-junit.xml`, `deployed/e2e-junit.xml` by `tests/tools/junit-to-md.mjs` on 2026-11-05 20:04 UTC.

**356 executed** · 354 passed · 0 failed · 2 skipped.

5 of the passing tests are `it.fails` bug tests: they pass because the bug is still there. See [bugs/README.md](../../../bugs/README.md).

| Suite | File | Test case | Bug | Check | Result |
|---|---|---|---|---|---|
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01a |  | accepts the family weapon | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01a |  | accepts the family spell | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01a |  | accepts the family armour | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01a |  | accepts the family item | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01b |  | rejects the family "armor" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01b |  | rejects the family "Weapon" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01b |  | rejects the family "curse" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01c |  | accepts cost 0 (boundary) and rejects -1 and 1.5 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01d |  | rejects a card with no effects | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01e |  | rejects an empty name and an empty text | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01f |  | rejects the id "Strike" (not kebab-case) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01f |  | rejects the id "strike_1" (not kebab-case) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01f |  | rejects the id "ice shard" (not kebab-case) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01f |  | rejects the id "-strike" (not kebab-case) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01g |  | rejects the same id used twice in one file | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01h |  | rejects an empty cards file | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-01i |  | the same id may be used by a card and a blessing (ids are unique per folder) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts dealDamage with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts gainBlock with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts gainEnergy with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts draw with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts applyFreeze with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts applyChill with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts heal with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts loseHealth with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts gainFood with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts loseFood with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts gainGold with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02a |  | accepts loseGold with amount 1 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects dealDamage with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects gainBlock with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects gainEnergy with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects draw with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects applyFreeze with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects applyChill with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects heal with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects loseHealth with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects gainFood with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects loseFood with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects gainGold with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02b |  | rejects loseGold with amount 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02c |  | rejects an amount that is missing, negative, a fraction or a string | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02d |  | accepts exhaust without an amount and rejects it with one | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02e |  | rejects the unknown effect "dealdamage" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02e |  | rejects the unknown effect "damage" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02e |  | rejects the unknown effect "gainShield" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-02e |  | rejects the unknown effect "applyBurn" | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03a |  | accepts kind normal without a signature | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03a |  | accepts kind elite without a signature | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03b |  | requires a signature on a boss | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03c |  | rejects a cycle that names a move the enemy does not have | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03d |  | rejects an empty cycle | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03e |  | rejects random weights of 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03f |  | accepts the intent attack | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03f |  | accepts the intent block | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03f |  | accepts the intent buff | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03f |  | accepts the intent debuff | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03g |  | rejects health 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03h |  | rejects random weights with no moves at all (regression BUG-001) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03i-control |  | the same enemy with two distinct move ids is valid | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-03i |  | rejects two moves with the same id in one enemy (regression BUG-003) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-04a |  | accepts the trigger onPickup | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-04a |  | accepts the trigger levelStart | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-04a |  | accepts the trigger fightStart | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-04a |  | accepts the trigger turnStart | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-04b |  | rejects an unknown trigger | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05a |  | rejects an event with one choice (needs at least two) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05b |  | chances [50,49] → valid: false (must add up to 100) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05b |  | chances [50,51] → valid: false (must add up to 100) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05b |  | chances [100] → valid: true (must add up to 100) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05b |  | chances [1,99] → valid: true (must add up to 100) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05b |  | chances [34,33,33] → valid: true (must add up to 100) | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05c |  | rejects a chance of 0 and of 101 | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-05d |  | accepts a cost in gold, food and health, and rejects other costs | PASS |
| unit / acceptance (Vitest) | `tests/auto/data-format.test.ts` | TC-DATA-06a |  | the game files that exist load without problems | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-01a |  | declares the 1280 × 720 screen from ui-rules.md §1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-01b |  | every rect on every screen is inside the 1280 × 720 canvas | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-01c |  | every element name is PascalCase (ui-rules.md §4) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-01d |  | the TopBar is identical on every screen that has it | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02a |  | is 1280 × 56 at the top and matches the topbar height token | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02b |  | padding 16 left and right | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02c |  | 12 px gap between items | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02d |  | every item is vertically centred in the bar | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02e |  | LevelName is centred in the space between BlessingsRow and DeckButton | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02g | BUG-016 | BlessingsRow is wide enough for the 4 slots of 28 px that screens.md asks for | PASS (bug confirmed) |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-02f |  | the two buttons are 48 high (size.button.height) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03a |  | every element in design/screens/map.md exists in layout.json | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03a |  | every element in design/screens/fight.md exists in layout.json | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03b |  | every fixed rect "x, y, w, h" in design/screens/map.md equals layout.json | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03b |  | every fixed rect "x, y, w, h" in design/screens/fight.md equals layout.json | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03c |  | "centred on x 640" elements of the fight screen are centred on 640 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03d |  | TurnCounter is right-aligned to x 1256 as fight.md says (regression BUG-005) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03e |  | the map side panel is a 16 px stack of 304-wide children (map.md SidePanel) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03f |  | the map grid and tooltip mockup stay inside MapArea | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03g |  | a hand of 5 cards is exactly the Hand rect: 140 × 196 with 12 px gaps (fight.md) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03k |  | EnemyBlock ends at x 512 and is centred on the enemy health bar (fight.md, S-01) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03l |  | BossSignature is one centred line under the enemy status (fight.md, S-02) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03h |  | EndTurnButton uses the end-turn size tokens (160 × 56) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03i |  | static fight elements do not overlap each other | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-03j |  | a hovered card (24 px up) does not cover EnemyStatus or the health bars | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04a |  | design/ui-rules.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04a |  | design/screens.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04a |  | design/screens/map.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04a |  | design/screens/fight.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04a |  | design/visual-direction.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04b |  | every colour token is a #RRGGBB value | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04c |  | every land has ground, hazard and accent colours (map-format.md land) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-04d |  | every padding the specs ask for is a tokens.space value (regression BUG-006) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.primary on bg.base is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.primary on bg.panel is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.primary on bg.raised is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.muted on bg.panel is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.muted on bg.raised is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06a |  | UI text text.inverse on accent.primary is at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06b |  | resource.energy icons on chips (bg.raised) are at least 3:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06b |  | resource.block icons on chips (bg.raised) are at least 3:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06b |  | resource.food icons on chips (bg.raised) are at least 3:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06b |  | resource.gold icons on chips (bg.raised) are at least 3:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06b |  | resource.key icons on chips (bg.raised) are at least 3:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06c |  | whisperwood hazard tiles stand out from ground by at least 3:1 (regression BUG-011) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06c |  | frostpeak hazard tiles stand out from ground by at least 3:1 (regression BUG-011) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06c |  | ashen hazard tiles stand out from ground by at least 3:1 (regression BUG-011) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06d |  | tile label (marker or detail) on its pill: color.text.primary on color.label.bg is at least 4.5:1 (regression BUG-012) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06d |  | warning text on chips and buttons: color.text.danger on color.bg.raised is at least 4.5:1 (regression BUG-012) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06d |  | warning text on panels: color.text.danger on color.bg.panel is at least 4.5:1 (regression BUG-012) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06e |  | map.md puts tile labels on the label pill, and the specs use text.danger for text | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-06f |  | a label on a far tile (opacity.far-tile over bg.base) is still at least 4.5:1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05a |  | all 28 icons in the list exist, and no others | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-start.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-monster.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-elite.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-chest.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-locked-chest.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-village.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-shrine.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-mystery.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | loc-boss.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-health.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-food.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-gold.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-lives.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-energy.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-block.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | res-key.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | kw-freeze.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | kw-chill.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | kw-exhaust.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | kw-draw.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | family-weapon.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | family-spell.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | family-armour.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | family-item.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | intent-attack.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | intent-block.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | intent-buff.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05b |  | intent-debuff.svg is credited in CREDITS.md with an author | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-start.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-monster.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-elite.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-chest.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-locked-chest.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-village.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-shrine.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-mystery.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | loc-boss.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-health.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-food.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-gold.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-lives.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-energy.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-block.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | res-key.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | kw-freeze.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | kw-chill.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | kw-exhaust.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | kw-draw.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | family-weapon.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | family-spell.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | family-armour.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | family-item.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | intent-attack.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | intent-block.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | intent-buff.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05c |  | intent-debuff.svg is one colour, tintable (fill="currentColor", no hard-coded colour) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05d |  | every asset file name is kebab-case | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05e |  | every file in assets/ and design/ is under 1 MB (no Git LFS) | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05f |  | fonts.css declares the families named in tokens.font and its files exist | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05g |  | fonts are local: no font CDN in fonts.css or index.html | PASS |
| unit / acceptance (Vitest) | `tests/auto/design-consistency.test.ts` | TC-DES-05h |  | Inter covers Cyrillic, Cinzel does not (open language question in CLAUDE.md) | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-01a |  | has 9 × 7 = 63 tiles, each once | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-01b |  | hex radius token is 46 px (ui-rules.md §5) | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-01c |  | whole grid is 644 × 597.6 px and equals the HexGrid rect in layout.json | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02a |  | tile 0,0 is centred at x 46, y 39.84 | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02a |  | tile 1,0 is centred at x 115, y 79.67 | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02a |  | tile 8,6 is centred at x 598, y 517.87 | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02b |  | every tile matches the formula in ui-rules.md | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02c |  | odd columns are pushed down by half a hex (odd-q) | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-02d |  | every tile lies fully inside the HexGrid rect | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-03a |  | neighbourhood is symmetric: a next to b ⇔ b next to a | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-03b |  | every inner tile has 6 neighbours, corners 2 or 3 | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-03c |  | neighbours are exactly the tiles whose centres are √3·R apart (geometry oracle) | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-03d |  | never returns a tile outside the grid | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-04a |  | equals the BFS step count for all 63 × 63 pairs | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-04b |  | corner to opposite corner is 10 steps (design doc: 9–10) | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-04c |  | is 0 to itself, 1 to a neighbour, and symmetric | PASS |
| unit / acceptance (Vitest) | `tests/auto/hex-grid.test.ts` | TC-HEX-04d |  | "within 2 tiles" of the mockup player [1,5] matches map.png | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-01 |  | start and boss are in opposite corners, 9–10 steps apart | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-02 |  | startFood covers the direct route plus about 3 spare steps (2–4) | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-03 |  | direct is the cheapest of the three routes in food | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-04 |  | every intended route is affordable with startFood | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-05 |  | direct passes an elite, safe passes a village, rich passes a chest or shrine | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-06 |  | the three routes are different | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-07 |  | the boss can be reached without stepping on any hazard tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-08 |  | no route visits a tile twice | PASS |
| unit / acceptance (Vitest) | `tests/auto/level-targets.test.ts` | TC-LVL-09 |  | the map uses its hazard (at least one hazard tile) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-00 |  | the example map is valid as written | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-01a |  | accepts the id of a renamed file when they match | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-01b |  | rejects an id that differs from the file name | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-01c |  | rejects an id that is not kebab-case | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02a |  | accepts whisperwood + swamp | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02a |  | accepts frostpeak + ice | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02a |  | accepts ashen + lava | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02b |  | rejects whisperwood + ice | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02b |  | rejects frostpeak + lava | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02b |  | rejects ashen + swamp | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-02c |  | rejects an unknown land | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03a |  | accepts an all-normal map | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03b |  | rejects 6 rows | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03c |  | rejects 8 rows | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03d |  | rejects a row of 8 characters and names the row | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03e |  | rejects a row of 10 characters | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03f |  | rejects another level's hazard and names the tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03g |  | rejects an unknown character | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-03h |  | rejects terrain that is not a list of strings | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04a |  | accepts a slot on the corner 0,0 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04a |  | accepts a slot on the corner 8,0 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04a |  | accepts a slot on the corner 0,6 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04a |  | accepts a slot on the corner 8,6 (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at col -1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at col 9 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at row -1 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at row 7 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at a fraction | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at three numbers | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04b |  | rejects a slot at one number | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04c |  | rejects a start outside the grid | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04d |  | rejects a route step outside the grid | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-04e |  | the message for a tile outside the grid shows the whole tile (regression BUG-004) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-05a |  | rejects a start on swamp | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-05b |  | rejects a boss on swamp | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-05c |  | allows a fixed village on a hazard tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-05d |  | allows a slot on a hazard tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-06a |  | rejects a slot on the start tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-06b |  | rejects a fixed location on the boss tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-06c |  | rejects two slots on one tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-06d |  | rejects start and boss on the same tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type monster | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type elite | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type chest | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type locked-chest | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type village | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type shrine | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07a |  | accepts the type mystery | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07b |  | rejects the type "start" | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07b |  | rejects the type "boss" | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07b |  | rejects the type "shop" | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07b |  | rejects the type "Village" | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07b |  | rejects the type "" | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07c |  | rejects an empty allow list | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07d |  | rejects an unknown type inside an allow list | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07f-control |  | accepts an allow list of distinct types | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07f | BUG-015 | rejects an allow list that repeats a type | PASS (bug confirmed) |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-07e |  | accepts a map with no fixed locations and no slots | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08a |  | rejects a route that does not start at start | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08b |  | rejects a route that does not end at the boss | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08c |  | rejects a jump between tiles that are not neighbours and names the step | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08d |  | uses odd-q neighbours: [1,5] → [2,5] is a step, [1,5] → [2,4] is not | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08e |  | rejects a route of one tile | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08f |  | rejects a missing route | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-08g |  | rejects a fourth, unknown route | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09a |  | accepts startFood equal to the direct cost (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09b |  | rejects startFood one below the direct cost (boundary) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09c |  | counts a swamp step as 2 food | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09d |  | rejects startFood 0 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09d |  | rejects startFood -3 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09d |  | rejects startFood 12.5 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09d |  | rejects startFood 13 | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-09d |  | rejects startFood null | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-10a |  | accepts the example boss goblin-chief | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-10b |  | rejects an unknown boss id when enemy files exist | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-10d | BUG-013 | rejects a normal enemy (bog-rat) as the boss | PASS (bug confirmed) |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-10d | BUG-013 | rejects an elite (frost-wisp) as the boss | PASS (bug confirmed) |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-10c |  | skips the check while there are no enemy files (stage 0) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-11a |  | reports broken JSON with the file name | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-11b |  | rejects an unknown field (typo protection) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-11c |  | reports every problem at once | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-12a |  | plays the levels in the listed order | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-12b |  | reports a listed level without a file | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-12c |  | rejects a level listed twice in levels.json (regression BUG-002) | PASS |
| unit / acceptance (Vitest) | `tests/auto/map-format.test.ts` | TC-MAP-12d | BUG-014 | a real level file without levels.json is a data error | PASS (bug confirmed) |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-01a |  | the same seed gives the same whole game state, 100 seeds | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-01b |  | the seed shown to the player is kept in the state | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-01c |  | dealing does not change the state it started from | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-01d |  | the generator moves on: the next random number after a deal differs from before | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-02a |  | every slot gets a type from its own allow list, 500 seeds | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-02b |  | fixed locations stay where the map puts them | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-02c |  | every allowed type of a two-way slot shows up across seeds (a level is never a memorised replay) | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-02d |  | at least 10 different deals across 100 seeds | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03a |  | pick() over 3 items is roughly uniform (chi-square, 30 000 draws, p ≈ 0.001) | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03b |  | nextFloat stays in [0, 1) for 100 000 draws | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03c |  | seed 0 is accepted and replayable | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03c |  | seed 1 is accepted and replayable | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03c |  | seed 4294967295 is accepted and replayable | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03c |  | seed -1 is accepted and replayable | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03c |  | seed 999999 is accepted and replayable | PASS |
| unit / acceptance (Vitest) | `tests/auto/seed-rng.test.ts` | TC-SEED-03d |  | no source file calls Math.random or Date-based randomness in game logic | PASS |
| e2e (Playwright, Chromium) local | `data-error.spec.ts` | TC-E2E-06a |  | a broken real level shows the data error screen with file, field and problem | PASS |
| e2e (Playwright, Chromium) local | `data-error.spec.ts` | TC-E2E-06b |  | the same problem is reported by `npm run check:data` in the terminal | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-01a |  | page loads with no errors and no requests to other sites (no font CDN) | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-01b |  | Inter and Cinzel are served from assets/fonts | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-02a |  | GameCanvas is exactly 1280 × 720 at a 1280 × 720 window | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-02b |  | HexGrid sits at x 150, y 89, 644 × 597.56 (layout.json) | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-02c |  | draws 63 tiles, flat-top, odd columns pushed down | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-03a |  | every tile centre has the land colour of its terrain (pixel check on a screenshot) | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-03b |  | slow tiles carry a word marker too (colour is never the only signal, ui-rules.md §8) | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-03c |  | space outside the grid is bg.base | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-04a |  | BuildInfo shows the commit of this build and the seed from the URL | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-04b |  | without ?seed a new seed 0–999999 is chosen and shown | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-04c |  | a seed that is not a number falls back to a new seed instead of breaking | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-04d |  | the same seed renders the same screen twice | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05 |  | 960 × 540 (smallest supported window) scales by 0.750, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05 |  | 1920 × 1080 (full HD) scales by 1.500, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05 |  | 1280 × 1000 (tall window: bars top and bottom) scales by 1.000, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05 |  | 1600 × 720 (wide window: bars left and right) scales by 1.000, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05 |  | 1366 × 768 (common laptop, not exactly 16:9) scales by 1.067, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) local | `smoke.spec.ts` | TC-E2E-05f |  | resizing the window after load rescales the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `data-error.spec.ts` | TC-E2E-06a |  | a broken real level shows the data error screen with file, field and problem | SKIP |
| e2e (Playwright, Chromium) deployed | `data-error.spec.ts` | TC-E2E-06b |  | the same problem is reported by `npm run check:data` in the terminal | SKIP |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-01a |  | page loads with no errors and no requests to other sites (no font CDN) | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-01b |  | Inter and Cinzel are served from assets/fonts | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-02a |  | GameCanvas is exactly 1280 × 720 at a 1280 × 720 window | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-02b |  | HexGrid sits at x 150, y 89, 644 × 597.56 (layout.json) | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-02c |  | draws 63 tiles, flat-top, odd columns pushed down | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-03a |  | every tile centre has the land colour of its terrain (pixel check on a screenshot) | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-03b |  | slow tiles carry a word marker too (colour is never the only signal, ui-rules.md §8) | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-03c |  | space outside the grid is bg.base | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-04a |  | BuildInfo shows the commit of this build and the seed from the URL | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-04b |  | without ?seed a new seed 0–999999 is chosen and shown | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-04c |  | a seed that is not a number falls back to a new seed instead of breaking | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-04d |  | the same seed renders the same screen twice | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05 |  | 960 × 540 (smallest supported window) scales by 0.750, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05 |  | 1920 × 1080 (full HD) scales by 1.500, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05 |  | 1280 × 1000 (tall window: bars top and bottom) scales by 1.000, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05 |  | 1600 × 720 (wide window: bars left and right) scales by 1.000, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05 |  | 1366 × 768 (common laptop, not exactly 16:9) scales by 1.067, keeps 16:9 and centres the canvas | PASS |
| e2e (Playwright, Chromium) deployed | `smoke.spec.ts` | TC-E2E-05f |  | resizing the window after load rescales the canvas | PASS |
