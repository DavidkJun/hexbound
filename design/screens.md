# Screen list

Owner: UI / Level designer. Every screen in the game, what it shows and what the player can do there. "Stage" means when it gets designed and built. A screen with a spec has a page in [`screens/`](screens/) and a frame in Figma → Screens.

## Always on screen: `TopBar`

Shown on Map, Fight, Village, Shrine, Mystery event, Chest and Card reward. 1280 × 56 at the top.
Left to right:
- `HealthChip` (current/max), `FoodChip`, `GoldChip`, `LivesChip`, `KeysChip`
- `BlessingsRow`: one 28 px icon per blessing; hover shows its text
- `LevelName`: Cinzel h3, centred in the remaining space
- `DeckButton`: shows the card count, opens Deck view
- `MenuButton`: opens the Pause menu

Layout until `layout.json` has the exact rects: background `bg.panel`, padding 16 left and right, 12 px gap between items, everything vertically centred. Chips have padding 6/12 (10 on the left), radius 8, background `bg.raised`, a 20 px icon, an 8 px gap and the number in Inter Bold `text.body`. The two buttons are the secondary `Button`, 48 high, on the right.

## Screens

| Screen | Shows | Player can | Stage | Spec |
|---|---|---|---|---|
| Main menu | Title, credits link | New run, continue (if saving is added), credits | 1 | — |
| Level intro | Level name, land art, hazard and what it does, boss and its signature move | Start the level | 1 | — |
| **Map** | 9×7 hex grid, player, location icons, planned route and its food cost, details within 2 tiles, boss panel | Plan a route, move, open deck | 1 | [map.md](screens/map.md) |
| **Fight** | Enemy with intent, health and status; player health and block; energy; hand of 5; draw, discard and exhaust piles; map effects on this fight | Play cards, end turn, look at piles | 1 | [fight.md](screens/fight.md) |
| Card reward | 3 cards to pick from, gold won | Pick 1 card or skip | 1 | — |
| Tutorial hints | Short hint bubbles pointing at one element at a time, first fight only | Next / dismiss | 1 | — |
| Deck view (overlay) | All cards in the deck, grouped by family | Close; in Village removal mode, pick a card to remove | 1 | — |
| Death and retry | Cause of death, lives left | Spend a life to retry the level | 1 | — |
| Level complete | Level summary (fights, gold, cards taken) | Continue to the next level intro | 1 | — |
| Chest | Contents: gold plus a card, food or healing | Take | 2 | — |
| Locked chest | Rare card and blessing; key needed | Open with a key, or leave | 2 | — |
| Village | Buy food, rest (heal), buy cards, remove a card, bounty board; prices and gold left | Buy, rest, remove, take a bounty, leave | 2 | — |
| Shrine | 3 blessings | Pick 1 | 2 | — |
| Mystery event | Event text; choices with cost and dice odds on the buttons | Pick a choice | 2 | — |
| Event result | What happened, dice roll, what changed | Continue | 2 | — |
| Run over / score | Win or loss, score breakdown, run stats | New run, main menu | 2 | — |
| Pause menu (overlay) | — | Resume, restart level, quit to menu | 2 | — |
| Credits | Fonts, icon authors (CC BY), team | Back | 4 | — |

## States every screen must handle

The tester checks these. Each screen spec says how its own states look.

| State | How it looks |
|---|---|
| Can't afford (gold, food, energy) | Price shown in `accent.danger`; button disabled (40% opacity, not clickable) |
| Route costs more food than the player has | Route preview turns `accent.danger` from the step where food runs out; Go is disabled |
| Food is 0 | Food chip in `accent.danger`. What happens next is a rule question for the PM |
| Draw pile empty | Discard pile shuffles into the draw pile; the draw count briefly highlights |
| No playable card | Hand cards dimmed; End turn highlighted |
| Fight won | Short "Victory" banner → Card reward |
| Fight lost | → Death and retry, or Run over if no lives are left |
| No key at a locked chest | Open button disabled, with "Needs a key from an elite" |
| Shop item sold out | Item removed, its slot shows "Sold" |
| Deck has the minimum card count | Remove card disabled (minimum is a PM rule) |
| Loading or bad data file | Full-screen message with the file and error (programmer side) |
