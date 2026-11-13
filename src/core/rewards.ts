import type { Rarity } from '../data/schema';
import type { Content } from './content';
import { rollInt, sample, shuffle, type RngState, type Rolled } from './rng';

/** Rewards: plan/HexBound_DD.md 4.5. */

export type FightKind = 'monster' | 'elite' | 'boss';
export type CardOfferKind = FightKind | 'chest' | 'lockedChest';

/** What winning a fight gives. The cards are offered: the player takes 1 or skips. */
export interface FightReward {
  readonly gold: number;
  readonly keys: number;
  readonly heal: number;
  readonly cards: readonly string[];
}

export function fightReward(
  content: Content,
  kind: FightKind,
  maxHealth: number,
  rng: RngState,
): Rolled<FightReward> {
  const { rewards } = content.numbers;
  const gold =
    kind === 'monster'
      ? rollInt(rng, rewards.monsterGold.min, rewards.monsterGold.max)
      : { value: kind === 'elite' ? rewards.eliteGold : rewards.bossGold, rng };
  const cards = offerCards(content, kind, gold.rng);
  return {
    value: {
      gold: gold.value,
      keys: kind === 'elite' ? rewards.eliteKeys : 0,
      heal: kind === 'boss' ? Math.floor((maxHealth * rewards.bossHealPercent) / 100) : 0,
      cards: cards.value,
    },
    rng: cards.rng,
  };
}

/**
 * A card reward: different cards, never starter cards, fewer if the pool is smaller. Monsters,
 * chests and villages offer commons, an elite's reward has one rare, bosses and locked chests rares.
 */
export function offerCards(
  content: Content,
  kind: CardOfferKind,
  rng: RngState,
): Rolled<readonly string[]> {
  const count = content.numbers.rewards.cardChoices;
  const pool = (rarity: Rarity) =>
    [...content.catalogue.cards.values()]
      .filter((card) => card.rarity === rarity)
      .map(({ id }) => id);

  switch (kind) {
    case 'monster':
    case 'chest':
      return sample(rng, pool('common'), count);
    case 'boss':
    case 'lockedChest':
      return sample(rng, pool('rare'), count);
    case 'elite': {
      const rare = sample(rng, pool('rare'), 1);
      const commons = sample(rare.rng, pool('common'), count - rare.value.length);
      return shuffle(commons.rng, [...rare.value, ...commons.value]);
    }
  }
}
