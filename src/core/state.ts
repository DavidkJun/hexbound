import type { LevelMap, LocationType } from '../data/schema';
import type { Hex } from './hex';
import { seedRng, type RngState } from './rng';

export interface Location {
  readonly at: Hex;
  readonly type: LocationType;
}

export interface LevelState {
  readonly map: LevelMap;
  readonly playerAt: Hex;
  /** Fixed locations plus this run's deal into the map's slots. */
  readonly locations: readonly Location[];
}

/** Everything about a run. Screens read this and send actions; they never change it. */
export interface GameState {
  readonly seed: number;
  readonly rng: RngState;
  readonly level: LevelState | null;
}

export function createGame(seed: number): GameState {
  return { seed, rng: seedRng(seed), level: null };
}
