# Testable rules: run, map, movement and food

Owner: Tester. For: the programmer (#30, PR #40), the UI / Level designer (#32, #33) and the PM (questions at the end). Task #25.

**Source:**

- the PM's rules, `plan/HexBound_DD.md` → 4.1–4.5 (PR #21), and the answers index `plan/reviews/stage-0-answers.md`
- every number from `data/numbers.json` (PR #37), named by its key, e.g. `run.health`

**How to read it.** Each rule has an ID (`MAP-nn`) and a **Check**: given → when → then, with exact numbers. A test that checks a rule names its ID. Where the DD leaves an edge case open, the rule says **(Q-Mn)** and the question is at the end, with a suggested answer. Until the PM answers, tests use the suggested answer and are marked so.

**Words used:**

- **Step:** moving onto a neighbouring tile (odd-q neighbours, `design/ui-rules.md` §5).
- **Slow tile:** swamp or ice.
- **Level attempt:** a level from its start, or from a retry.

## 1. Run and level start

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-01 | A new run starts with health `run.health` of `run.maxHealth` (60 of 60), gold `run.gold` (20), lives `run.lives` (3), 0 keys, no blessings, the starter deck (FIGHT-04) | New run, seed 1 → 60/60, 20 gold, 3 lives, 0 keys, 10 cards | 4.1, 4.2 |
| MAP-02 | At the start of every level attempt, food is set to the map's `startFood`. Food left over from the previous level is lost | End level 1 with 4 food; level 2 has `startFood` 14 → level 2 starts with 14, not 18 | 4.2 |
| MAP-03 | Health, max health, gold, keys, blessings and the deck carry over from one level to the next | Finish level 1 with 35/60, 47 gold, 1 key → level 2 starts with 35/60, 47 gold, 1 key | 4.1, 4.2 |
| MAP-04 | The player starts each level attempt on the map's `start` tile, which costs no food and does nothing | Level start → the token is on `start`, food = `startFood` | 4.3 |
| MAP-05 | At each level attempt, every slot is dealt exactly one type from its `allow` list, each type equally likely, using the run's random generator. The details are chosen at the same time: which enemy, the chest's contents, which event | `_example.json`, 1000 seeds → slot `[3,4]` (`["chest","mystery"]`) is a chest 45–55% of the time; a slot never gets a type outside its list | 4.3 |
| MAP-06 | The same seed gives the same deal, the same details and the same deal on every retry | Seed 42 twice, die once each time → both runs have identical deals on the first and the second attempt | 4.1, 4.3 |
| MAP-07 | A monster tile deals a normal enemy, and an elite tile an elite, of the level's land (#29) | Level 1 → every dealt monster is a `normal` enemy with `land: whisperwood` | 4.5 |

## 2. Steps and food

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-10 | The player can only step onto a neighbour of their current tile. A route is a chain of neighbours from the current tile | On [1,5] (odd column): [2,5] and [2,6] are steps; [2,4] is not | 4.3 |
| MAP-11 | A step costs 1 food onto a normal or lava tile and 2 onto a slow tile (swamp, ice). The tile the player stands on costs nothing | Route [1,5] → [1,4] (normal) → [2,4] (swamp) costs 3 | 4.2, map-format |
| MAP-12 | Any tile can be stepped on again, including visited and resolved tiles, at the same cost | [1,5] → [1,4] → [1,5] costs 2 | 4.3 |
| MAP-13 | **Out of food:** a step is never blocked. Each point of food the step can't pay costs `food.healthPerMissingFood` (3) health; food can't go below 0 | 1 food, swamp step → food 0, health −3. 0 food, normal step → health −3. 0 food, swamp step → health −6. 2 food, swamp step → food 0, no health lost (boundary) | 4.2 |
| MAP-14 | Before Go, the planned route shows its food cost, the food left, and the health cost of every step past the food | 5 food, route of 3 normal then 2 swamp steps (cost 7) → "food runs out at step 5: −6 health" | 4.2 |
| MAP-15 | Health lost to hunger that reaches 0 is a death with the cause "Starved" (MAP-50) | 3 health, 0 food, normal step → death, "Starved" | 4.1 |
| MAP-16 | Food above `startFood` is allowed (Ration, chests, the village); there is no food cap | 13 food, take a chest with 3 food → 16 | 4.5 |

## 3. Terrain hazards and fight modifiers

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-20 | **Lava:** entering a lava tile costs 1 food and `hazards.lavaDamage` (4) health. Block doesn't count on the map | 30 health, step onto lava → 26 health, food −1 | 4.4 |
| MAP-21 | Lava can kill. The cause is "Burned by lava" (MAP-50). **(Q-M1)** when hunger and lava hit on the same step | 4 health, step onto lava with food → death, "Burned by lava" | 4.1, 4.4 |
| MAP-22 | **Chilled:** entering an ice tile gives the Chilled status. It doesn't stack: three ice tiles still give one Chilled | Cross 3 ice tiles, enter a fight → the player starts with Chill 1, not 3 | 4.4 |
| MAP-23 | Chilled lasts until the next fight, through chests, villages, shrines and events, and turns into Chill `hazards.iceChill` (1) on the player when that fight starts (FIGHT-03). Then it's gone. **(Q-M5)** for a retry | Ice, then a chest, then a monster → the fight starts with Chill 1; the next fight starts with none | 4.4, 4.7 |
| MAP-24 | **Rested:** resting in a village gives the Rested status: the next fight starts with `village.restedBlock` (5) block on the player. It doesn't stack | Rest in two villages, then fight → 5 block, not 10 | 4.4 |
| MAP-25 | Swamp has no effect besides being slow | Cross swamp, then fight → no fight modifier | 4.4 |

## 4. Walking and resolving locations

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-30 | Go walks the route one step at a time. **Entering an unresolved location tile resolves it, and the walk stops there**, even if the route goes on | Route of 5 with a monster at step 2 → the walk stops on step 2 and the fight starts | 4.3 |
| MAP-31 | After the location is resolved, the rest of the route is kept, renumbered from 1, and its food is checked again (MAP-14) | Route of 5, stop at step 2, win → 3 steps left, numbered 1–3 | 4.3 |
| MAP-32 | A fight can't be fled; there is no way back to the map except winning or dying | Fight screen → no "leave" action exists | 4.3 |
| MAP-33 | A resolved monster, elite, chest, shrine or mystery tile becomes **empty**: it shows as visited and does nothing when entered again; the walk doesn't stop there | Win on [2,5], walk back over [2,5] → no fight, no stop | 4.3 |
| MAP-34 | **Locked chest without a key:** nothing happens, it stays locked and can be opened later. **(Q-M2)** whether the walk stops there | 0 keys, enter the locked chest → keys 0, chest still locked | 4.3 |
| MAP-35 | **Locked chest with a key:** it opens, uses 1 key, gives a card reward of rares and a random blessing the player doesn't own, and becomes empty | 1 key → 0 keys, rare card reward, +1 blessing | 4.5 |
| MAP-36 | A **village** stays a village. Entering it always opens it (the walk stops). Rest, buy a card and remove a card each work **once per village per level**, and leaving and coming back doesn't reset them; food can be bought without limit | Rest, leave, come back → Rest shows as used | 4.3, 4.5 |
| MAP-37 | **Boss:** the step onto the boss tile asks "Fight the boss now?" first. "Not yet" leaves the player on the tile before it. Winning the boss fight ends the level | Route ending on the boss → the dialog before the last step | 4.3 |

## 5. Visibility

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-40 | Every location's **type** is visible from the start of the level attempt | Level start → every slot shows its type icon | 4.3 |
| MAP-41 | **Details** (which enemy, the chest's contents, which event) show for every tile within 2 steps of the player's current tile, counted as hex distance and ignoring terrain | Player on [1,5]: [3,4] (distance 2) shows details; [5,3] (distance 4) doesn't | 4.3 |
| MAP-42 | Once shown, details stay shown for the rest of the level attempt, even when the player walks away | See [3,4] from [1,5], walk to [1,1] → [3,4] still shows its details | 4.3 |
| MAP-43 | The boss and its signature move are shown from the start, at any distance | Level start → boss name and signature visible | 4.3 |

## 6. Death, retry, lives and score

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-50 | Health reaching 0 is a death anywhere. The death screen shows the cause: "Fight: &lt;enemy&gt;", "Burned by lava", "Event: &lt;name&gt;" or "Starved" | Die to the Bog rat → "Fight: Bog rat" | 4.1 |
| MAP-51 | Dying with 1 or more lives: spend 1 life and **retry the level**. Dying with 0 lives: **Run over** | 3 lives, die → 2 lives, level restarts. 0 lives, die → Run over | 4.1 |
| MAP-52 | A retry restores the state from the start of the level attempt: deck, gold, health, max health, food, keys and blessings. The slots are dealt again (MAP-05/06), visibility starts over, and used village services are reset | Start level 1 with 60/60 and 20 gold; reach 31 gold, take a card, die → retry with 60/60, 20 gold, the old deck | 4.1 |
| MAP-53 | **Restart level** (Pause menu) works like a death: it asks to confirm, costs 1 life and does MAP-52. It is unavailable with 0 lives | 1 life → confirm → 0 lives, level restarts. 0 lives → Restart disabled | 4.1 |
| MAP-54 | The run is **won** when the level 3 boss dies. The score is shown at the end of every run, won or lost: 1000 per level cleared + 10 per health + 1 per gold + 300 per life left (`score.*`) | Win with 3 levels, 22 health, 85 gold, 1 life → 3000 + 220 + 85 + 300 = 3605. Lose on level 2 with 0 lives, 0 health, 40 gold → 1000 + 0 + 40 + 0 = 1040 | 4.1 |

## 7. Location rewards

| ID | Rule | Check | DD |
|---|---|---|---|
| MAP-60 | **Monster** won: gold from `rewards.monsterGold` (10–15, whole numbers, inclusive, uniform; Q-M6), then a card reward of commons | 1000 seeds → gold is always 10–15, and each value appears | 4.5 |
| MAP-61 | **Elite** won: `rewards.eliteGold` (25) gold, `rewards.eliteKeys` (1) key, and a card reward in which exactly 1 of the 3 cards is rare | Win an elite → +25 gold, +1 key, offer = 2 commons + 1 rare | 4.5 |
| MAP-62 | **Boss** won: `rewards.bossGold` (40) gold, a heal of `rewards.bossHealPercent` (30%) of max health rounded down, never above max, and a card reward of rares. The level 3 boss wins the run instead (MAP-54) | 20/60 → 38/60. 50/60 → 60/60 (not 68). Max 61 → +18 | 4.5 |
| MAP-63 | **Card reward:** `rewards.cardChoices` (3) **different** cards of the given rarity. Starter cards are never offered; cards already in the deck can be. Take 1 or skip | Never two copies of one card in an offer; never Strike, Defend, Ice Shard or Ration | 4.5, 4.8 |
| MAP-64 | **Chest:** gold from `chest.gold` (10–20), plus one of these, equally likely: a card reward of commons, `chest.food` (3) food, or `chest.health` (10) health (not above max) | 3000 seeds → each kind 30–37% | 4.5 |
| MAP-65 | **Village prices:** food `village.foodAmount` (3) for `village.foodPrice` (10) gold; rest `village.restHealth` (+15, not above max) for `village.restPrice` (20) and gives Rested; a card of `village.cardChoices` (3) commons for `village.cardPrice` (25); removal for `village.removalPrice` (30) | 20 gold → rest leaves 0; food then unavailable | 4.5 |
| MAP-66 | Gold never goes below 0. Anything the player can't pay is unavailable (disabled), not partly paid | 24 gold → the card (25) is disabled, food (10) is available | 4.2 |
| MAP-67 | Rest is unavailable at full health. Removal is unavailable when the deck has `village.smallestDeck` (8) cards | 60/60 → Rest disabled. 8 cards → Remove disabled; 9 cards → available, and the deck goes to 8 | 4.5 |
| MAP-68 | **Shrine:** pick 1 of `shrine.choices` (3) different blessings the player doesn't own; no skip. Fewer left: offer the rest. None left: heal `shrine.healWhenEmpty` (10) | Own all but 2 → offer of 2. Own all → +10 health | 4.5 |
| MAP-69 | **Mystery:** an event that hasn't come up in this run (Q-M3). A choice is unavailable if its cost can't be paid or its health cost would bring health to 0 | 5 health, choice "lose 5 health" → disabled with "Would kill you"; 6 health → available | 4.5 |
| MAP-70 | **Bounty** (stage 2 village screen, rule from now): marks one unresolved monster or elite tile of this level at random; winning that fight before the boss fight pays `bountyGold` (40). One at a time; it fails when the boss fight starts (Q-M4) | Take a bounty, win the marked fight → +40 gold on top of the fight's gold | 4.5 |

## Open questions for the PM

Tests use the suggested answer until the PM answers. Each question is 1 line in `plan/reviews/`.

| ID | Rule | Question | Suggested answer |
|---|---|---|---|
| Q-M1 | MAP-21, MAP-15 | A lava step with no food left loses health twice (hunger 3, lava 4). If that kills, which cause is shown? | Hunger is paid first, then lava. The cause is the one that brought health to 0 |
| Q-M2 | MAP-34 | Does the walk stop on a locked chest entered without a key? | Yes, it's a location, so the walk stops; the chest stays locked |
| Q-M3 | MAP-69 | An event dealt in a level attempt the player then lost: has it "come up" this run? | Only an event the player actually opened counts. A retry may deal unseen events again |
| Q-M4 | MAP-70 | No unresolved monster or elite left on the level: can a bounty still be taken? | No, "Take a bounty" is disabled |
| Q-M5 | MAP-23, MAP-52 | Chilled or Rested picked up, then the player dies: does the retry keep it? | No. The retry restores the level start, when the player had neither |
| Q-M6 | MAP-60, MAP-64 | Are gold ranges whole numbers, inclusive, all equally likely? | Yes: 10–15 means 10, 11, 12, 13, 14 or 15 |
| Q-M7 | MAP-07 | Can two monster tiles of one level deal the same enemy? | Yes, but the deal prefers enemies not yet dealt on this level, so a level shows variety |
