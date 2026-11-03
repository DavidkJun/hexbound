# <Name> screen

Figma: Screens page → frame `<Name>Screen` · Snapshot: [`<name>.png`](<name>.png) · Status: draft | approved

## Purpose

One or two sentences: why this screen exists, and what the player decides here.

## Elements

Rectangles are `x, y, w, h` on the 1280 × 720 canvas. `layout.json` overrides these numbers once exported.

| Name | Rect | Shows (game state it reads) | Does (action it sends) |
|---|---|---|---|
| `TopBar` | 0, 0, 1280, 56 | see [screens.md](../screens.md) | DeckButton → deck view |
| `ExampleElement` | x, y, w, h | … | … |

## Dynamic elements

How repeated or moving things are placed (cards in hand, route steps, tooltips): the rule, not one example position.

## States

Every state from [screens.md](../screens.md#states-every-screen-must-handle) that applies here, and how it looks.

## Acceptance checklist

- [ ] All elements present, named as above, at their rectangles
- [ ] Colours, fonts and sizes only from tokens.json
- [ ] Each state above can be reached and looks as described
- [ ] Screenshot at 1280 × 720 matches the snapshot
