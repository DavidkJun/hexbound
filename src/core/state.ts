import type { LevelMap, LocationType } from '../data/schema';
import type { FightState } from './fight';
import type { Hex } from './hex';
import type { FightKind } from './rewards';
import { seedRng, type RngState } from './rng';

/** What a chest gives besides its gold, one of three, equally likely (DD 4.5). */
export type ChestBonus = 'cards' | 'food' | 'health';

/** What a location holds, chosen when the level is dealt (DD 4.3 → Dealing). */
export type LocationDetail =
  | { readonly kind: 'enemy'; readonly enemy: string }
  | { readonly kind: 'chest'; readonly gold: number; readonly bonus: ChestBonus }
  | { readonly kind: 'none' };

export interface Location {
  readonly at: Hex;
  readonly type: LocationType;
  readonly detail: LocationDetail;
  /** A resolved tile shows as visited and does nothing. */
  readonly resolved: boolean;
  /** The detail has been within 2 steps of the player, so it is shown for the rest of the level. */
  readonly seen: boolean;
}

export interface LevelState {
  readonly map: LevelMap;
  readonly food: number;
  readonly playerAt: Hex;
  /** The planned steps still to walk, not counting the tile the player is on. */
  readonly route: readonly Hex[];
  /** Fixed locations plus this attempt's deal into the map's slots. The boss is `map.boss`. */
  readonly locations: readonly Location[];
}

/** Where a fight came from: which rewards it gives, and which tile it resolves. */
export interface FightSource {
  readonly kind: FightKind;
  readonly at: Hex;
}

/** What the player got. Gold, keys, health and food are already added; the cards are offered. */
export interface Reward {
  readonly gold: number;
  readonly keys: number;
  readonly health: number;
  readonly food: number;
  /** Take 1 or skip. Empty when there is no card to pick. */
  readonly cards: readonly string[];
  /** Where the game goes once the player takes a card or moves on. */
  readonly then: 'map' | 'levelWon';
}

export type DeathCause =
  { readonly kind: 'fight'; readonly enemy: string } | { readonly kind: 'starved' };

/** What the player is doing now. Each phase allows its own actions; see reducer.ts. */
export type Phase =
  | { readonly kind: 'map' }
  | { readonly kind: 'bossConfirm' }
  | { readonly kind: 'fight'; readonly fight: FightState; readonly source: FightSource }
  | { readonly kind: 'reward'; readonly reward: Reward }
  | { readonly kind: 'levelWon' }
  | { readonly kind: 'dead'; readonly cause: DeathCause };

export interface Run {
  readonly health: number;
  readonly maxHealth: number;
  readonly gold: number;
  readonly keys: number;
  readonly lives: number;
  /** Card ids, one per card. */
  readonly deck: readonly string[];
  /** Index into the catalogue's levels. */
  readonly levelIndex: number;
  /** The first monster fight of a new run is the tutorial, once. */
  readonly tutorialDone: boolean;
  readonly level: LevelState;
  readonly phase: Phase;
}

/** Everything that changes in a game. Screens read this and send actions; they never change it. */
export interface GameState {
  readonly seed: number;
  readonly rng: RngState;
  readonly run: Run | null;
}

export function createGame(seed: number): GameState {
  return { seed, rng: seedRng(seed), run: null };
}
