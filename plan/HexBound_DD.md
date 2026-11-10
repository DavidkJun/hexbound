# Hexbound: Game Concept and Implementation Plan

This file is the source of the design document. [`HexBound_DD.pdf`](HexBound_DD.pdf) is exported from it, so edit this file and export the PDF again.

**Team members:**

Крикота Давид ІМ-33<br>
Войтків Владислав ІМ-33<br>
Розумовський Даниїл ІМ-34<br>
Лев Береза ІМ-32

## 1. Overview

Hexbound is a single-player, turn-based fantasy roguelite for the browser. The player crosses a hand-made hex map towards a boss, chooses which locations to visit on the way, and fights with a deck of cards built along the route.

The player is the Wayfarer, a lone traveller crossing three lands to slay the Ember dragon. The game has three levels, and a full run takes 35–45 minutes.

| | |
|---|---|
| Course | «Основи розроблення комп'ютерних ігор» |
| Team | 4 members |
| Development time | Under 2 months |
| Platform | Web browser: the latest two versions of Chrome, Firefox and Edge on desktop; Safari best effort |
| Language | In-game text is in English. The course report and the presentation are in Ukrainian. |
| Genre | Single-player roguelite with route planning and card combat |

## 2. Design pillars

Four pillars decide which features go into the game: a feature that serves none of them is cut.

| Pillar | What it means |
|---|---|
| The route is the main decision | Where you go decides what you fight, what you earn and how strong you are at the boss. |
| The map feeds the fight | Terrain you crossed and places you visited change the next fight, not just your numbers. |
| Few rules, real choices | Every screen (a fight turn, a reward, a shop, an event) offers at least two sensible options. |
| Growth you chose | Starting weak, the player shapes a deck with a clear direction. |

## 3. Core gameplay

### Core loop

A level is one loop repeated tile by tile until the boss falls:

1. Plan a route on the map.
2. Step onto the next tile (each step costs food).
3. Resolve the location: a fight, a chest, a village, a shrine or an event.
4. Grow: take a card, a blessing, gold or supplies.

The route decides which fights you take and in what shape you arrive; the fights pay for the next part of the route.

### Map and routes

Each level is a hand-made 9×7 hex map with the start and the boss in opposite corners, about 9–10 steps apart. Every map offers three readable routes: **direct** (short, passes an elite), **safe** (longer, with a village) and **rich** (a detour through chests and shrines).

- **Slot maps.** Terrain, start, boss and villages are fixed; other locations are dealt at random into marked slots each run, so a level is never a memorised replay.
- **Visibility.** Location types are visible from the start; details (which monster, chest contents) appear within 2 tiles. The boss and its signature move are shown from the start.
- **Food.** Each step costs 1 food (2 on slow terrain). A level gives enough food for the direct route plus about 3 spare steps, so every detour is a trade.
- **Terrain hazards.** Each level adds one hazard that also affects the next fight, for example ice chills you (−1 energy on the first turn). Every hazard can be avoided by a longer route.

### Locations

| Location | What happens |
|---|---|
| Monster | Fight a normal enemy; win gold and pick 1 of 3 cards. |
| Elite | Harder fight on the short route; better rewards and a key. |
| Chest | No fight; gold plus a card, food or healing. |
| Locked chest | Opens only with a key from an elite; holds a rare card and a blessing. |
| Village | Buy food, rest, buy or remove cards, take a bounty. |
| Shrine | Pick 1 of 3 permanent blessings. |
| Mystery | A choice event with its cost and dice odds shown on the buttons. |
| Boss | Hardest fight; ends the level. |

### Resources

The player tracks three meters (health, food and gold) plus 3 lives for the whole run, and shapes a build made of the deck and blessings. Gold earned on a level pays for about two village purchases, so the player must choose between healing, food and new cards.

### Cards and combat

The deck has about 20–24 card types in four families: weapons, spells, armour and items. The player starts with 10 cards and leans into one of three build directions: Blade (weapons), Arcane (spells) or Bulwark (armour). Rules on cards use only four keywords: Freeze, Chill, Exhaust and Draw.

Fights are short, turn-based battles against one enemy whose next move is always shown. Each turn the player draws 5 cards and has 3 energy to spend on attacks, block and effects. Target length: 2–4 turns for a normal fight, 6–10 for a boss.

### Levels and progression

| Level | Hazard | Boss | What it tests |
|---|---|---|---|
| 1. Whisperwood | Swamp (slow) | Goblin chief | Basics; doubles as the tutorial |
| 2. Frostpeak Pass | Ice (slow, chills) | Frost giant | Route and food planning |
| 3. Ashen Citadel | Lava (damage) | Ember dragon | Whether the deck has a real direction |

Deck, gold and blessings carry over between levels. On death the player spends a life to retry the level; with no lives left, the run ends. The end screen shows a score so runs can be compared.

## 4. Rules

The exact rules, decided after the stage 0 design review (`tests/design-review/design-doc-gaps.md`; the answer to each question is in [`reviews/stage-0-answers.md`](reviews/stage-0-answers.md)). All numbers are starting values, collected in [4.9](#49-numbers), and are tuned in stage 3. In the game they live in data files, never in code.

### 4.1 Run, lives and score

- A run is the three levels in order. The run is **won** when the level 3 boss, the Ember dragon, dies.
- The player starts the run with **3 lives**. A life is a retry: dying with at least 1 life left spends 1 life and restarts the level. Dying with 0 lives left ends the run (**Run over**).
- Health reaching 0 is a death wherever it happens: in a fight, on lava, from an event or from hunger. The death screen names the cause: "Fight: &lt;enemy&gt;", "Burned by lava", "Event: &lt;name&gt;" or "Starved".
- **A retry restores the state from the moment the level started:** deck, gold, health, max health, food, keys and blessings. The slots are dealt again. The deal uses the run's random generator, which keeps going, so the same seed replays the same retries.
- **Restart level** in the Pause menu works like a death: it costs 1 life and asks to confirm first. With 0 lives left it is unavailable.
- **Score**, shown at the end of every run, won or lost: 1000 per level cleared + 10 per health left + 1 per gold left + 300 per life left. Time doesn't count: the game is turn-based, and the player should never feel rushed.

### 4.2 Health, gold and food

- **Health** starts at 60 of 60 and carries over between fights and levels. It is restored only by village rest, chests, events, blessings and the heal after a boss, and never above max health. Max health changes only through blessings.
- **Gold** starts at 20 and carries over. It never goes below 0: a cost the player can't pay is unavailable.
- **Food** is reset to the map's `startFood` at the start of every level. Food left at the end of a level is lost.
- Each step costs 1 food, or 2 onto a slow tile (swamp, ice).
- **Out of food:** moving is never blocked. Each point of food a step can't pay for costs **3 health** instead. Example: a swamp step with 1 food left sets food to 0 and costs 3 health. The planned route shows this health cost before the player presses Go.

### 4.3 Map and movement

- A route is a chain of neighbouring tiles. The player may step onto any tile, including tiles already visited, at the normal food cost.
- **Entering a location tile always resolves it,** and the walk stops there. A fight can't be fled, and an unresolved location can't be walked through.
- After the location is resolved, the rest of the planned route is kept and its food is checked again.
- A resolved monster, elite, chest, shrine or mystery tile becomes empty: it shows as visited and does nothing.
- A **locked chest** entered without a key does nothing and stays locked; the player can come back with a key. Opening it uses the key, and the tile becomes empty.
- A **village** stays a village. Rest, buy a card and remove a card can each be used once per village per level; buying food has no limit. Leaving and coming back doesn't reset them.
- Stepping onto the **boss** tile asks "Fight the boss now?" first. Winning the boss fight ends the level.
- **Visibility:** location types are visible from the start. Details (which enemy, the chest contents, which event) are shown for every tile within 2 steps of the player's current tile, and stay shown for the rest of the level once seen. The boss and its signature move are shown from the start.
- **Dealing:** at the start of each level attempt, each slot gets one type from its `allow` list, all equally likely, through the run's random generator. The details of each location are chosen at the same time. A map guarantees what matters through its own `allow` lists: a slot `["elite"]` is always an elite.

### 4.4 Terrain hazards and fight modifiers

| Hazard | Level | On the map | In the next fight |
|---|---|---|---|
| Swamp | 1 | Slow: 2 food per step | Nothing. Level 1 teaches food, nothing else |
| Ice | 2 | Slow: 2 food per step | **Chilled:** the player starts the next fight with Chill 1, so the first turn has 1 less energy |
| Lava | 3 | 4 damage on entering the tile; block doesn't count on the map. It can kill | The player arrives with less health |

**Fight modifiers** are what the map gives the next fight (pillar 2). Each one lasts until the next fight, including a boss fight, doesn't stack with itself, and is shown in the fight's modifier row:

- **Chilled** from crossing ice: the fight starts with Chill 1 on the player. Crossing three ice tiles still gives Chill 1.
- **Rested** from resting in a village: the fight starts with 5 block on the player.

### 4.5 Locations

- **Monster:** a normal enemy. Winning gives 10–15 gold and a card reward of commons.
- **Elite:** a harder enemy. Winning gives 25 gold, 1 key and a card reward in which one of the three cards is rare.
- **Boss:** winning gives 40 gold, heals 30% of max health (rounded down) and a card reward of rares. The level 3 boss wins the run instead.
- **Card reward:** 3 different cards, the player takes 1 or skips. Cards already in the deck can be offered; starter cards never are.
- **Chest:** 10–20 gold, plus one of these, equally likely: a card reward of commons, 3 food, or 10 health.
- **Locked chest:** needs a key. It holds a card reward of rares and a random blessing the player doesn't own yet. Keys carry over between levels. Every map has an elite slot and a locked-chest slot.
- **Village:**
    - Buy food: 3 food for 10 gold, as many times as the player likes.
    - Rest: +15 health for 20 gold. Gives **Rested**. Unavailable at full health.
    - Buy a card: 1 of 3 commons for 25 gold.
    - Remove a card: 30 gold. Unavailable when the deck has 8 cards.
    - Take a bounty: free.
- **Bounty:** the village marks one unresolved monster or elite tile on this level, chosen at random. Winning that fight before the boss fight pays 40 gold. Only one bounty can be active; it fails when the boss fight starts.
- **Shrine:** pick 1 of 3 different blessings the player doesn't own yet. There is no skip, since every blessing helps. If fewer than 3 are left, it offers the rest; if none are left, it heals 10.
- **Mystery:** a random event that hasn't come up this run yet. Each choice shows its cost and its outcomes with their chances on the button, e.g. "50%: +30 gold". A choice is unavailable if the player can't pay its cost, or if its health cost would bring health to 0. The game has **8 events** (at least 6 are a must-have), shared by all three levels.

### 4.6 Combat

- Every fight is against **one enemy**. Nothing is summoned.
- **Fight start:** the deck is shuffled into the draw pile. Fight modifiers and `fightStart` blessings apply.
- **Player turn**, in this order:
    1. The player's block resets to 0. On the first turn it doesn't, so block from the fight start (Rested, blessings) is kept.
    2. Energy is set to 3, minus the player's Chill.
    3. The player draws 5 cards. `turnStart` blessings apply.
    4. The enemy's next move is chosen and shown as its intent.
    5. The player plays cards in any order, as long as energy lasts, then presses End turn.
    6. The hand is discarded, and unused energy is lost.
- **Enemy turn:** its block resets to 0. If it is frozen, it skips its move; otherwise it does the move it showed. Then its Chill goes down by 1.
- **Energy** can go above 3 for one turn through `gainEnergy` (shown as 4/3).
- **Hand:** at most 10 cards. A card drawn into a full hand goes to the discard pile.
- **Reshuffle:** drawing from an empty draw pile first shuffles the discard pile into it. If both are empty, nothing is drawn. Exhausted cards stay out until the fight ends.
- **Damage:** the effect's amount + the attacker's strength − the attacker's Chill (enemies only), never below 0. Block absorbs it first, the rest comes off health. `loseHealth` ignores block.
- The fight ends the moment either side reaches 0 health, even in the middle of a turn.
- **After a fight:** block, statuses, strength and energy are cleared, and exhausted cards return to the deck.
- **Fight length targets** (2–4 turns for a normal fight, 6–10 for a boss) are measured with the starter deck plus the cards picked on the way on level 1, and with the player's own deck on levels 2 and 3.

### 4.7 Keywords and statuses

| Keyword | Rule |
|---|---|
| **Freeze** | The enemy skips its next move, and its pattern moves on to the move after it. Freeze doesn't stack. Only the player uses Freeze: enemy moves never apply it. Every card that applies Freeze also has Exhaust. |
| **Chill** on an enemy | Each of its attacks deals 1 less damage per Chill. At the end of its turn, its Chill goes down by 1. Chill adds up. |
| **Chill** on the player | The player's next turn has 1 less energy per Chill (never below 0), then the player's Chill is removed. Chill adds up. |
| **Exhaust** | After the card is played, it leaves the deck for the rest of the fight. |
| **Draw N** | Draw N cards now. The hand limit and the reshuffle rule apply. |

**Strength** is a new effect, `gainStrength N`: +N damage on each of that side's attacks for the rest of the fight. It adds up. It is what an enemy's **buff** intent does, and cards can use it too.

**Intent:** the enemy shows the icon of its move's `intent`, with the damage it will really deal (after strength and Chill) for an attack, the block for a block, and the amount for a buff or debuff. Each extra effect of the move is a small icon after the value.

### 4.8 Cards, starter deck and tutorial

- A **build** is a card family: Blade = weapons, Arcane = spells, Bulwark = armour. Items fit every build.
- Every card has a **rarity**: starter, common or rare. Monsters, chests and villages offer commons; an elite's card reward has one rare; bosses and locked chests offer rares.
- **Starter deck**, 10 cards: 4 Strike (weapon), 4 Defend (armour), 1 Ice Shard (spell) and 1 Ration (item). It shows every family once, and Ration ties the fight back to the map through food.
- **Tutorial:** the first fight of a new run is the tutorial. Whichever monster tile the player enters first on level 1, its enemy is the tutorial enemy, the first two hands are fixed by a scripted draw order, and short hints explain the intent, energy, block and End turn. A retry doesn't repeat the tutorial.

### 4.9 Numbers

| What | Value |
|---|---|
| Health at the start of the run | 60 of 60 |
| Gold at the start of the run | 20 |
| Lives | 3 |
| Food at the start of a level | the map's `startFood` |
| Health per missing food | 3 |
| Gold per fight | normal 10–15, elite 25, boss 40 |
| Heal after a boss | 30% of max health, rounded down |
| Chest | 10–20 gold + a card reward, 3 food or 10 health |
| Village | food 3 for 10 gold, rest +15 health for 20 gold, card 25 gold, removal 30 gold |
| Smallest deck | 8 cards |
| Bounty | 40 gold |
| Shrine with no blessing left | heals 10 |
| Lava | 4 damage per tile |
| Ice | Chill 1 in the next fight |
| Rested | 5 block in the next fight |
| Energy per turn | 3 |
| Cards drawn per turn | 5; at most 10 in the hand |
| Score | 1000 per level cleared, 10 per health, 1 per gold, 300 per life left |

## 5. Scope

The must-have list is what the team commits to deliver; everything else is added only after a full run is playable from start to finish.

**Must-have**

- Three levels with hand-made terrain, slot maps and three routes each.
- Movement, food, terrain hazards and their effect on fights.
- All location types, including elites with keys, the locked chest, villages with card removal and bounties, and 6–8 choice events.
- Combat with visible enemy intents, 5-card hands and the four keywords.
- About 20–24 cards, 9 normal enemies, 3 elites, 3 bosses, 10–12 blessings.
- 3 lives, a score screen and a tutorial first fight.
- All content stored as data files, so it can be balanced without code changes.

**Nice-to-have:** extra chest types, card upgrades, sound and music, a consistent art set, saving a run between sessions.

**Out of scope:** multiplayer, random terrain generation, multiple playable characters, a story beyond short level texts.

## 6. Team roles

Each of the four members owns one area of the project.

| Role | Responsibilities |
|---|---|
| PM / Game designer | Introduces the game concepts and rules, manages the team, priorities and implementation plan; designs cards, events and blessings. |
| UI / Level designer | Implements all screens, the interface and visual feedback; builds the three hand-made maps and the art. |
| Programmer | Codes the game: architecture, map and movement, combat and enemies, locations, lives and score, release build. |
| Tester | Finalises the concepts from the game designer into testable rules; tests each feature, runs playtests and checks balance against the design targets. |

## 7. Implementation plan

The game is built in six stages. Each stage ends with an exit check, and the team moves on only when it passes. Durations are given as a share of the whole timeline.

**Stage 0. Kick-off and decisions (~5%)**

- **PM / Game designer:** presents the design, closes open questions (engine, art style), splits the must-have list into tasks.
- **UI / Level designer:** picks the visual direction and the list of screens; sketches the hex grid.
- **Programmer:** sets up the repository on the prototype, project structure and data-file format.
- **Tester:** reviews the design for gaps; turns the pillars into a playtest checklist.

*Exit check:* decisions made, task board ready, project builds and runs.

**Stage 1. Playable first level (~25%)**

- **PM / Game designer:** writes level-1 content (starter deck, enemies, boss) and the tutorial fight.
- **UI / Level designer:** map and fight screens; the Whisperwood map with three routes.
- **Programmer:** map, movement and food; combat core with intents, energy, 5-card hands and keywords.
- **Tester:** tests each system as it is added; first check of route choices.

*Exit check:* a teammate who did not build it can finish level 1.

**Stage 2. Full game loop and content (~30%)**

- **PM / Game designer:** final lists of cards, enemies, blessings, events and bounties; prices.
- **UI / Level designer:** village, shop, shrine, event, reward and score screens; maps for levels 2 and 3.
- **Programmer:** elites and keys, villages, shrines, events, hazards, lives and score.
- **Tester:** regression testing after each feature; looks for exploits in the rules.

*Exit check:* a full run from level 1 to the final boss is possible with no blocking bugs.

**Stage 3. Playtests and balance (~20%)**

- **PM / Game designer:** analyses playtest results; adjusts numbers and maps.
- **UI / Level designer:** fixes readability and layout issues found in playtests.
- **Programmer:** bug fixes; a debug panel and a fight simulator for balance checks.
- **Tester:** runs playtests with people outside the team; compares results with the design targets.

*Exit check:* a full run takes 35–45 minutes and no single route always wins.

**Stage 4. Polish (~12%)**

- **PM / Game designer:** chooses which nice-to-haves fit; final text pass.
- **UI / Level designer:** consistent art set, hit feedback, final UI pass.
- **Programmer:** implements chosen extras; performance and browser checks.
- **Tester:** full regression pass and a second playtest.

*Exit check:* feature freeze.

**Stage 5. Release and defence (~8%)**

- **PM / Game designer:** final design document, report and presentation.
- **UI / Level designer:** screenshots and visuals for the presentation.
- **Programmer:** release build and deployment; last fixes.
- **Tester:** final acceptance test against the must-have list.

*Exit check:* game deployed and the presentation ready.

## 8. Estimated hours

The whole project is estimated at about 316 hours across the team.

| Stage | PM / GD | UI / LD | Programmer | Tester | Total |
|---|---:|---:|---:|---:|---:|
| 0. Kick-off | 8 | 5 | 7 | 5 | 25 |
| 1. First level | 14 | 20 | 32 | 10 | 76 |
| 2. Full game | 18 | 22 | 34 | 14 | 88 |
| 3. Playtests | 12 | 12 | 14 | 22 | 60 |
| 4. Polish | 6 | 14 | 10 | 10 | 40 |
| 5. Release | 8 | 5 | 6 | 8 | 27 |
| **Total, h** | **66** | **78** | **103** | **69** | **316** |

## 9. Working rules and risks

- A short weekly sync led by the PM; all tasks are tracked on one shared board.
- Every change is reviewed by another team member before it is merged.
- Game content is changed through data files, so balance can be tuned without code changes.
- Every stage ends with a playable build that the whole team tries.

| Risk | Response |
|---|---|
| Balance takes longer than planned | Fight simulator and debug panel in stage 3; tune numbers before redesigning maps. |
| Scope creep from new ideas | New ideas go to the nice-to-have list; nothing new after the stage 4 feature freeze. |
| Inconsistent code or art style | One code style and one art direction agreed in stage 0; review before merge. |
