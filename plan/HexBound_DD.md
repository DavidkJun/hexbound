# Hexbound: Game Concept and Implementation Plan

This file is the source of the design document. [`HexBound_DD.pdf`](HexBound_DD.pdf) is exported from it, so edit this file and export the PDF again.

**Team members:**

Крикота Давид ІМ-33<br>
Войтків Владислав ІМ-33<br>
Розумовський Даниїл ІМ-34<br>
Лев Береза ІМ-32

## 1. Overview

Hexbound is a single-player, turn-based fantasy roguelite for the browser. The player crosses a hand-made hex map towards a boss, chooses which locations to visit on the way, and fights with a deck of cards built along the route.

The player is the Wayfarer, a lone traveller crossing three lands to slay the Ember dragon. The game has three levels, and a full run takes about 40 minutes.

| | |
|---|---|
| Course | «Основи розроблення комп'ютерних ігор» |
| Team | 4 members |
| Development time | Under 2 months |
| Platform | Web browser |
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

## 4. Scope

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

## 5. Team roles

Each of the four members owns one area of the project.

| Role | Responsibilities |
|---|---|
| PM / Game designer | Introduces the game concepts and rules, manages the team, priorities and implementation plan; designs cards, events and blessings. |
| UI / Level designer | Implements all screens, the interface and visual feedback; builds the three hand-made maps and the art. |
| Programmer | Codes the game: architecture, map and movement, combat and enemies, locations, lives and score, release build. |
| Tester | Finalises the concepts from the game designer into testable rules; tests each feature, runs playtests and checks balance against the design targets. |

## 6. Implementation plan

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

## 7. Estimated hours

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

## 8. Working rules and risks

- A short weekly sync led by the PM; all tasks are tracked on one shared board.
- Every change is reviewed by another team member before it is merged.
- Game content is changed through data files, so balance can be tuned without code changes.
- Every stage ends with a playable build that the whole team tries.

| Risk | Response |
|---|---|
| Balance takes longer than planned | Fight simulator and debug panel in stage 3; tune numbers before redesigning maps. |
| Scope creep from new ideas | New ideas go to the nice-to-have list; nothing new after the stage 4 feature freeze. |
| Inconsistent code or art style | One code style and one art direction agreed in stage 0; review before merge. |
