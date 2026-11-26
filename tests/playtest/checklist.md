# Playtest checklist

Owner: Tester. For: everyone who runs or watches a playtest (first used at the end of stage 1). Stage 0, task 3 of `plan/Stage0_Tester.txt`.

**How to use it:**

1. One observer per player, who doesn't help.
2. The observer notes the answers to the **W** (watch) questions during the run. The **A** (ask) questions are asked after.
3. Every run goes in [`playtest-log.csv`](playtest-log.csv), one row per level played.
4. Note the build and seed from the bottom-left corner first, so any odd moment can be replayed.

## Pillar 1: The route is the main decision

| ID | Question | How | Pass if |
|---|---|---|---|
| P1-1 | Did the player look at more than one route (hover or plan, then clear or change) before the first Go? | W: count route plans before the first Go | ≥ 2 routes looked at, on ≥ 70% of levels |
| P1-2 | Did different routes lead to a noticeably different state at the boss? | Log: health, food, gold and deck size at the boss, by route | Average health or gold at the boss differs by ≥ 20% between routes |
| P1-3 | Could the player say why they chose their route? | A: "Why that way?" | The answer names a trade-off (food, risk, reward), not "random" |

## Pillar 2: The map feeds the fight

| ID | Question | How | Pass if |
|---|---|---|---|
| P2-1 | Did the player notice that a hazard or a visited place changed the next fight? | W: do they look at `FightModifiers`? A: "Was this fight different? Why?" | ≥ 1 of 2 noticed per level, unprompted |
| P2-2 | Did a hazard change the route plan (avoided, or crossed on purpose)? | W: the route vs hazard tiles | The player can say whether they avoided the hazard or crossed it on purpose |

## Pillar 3: Few rules, real choices

| ID | Question | How | Pass if |
|---|---|---|---|
| P3-1 | On each screen (card reward, village, shrine, event), were at least two options really considered? | W: hesitation, hover, back-and-forth | ≥ 2 options looked at on ≥ 80% of the screens |
| P3-2 | Was any option always the right one? | Log the choices across all players | No option is picked > 80% of the time when offered |
| P3-3 | Did the player have to ask what a keyword does more than once? | W: questions; hovering keyword tooltips | ≤ 1 question per keyword per player |

## Pillar 4: Growth you chose

| ID | Question | How | Pass if |
|---|---|---|---|
| P4-1 | By level 3, can the player say what their deck is built around? | A: "What is your deck about?" | Names a direction (Blade / Arcane / Bulwark or a keyword) |
| P4-2 | Did they remove or skip cards on purpose? | Log card removals and reward skips | ≥ 1 deliberate removal or skip per run |

## Measurable targets (from the design document)

| ID | Target | Measured as | Pass if |
|---|---|---|---|
| P-T1 | A full run takes 35–45 minutes | Stopwatch from New run to the end screen (column `run_minutes`) | The median of all runs is 35–45 |
| P-T2 | A normal fight lasts 2–4 turns, a boss fight 6–10 | `fight_turns` per fight | ≥ 80% of normal fights in 2–4; bosses in 6–10 |
| P-T3 | Food on each level covers the direct route + about 3 spare steps | `food_left` at the boss on the direct route | 1–5 left (also checked in code by TC-LVL-02) |
| P-T4 | Gold on each level pays for about two village purchases | `gold_at_village` vs prices | 2 purchases affordable at the first village, ±1 |
| P-T5 | No single route always wins | Route vs `reached_boss` / `beat_boss` | Each of direct / safe / rich wins ≥ 1 run and loses ≥ 1 run |

## After each playtest

- [ ] Every run is logged in `playtest-log.csv`, with build and seed
- [ ] Bugs are filed (template fields: build and seed, steps, expected, actual)
- [ ] The results summary goes to the PM: targets met or not, the top 3 surprises
- [ ] Readability problems go to the UI / Level designer
