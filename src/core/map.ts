import type { LevelMap, LocationType } from '../data/schema';
import type { Content } from './content';
import { areNeighbours, distance, isInGrid, sameHex, type Hex } from './hex';
import { pick, rollInt, type RngState, type Rolled } from './rng';
import type { ChestBonus, LevelState, Location, LocationDetail } from './state';
import { foodToEnter } from './terrain';

/** The map side of a level: plan/HexBound_DD.md 4.2 and 4.3. Pure functions, like the fight. */

/** Details are shown for every tile within this many steps of the player (DD 4.3 → Visibility). */
const SIGHT = 2;

const CHEST_BONUSES: readonly ChestBonus[] = ['cards', 'food', 'health'];

/** A new attempt at a level: full food, on the start tile, and a fresh deal. */
export function startLevel(content: Content, map: LevelMap, rng: RngState): Rolled<LevelState> {
  const dealt = dealLocations(content, map, rng);
  const level: LevelState = {
    map,
    food: map.startFood,
    playerAt: map.start,
    route: [],
    locations: dealt.value,
  };
  return { value: see(level), rng: dealt.rng };
}

/**
 * Each slot gets one type from its `allow` list, all equally likely, and every location its
 * details at the same time: which enemy, or what a chest holds.
 */
export function dealLocations(content: Content, map: LevelMap, rng: RngState): Rolled<Location[]> {
  let state = rng;
  const roll = <T>(rolled: Rolled<T>): T => {
    state = rolled.rng;
    return rolled.value;
  };

  const placed = [
    ...map.fixed,
    ...map.slots.map(({ at, allow }) => ({ at, type: roll(pick(state, allow)) })),
  ];
  const locations = placed.map(({ at, type }): Location => ({
    at,
    type,
    detail: roll(dealDetail(content, map, type, state)),
    resolved: false,
    seen: false,
  }));
  return { value: locations, rng: state };
}

function dealDetail(
  content: Content,
  map: LevelMap,
  type: LocationType,
  rng: RngState,
): Rolled<LocationDetail> {
  const { enemies } = content.catalogue;
  switch (type) {
    case 'monster':
    case 'elite': {
      const kind = type === 'monster' ? 'normal' : 'elite';
      const pool = [...enemies.values()]
        .filter((enemy) => enemy.kind === kind && enemy.land === map.land)
        .map(({ id }) => id);
      // The data check makes sure a level that deals these has one; without enemy files, nothing.
      if (pool.length === 0) return { value: { kind: 'none' }, rng };
      const enemy = pick(rng, pool);
      return { value: { kind: 'enemy', enemy: enemy.value }, rng: enemy.rng };
    }
    case 'chest': {
      const { gold } = content.numbers.chest;
      const coins = rollInt(rng, gold.min, gold.max);
      const bonus = pick(coins.rng, CHEST_BONUSES);
      return { value: { kind: 'chest', gold: coins.value, bonus: bonus.value }, rng: bonus.rng };
    }
    // TODO(stage-2): a mystery deals its event here, a shrine its blessings.
    case 'locked-chest':
    case 'village':
    case 'shrine':
    case 'mystery':
      return { value: { kind: 'none' }, rng };
  }
}

/** Marks every location within sight of the player as seen. Seen stays seen. */
export function see(level: LevelState): LevelState {
  return {
    ...level,
    locations: level.locations.map((location) =>
      location.seen || distance(location.at, level.playerAt) > SIGHT
        ? location
        : { ...location, seen: true },
    ),
  };
}

/** A route is a chain of neighbouring tiles inside the grid, starting next to the player. */
export function isRoute(from: Hex, route: readonly Hex[]): boolean {
  return route.every((hex, i) => isInGrid(hex) && areNeighbours(route[i - 1] ?? from, hex));
}

export interface StepCost {
  readonly at: Hex;
  readonly food: number;
  /** Health paid for the food the step can't pay for. */
  readonly health: number;
}

/**
 * What walking the planned route would cost, step by step, before the player presses Go. Moving is
 * never blocked: each food a step can't pay for costs health instead (DD 4.2 → Out of food).
 */
export function routeCost(
  content: Content,
  level: LevelState,
): { readonly steps: readonly StepCost[]; readonly food: number; readonly health: number } {
  let food = level.food;
  const steps = level.route.map((at): StepCost => {
    const cost = stepCost(content, level.map, food, at);
    food -= cost.food;
    return cost;
  });
  return {
    steps,
    food: steps.reduce((sum, step) => sum + step.food, 0),
    health: steps.reduce((sum, step) => sum + step.health, 0),
  };
}

/** One step: the food paid, and the health for the rest. */
export function stepCost(content: Content, map: LevelMap, food: number, at: Hex): StepCost {
  const cost = foodToEnter(map, at);
  const paid = Math.min(food, cost);
  return { at, food: paid, health: (cost - paid) * content.numbers.food.healthPerMissingFood };
}

/** The location on a tile, if any. The boss tile isn't one: it's `map.boss`. */
export function locationAt(level: LevelState, at: Hex): Location | undefined {
  return level.locations.find((location) => sameHex(location.at, at));
}
