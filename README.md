# Hexbound

Single-player, turn-based fantasy roguelite for the browser: cross a hand-made 9×7 hex map, pick a route, fight with a deck of cards. University team project.

- **Play the latest build:** https://davidkjun.github.io/hexbound/ (every merge to `main` deploys here)
- **Design:** [`plan/HexBound_DD.pdf`](plan/HexBound_DD.pdf) (what the game is), [`design/`](design/README.md) (how it looks), [Figma](https://www.figma.com/design/1meb36Hx2PgO7MkSCFxt55)
- **Plan:** [`plan/HexBound_Team_Plan.md`](plan/HexBound_Team_Plan.md)
- **Task board:** [Stage 1 milestone](https://github.com/DavidkJun/hexbound/milestone/1), one issue per task with one owner
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
  const { state, dispatch } = useGame();
  // Read from state, send with dispatch({ type: 'someAction', ... }).
}
```

New rules go into `core/reducer.ts`: it takes the current state and an action and returns the new state. When a screen needs something the state doesn't expose yet, ask the programmer. Don't compute rules in a screen.

To build a screen, follow [`design/ui-rules.md`](design/ui-rules.md). In code:

- **Positions:** `rectStyle(layout.MapScreen.HexGrid)`, from `ui/design.ts`.
- **Colours and sizes in CSS:** every token is a variable, so `color.resource.food` is `var(--color-resource-food)` and `text.h1` is `var(--text-h1)`.
- **Colours and sizes in TypeScript:** `tokens.color.resource.food`.
- **Text:** `t('some.key')` with the key in `data/text.json`.

## Contribute

1. Branch from `main`, named `<type>/<scope>`, for example `feat/stage-1-map-screen`. Commits and PR titles follow [Git naming in CLAUDE.md](CLAUDE.md#git-naming).
2. Run `npm run check`.
3. Open a pull request. Another team member reviews every change; the UI / Level designer reviews every screen change.
