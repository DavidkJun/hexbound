# Testable rules: combat and keywords

Owner: Tester. For: the programmer (#31, PR #39), the UI / Level designer (#34) and the PM (questions at the end). Task #26.

**Source:** the PM's rules, `plan/HexBound_DD.md` → 4.6–4.8 (PR #21), and `data/numbers.json` (PR #37).

**How to read it:** as in [`stage-1-map.md`](stage-1-map.md). Rules are `FIGHT-nn`; open edge cases are **(Q-Cn)**, listed at the end with a suggested answer.

**Notation:**

- **E** = energy, **B** = block, **H** = health.
- "Strike 6" = a card with `dealDamage 6`.
- The examples use the starter cards:
    - Strike: 1 energy, deal 6
    - Defend: 1 energy, gain 5 block
    - Ice Shard: 1 energy, deal 4, apply Chill 1
    - Ration: 0 energy, gain 2 food, Exhaust
- The example enemy is the Bog rat: 20 H, cycle bite 8 → bite 8 → burrow (block 5).

## 1. Fight start

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-01 | Every fight is against one enemy; nothing is summoned | No move or effect adds a second enemy | 4.6 |
| FIGHT-02 | At fight start the whole deck is shuffled into the draw pile with the run's random generator. Discard and exhaust piles are empty, the hand is empty | Deck of 10 → draw pile 10 before the first draw; same seed, same order | 4.6 |
| FIGHT-03 | Fight modifiers apply at fight start: **Chilled** gives the player Chill `hazards.iceChill` (1); **Rested** gives `village.restedBlock` (5) block. `fightStart` blessings apply too. The modifier row shows each | Chilled + Rested → turn 1 has E 2/3 and B 5 | 4.4, 4.6 |
| FIGHT-04 | The **starter deck** (10 cards) is 4 Strike, 4 Defend, 1 Ice Shard and 1 Ration, all with rarity `starter` | New run → exactly these 10 | 4.8 |

## 2. Player turn

The order inside a player turn is fixed (DD 4.6):

1. block reset
2. energy
3. draw 5 and `turnStart` blessings
4. the enemy's intent
5. play cards
6. End turn: discard the hand, unused energy is lost

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-10 | Step 1: the player's block resets to 0 at the start of every player turn **except the first**, where block from the fight start is kept | Rested 5 B; turn 1 → 5 B. Defend on turn 1, End turn, the enemy doesn't attack → turn 2 starts with 0 B | 4.6 |
| FIGHT-11 | Step 2: energy is set to `fight.energyPerTurn` (3) minus the player's Chill, never below 0. Then the player's Chill is removed | Chill 1 → E 2/3, Chill 0 after. Chill 4 → E 0/3 | 4.6, 4.7 |
| FIGHT-12 | Step 3: draw `fight.cardsPerTurn` (5) cards | Turn start → 5 cards in hand | 4.6 |
| FIGHT-13 | Step 4: the enemy's next move is chosen now and shown as its intent: `cycle` takes the next move in `order`, looping; `random` picks by `weights` with the run's generator | Bog rat: turn 1 bite, turn 2 bite, turn 3 burrow, turn 4 bite | 4.6 |
| FIGHT-14 | A card can be played only if its cost ≤ current energy; playing it subtracts the cost and applies its effects in the order written | 1 E: Strike playable, playing it → 0 E. 0 E: Strike disabled, Ration (0) playable | 4.6 |
| FIGHT-15 | A played card goes to the discard pile, unless it has Exhaust (FIGHT-52) | Play Strike → discard +1 | 4.6, 4.7 |
| FIGHT-16 | End turn: every card left in hand goes to the discard pile; unused energy is lost | 3 cards in hand, 1 E left, End turn → discard +3, next turn E 3/3 (not 4) | 4.6 |
| FIGHT-17 | `gainEnergy` can take energy above `fight.energyPerTurn` for that turn, shown as e.g. 4/3; it doesn't carry over | 3 E, gainEnergy 1 → 4/3; next turn 3/3 | 4.6 |

## 3. Draw, hand and reshuffle

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-20 | The hand holds at most `fight.handLimit` (10) cards. A card drawn into a full hand goes straight to the discard pile | 10 cards in hand, Draw 2 → hand 10, discard +2 | 4.6 |
| FIGHT-21 | Drawing from an empty draw pile first shuffles the whole discard pile into the draw pile (run's generator), then draws | Draw 0, discard 6, draw 5 → draw 1, hand +5, discard 0 | 4.6 |
| FIGHT-22 | If both the draw and the discard pile are empty, nothing is drawn and nothing else happens | Draw 0, discard 0, Draw 2 → hand unchanged | 4.6 |
| FIGHT-23 | A turn-start draw that empties the pile midway reshuffles midway: draw what is there, reshuffle, draw the rest | Draw 2, discard 5, turn start → 2 drawn, reshuffle, 3 drawn; draw pile 2 | 4.6 |
| FIGHT-24 | Exhausted cards are never reshuffled; they stay out until the fight ends | Exhaust Ration, reshuffle → Ration not in the draw pile | 4.6 |

## 4. Damage and block

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-30 | **Damage** of a `dealDamage` effect = its amount + the attacker's strength − the attacker's Chill (**only for enemies**), never below 0 | Bog rat bite 8 with Chill 1 → 7. With strength 2 and Chill 1 → 9. Bite 8 with Chill 9 → 0 | 4.6, 4.7 |
| FIGHT-31 | The player's Chill never lowers the player's damage; it only lowers energy (FIGHT-11) | Player with Chill 1 plays Strike → 6 | 4.7 |
| FIGHT-32 | Block absorbs damage first; the rest comes off health | 5 B, take 8 → 0 B, H −3. 10 B, take 8 → 2 B, H unchanged | 4.6 |
| FIGHT-33 | `loseHealth` ignores block | 5 B, loseHealth 3 → 5 B, H −3 | 4.6 |
| FIGHT-34 | `gainBlock` adds up within a turn | Defend + Defend → 10 B | 4.6 |
| FIGHT-35 | The enemy's block resets to 0 at the start of the enemy's turn, so block it gains on its turn protects it during the player's next turn | Bog rat burrows (5 B) → on the player's turn, Strike → 0 B, H −1 | 4.6 |
| FIGHT-36 | Healing never goes above max health (`heal`) | 58/60, heal 5 → 60/60 | 4.2 |

## 5. Enemy turn

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-41 | Enemy turn: (1) its block resets to 0; (2) if frozen, it skips its move; otherwise it does the move it showed, with FIGHT-30 damage; (3) its Chill goes down by 1 (not below 0) | Bog rat with Chill 2 bites → 6 damage, Chill 1 after | 4.6 |
| FIGHT-42 | The move done is always the move shown as the intent at the start of the player's turn | Intent "bite 8" → the enemy bites, never burrows instead | 4.6 |

## 6. Keywords and statuses

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-50 | **Freeze:** the enemy skips its next move, and its pattern moves on past it. Freeze doesn't stack: a second Freeze before the enemy's turn does nothing more | Bog rat shows bite (turn 1), frozen → no damage on its turn; turn 2 intent is the 2nd bite (the skipped move counts as used) | 4.7 |
| FIGHT-51 | Only the player applies Freeze: no enemy move applies it, and every card that applies Freeze also has Exhaust (both checked by the data loader) | A data file with an enemy move `applyFreeze` → data error | 4.7 |
| FIGHT-52 | **Exhaust:** after the card is played it goes to the exhaust pile, not the discard pile, for the rest of the fight. Exhausted cards return to the deck after the fight | Play Ration → exhaust pile 1; next fight Ration is in the deck again | 4.7 |
| FIGHT-53 | **Chill on the enemy:** each of its attacks deals 1 less per Chill (FIGHT-30); at the end of its turn its Chill goes down by 1; Chill adds up | Ice Shard twice → Chill 2; its turn: bite 8 → 6, then Chill 1 | 4.7 |
| FIGHT-54 | **Chill on the player:** the next turn has 1 less energy per Chill (not below 0), then the player's Chill is removed; Chill adds up | Chill 2 from enemy debuffs → next turn E 1/3, then Chill 0 | 4.7 |
| FIGHT-55 | **Draw N:** draw N cards now; FIGHT-20 to FIGHT-22 apply | 9 cards in hand, Draw 2 → hand 10, discard +1 | 4.7 |
| FIGHT-56 | **Strength** (`gainStrength N`): +N damage on each of that side's attacks for the rest of the fight; it adds up. An enemy's buff intent is its strength gain (Q-C2) | Enemy gains strength 2 twice → bite 8 deals 12 | 4.7 |

## 7. Intent

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-60 | The intent shows the move's `intent` icon and: for an attack, the damage it will really deal (after strength and Chill, FIGHT-30); for a block, the block; for a buff or debuff, the amount. Each extra effect of the move is a small icon after the value | Bite 8, enemy Chill 1 → intent "7" | 4.7 |
| FIGHT-61 | The intent value is kept up to date during the player's turn (Q-C1) | Intent 8, play Ice Shard (Chill 1) → intent shows 7 at once | 4.7 |
| FIGHT-62 | A frozen enemy's intent shows that it will skip its move (designed look: UI) | Freeze → `EnemyIntent` shows the frozen state, no damage number | 4.7 |

## 8. Fight end

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-70 | The fight ends the moment either side reaches 0 health, even in the middle of a turn or a card. The rest of the card's effects and the rest of the turn don't happen (Q-C3) | Enemy at 6 H, Strike 6 → won at once; cards left in hand are not played | 4.6 |
| FIGHT-71 | Overkill and exact kills both win; health is never shown below 0 | Enemy 6 H: Strike 6 → won, 0 H. Enemy 4 H: Strike 6 → won, 0 H | 4.6 |
| FIGHT-72 | After a fight: block, statuses (Chill, Freeze), strength and energy are cleared, and exhausted cards return to the deck. Health and food stay as they are | Win with 7 B and Chill 1 → map: no block, no Chill; Ration back in the deck | 4.6 |
| FIGHT-73 | The player losing a fight is a death with cause "Fight: &lt;enemy name&gt;" (MAP-50) | Lose to the Bog rat → "Fight: Bog rat" | 4.1 |

## 9. Tutorial

| ID | Rule | Check | DD |
|---|---|---|---|
| FIGHT-80 | The first fight of a new run on level 1 is the tutorial: whichever **monster** tile the player enters first, its enemy is the tutorial enemy (Q-C4) | New run, first monster at [2,5] or [1,4] → tutorial enemy in both cases | 4.8 |
| FIGHT-81 | The first two hands of the tutorial are fixed by the scripted draw order; from the third hand the draw is random (run's generator) | Two runs with different seeds → hands 1 and 2 identical, hand 3 differs | 4.8 |
| FIGHT-82 | The tutorial shows the hints for intent, energy, block and End turn | Each hint appears once in the tutorial fight | 4.8 |
| FIGHT-83 | A retry never repeats the tutorial; a new run does | Die in level 1 after the tutorial → retry: the first monster is a normal enemy | 4.8 |

## 10. Fight length (for #28)

| ID | Rule | How it's measured | DD |
|---|---|---|---|
| FIGHT-90 | A normal fight lasts 2–4 player turns, a boss fight 6–10, with the starter deck plus the cards picked on level 1 | The fight simulator (stage 3) or a scripted greedy player, 100 seeds per enemy: median turns per enemy | 4.6 |

## Open questions for the PM

| ID | Rule | Question | Suggested answer |
|---|---|---|---|
| Q-C1 | FIGHT-61 | When the player applies Chill (or the enemy gains strength) during the player's turn, does the intent number update at once? | Yes: the intent always shows what the enemy will really deal |
| Q-C2 | FIGHT-56, FIGHT-30 | A card or move with two `dealDamage` effects: does strength (and enemy Chill) apply to each? | Yes, per `dealDamage` effect: each one is an attack |
| Q-C3 | FIGHT-70 | If one card brings both sides to 0 (e.g. damage plus `loseHealth` on the player), who wins? | Effects resolve in order, and the fight ends at the first 0, so the side hit first loses |
| Q-C4 | FIGHT-80 | If the first fight of the run is an **elite** (the player walks to the elite first), is that the tutorial? | No. The tutorial is the first **monster** fight; route intent rule 2 makes a monster come first on every route anyway |
| Q-C5 | FIGHT-02, FIGHT-81 | Does the scripted draw order replace the fight-start shuffle only for the first 10 draws, with the rest of the deck shuffled? | Yes: the script fixes the first 10 cards; the shuffle covers what is left |
