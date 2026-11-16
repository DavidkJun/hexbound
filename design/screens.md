# Screen list

Owner: UI / Level designer. Every screen in the game, what it shows and what the player can do there. "Stage" means when it gets designed and built. A screen with a spec has a page in [`screens/`](screens/) and a frame in Figma → Screens.

Some states below come from the PM's rule answers. They are marked with the question's ID; the answers are in [`plan/reviews/stage-0-answers.md`](../plan/reviews/stage-0-answers.md) and the rules in `plan/HexBound_DD.md` → 4.

## Always on screen: `TopBar`

Shown on Map, Fight, Village, Shrine, Mystery event, Chest and Card reward. 1280 × 56 at the top.
Left to right:
- `HealthChip` (current/max), `FoodChip`, `GoldChip`, `LivesChip`, `KeysChip`
- `BlessingsRow`: 124 wide, room for **4 slots**: `size.icon.blessing` (28) icons with `space.xs` gaps, hover shows a blessing's text. It never grows: with 5 or more blessings, the 4th slot is a "+N" pill (`text.small`, `color.text.muted`), and hovering it lists the rest
- `LevelName`: Cinzel `text.h3`, centred in the remaining space
- `DeckButton`: shows the card count, opens Deck view
- `MenuButton`: opens the Pause menu

Layout (exact rects in `layout.json`):
- background `color.bg.panel`, padding 16 left and right, a `space.md` (12) gap between items, everything vertically centred
- chips: padding 8/12 (8 on the left), radius `radius.md`, background `color.bg.raised`, a `size.icon.sm` icon, a `space.sm` gap, and the number in Inter Bold `text.body`
- the two buttons are the secondary `Button`, `size.button.height` high, on the right

## Screens

| Screen | Shows | Player can | Stage | Spec |
|---|---|---|---|---|
| Main menu | Title; a footer line with the icon credits ("Icons by Lorc, Delapouite, Skoll and Faithtoken from game-icons.net, CC BY 3.0") and a Credits link | New run, continue (if saving is added), credits | 1 | — |
| Credits | Fonts, icon authors (CC BY), team | Back | **1** (the icons are public from the first deployed build) | — |
| Level intro | Level name, land art, hazard and what it does, boss and its signature move | Start the level | 1 | — |
| **Map** | 9×7 hex grid, player, location icons, planned route and its food cost, details within 2 tiles, boss panel | Plan a route, move, open deck | 1 | [map.md](screens/map.md) |
| **Fight** | Enemy with intent, health, block and status; boss signature in boss fights; player health, block and status; energy; hand; draw, discard and exhaust piles; map effects on this fight | Play cards, end turn, look at piles | 1 | [fight.md](screens/fight.md) |
| Card reward | 3 cards to pick from, gold won; after an elite also "+1 key" (one of the 3 cards is rare); after the boss 40 gold, the healing received (30% of max health) and 3 rare cards | Pick 1 card or skip | 1 | — |
| Tutorial hints | Short hint bubbles pointing at one element at a time, first fight only | Next / dismiss | 1 | — |
| Deck view (overlay) | All cards in the deck, grouped by family | Close; in Village removal mode, pick a card to remove | 1 | — |
| Confirm dialog (overlay) | A title, one line of text, two buttons. Used for the boss tile, Restart level and other actions that can't be undone | Confirm (primary button) or cancel (secondary) | 1 | — |
| Death and retry | Cause of death, lives left | Spend a life to retry the level | 1 | — |
| Level complete | Level summary (fights, gold, cards taken) | Continue to the next level intro | 1 | — |
| Chest | Contents: gold plus a card, food or healing | Take | 2 | — |
| Locked chest | Rare card and blessing; key needed | Open with a key, or leave | 2 | — |
| Village | Buy food, rest (heal), buy cards, remove a card, bounty board; prices and gold left | Buy, rest, remove, take a bounty, leave | 2 | — |
| Shrine | 3 blessings | Pick 1 | 2 | — |
| Mystery event | Event text; choices with cost and odds on the buttons | Pick a choice | 2 | — |
| Event result | What happened, dice roll, what changed | Continue | 2 | — |
| Run over / score | Win or loss, score breakdown, run stats | New run, main menu | 2 | — |
| Pause menu (overlay) | — | Resume, restart level, quit to menu | 2 | — |

### Confirm dialog

- **Backdrop:** a full-canvas `color.bg.base` at `opacity.backdrop`.
- **Panel:** `size.dialog.width` wide, centred on the canvas, fill `color.bg.panel`, radius `radius.lg`, padding `space.xl`, a `space.lg` gap between rows.
- **Title:** Cinzel `text.h3`, `color.text.primary`.
- **Text:** `text.body`, `color.text.muted`.
- **Buttons:** right-aligned, with a `space.sm` gap. The secondary button (cancel) comes first and the primary (confirm) last.
- **Keys:** Esc cancels, Enter confirms.

## System screens

These are drawn by the shared UI code, not by a game screen. They use the same tokens.

| Name | Where and how it looks |
|---|---|
| `BuildInfo` | On every screen, bottom-left: `space.sm` from the left and bottom edges of the canvas. `text.small`, `color.text.muted`: "build <commit> · seed <seed>". Drawn above everything, but it never takes clicks. *(This is what the build already does.)* |
| `DataErrorScreen` | Replaces the whole canvas when a data file is broken. Background `color.bg.base`, padding `space.2xl`. Title "Data error" in Cinzel `text.h2`, `color.text.danger`, with a `space.lg` gap under it. Under it, one line per problem in `text.body`, `color.text.primary`, with `space.sm` between lines: "file · field: message" ("file: message" when there is no field). `BuildInfo` stays visible. |
| `WindowTooSmall` | When the browser window is smaller than 960 × 540, shown instead of the canvas. It fills the whole window, background `color.bg.base`. A centred line in `text.body`, `color.text.primary`: "Hexbound needs a desktop browser window of at least 960 × 540." The game behind it stays paused. |

## States every screen must handle

The tester checks these. Each screen spec says how its own states look.

| State | How it looks |
|---|---|
| Can't afford (gold, food, energy, health) | Price shown in `color.text.danger`; button disabled (`opacity.disabled`, not clickable) |
| A choice would bring health to 0 (event cost) | Choice disabled, with "Would kill you" in `color.text.danger` (G-31) |
| Route costs more food than the player has | Moving is never blocked (G-09). From the step where food runs out, the route preview turns `color.accent.danger`, and the route panel shows the health cost, e.g. "Food runs out at step 4: −6 health". Go stays enabled |
| Food is 0 | Food chip number in `color.text.danger`. What happens next is a rule question for the PM (G-09) |
| Draw pile empty | Discard pile shuffles into the draw pile; the draw count briefly highlights |
| No playable card | Hand cards dimmed; End turn highlighted |
| Fight won | Short "Victory" banner → Card reward |
| Fight lost | → Death and retry, or Run over if no lives are left |
| Death outside a fight (lava, an event, 0 food) | → Death and retry with the cause, e.g. "Burned by lava", "Event: <name>", "Starved" (G-04, G-09) |
| No key at a locked chest | Open button disabled, with "Needs a key from an elite" |
| Shop item sold out | Item removed, its slot shows "Sold" |
| Deck has the minimum card count | Remove card disabled (minimum is a PM rule, G-28) |
| Rest at full health | Rest disabled, with "Already at full health" |
| A village service already used this level | Rest, Buy a card and Remove a card work once per village per level (G-13, G-27): the used one is disabled with "Used", also after leaving and coming back. Buying food is never used up |
| Shrine | No Skip button: the player must pick (G-30). Owned blessings are never offered. Fewer than 3 left: only those are shown. None left: the shrine shows "The shrine heals you: +10 health" and a Continue button |
| Bounty active, completed or failed | Designed with the Village screen in stage 2 (G-29) |
| Restart level (Pause menu) | Confirm dialog: "Restart the level? This costs 1 life." With 0 lives it is disabled, with "No lives left" (G-06) |
| Loading or bad data file | `DataErrorScreen` |
| Window smaller than 960 × 540 | `WindowTooSmall` |
