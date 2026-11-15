# Hexbound

Single-player, turn-based fantasy roguelite for the browser: cross a hand-made 9×7 hex map, pick a route, fight with a deck of cards. University team project, 4 people, under 2 months.

## Current state

Update this section whenever a stage ends or a decision changes.

- **Stage 0 (kick-off).** See `plan/HexBound_Team_Plan.md` → Stage 0.
- **Programmer stage 0 is done**: TypeScript, Vite and Preact, with the hex map in SVG (`README.md` has the reasons, the structure and how screens work with the game); content data format in `data/README.md`.
  - The build draws the grid of the example map, because there is no real map yet. `src/main.tsx` switches to `data/levels/levels.json` as soon as that file exists.
  - GitHub Pages deploys every merge to `main`. `main` is protected: a pull request with 1 approval and a passing `build` check, for everyone.
  - The game state and actions are only what stage 0 needs. Stage 1 adds to them from the tester's rules.
- **UI / level design stage 0 is done**, in `design/`:
  - fixed UI rules, tokens, layout, map and fight wireframes, the map file format, icons and fonts
  - the visual direction is **approved by the PM**
- **PM stage 0 is done**, in `plan/`:
  - the game rules: `plan/HexBound_DD.md` → 4. Rules, with every number in 4.9. `plan/reviews/stage-0-answers.md` maps each question of the tester's design review to its rule
  - in-game text is **English**, so Cinzel stays the heading font
  - the route intent for map 1: `plan/route-intent.md`
  - the task board: the [Stage 1 milestone](https://github.com/DavidkJun/hexbound/milestone/1), one issue per task with one owner

## Decisions that override the stage briefs

The stage 0 briefs were written before these were decided. Where a brief says otherwise, this list wins:

| Brief says | Decided |
|---|---|
| Programmer defines the map file format (`Stage0_Programmer.txt` §4) | The UI / Level designer defines it: `design/levels/map-format.md`. The programmer writes the loader and the checks listed there. |
| Branch names like `feature/map-movement` (`Stage0_Programmer.txt` §2) | `<type>/<scope>`, e.g. `feat/stage-1`. See **Git naming** below. |
| Screen size, hex orientation, asset folders and names "to be agreed" (both briefs, §5) | Fixed in `design/ui-rules.md`: 1280×720 canvas scaled to fit, flat-top odd-q hexes, `assets/` layout and kebab-case names. |

## Where things are

| Path | What | Owner |
|---|---|---|
| `plan/HexBound_DD.md` | Design document: what the game is, and its rules. `HexBound_DD.pdf` is exported from it | PM / Game designer |
| `plan/reviews/`, `plan/route-intent.md` | PM answers to reviews; what each map's routes must offer | PM / Game designer |
| `plan/HexBound_Team_Plan.md` | Stages, roles, handoffs | PM / Game designer |
| `plan/Stage0_*.txt` | Stage 0 brief for each role | PM / Game designer |
| `design/` | How the game looks: UI rules, tokens, layout, screen specs, map format. Start at `design/README.md` | UI / Level designer |
| `data/levels/` | Map files (JSON) | UI / Level designer |
| `data/cards/`, `enemies/`, `blessings/`, `events/` | Game content (JSON). Format in `data/README.md`, which the programmer owns | PM / Game designer |
| `assets/` | Icons, art, fonts. Icon credits in `assets/icons/CREDITS.md` | UI / Level designer |
| `tools/figma-export/` | Figma plugin that exports `design/tokens.json` and `design/layout.json` | UI / Level designer |
| `src/core/`, `src/data/`, `src/ui/`, `scripts/`, project config | Game logic, data loading, shared UI code, tooling. Unit tests sit next to the code (`*.test.ts`) | Programmer |
| `src/screens/` | One folder per screen | UI / Level designer, with the programmer |
| `tests/` | Test cases and results | Tester |

## Rules for Claude

- **Don't edit files another role owns** (see the table and the team plan). If something in them looks wrong or is missing, say so and suggest the change to the owner instead.
- **Building or changing anything visible on screen:**
  1. Read `design/ui-rules.md`, then the screen's spec in `design/screens/<screen>.md`, and look at `design/screens/<screen>.png`.
  2. Take colours, fonts and sizes only from `design/tokens.json`, and positions from `design/layout.json` (or the spec's rects if the screen isn't in layout.json yet). Never invent a colour, size, position or layout.
  3. Use the element names from the spec (PascalCase) in the code.
  4. If the design doesn't cover something, leave a `TODO(design):` comment and mention it in the pull request. Don't guess.
  5. Before saying a screen is done, run the game, take a screenshot at 1280 × 720, compare it with the PNG, and go through the spec's acceptance checklist.
- **Maps:** follow `design/levels/map-format.md`. Code loads and validates map files; it never changes them.
- **Game rules and content** (numbers, cards, enemies, events) come from the PM's design and the tester's rules, not from screens or maps. Screens read the game state and send actions; they never change the state themselves.
- **Code:** game rules go in `src/core/`, which knows nothing about the screen. Everything random goes through `src/core/rng.ts`. Text the player sees lives in `data/`, never in code.
- **Before saying code is done,** run `npm run check`.
- Every change goes through a pull request reviewed by another team member. Screen changes are reviewed by the UI / Level designer.

## Git naming

Every branch and commit follows these rules. No exceptions.

- **Branch:** `<type>/<scope>`, e.g. `feat/stage-0`, `fix/stage-1`. If one stage needs more than one branch of the same type, add a short kebab-case topic: `feat/stage-1-map-screen`.
- **Commit message:** `<type>(<scope>): <description>`, e.g. `feat(stage-0): add UI/level design setup`, `fix(stage-1): correct food cost on swamp tiles`.
  - `<description>`: lowercase, imperative ("add", not "added"), no full stop, under 72 characters for the whole first line.
  - Details go in the commit body after a blank line.
- **`<type>`** is one of:
  - `feat`: new functionality, content or design
  - `fix`: bug fix
  - `docs`: documentation only
  - `refactor`: code change with no behaviour change
  - `test`: tests or test cases
  - `chore`: tooling, config, dependencies
- **`<scope>`** is the stage the work belongs to: `stage-0` … `stage-5`.
- Pull request titles use the same format as commit messages.
