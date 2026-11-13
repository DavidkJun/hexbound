import { describe, expect, it } from 'vitest';
import { fightReward, offerCards } from './rewards';
import { seedRng } from './rng';
import { testContent as content } from './test-content';

const rarityOf = (id: string) => content.catalogue.cards.get(id)?.rarity;

describe('fight rewards', () => {
  it('a monster gives 10–15 gold and 3 different commons', () => {
    for (let seed = 0; seed < 30; seed++) {
      const { value } = fightReward(content, 'monster', 60, seedRng(seed));
      expect(value.gold).toBeGreaterThanOrEqual(10);
      expect(value.gold).toBeLessThanOrEqual(15);
      expect(value.keys).toBe(0);
      expect(new Set(value.cards).size).toBe(3);
      expect(value.cards.map(rarityOf)).toEqual(['common', 'common', 'common']);
    }
  });

  it('an elite gives 25 gold, 1 key and one rare among the 3 cards', () => {
    const { value } = fightReward(content, 'elite', 60, seedRng(4));
    expect(value).toMatchObject({ gold: 25, keys: 1, heal: 0 });
    expect(value.cards.map(rarityOf).sort()).toEqual(['common', 'common', 'rare']);
  });

  it('a boss gives 40 gold, heals 30% of max health rounded down, and rares', () => {
    const { value } = fightReward(content, 'boss', 55, seedRng(4));
    expect(value).toMatchObject({ gold: 40, keys: 0, heal: 16 });
    expect(value.cards.map(rarityOf)).toEqual(['rare', 'rare', 'rare']);
  });
});

describe('card offers', () => {
  it('never offers starter cards', () => {
    for (let seed = 0; seed < 30; seed++) {
      const { value } = offerCards(content, 'chest', seedRng(seed));
      expect(value.map(rarityOf)).not.toContain('starter');
    }
  });

  it('offers fewer cards when the pool is smaller', () => {
    const rares = [...content.catalogue.cards.values()].filter(({ rarity }) => rarity !== 'rare');
    const fewer = {
      ...content,
      catalogue: { ...content.catalogue, cards: new Map(rares.map((card) => [card.id, card])) },
    };
    expect(offerCards(fewer, 'lockedChest', seedRng(1)).value).toEqual([]);
    expect(offerCards(fewer, 'elite', seedRng(1)).value.map(rarityOf)).toEqual([
      'common',
      'common',
      'common',
    ]);
  });
});
