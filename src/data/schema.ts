import { z } from 'zod';
import { GRID_COLS, GRID_ROWS, isInGrid } from '../core/hex';

/** The shape of every data file. data/README.md explains the format for content writers. */

/** Loaded content is never changed by the game. */
type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const idSchema = z.string().regex(KEBAB_CASE, 'must be a kebab-case id');
const textSchema = z.string().min(1);
const amountSchema = z.number().int().positive();

// Effects: one small vocabulary shared by cards, enemy moves, blessings and events.

const amountEffect = <Type extends string>(type: Type) =>
  z.strictObject({ type: z.literal(type), amount: amountSchema });

const fightEffects = [
  // Damage and statuses hit the opponent; everything else applies to whoever uses the effect.
  amountEffect('dealDamage'),
  amountEffect('gainBlock'),
  amountEffect('gainEnergy'),
  amountEffect('draw'),
  amountEffect('gainStrength'),
  // Freeze doesn't stack (DD 4.7), so it has no amount.
  z.strictObject({ type: z.literal('applyFreeze') }),
  amountEffect('applyChill'),
  z.strictObject({ type: z.literal('exhaust') }),
  // Resources of the run.
  amountEffect('heal'),
  amountEffect('loseHealth'),
  amountEffect('gainFood'),
  amountEffect('loseFood'),
  amountEffect('gainGold'),
  amountEffect('loseGold'),
] as const;

/** Rewards that change the run, not a fight: only blessings and event outcomes give them (#29). */
const rewardEffects = [
  amountEffect('gainKey'),
  amountEffect('gainMaxHealth'),
  // A card reward of `rewards.cardChoices` different cards of this rarity: take 1 or skip.
  z.strictObject({ type: z.literal('cardReward'), rarity: z.enum(['common', 'rare']) }),
  // A random blessing the player doesn't own yet.
  z.strictObject({ type: z.literal('gainBlessing') }),
] as const;

const REWARD_TYPES: readonly unknown[] = rewardEffects.map((effect) => effect.shape.type.value);

/** Effects of cards and enemy moves. A reward effect there gets its own message. */
const effectSchema = z.discriminatedUnion('type', fightEffects, {
  error: (issue) => {
    const type = (issue.input as { type?: unknown } | undefined)?.type;
    return REWARD_TYPES.includes(type)
      ? `"${String(type)}" works only in blessings and event outcomes`
      : undefined;
  },
});

/** Effects of blessings and event outcomes: everything. */
const anyEffectSchema = z.discriminatedUnion('type', [...fightEffects, ...rewardEffects]);

const effectsSchema = z.array(effectSchema);
const anyEffectsSchema = z.array(anyEffectSchema);

const hasEffect = (effects: readonly { type: string }[], type: string) =>
  effects.some((effect) => effect.type === type);

// Cards

const cardSchema = z
  .strictObject({
    id: idSchema,
    name: textSchema,
    family: z.enum(['weapon', 'spell', 'armour', 'item']),
    rarity: z.enum(['starter', 'common', 'rare']),
    /** How many of this card the starter deck holds. Only on starter cards. */
    copies: amountSchema.optional(),
    cost: z.number().int().nonnegative(),
    effects: effectsSchema.min(1),
    text: textSchema,
  })
  .superRefine((card, ctx) => {
    if (card.rarity === 'starter' && card.copies === undefined) {
      ctx.addIssue({ code: 'custom', path: ['copies'], message: 'a starter card needs copies' });
    }
    if (card.rarity !== 'starter' && card.copies !== undefined) {
      ctx.addIssue({ code: 'custom', path: ['copies'], message: 'only starter cards have copies' });
    }
    if (hasEffect(card.effects, 'applyFreeze') && !hasEffect(card.effects, 'exhaust')) {
      ctx.addIssue({
        code: 'custom',
        path: ['effects'],
        message: 'a card that applies Freeze also needs exhaust',
      });
    }
  });

// Enemies

const landSchema = z.enum(['whisperwood', 'frostpeak', 'ashen']);

const moveSchema = z.strictObject({
  id: idSchema,
  name: textSchema,
  intent: z.enum(['attack', 'block', 'buff', 'debuff']),
  effects: effectsSchema
    .min(1)
    .refine((effects) => !hasEffect(effects, 'applyFreeze'), 'enemies never apply Freeze'),
});

const movePatternSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('cycle'), order: z.array(idSchema).min(1) }),
  z.strictObject({
    type: z.literal('random'),
    weights: z
      .record(idSchema, amountSchema)
      .refine((weights) => Object.keys(weights).length > 0, 'needs at least one move'),
  }),
]);

const enemySchema = z
  .strictObject({
    id: idSchema,
    name: textSchema,
    kind: z.enum(['normal', 'elite', 'boss']),
    /** The level it appears on, by the level's land. Monster and elite slots deal from these. */
    land: landSchema,
    health: amountSchema,
    moves: z.array(moveSchema).min(1),
    pattern: movePatternSchema,
    signature: z.strictObject({ move: idSchema, text: textSchema }).optional(),
  })
  .superRefine((enemy, ctx) => {
    const moveIds = new Set<string>();
    enemy.moves.forEach(({ id }, i) => {
      if (moveIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['moves', i, 'id'],
          message: `"${id}" is already used`,
        });
      }
      moveIds.add(id);
    });

    const requireMove = (id: string, path: (string | number)[]) => {
      if (!moveIds.has(id)) ctx.addIssue({ code: 'custom', path, message: `no move "${id}"` });
    };

    if (enemy.pattern.type === 'cycle') {
      enemy.pattern.order.forEach((id, i) => {
        requireMove(id, ['pattern', 'order', i]);
      });
    } else {
      Object.keys(enemy.pattern.weights).forEach((id) => {
        requireMove(id, ['pattern', 'weights', id]);
      });
    }

    if (enemy.signature) requireMove(enemy.signature.move, ['signature', 'move']);
    if (enemy.kind === 'boss' && !enemy.signature) {
      ctx.addIssue({ code: 'custom', path: ['signature'], message: 'a boss needs a signature' });
    }
  });

// Blessings

/** Rewards that open a screen of their own can't happen in the middle of a fight. */
const REWARD_SCREENS = ['cardReward', 'gainBlessing'];

const blessingSchema = z
  .strictObject({
    id: idSchema,
    name: textSchema,
    text: textSchema,
    trigger: z.enum(['onPickup', 'levelStart', 'fightStart', 'turnStart']),
    effects: anyEffectsSchema.min(1),
  })
  .superRefine((blessing, context) => {
    if (blessing.trigger !== 'fightStart' && blessing.trigger !== 'turnStart') return;
    blessing.effects.forEach((effect, i) => {
      if (!REWARD_SCREENS.includes(effect.type)) return;
      context.addIssue({
        code: 'custom',
        path: ['effects', i, 'type'],
        message: `"${effect.type}" opens a reward screen, so it can't run at ${blessing.trigger}`,
      });
    });
  });

// Events

const outcomeSchema = z.strictObject({
  chance: z.number().int().min(1).max(100),
  text: textSchema,
  effects: anyEffectsSchema,
});

const choiceSchema = z
  .strictObject({
    label: textSchema,
    cost: z
      .strictObject({ gold: amountSchema, food: amountSchema, health: amountSchema })
      .partial()
      .optional(),
    outcomes: z.array(outcomeSchema).min(1),
  })
  .refine((choice) => choice.outcomes.reduce((sum, { chance }) => sum + chance, 0) === 100, {
    path: ['outcomes'],
    message: 'outcome chances must add up to 100',
  });

const eventSchema = z.strictObject({
  id: idSchema,
  name: textSchema,
  text: textSchema,
  choices: z.array(choiceSchema).min(2),
});

// Levels: design/levels/map-format.md. Rules that compare fields live in level-rules.ts.

const GRID_RANGE = `col 0–${GRID_COLS - 1}, row 0–${GRID_ROWS - 1}`;

/** The problem sits on the number that is off, and its message shows the whole tile. */
const hexSchema = z.tuple([z.number().int(), z.number().int()]).superRefine(([col, row], ctx) => {
  if (isInGrid([col, row])) return;
  const colIsOff = col < 0 || col >= GRID_COLS;
  ctx.addIssue({
    code: 'custom',
    path: [colIsOff ? 0 : 1],
    message: `tile ${col},${row} is outside the grid (${GRID_RANGE})`,
  });
});

const locationTypeSchema = z.enum([
  'monster',
  'elite',
  'chest',
  'locked-chest',
  'village',
  'shrine',
  'mystery',
]);

/** Each type in a slot is equally likely, so a type can't be listed twice to weight it. */
const allowSchema = z
  .array(locationTypeSchema)
  .min(1)
  .superRefine((types, ctx) => {
    const repeated = types.find((type, i) => types.indexOf(type) !== i);
    if (repeated) ctx.addIssue({ code: 'custom', message: `"${repeated}" is listed twice` });
  });

const routeSchema = z.array(hexSchema).min(2);

export const levelSchema = z.strictObject({
  id: z.string().regex(/^_?[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a kebab-case id'),
  name: textSchema,
  land: landSchema,
  hazard: z.enum(['swamp', 'ice', 'lava']),
  startFood: amountSchema,
  terrain: z
    .array(
      z
        .string()
        .regex(new RegExp(`^[.sil]{${GRID_COLS}}$`), `must be ${GRID_COLS} of the characters .sil`),
    )
    .length(GRID_ROWS),
  start: hexSchema,
  boss: z.strictObject({ at: hexSchema, enemy: idSchema }),
  fixed: z.array(z.strictObject({ at: hexSchema, type: locationTypeSchema })),
  slots: z.array(z.strictObject({ at: hexSchema, allow: allowSchema })),
  intendedRoutes: z.strictObject({ direct: routeSchema, safe: routeSchema, rich: routeSchema }),
});

// Tutorial: the first fight of a new run (DD 4.8). Checks against cards and enemies are in load.ts.

const tutorialSchema = z.strictObject({
  enemy: idSchema,
  drawOrder: z.array(idSchema).min(1),
  hints: z.strictObject({
    intent: textSchema,
    energy: textSchema,
    block: textSchema,
    endTurn: textSchema,
  }),
});

// Numbers: every number of DD 4.9, in one file so they can be tuned without code.

const rangeSchema = z
  .strictObject({ min: amountSchema, max: amountSchema })
  .refine(({ min, max }) => min <= max, 'min must not be above max');

export const numbersSchema = z.strictObject({
  run: z.strictObject({
    health: amountSchema,
    maxHealth: amountSchema,
    gold: z.number().int().nonnegative(),
    lives: amountSchema,
  }),
  food: z.strictObject({ healthPerMissingFood: amountSchema }),
  fight: z.strictObject({
    energyPerTurn: amountSchema,
    cardsPerTurn: amountSchema,
    handLimit: amountSchema,
  }),
  rewards: z.strictObject({
    cardChoices: amountSchema,
    monsterGold: rangeSchema,
    eliteGold: amountSchema,
    eliteKeys: amountSchema,
    bossGold: amountSchema,
    bossHealPercent: amountSchema.max(100),
  }),
  hazards: z.strictObject({ lavaDamage: amountSchema, iceChill: amountSchema }),
  chest: z.strictObject({ gold: rangeSchema, food: amountSchema, health: amountSchema }),
  village: z.strictObject({
    foodAmount: amountSchema,
    foodPrice: amountSchema,
    restHealth: amountSchema,
    restPrice: amountSchema,
    restedBlock: amountSchema,
    cardChoices: amountSchema,
    cardPrice: amountSchema,
    removalPrice: amountSchema,
    smallestDeck: amountSchema,
  }),
  bountyGold: amountSchema,
  shrine: z.strictObject({ choices: amountSchema, healWhenEmpty: amountSchema }),
  score: z.strictObject({
    perLevelCleared: amountSchema,
    perHealth: amountSchema,
    perGold: amountSchema,
    perLifeLeft: amountSchema,
  }),
});

// What a whole file holds.

export const tutorialFileSchema = tutorialSchema;
export const cardsFileSchema = z.array(cardSchema).min(1);
export const enemiesFileSchema = z.array(enemySchema).min(1);
export const blessingsFileSchema = z.array(blessingSchema).min(1);
export const eventsFileSchema = z.array(eventSchema).min(1);
export const levelOrderSchema = z.array(idSchema);

export type Effect = DeepReadonly<z.infer<typeof effectSchema>>;
/** Any effect, including the rewards only blessings and event outcomes give. */
export type AnyEffect = DeepReadonly<z.infer<typeof anyEffectSchema>>;
export type Card = DeepReadonly<z.infer<typeof cardSchema>>;
export type Rarity = Card['rarity'];
export type Enemy = DeepReadonly<z.infer<typeof enemySchema>>;
export type Blessing = DeepReadonly<z.infer<typeof blessingSchema>>;
export type GameEvent = DeepReadonly<z.infer<typeof eventSchema>>;
export type LevelMap = DeepReadonly<z.infer<typeof levelSchema>>;
export type LocationType = z.infer<typeof locationTypeSchema>;
export type Tutorial = DeepReadonly<z.infer<typeof tutorialSchema>>;
export type Numbers = DeepReadonly<z.infer<typeof numbersSchema>>;
