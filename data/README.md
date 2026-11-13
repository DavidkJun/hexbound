# Data files

All game content lives here as JSON, so it can be balanced without touching code. The game checks every file when it starts. Run the same check yourself after an edit:

```sh
npm run check:data
```

A bad file gives a message with the file, the field and the problem, in the terminal and full-screen in the game.

## Files

| Path                     | Holds                                              | Owner               |
| ------------------------ | -------------------------------------------------- | ------------------- |
| `cards/*.json`           | A list of cards                                    | PM / Game designer  |
| `enemies/*.json`         | A list of enemies                                  | PM / Game designer  |
| `blessings/*.json`       | A list of blessings                                | PM / Game designer  |
| `events/*.json`          | A list of events                                   | PM / Game designer  |
| `levels/<level-id>.json` | One map: [format](../design/levels/map-format.md)  | UI / Level designer |
| `levels/levels.json`     | Which levels the game plays, in order, each once   | UI / Level designer |
| `tutorial/tutorial.json` | The first fight of a new run                       | PM / Game designer  |
| `numbers.json`           | Every number of the rules (DD 4.9)                 | PM / Game designer  |
| `text.json`              | All other text on screen: labels, buttons, markers | Whoever adds it     |

Split a folder into as many files as you like, for example `cards/starter.json` and `cards/blade.json`. Ids must be unique across a folder, in kebab-case.

Files starting with `_` are examples or drafts. The check validates them as their own set, but they are never part of the game. **All numbers in the `_example.json` files are placeholders**, not balance decisions. Copy one to start a real file. `numbers.json` is the one file both sets share, and its values are the real ones from the design document.

## Effects

Cards, enemy moves, blessings and event outcomes all change the game the same way: with a list of effects.

```json
{ "type": "dealDamage", "amount": 6 }
```

| `type`                    | What it does                                                            |
| ------------------------- | ----------------------------------------------------------------------- |
| `dealDamage`              | Damages the opponent; block absorbs it                                  |
| `gainBlock`, `gainEnergy` | For whoever uses the effect                                             |
| `draw`                    | Draw `amount` cards                                                     |
| `gainStrength`            | `amount` more damage on each attack, for the rest of the fight          |
| `applyFreeze`             | No `amount`, it doesn't stack. The enemy skips its next move            |
| `applyChill`              | Puts Chill on the opponent                                              |
| `exhaust`                 | No `amount`. The card leaves the deck for this fight after it is played |
| `heal`, `loseHealth`      | Changes the player's health; `loseHealth` ignores block                 |
| `gainFood`, `loseFood`    | Changes the player's food                                               |
| `gainGold`, `loseGold`    | Changes the player's gold                                               |

`amount` is a positive whole number. The rules for each effect are in `plan/HexBound_DD.md` 4.6 and 4.7. Two of them are checked here: **a card that applies Freeze also has `exhaust`**, and **enemy moves never apply Freeze**. If you need an effect that isn't here, ask the programmer; don't work around it in text.

## Card

```json
{
  "id": "ice-shard",
  "name": "Ice Shard",
  "family": "spell",
  "rarity": "starter",
  "copies": 1,
  "cost": 1,
  "effects": [
    { "type": "dealDamage", "amount": 4 },
    { "type": "applyChill", "amount": 1 }
  ],
  "text": "Deal 4 damage. Apply 1 Chill."
}
```

- `family` is `weapon`, `spell`, `armour` or `item`.
- `rarity` is `starter`, `common` or `rare`. Rewards never offer starter cards.
- **The starter deck is every card with rarity `starter`,** and `copies` says how many of it the deck holds. Only starter cards have `copies`. A set with cards needs at least one starter card.
- `cost` is the energy cost and can be 0.
- `text` is what the card shows, so keep it in step with `effects`.

## Enemy

```json
{
  "id": "goblin-chief",
  "name": "Goblin chief",
  "kind": "boss",
  "health": 90,
  "moves": [
    {
      "id": "cleave",
      "name": "Cleave",
      "intent": "attack",
      "effects": [{ "type": "dealDamage", "amount": 12 }]
    },
    {
      "id": "rally",
      "name": "Rally",
      "intent": "buff",
      "effects": [{ "type": "gainBlock", "amount": 15 }]
    }
  ],
  "pattern": { "type": "cycle", "order": ["cleave", "cleave", "rally"] },
  "signature": { "move": "rally", "text": "Rally: gains a wall of block every 3rd turn." }
}
```

- `kind`: `normal`, `elite` or `boss`.
- `moves`: each `id` is used once within the enemy, because `pattern` and `signature` refer to moves by id.
- `intent` picks the icon the player sees: `attack`, `block`, `buff` or `debuff`. A `buff` is `gainStrength` (DD 4.7).
- `pattern` picks the next move. `cycle` repeats `order`. `random` uses weights: `{ "type": "random", "weights": { "touch": 2, "numb": 1 } }` makes `touch` twice as likely. `weights` needs at least one move.
- `signature` is required on a boss. Its `text` is shown on the map from the start of the level.

## Blessing

```json
{
  "id": "iron-skin",
  "name": "Iron skin",
  "text": "Start each fight with 3 block.",
  "trigger": "fightStart",
  "effects": [{ "type": "gainBlock", "amount": 3 }]
}
```

`trigger` says when the effects happen: `onPickup`, `levelStart`, `fightStart` or `turnStart`.

## Event

```json
{
  "id": "old-well",
  "name": "The old well",
  "text": "A coin glints at the bottom of a mossy well. Something moves below it.",
  "choices": [
    {
      "label": "Reach in",
      "cost": { "health": 3 },
      "outcomes": [
        {
          "chance": 50,
          "text": "You pull out a heavy purse.",
          "effects": [{ "type": "gainGold", "amount": 30 }]
        },
        { "chance": 50, "text": "Only cold water and a bite on the hand.", "effects": [] }
      ]
    },
    {
      "label": "Walk on",
      "outcomes": [{ "chance": 100, "text": "You leave the well behind.", "effects": [] }]
    }
  ]
}
```

An event has at least two choices. `cost` is optional and can hold `gold`, `food` and `health`. `chance` is a percentage, and the chances of a choice must add up to 100; how they are shown as dice is still an open question for the PM.

## Tutorial

The scripted first fight of a new run (DD 4.8). One file, `tutorial/tutorial.json`; the game plays without one until it exists.

```json
{
  "enemy": "bog-rat",
  "drawOrder": [
    "strike",
    "strike",
    "defend",
    "defend",
    "strike",
    "ice-shard",
    "defend",
    "strike",
    "defend",
    "ration"
  ],
  "hints": {
    "intent": "The icon above the enemy shows what it does next.",
    "energy": "Each card costs energy. You get new energy every turn.",
    "block": "Block absorbs damage until your next turn.",
    "endTurn": "Press End turn when you have played your cards."
  }
}
```

- `enemy` is a `normal` enemy.
- `drawOrder` is the order of the first draws, so the first two hands are its first 10 cards. Only starter cards, each at most as often as its `copies`.
- `hints` are the four texts the tutorial shows. Where and when they appear is the UI / Level designer's part.

## Numbers

`numbers.json` holds every number of DD 4.9, so the PM and the tester can tune them in stage 3 without code. Every value is a positive whole number (gold at the start can be 0), and a range is `{ "min": 10, "max": 15 }`.

| Field                           | What                                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run`                           | `health` and `maxHealth` at the start of the run, starting `gold`, `lives`                                                                                                  |
| `food.healthPerMissingFood`     | Health lost for each food a step can't pay for                                                                                                                              |
| `fight`                         | `energyPerTurn`, `cardsPerTurn`, `handLimit`                                                                                                                                |
| `rewards`                       | `cardChoices` in a card reward, `monsterGold` range, `eliteGold`, `eliteKeys`, `bossGold`, `bossHealPercent`                                                                |
| `hazards`                       | `lavaDamage` per tile, `iceChill` in the next fight                                                                                                                         |
| `chest`                         | `gold` range, and the `food` or `health` it can give                                                                                                                        |
| `village`                       | food: `foodAmount` for `foodPrice`; rest: `restHealth` for `restPrice`, then `restedBlock` in the next fight; `cardChoices` and `cardPrice`; `removalPrice`; `smallestDeck` |
| `bountyGold`, `shrine`, `score` | The bounty's gold; the shrine's `choices` and `healWhenEmpty`; the score per level cleared, health, gold and life left                                                      |

Food per step (1, or 2 onto a slow tile) is part of the map format, so it isn't here.

## Not in the format yet

For stage 2, when the PM writes events and blessings: `gainKey`, a card reward with a rarity, a random blessing, and `gainMaxHealth`. Ask the programmer when you get to them.
