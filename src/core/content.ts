import type { Catalogue } from '../data/load';
import type { Card, Enemy, Numbers } from '../data/schema';

/** What the game is played with: the checked data files. It never changes during a run. */
export interface Content {
  readonly catalogue: Catalogue;
  readonly numbers: Numbers;
}

export type Move = Enemy['moves'][number];

/** The data check guarantees every id the game uses exists, so a missing one is a bug. */
export function cardOf({ catalogue }: Content, id: string): Card {
  const card = catalogue.cards.get(id);
  if (!card) throw new Error(`no card "${id}"`);
  return card;
}

export function enemyOf({ catalogue }: Content, id: string): Enemy {
  const enemy = catalogue.enemies.get(id);
  if (!enemy) throw new Error(`no enemy "${id}"`);
  return enemy;
}
