# Hexbound

Single-player, turn-based fantasy roguelite for the browser: cross a hand-made 9×7 hex map, pick a route, fight with a deck of cards. University team project, 4 people, under 2 months.

## Where things are

| Path | What | Owner |
|---|---|---|
| `plan/HexBound_DD.pdf` | Design document: what the game is | PM / Game designer |
| `plan/HexBound_Team_Plan.md` | Stages, roles, handoffs | PM / Game designer |
| `plan/Stage0_*.txt` | Stage 0 brief for each role | PM / Game designer |
| `design/` | How the game looks: UI rules, tokens, layout, screen specs, map format. Start at `design/README.md` | UI / Level designer |
| `data/levels/` | Map files (JSON) | UI / Level designer |
| `tools/figma-export/` | Figma plugin that exports `design/tokens.json` and `design/layout.json` | UI / Level designer |
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
