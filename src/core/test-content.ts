import numbersJson from '../../data/numbers.json';
import { cardsFileSchema, enemiesFileSchema, numbersSchema } from '../data/schema';
import type { Content } from './content';

/** A small, fixed set of content for the core's unit tests, independent of the example files. */

const effect = (type: string, amount?: number) =>
  amount === undefined ? { type } : { type, amount };

const cards = cardsFileSchema.parse([
  card('strike', 'starter', 1, [effect('dealDamage', 6)], 4),
  card('defend', 'starter', 1, [effect('gainBlock', 5)], 4),
  card('ice-shard', 'starter', 1, [effect('dealDamage', 4), effect('applyChill', 1)], 1),
  card('ration', 'starter', 0, [effect('gainFood', 2), effect('exhaust')], 1),
  card('flurry', 'common', 1, [effect('dealDamage', 3), effect('draw', 1)]),
  card('surge', 'common', 0, [effect('gainEnergy', 2)]),
  card('war-cry', 'common', 1, [effect('gainStrength', 2)]),
  card('bash', 'common', 2, [effect('dealDamage', 12)]),
  card('deep-freeze', 'rare', 1, [effect('applyFreeze'), effect('exhaust')]),
  card('inferno', 'rare', 2, [effect('dealDamage', 20)]),
  card('aegis', 'rare', 1, [effect('gainBlock', 15)]),
]);

const enemies = enemiesFileSchema.parse([
  enemy('rat', 'normal', 20, [move('bite', 'attack', 8), move('burrow', 'block', 0)], {
    type: 'cycle',
    order: ['bite', 'bite', 'burrow'],
  }),
  enemy('wisp', 'normal', 15, [move('touch', 'attack', 5), move('numb', 'debuff', 0)], {
    type: 'random',
    weights: { touch: 3, numb: 1 },
  }),
  enemy('brute', 'elite', 40, [move('roar', 'buff', 0), move('smash', 'attack', 10)], {
    type: 'cycle',
    order: ['roar', 'smash'],
  }),
  {
    ...enemy('chief', 'boss', 60, [move('cleave', 'attack', 12)], {
      type: 'cycle',
      order: ['cleave'],
    }),
    signature: { move: 'cleave', text: 'Cleaves.' },
  },
]);

export const testContent: Content = {
  catalogue: {
    cards: new Map(cards.map((entry) => [entry.id, entry])),
    enemies: new Map(enemies.map((entry) => [entry.id, entry])),
    blessings: new Map(),
    events: new Map(),
    levels: [],
    tutorial: undefined,
  },
  numbers: numbersSchema.parse(numbersJson),
};

/** The starter deck of the test content: 4 strike, 4 defend, 1 ice-shard, 1 ration. */
export const starterDeck: readonly string[] = cards.flatMap(({ id, copies }) =>
  Array<string>(copies ?? 0).fill(id),
);

function card(id: string, rarity: string, cost: number, effects: object[], copies?: number) {
  return { id, name: id, family: 'weapon', rarity, copies, cost, effects, text: id };
}

function move(id: string, intent: string, amount: number) {
  const effects = {
    attack: [effect('dealDamage', amount)],
    block: [effect('gainBlock', 5)],
    buff: [effect('gainStrength', 2)],
    debuff: [effect('applyChill', 1)],
  }[intent];
  return { id, name: id, intent, effects };
}

function enemy(id: string, kind: string, health: number, moves: object[], pattern: object) {
  return { id, name: id, kind, land: 'whisperwood', health, moves, pattern };
}
