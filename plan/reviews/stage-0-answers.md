# Answers to the stage 0 review (PM)

Owner: PM / Game designer. Answers [`tests/design-review/design-doc-gaps.md`](https://github.com/DavidkJun/hexbound/blob/test/stage-0/tests/design-review/design-doc-gaps.md) (48 questions, 3 contradictions), the questions for the PM in PR #2 and in the design review answers (`design/reviews/stage-0-answers.md`), and the PM's open bugs #11 and #12.

The full rules are in the design document, [`../HexBound_DD.md`](../HexBound_DD.md) → **4. Rules**. This file is the index: one line per question, and whether it follows the tester's suggested answer. "As suggested" means exactly the suggested answer.

## Decisions outside the rules

| Question | Decision |
|---|---|
| Language of in-game text (G-47) | **English.** All in-game text, data files and docs stay in English, so Cinzel stays as the heading font. The course report and the presentation are in Ukrainian. |
| Visual direction (`design/visual-direction.md`, Figma → Foundations) | **Approved:** option A, flat vector with game-icons.net icons, the palette, the lands, the card families and the type in `tokens.json` v2. |
| Task board | GitHub issues grouped by stage milestones, one owner per issue: the [Stage 1 milestone](https://github.com/DavidkJun/hexbound/milestone/1), linked from the README. |
| Route intent for map 1 | [`../route-intent.md`](../route-intent.md) |
| BUG-009 (#11) `main` not protected | Fixed in the repository settings: a pull request with 1 approval and a passing `build` check is needed to merge into `main`, for everyone, including the owner. |
| BUG-010 (#12) the PDF can't be searched | Fixed: `plan/HexBound_DD.md` is now the source, and the PDF is exported from it with real text. |
| BUG-008 (#10) GitHub Pages | Already fixed and verified on 2026-11-05; nothing left to do. |

## A. Run, meters and lives

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-01 | Health carries over everywhere. Rest, chests, events, blessings and the heal after a boss restore it. | As suggested, plus the boss heal (G-33) | 4.2 |
| G-02 | 60 of 60. Max health changes only through blessings. | As suggested | 4.2 |
| G-03 | Start with **20** gold. Per fight: normal 10–15, elite 25, boss 40. | **Changed:** 20 at the start so the first village is useful; smaller fight gold so a level pays for about two village purchases, not three | 4.2, 4.5 |
| G-04 | Yes, one death for every cause: "Fight: &lt;enemy&gt;", "Burned by lava", "Event: &lt;name&gt;", "Starved". | As suggested, plus "Starved" (G-09) | 4.1 |
| G-05 | A retry restores everything from the level start (deck, gold, health, max health, food, keys, blessings) and deals the slots again with the run's generator, which keeps going. | As suggested; "new seed" made precise so `?seed=` still replays a run | 4.1 |
| G-06 | Restart level costs 1 life and asks to confirm. Unavailable with 0 lives. | As suggested, plus the 0-lives case | 4.1 |
| G-07 | 1000 per level cleared + 10 per health + 1 per gold + 300 per life left. | **Changed:** no time term, so a turn-based game doesn't rush the player | 4.1 |
| G-08 | Won when the Ember dragon dies. A life is a retry: dying with 0 lives left is Run over, even at the final boss. | As suggested | 4.1 |

## B. Food

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-09 | Moving is never blocked. Each point of food a step can't pay costs 3 health. The route panel shows that cost. | As suggested, made precise for a 2-food step with 1 food left | 4.2 |
| G-10 | Food resets to `startFood` at each level start; leftover food is lost. | As suggested (not converted to score) | 4.2 |
| G-11 | 3 food for 10 gold, no limit per visit, no cap. | As suggested | 4.5 |

## C. Map, movement and visibility

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-12 | Yes, at the normal food cost. | As suggested | 4.3 |
| G-13 | Monster, elite, chest, shrine and mystery tiles become empty once resolved; an opened locked chest too. A village stays; rest, buy a card and remove a card work **once per village per level**, food has no limit. | **Changed:** once per village per level, not per visit, so stepping out and back in doesn't reset the services | 4.3 |
| G-14 | Entering a location always resolves it. Fights can't be fled. | As suggested | 4.3 |
| G-15 | The rest of the route is kept and its food checked again. | As suggested | 4.3 |
| G-16 | Within 2 steps of the player only; once seen, details stay shown for the level. | As suggested | 4.3 |
| G-17 | Uniform from `allow`; maps guarantee what matters through their `allow` lists. | As suggested | 4.3 |
| G-18 | Any time, with "Fight the boss now?" first. | As suggested | 4.3 |
| G-19 | Two fight modifiers: **Chilled** (ice: Chill 1 on the player) and **Rested** (village rest: 5 block). They last until the next fight and don't stack. Shrines and chests give none. | Uses the suggested example; the full list is in the rules | 4.4 |

## D. Terrain hazards

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-20 | 4 damage on entering the tile. Block doesn't count. It can kill. | As suggested | 4.4 |
| G-21 | Chilled is a map status that doesn't stack and lasts until the next fight, where it becomes **Chill 1 on the player**, so the first turn has 1 less energy. | **Changed:** it uses the Chill keyword instead of a separate rule, since the effect is the same. The map still shows the Chilled badge | 4.4, 4.7 |
| G-22 | Swamp is only slow. Intended: level 1 teaches food and nothing else. | As suggested | 4.4 |

## E. Locations

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-23 | 3 different cards; monsters, chests and villages offer commons, elites 1 rare of 3, bosses and locked chests rares. Starter cards are never offered. Skip allowed. | As suggested, with rarity added | 4.5, 4.8 |
| G-24 | Always 1 key. Keys carry over. Every map has an elite slot and a locked-chest slot. | As suggested | 4.5 |
| G-25 | 10–20 gold plus one of a card reward, 3 food or 10 health, equally likely. | As suggested | 4.5 |
| G-26 | Cards get `rarity`: `starter`, `common` or `rare`. The blessing is a random one the player doesn't own. | As suggested, plus `starter` | 4.5, 4.8 |
| G-27 | Rest +15 health for 20 gold, card 1 of 3 for 25 gold, removal 30 gold, each once per village per level. | As suggested; "per visit" → "per level" (G-13) | 4.5 |
| G-28 | 8 cards. | As suggested | 4.5 |
| G-29 | The village marks a random unresolved monster or elite tile; winning that fight before the boss pays 40 gold. One at a time; fails when the boss fight starts. Taking it is free. | As suggested, with the target made concrete | 4.5 |
| G-30 | 3 different blessings not owned yet, from 10–12. No skip. Fewer than 3 left: offer the rest; none left: heal 10. | As suggested, plus the empty-pool case | 4.5 |
| G-31 | Chances as percentages on the button. A choice is unavailable if its cost can't be paid or would bring health to 0. | As suggested | 4.5 |
| G-32 | **8 events** in the game (6 is the must-have minimum), shared by all levels, never repeated in one run. The number of mystery slots per level is up to each map. | — | 4.5 |
| G-33 | 40 gold, heal 30% of max health (rounded down), a card reward of rares. | As suggested, plus gold | 4.5 |

## F. Combat

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-34 | The player acts first. The enemy's next move is chosen and shown at the start of each player turn. | As suggested | 4.6 |
| G-35 | Unused energy is lost. `gainEnergy` can go above 3 for that turn (4/3). | As suggested | 4.6 |
| G-36 | Each side's block resets at the start of its own turn. The player's first turn keeps block from the fight start. | As suggested, plus the first-turn case | 4.6 |
| G-37 | The whole hand is discarded. At most 10 cards; a card drawn into a full hand goes to the **discard pile**. | **Changed:** discarded, not lost, as the fight screen already shows it | 4.6 |
| G-38 | When drawing from an empty draw pile. Both empty: nothing is drawn. | As suggested | 4.6 |
| G-39 | The enemy skips its next move; its pattern moves on. Doesn't stack. **Enemies never apply Freeze.** Every Freeze card has Exhaust. | **Changed:** enemies can't freeze the player (a skipped turn is no fun and isn't needed); Exhaust stops endless freeze loops | 4.7 |
| G-40 | Enemy: −1 damage per Chill on each attack, −1 Chill at the end of its turn. Player: −1 energy per Chill next turn, then removed. Chill adds up. | As suggested | 4.7 |
| G-41 | Confirmed as written in `data/README.md`. Exhausted cards come back after the fight. | As suggested | 4.7 |
| G-42 | New effect `gainStrength N`: +N damage on that side's attacks for the rest of the fight. The buff intent uses it. | As suggested | 4.7 |
| G-43 | Main intent icon and value, plus a small icon for each extra effect. | As suggested | 4.7 |
| G-44 | Starter deck plus picked cards on level 1; the player's own deck on levels 2–3. | As suggested | 4.6 |

## G. Content and other

| ID | Answer | vs suggestion | Rule |
|---|---|---|---|
| G-45 | 4 Strike, 4 Defend, 1 Ice Shard, 1 Ration. A build is a card family; items fit every build. | **Changed:** one card of each family instead of 5 Strike + 1 family card, so the player sees every direction from the first fight | 4.8 |
| G-46 | The first fight of a new run, whichever monster it is on level 1, uses the tutorial enemy and a scripted draw order for the first two hands, with hints. | **Changed:** a scripted draw order instead of a fixed seed, so the rest of the run stays random | 4.8 |
| G-47 | English in the game; Ukrainian only in the report and the presentation. | As suggested | 1 |
| G-48 | The latest 2 versions of Chrome, Firefox and Edge on desktop; Safari best effort. | As suggested | 1 |

## Contradictions

| ID | Answer |
|---|---|
| C-01 | Solved by `gainStrength` (G-42). |
| C-02 | No summons: one enemy per fight (4.6). The Goblin chief's signature move comes with the level 1 content; both texts so far are placeholders. |
| C-03 | 35–45 minutes is the target, and the DD now says so. |

## For the programmer (questions in PR #2)

What the data format still needs. The format is yours; these are the rules it has to carry:

| Missing piece | Rule |
|---|---|
| Starter deck | A list of card ids with counts (4.8). |
| Card rarity | `starter`, `common` or `rare` on every card (4.8). |
| Bounties | Not content: one rule with one number (4.5), so no bounty files are needed. |
| Shop prices and every other number | All of 4.9. They should live in one data file, so the tester and I can tune them in stage 3 without code. |
| Keys and rewards as effects | Events and blessings need: `gainKey`, a card reward (with a rarity), a random blessing, and `gainMaxHealth` for blessings. |
| Hazard numbers | Lava 4 damage, ice Chill 1, out of food 3 health per missing food (4.4, 4.2). |
| New effect | `gainStrength` (4.7). |

## For the UI / Level designer

Every design that was built on a suggested answer still holds, except these:

| ID | What changes in the design |
|---|---|
| G-09 | The planned route shows the health cost of steps past the food, e.g. "Food runs out at step 4: −6 health". |
| G-13, G-27 | Village services used once per village per level: a used service needs a disabled "used" state, also after leaving and coming back. |
| G-19 | A second fight modifier: **Rested**, "+5 block on turn 1", in `FightModifiers`. |
| G-21 | No change on the map. In the fight, Chilled shows as the `FightModifiers` pill and as Chill 1 in `PlayerStatus`, as `fight.png` already does. |
| G-30 | The shrine has no Skip button. |
| G-39 | `PlayerStatus` never shows Freeze. The enemy needs a frozen look on `EnemyIntent` (it skips its move). |
| G-06 | Restart level is disabled with 0 lives. |
| G-29 | The bounty target tile needs a marker on the map (stage 2). |

All the other questions you listed (G-04, 15, 18, 20, 24, 28, 31, 33, 37, 38, 40, 42, 43) are answered as suggested, so their designs stay.
