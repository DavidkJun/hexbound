import { createContext } from 'preact';
import { useContext, useSyncExternalStore } from 'preact/compat';
import type { Content } from '../core/content';
import type { GameAction } from '../core/reducer';
import type { GameState } from '../core/state';
import type { GameStore } from '../core/store';

export const GameContext = createContext<GameStore | null>(null);

/**
 * How a screen talks to the game: read `state`, send actions with `dispatch`, and look up cards and
 * enemies by id in `content`.
 */
export function useGame(): {
  state: GameState;
  dispatch: (action: GameAction) => void;
  content: Content;
} {
  const store = useContext(GameContext);
  if (!store) throw new Error('useGame() must be used inside <GameContext.Provider>');

  const state = useSyncExternalStore(store.subscribe, store.getState);
  return { state, dispatch: store.dispatch, content: store.content };
}
