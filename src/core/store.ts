import type { Content } from './content';
import { reduce, type GameAction } from './reducer';
import type { GameState } from './state';

export interface GameStore {
  /** The checked data files the game is played with. They never change during a run. */
  readonly content: Content;
  readonly getState: () => GameState;
  readonly dispatch: (action: GameAction) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

/** Holds the current state and tells subscribers when an action changes it. */
export function createGameStore(content: Content, initial: GameState): GameStore {
  let state = initial;
  const listeners = new Set<() => void>();

  return {
    content,
    getState: () => state,
    dispatch: (action) => {
      state = reduce(content, state, action);
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
