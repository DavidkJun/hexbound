# Design document: gaps and open questions

Owner: Tester. For: PM / Game designer. Stage 0, task 1 of `plan/Stage0_Tester.txt`.

Source reviewed: `plan/HexBound_DD.pdf` (as of commit `41ce590`), read together with `design/` and `data/README.md`, because those already make some rule assumptions.

Each point is a place where two people could build the same rule in two different ways. Every point has a suggested answer, so the PM can confirm it or pick another. Once the PM answers, the tester turns the answer into a testable rule for stage 1.

**Needed by:** the stage that first builds on the answer. All **stage 1** points block the level 1 rules.

**Status:** `Open` until the PM answers, then `Answered → <link to the rule>`.

Summary: **48 points**: 30 needed for stage 1, 16 for stage 2, 2 for stages 3–4. There are also 3 contradictions between documents, listed at the end.

**Top 5 to answer first** (they block the stage 1 rules for movement and combat):

1. G-09: what happens at 0 food
2. G-05: what a retry restores
3. G-36 to G-38: block, hand and reshuffle
4. G-39 and G-40: Freeze and Chill
5. G-13: what a visited tile becomes

## A. Run, meters and lives

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-01 | Does health carry over between fights and between levels? | Decides how punishing a route is and whether "health at boss" means anything (playtest target). | Carries over everywhere. Only rest, chests, events and blessings heal. | 1 | Open |
| G-02 | Starting and maximum health. Can max health change? | Cards, enemy damage and village prices are balanced against it. The mockups show 42/60 as an example. | Start at 60/60. Max health changes only through blessings. | 1 | Open |
| G-03 | Starting gold, and gold per fight (normal, elite, boss). | The DD target is "gold on a level ≈ two village purchases". It can't be checked without these numbers. | Start with 0. Per fight: normal 15–20, elite 30, boss 50 (to tune in stage 3). | 1 | Open |
| G-04 | Health reaches 0 outside a fight (lava step, event cost, `loseHealth`). Is it the same death as losing a fight? | The Death screen shows a "cause of death". The code needs one path for all deaths. | Yes. Any 0 health means death. The cause is "Lava", "Event: <name>" or "Fight: <enemy>". | 2 | Open |
| G-05 | Retry after death: from the state at the start of the level, or at the moment of death? Are the slots dealt again? Is the retry seed the same? | Exploit risk: a retry that keeps gold or cards farms the level. A retry with the same deal makes the level "memorised". | Restore deck, gold, health, food and blessings from the level start. Deal the slots again from a new seed. | 1 | Open |
| G-06 | The Pause menu has **Restart level** (`design/screens.md`). Does it cost a life? | If it is free, it's an exploit: restart after a bad deal or a bad fight with no penalty. | It costs a life and asks to confirm. Or remove it. | 2 | Open |
| G-07 | Score formula: what counts and with what weight (levels cleared, health, gold, lives left, time, fights)? | The score screen (stage 2) and comparing runs depend on it. "No route always wins" can't be judged without it. | E.g. 1000 per level + 10 × health left + gold + 500 × lives left − 2 × minutes. | 2 | Open |
| G-08 | What ends the run with a win? What happens with 0 lives exactly at the final boss? | Edge case of the end screen. | The run is won when the level 3 boss dies. With 0 lives, death means Run over (loss). | 2 | Open |

## B. Food

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-09 | What happens when food runs out? | The biggest open rule in movement. Without it the player may be **soft-locked** (can't move, can't die). `screens.md` already marks the "Food is 0" state as a PM question. | Moving with 0 food costs 3 health per step instead. The run is never soft-locked. | 1 | Open |
| G-10 | Does food carry over to the next level, or does each level reset to `startFood`? | Changes every food calculation, and the map file's `startFood` field. | Reset to `startFood` at each level start. Leftover food is lost (or converted to score). | 1 | Open |
| G-11 | Food price and amount in a village. Is there a food cap? | The village is the "safe route" reward. Without a cap, food can be stockpiled. | 3 food for 10 gold. No cap, because the reset in G-10 handles stockpiling. | 2 | Open |

## C. Map, movement and visibility

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-12 | Can the player go back to a tile they already visited? Does stepping back cost food? | Route planning UI and food maths. | Yes, at normal food cost. | 1 | Open |
| G-13 | What does a resolved tile become: empty, or still the location? Can a village be used twice? A shrine? | The map screen needs a "visited" tile look, and exploits are possible (a shrine visited twice). | Fight, chest, shrine and mystery tiles become empty. Village services can be used once per visit; the village stays. | 1 | Open |
| G-14 | Can the player walk past or through a monster tile without fighting? | `map.md` says walking stops at each location. Is the fight then forced? | Entering a location tile always resolves it. A fight can't be fled. | 1 | Open |
| G-15 | After walking stops at a location, is the rest of the planned route kept? | Map screen behaviour after every fight. | Kept. It's re-checked for food and can be cleared. | 1 | Open |
| G-16 | "Details appear within 2 tiles": of the player only, or also of the planned route? Do revealed details stay revealed after the player moves away? | `map.md` assumes "of the player". | Of the player only. Once revealed, details stay revealed. | 1 | Open |
| G-17 | How are slots dealt: uniformly from `allow`? Are there guarantees (always ≥ 1 elite, a locked chest only on a level with an elite)? | Seeded dealing is built in stage 1 (the code is uniform today). A deal without an elite makes the locked chest useless. | Uniform. Each map guarantees what matters by its own `allow` lists (a slot `["elite"]` is always an elite). | 1 | Open |
| G-18 | Can the boss tile be entered at any time? Is there a confirmation? | Avoids walking into the boss by mistake. | Yes; ask "Fight the boss now?" once. | 1 | Open |
| G-19 | "Places you visited change the next fight" (pillar 2): which places and which effects, besides terrain? | The fight screen's `FightModifiers` needs the list. Pillar 2 is otherwise only ice. | List every location effect on the next fight, e.g. village rest gives +5 block in the next fight; shrine gives none. | 1 | Open |

## D. Terrain hazards

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-20 | Lava: how much damage, and when (on entering the tile, or at the start of the next fight)? Can it kill on the map? | `map-format.md` says "amount set in the rules". The level 3 balance needs it. | 4 damage on entering. It can kill (see G-04). | 2 | Open |
| G-21 | Ice "chills": is it the same as the **Chill** keyword? Does crossing 3 ice tiles chill 3 times? Does it wear off if the next location isn't a fight? | `map-format.md` says "−1 energy on the first turn of the next fight". `fight.md` shows a "Chilled" pill. Stacking is undefined. | A separate "Chilled" map status, not the keyword. It doesn't stack and lasts until the next fight. | 2 | Open |
| G-22 | Swamp: is "slow" (2 food) its only effect? | Pillar 2 says terrain changes the next fight; swamp doesn't. | Only slow. (Confirm that this is intended.) | 1 | Open |

## E. Locations

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-23 | Card reward "pick 1 of 3": from which pool? Can cards repeat? Is skipping allowed? | `screens.md` has Skip. The data format has no rarity and no pool. | From all non-starter, non-rare cards, with no duplicates in one offer. Skipping is allowed. | 1 | Open |
| G-24 | Elite: does it always give a key? Does a key carry over to the next level? Is a locked chest always on the same level as an elite? | The tester brief asks this. The locked chest is useless without a key. | Always 1 key. Keys carry over. Each map has an elite slot and a locked-chest slot. | 2 | Open |
| G-25 | Chest: gold plus "a card, food or healing". Random which one? How much? | The rich route's value depends on it. | Random 1 of 3: a card offer, 3 food or 10 health; plus 10–20 gold. | 2 | Open |
| G-26 | Locked chest: what is a "rare card"? Which blessing pool? | The data format has no rarity field (`data/README.md` "Not in the format yet"). | Add `rarity: common/rare` to cards. Draw the blessing from the shrine pool. | 2 | Open |
| G-27 | Village prices: rest (how much healing), buy a card (how many offered), remove a card. Can each be done more than once per visit? | Gold target "≈ two purchases" per level. | Rest 20 gold for +15 health; card 25 gold; removal 30 gold; each once per visit. | 2 | Open |
| G-28 | Minimum deck size for card removal. | `screens.md` "Remove card disabled" state. | 8 cards. | 2 | Open |
| G-29 | Bounty: what is it, what's the reward, is there a deadline, can it fail, and is only one active? | It's in the must-have list and on the village screen, but undefined. | "Defeat X before the boss": +40 gold. One at a time, and it fails at the level end. | 2 | Open |
| G-30 | Shrine: 3 of how many blessings? Duplicates? Can the player skip? | The pool size decides how often a run repeats itself. | 3 different blessings from the 10–12 not owned yet. No skip. | 2 | Open |
| G-31 | Mystery event: which dice (d6? percentages?), and how are the odds shown? Can a cost kill the player? | `data/README.md` uses `chance` in %. The display is an open question there too. | Percentages on the button ("50%: +30 gold"). A choice whose cost would bring health to 0 is disabled. | 2 | Open |
| G-32 | How many events per level? (The number is not legible in the PDF export, see BUG-010.) | Content scope. | — (PM to state.) | 2 | Open |
| G-33 | After the boss: healing, a reward, a card? | Health at the start of level 2/3 drives difficulty. | Card reward plus heal 30%. | 1 | Open |

## F. Combat

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-34 | Turn order: does the player always act first? When is the next intent chosen? | Intent display and testing. | The player acts first. The enemy acts after End turn. The next intent is shown at the start of each player turn. | 1 | Open |
| G-35 | Is unused energy lost at the end of the turn? Can `gainEnergy` go above 3? | Energy orb "current/max" display. | Lost. It can go above max for this turn (shown as 4/3). | 1 | Open |
| G-36 | Block: does it reset every turn? The player's at the start of their turn, the enemy's at the start of theirs? | Basic combat maths. | Each side's block resets at the start of its own turn. | 1 | Open |
| G-37 | Unplayed cards: discarded at the end of the turn, or kept? Is there a hand size limit? | `fight.md` lays out 6+ cards, but with no maximum. | Discard the whole hand. Max hand 10; extra draws are lost. | 1 | Open |
| G-38 | When does the draw pile reshuffle? What if both draw and discard are empty? | `screens.md` assumes "discard shuffles into draw". | When drawing from an empty draw pile. If both are empty, draw nothing. | 1 | Open |
| G-39 | **Freeze**: exact rule. Does the target skip its next move? Does it stack? Can enemies freeze the player? | One of the 4 keywords; the core of the Arcane build. | The target skips its next action. It doesn't stack. Enemies can freeze the player (the player's next turn has 0 energy). | 1 | Open |
| G-40 | **Chill**: exact rule. What does "Chill 1" do on an enemy, and on the player? Does it decay? | `fight.md` shows "Chill 1" on an enemy. | Enemy: deals 1 less damage per stack, −1 stack per turn. Player: −1 energy per stack next turn. | 1 | Open |
| G-41 | **Exhaust** and **Draw**: confirm the meaning. Exhaust = removed for the rest of the fight; Draw N = draw N now. | They are in the data format; the PM should confirm. | As written in `data/README.md`. | 1 | Open |
| G-42 | Enemy **buff** intent: what does a buff do? The effect list has no "strength" or "damage up" effect. | Enemy data can't express a buff, so the intent icon has nothing behind it. | Add `gainStrength N` (+N damage on attacks) to the effects, or drop the buff intent. | 1 | Open |
| G-43 | Moves with several effects (attack + debuff): what does the intent show? | `EnemyIntent` shows one icon and one value. | Show the main intent with its value plus small icons for the extra effects. | 1 | Open |
| G-44 | Fight length targets (2–4 turns normal, 6–10 boss): measured with which deck — the starter deck? | Tester checks this in playtests (stage 3). | Starter deck on level 1, a typical deck by level 3. | 3 | Open |

## G. Content and other

| ID | What is unclear | Why it matters | Suggested answer | Needed by | Status |
|---|---|---|---|---|---|
| G-45 | The 10-card starter deck, and how cards belong to a build (Blade / Arcane / Bulwark). | Level 1 content. The data format has no starter or build field. | Starter: 5 Strike, 4 Defend, 1 family card. A build = card family. | 1 | Open |
| G-46 | Tutorial first fight: scripted (fixed enemy, hand and seed), or a normal fight with hints? | Testability, and the tutorial hints screen. | Scripted: a fixed enemy, and a fixed first hand through a fixed seed. | 1 | Open |
| G-47 | Language of in-game text (already open in `CLAUDE.md`). | Cinzel has no Cyrillic; fonts, text length and layouts depend on it. | English for the game; Ukrainian only in the report. | 1 | Open |
| G-48 | Supported browsers (Chrome, Firefox, Safari, Edge; versions) for the stage 4 check. | The browser test matrix. | The latest 2 versions of Chrome, Firefox and Edge on desktop; Safari best effort. | 4 | Open |

## Contradictions found between documents

| ID | Where | Contradiction | Suggested fix |
|---|---|---|---|
| C-01 | DD "Combat" vs `data/README.md` effects | The DD allows a **buff** intent, but no effect can express a buff (see G-42). | PM decides; the programmer adds the effect. |
| C-02 | `map.md` boss panel vs `_example` enemy file | The mockup says Rally "calls a goblin every 3rd turn"; the example data says Rally "gains a wall of block". Both are placeholders, but "calls a goblin" (a summon) isn't in the effect list. | PM confirms there are no summons (one enemy per fight). |
| C-03 | DD "a full run takes about 40 minutes" vs "35–45 min" (team plan, stage 3) | Not a conflict, but the playtest target is the range. | Use 35–45 min as the test target. |
