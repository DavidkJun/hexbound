import { describe, expect, it, vi } from 'vitest';
import { createGame } from './state';
import { createGameStore } from './store';
import { testContent } from './test-content';

describe('createGameStore', () => {
  it('runs actions through the game logic and tells subscribers', () => {
    const store = createGameStore(testContent, createGame(1));
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'startRun' });

    expect(store.getState().run?.level.map.id).toBe('test-wood');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('stops telling a subscriber after it unsubscribes', () => {
    const store = createGameStore(testContent, createGame(1));
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch({ type: 'startRun' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('holds the content the game is played with', () => {
    expect(createGameStore(testContent, createGame(1)).content).toBe(testContent);
  });
});
