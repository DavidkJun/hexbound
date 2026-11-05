import { describe, expect, it, vi } from 'vitest';
import exampleLevel from '../../data/levels/_example.json';
import { levelSchema } from '../data/schema';
import { createGame } from './state';
import { createGameStore } from './store';

const startLevel = { type: 'startLevel', map: levelSchema.parse(exampleLevel) } as const;

describe('createGameStore', () => {
  it('runs actions through the game logic and tells subscribers', () => {
    const store = createGameStore(createGame(1));
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch(startLevel);

    expect(store.getState().level?.map.id).toBe('_example');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('stops telling a subscriber after it unsubscribes', () => {
    const store = createGameStore(createGame(1));
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.dispatch(startLevel);

    expect(listener).not.toHaveBeenCalled();
  });
});
