import { reduce, type GameAction } from './reducer';
import type { GameState } from './state';

export interface GameStore {
  readonly getState: () => GameState;
  readonly dispatch: (action: GameAction) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

/** Holds the current state and tells subscribers when an action changes it. */
export function createGameStore(initial: GameState): GameStore {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    getState: () => state,
    dispatch: (action) => {
      state = reduce(state, action);
      listeners.forEach((listener) => {
        listener();
      });
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
