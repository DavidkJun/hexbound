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
| `text.json`              | All other text on screen: labels, buttons, markers | Whoever adds it     |

Split a folder into as many files as you like, for example `cards/starter.json` and `cards/blade.json`. Ids must be unique across a folder, in kebab-case.

Files starting with `_` are examples or drafts. The check validates them as their own set, but they are never part of the game. **All numbers in the `_example.json` files are placeholders**, not balance decisions. Copy one to start a real file.

## Effects

Cards, enemy moves, blessings and event outcomes all change the game the same way: with a list of effects.

```json
{ "type": "dealDamage", "amount": 6 }
```

| `type`                      | What it does                                                            |
| --------------------------- | ----------------------------------------------------------------------- |
| `dealDamage`                | Damages the opponent; block absorbs it                                  |
| `gainBlock`, `gainEnergy`   | For whoever uses the effect                                             |
| `draw`                      | Draw `amount` cards                                                     |
| `applyFreeze`, `applyChill` | Puts the status on the opponent                                         |
| `exhaust`                   | No `amount`. The card leaves the deck for this fight after it is played |
| `heal`, `loseHealth`        | Changes the player's health; `loseHealth` ignores block                 |
| `gainFood`, `loseFood`      | Changes the player's food                                               |
| `gainGold`, `loseGold`      | Changes the player's gold                                               |

`amount` is a positive whole number. The exact rules for Freeze, Chill and block come from the tester's testable rules, not from this file. If you need an effect that isn't here, ask the programmer; don't work around it in text.

## Card

```json
{
  "id": "ice-shard",
  "name": "Ice Shard",
  "family": "spell",
  "cost": 1,
  "effects": [
    { "type": "dealDamage", "amount": 4 },
    { "type": "applyChill", "amount": 1 }
  ],
  "text": "Deal 4 damage. Apply 1 Chill."
}
```

`family` is `weapon`, `spell`, `armour` or `item`. `cost` is the energy cost and can be 0. `text` is what the card shows, so keep it in step with `effects`.

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
- `intent` picks the icon the player sees: `attack`, `block`, `buff` or `debuff`.
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

## Not in the format yet

These wait for rules from the PM and the tester. Ask the programmer when you get to them: starter deck, card rarity (locked chests hold a rare card), bounties, shop prices, keys and card or blessing rewards as effects, hazard numbers.
