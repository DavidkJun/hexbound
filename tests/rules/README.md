# Testable rules

Owner: Tester. The PM's rules (`plan/HexBound_DD.md` → 4) turned into exact, checkable statements, each with an ID, a given → when → then check, and its source. The programmer builds from them; the tester's tests name the rule they check.

| File | Rules | Task | Automated in |
|---|---|---|---|
| [`stage-1-map.md`](stage-1-map.md) | MAP-01 – MAP-70: run, levels, steps, food, hazards, locations, visibility, death and score, rewards | #25 | [`../stage-1/run-map.test.ts`](../stage-1/run-map.test.ts) |
| [`stage-1-combat.md`](stage-1-combat.md) | FIGHT-01 – FIGHT-90: fight start, turns, draw, damage, block, keywords, intent, fight end, tutorial, fight length | #26 | [`../stage-1/combat.test.ts`](../stage-1/combat.test.ts) |

**Open questions for the PM** are at the end of each file (Q-M1–Q-M7, Q-C1–Q-C5), each with a suggested answer. The tests use the suggested answer until the PM decides.
