import { createContext } from 'preact';
import { useContext, useSyncExternalStore } from 'preact/compat';
import type { GameAction } from '../core/reducer';
import type { GameState } from '../core/state';
import type { GameStore } from '../core/store';

export const GameContext = createContext<GameStore | null>(null);

/** How a screen talks to the game: read `state`, send actions with `dispatch`. */
export function useGame(): { state: GameState; dispatch: (action: GameAction) => void } {
  const store = useContext(GameContext);
  if (!store) throw new Error('useGame() must be used inside <GameContext.Provider>');

  const state = useSyncExternalStore(store.subscribe, store.getState);
  return { state, dispatch: store.dispatch };
}
