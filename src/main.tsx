import { render, type VNode } from 'preact';
import { App } from './App';
import { createGame } from './core/state';
import type { Content } from './core/content';
import { createGameStore, type GameStore } from './core/store';
import { bundledFiles } from './data/bundled-files';
import { DataError } from './data/data-error';
import { isExampleFile, loadCatalogue, loadNumbers } from './data/load';
import { DataErrorScreen } from './screens/data-error/DataErrorScreen';
import { BuildInfo } from './ui/BuildInfo';
import { applyTokens } from './ui/design';
import { GameCanvas } from './ui/GameCanvas';
import { GameContext } from './ui/game-context';
import '../assets/fonts/fonts.css';

/** `?seed=123` replays a run; otherwise a new short seed that is easy to copy into a bug report. */
function readSeed(): number {
  const seed = Number.parseInt(new URLSearchParams(window.location.search).get('seed') ?? '', 10);
  return Number.isNaN(seed) ? Date.now() % 1_000_000 : seed;
}

/**
 * The checked data files. Until data/levels/levels.json arrives with the first real map there is
 * nothing to play, so the examples are played instead (see #17 for how that will be shown).
 */
function loadContent(): Content {
  const numbers = loadNumbers(bundledFiles);
  const game = loadCatalogue(bundledFiles.filter((file) => !isExampleFile(file.path)));
  const catalogue =
    game.levels.length > 0
      ? game
      : loadCatalogue(bundledFiles.filter((file) => isExampleFile(file.path)));
  if (catalogue.levels.length === 0) {
    throw new DataError([{ file: 'data/levels', field: '', message: 'no level to load' }]);
  }
  return { catalogue, numbers };
}

/** `?debug` prints the game state as JSON in the console after every action, for bug reports. */
function logStateForDebugging(store: GameStore): void {
  if (!new URLSearchParams(window.location.search).has('debug')) return;
  const log = () => {
    console.info('[hexbound] state', JSON.stringify(store.getState()));
  };
  store.subscribe(log);
  log();
}

function startGame(): VNode {
  const seed = readSeed();
  try {
    const store = createGameStore(loadContent(), createGame(seed));
    logStateForDebugging(store);
    store.dispatch({ type: 'startRun' });
    return (
      <GameContext.Provider value={store}>
        <App />
      </GameContext.Provider>
    );
  } catch (error) {
    if (!(error instanceof DataError)) throw error;
    return (
      <>
        <DataErrorScreen problems={error.problems} />
        <BuildInfo seed={seed} />
      </>
    );
  }
}

applyTokens(document.documentElement);

const root = document.getElementById('app');
if (!root) throw new Error('index.html has no #app element');

render(<GameCanvas>{startGame()}</GameCanvas>, root);
