import type { LevelMap } from '../data/schema';
import { pick } from './rng';
import type { GameState, Location } from './state';

interface StartLevel {
  readonly type: 'startLevel';
  readonly map: LevelMap;
}

/** Everything a screen can ask the game to do. New actions join this union. */
export type GameAction = StartLevel;

/** The whole game logic in one call: current state + player action = new state. */
export function reduce(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- until a 2nd action
    case 'startLevel':
      return startLevel(state, action.map);
  }
}

function startLevel(state: GameState, map: LevelMap): GameState {
  let { rng } = state;
  const dealt = map.slots.map(({ at, allow }): Location => {
    const roll = pick(rng, allow);
    rng = roll.rng;
    return { at, type: roll.value };
  });

  return {
    ...state,
    rng,
    level: { map, playerAt: map.start, locations: [...map.fixed, ...dealt] },
  };
}
