import type { LevelMap } from '../data/schema';
import type { Hex } from './hex';

/** Terrain rules from design/levels/map-format.md. */

export type Terrain = 'normal' | 'swamp' | 'ice' | 'lava';

export const TERRAIN_CHARS: Readonly<Record<Terrain, string>> = {
  normal: '.',
  swamp: 's',
  ice: 'i',
  lava: 'l',
};

const FOOD_PER_STEP: Readonly<Record<Terrain, number>> = {
  normal: 1,
  swamp: 2,
  ice: 2,
  lava: 1,
};

/** Terrain of a tile on a map whose file already passed validation. */
export function terrainAt(map: Pick<LevelMap, 'terrain' | 'hazard'>, [col, row]: Hex): Terrain {
  return map.terrain[row]?.[col] === TERRAIN_CHARS.normal ? 'normal' : map.hazard;
}

/** Food spent walking a route; the first tile is where the walk starts, so it costs nothing. */
export function routeFoodCost(
  map: Pick<LevelMap, 'terrain' | 'hazard'>,
  route: readonly Hex[],
): number {
  return route.slice(1).reduce((food, hex) => food + FOOD_PER_STEP[terrainAt(map, hex)], 0);
}
