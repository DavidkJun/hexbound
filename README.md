# Hexbound

Single-player, turn-based fantasy roguelite for the browser: cross a hand-made 9×7 hex map, pick a route, fight with a deck of cards. University team project.

- **Play the latest build:** https://davidkjun.github.io/hexbound/ (every merge to `main` deploys here)
- **Design:** [`plan/HexBound_DD.pdf`](plan/HexBound_DD.pdf) (what the game is), [`design/`](design/README.md) (how it looks), [Figma](https://www.figma.com/design/1meb36Hx2PgO7MkSCFxt55)
- **Plan:** [`plan/HexBound_Team_Plan.md`](plan/HexBound_Team_Plan.md)
- **Task board:** not decided yet, the PM will link it here
- **Bugs:** [open an issue](https://github.com/DavidkJun/hexbound/issues/new?template=bug_report.yml)

## Run it

You need [Node.js](https://nodejs.org) 24, the version CI uses: with nvm, run `nvm use`. Node 22.13 or newer on the 22 line also works. On a version the project can't run on, `npm install` stops and says which one it needs.

```sh
npm install
npm run dev
```

Then open the link it prints. Add `?seed=123` to the URL to replay a run: the same seed always deals the same game. The current build and seed are in the bottom-left corner.

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Runs the game locally, reloads on every save |
| `npm run check`      | Everything CI checks: run it before a PR     |
| `npm run check:data` | Checks only the files in `data/`             |
| `npm test`           | Unit tests                                   |
| `npm run format`     | Formats the code with Prettier               |
| `npm run build`      | Production build in `dist/`                  |

## Tech stack

**TypeScript, Vite and Preact, with the hex map in SVG.** Most of the game is UI (cards, shops, menus) and nothing moves fast, so HTML and CSS fit better than a game framework, and they are the quickest way for the programmer and the UI designer to work in one project. Preact is a small library with the React API, so screens are components named after the design spec (`TopBar`, `EndTurnButton`). Zod checks data files and gives us their TypeScript types from one definition.

## Structure

```
src/
  core/      Game state and rules. Plain code that knows nothing about the screen.
  data/      Loading and checking data files.
  screens/   One folder per screen.
  ui/        Shared by screens: canvas scaling, tokens and layout, text, useGame().
  main.tsx   Starts the game.
data/        Cards, enemies, blessings, events, levels. See data/README.md.
design/      UI rules, tokens, layout, screen specs. See design/README.md.
assets/      Icons, art, fonts.
scripts/     Command-line tools.
```

Three rules keep it this way. The first two are enforced by ESLint:

1. **`core/` never touches the screen.** It can't import from `screens/` or `ui/`, or use the DOM. That keeps it testable, and the stage 3 fight simulator is just `core/` in a loop.
2. **One seeded random generator.** Everything random goes through `core/rng.ts`, and its state lives in the game state. `Math.random` is banned.
3. **Text and numbers live in data files,** not in code. Colours and sizes live in `design/tokens.json`.

## How screens work with the game

A screen reads the game state and sends actions. It never changes the state, and the types won't let it: everything in the state is `readonly`.

```tsx
function GoButton() {
  const { state, dispatch, content } = useGame();
  const run = state.run;
  if (run?.phase.kind !== 'map') return null;
  return <button onClick={() => dispatch({ type: 'go' })}>{t('map.go')}</button>;
}
```

`content` holds the checked data files (`content.catalogue.cards.get(id)` for a card's name and text). The game rules are in `src/core/`, and none of them are computed in a screen.

### The state

`state.run` is `null` before a run starts. During a run it holds the player's `health`, `maxHealth`, `gold`, `keys`, `lives` and `deck` (card ids), the current `level`, and the `phase`: what the player is doing now. Each screen shows one phase.

| `run.phase.kind` | Screen                       | What it holds                                                                                                                                                             |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map`            | Map                          | Nothing more; the map is in `run.level`                                                                                                                                   |
| `bossConfirm`    | Map, with the confirm dialog | "Fight the boss now?"                                                                                                                                                     |
| `fight`          | Fight                        | `fight`: the enemy, the player's block, strength, Chill and energy, the hand, draw, discard and exhaust piles, the turn, and `tutorial`; `source`: monster, elite or boss |
| `reward`         | Reward                       | `reward`: the `gold`, `keys`, `health` and `food` already added, the `cards` to pick from, and where the game goes next                                                   |
| `levelWon`       | Level won                    | Nothing more                                                                                                                                                              |
| `dead`           | Run over                     | `cause`: a fight with an enemy id, or starved                                                                                                                             |

`run.level` has the `map`, the `food` left, `playerAt`, the planned `route` (the steps still to walk), and the `locations`. A location has its `type` (always shown), its `detail` (which enemy, or what a chest holds; show it only if `seen`), and `resolved` (show it as visited).

### Actions

| Action                                                  | Phase         | Does                                                                                                                                      |
| ------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `{ type: 'startRun' }`                                  | any           | A new run on the first level                                                                                                              |
| `{ type: 'planRoute', route }`                          | `map`         | Replaces the planned route: the tiles to step on, each next to the one before, the first next to the player. `[]` clears it               |
| `{ type: 'go' }`                                        | `map`         | Walks the route. It stops on an unresolved location, which starts a fight or opens a chest; the rest of the route is kept for the next Go |
| `{ type: 'confirmBoss' }`, `{ type: 'cancelBoss' }`     | `bossConfirm` | Fights the boss, or stays and clears the route                                                                                            |
| `{ type: 'playCard', handIndex }`                       | `fight`       | Plays that card of the hand, if there is energy for it                                                                                    |
| `{ type: 'endTurn' }`                                   | `fight`       | The enemy acts, and the next turn starts                                                                                                  |
| `{ type: 'pickCard', index }`, `{ type: 'skipReward' }` | `reward`      | Takes that card into the deck, or moves on without one                                                                                    |

An action that doesn't fit the phase changes nothing.

### Ready-made answers for screens

- `routeCost(content, level)` from `core/map.ts`: the food and health the planned route costs, step by step, for the preview before Go.
- `intentOf(content, fight)` and `canPlay(content, fight, handIndex)` from `core/fight.ts`: what the enemy's intent shows (the real damage after strength and Chill), and whether a card can be played now.
- `locationAt(level, hex)` from `core/map.ts`: the location on a tile.

Add `?debug` to the URL to print the state as JSON in the browser console after every action, for bug reports. When a screen needs something the state doesn't give yet, ask the programmer.

To build a screen, follow [`design/ui-rules.md`](design/ui-rules.md). In code:

- **Positions:** `rectStyle(layout.MapScreen.HexGrid)`, from `ui/design.ts`.
- **Colours and sizes in CSS:** every token is a variable, so `color.resource.food` is `var(--color-resource-food)` and `text.h1` is `var(--text-h1)`.
- **Colours and sizes in TypeScript:** `tokens.color.resource.food`.
- **Text:** `t('some.key')` with the key in `data/text.json`.

## Contribute

1. Branch from `main`, named `<type>/<scope>`, for example `feat/stage-1-map-screen`. Commits and PR titles follow [Git naming in CLAUDE.md](CLAUDE.md#git-naming).
2. Run `npm run check`.
3. Open a pull request. Another team member reviews every change; the UI / Level designer reviews every screen change.
