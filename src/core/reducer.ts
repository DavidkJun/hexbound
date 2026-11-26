import type { Content } from './content';
import { endTurn, playCard } from './fight';
import type { Hex } from './hex';
import {
  cancelBoss,
  confirmBoss,
  go,
  inFight,
  pickCard,
  planRoute,
  skipReward,
  startRun,
  type RunStep,
} from './run';
import type { GameState } from './state';

/**
 * Everything a screen can ask the game to do. An action that doesn't fit the current phase (see
 * `Phase` in state.ts) changes nothing.
 */
export type GameAction =
  /** A new run on the first level. */
  | { readonly type: 'startRun' }
  /** Map: the steps to walk, each a neighbour of the one before, starting next to the player. */
  | { readonly type: 'planRoute'; readonly route: readonly Hex[] }
  /** Map: walk the planned route. */
  | { readonly type: 'go' }
  /** Boss confirm: fight the boss now, or stay. */
  | { readonly type: 'confirmBoss' }
  | { readonly type: 'cancelBoss' }
  /** Fight: play the card at this place in the hand, or end the turn. */
  | { readonly type: 'playCard'; readonly handIndex: number }
  | { readonly type: 'endTurn' }
  /** Reward: take one of the offered cards, or skip. */
  | { readonly type: 'pickCard'; readonly index: number }
  | { readonly type: 'skipReward' };

/** The whole game logic in one call: content + current state + player action = new state. */
export function reduce(content: Content, state: GameState, action: GameAction): GameState {
  if (action.type === 'startRun') return startRun(content, state);
  if (!state.run) return state;

  const step: RunStep = { run: state.run, rng: state.rng };
  const next = act(content, step, action);
  return next === step ? state : { ...state, run: next.run, rng: next.rng };
}

function act(
  content: Content,
  step: RunStep,
  action: Exclude<GameAction, { type: 'startRun' }>,
): RunStep {
  switch (action.type) {
    case 'planRoute':
      return planRoute(step, action.route);
    case 'go':
      return go(content, step);
    case 'confirmBoss':
      return confirmBoss(content, step);
    case 'cancelBoss':
      return cancelBoss(step);
    case 'playCard':
      return inFight(content, step, (battle) => playCard(content, battle, action.handIndex));
    case 'endTurn':
      return inFight(content, step, (battle) => endTurn(content, battle));
    case 'pickCard':
      return pickCard(step, action.index);
    case 'skipReward':
      return skipReward(step);
  }
}
