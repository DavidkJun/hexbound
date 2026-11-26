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
 * The checked data files. Until the first real level file arrives, there is nothing to play, so
 * the examples are played instead, with an "Example map" warning on screen
 * (design/levels/map-format.md, #17).
 */
function loadContent(): { content: Content; examples: boolean } {
  const numbers = loadNumbers(bundledFiles);
  const game = loadCatalogue(bundledFiles.filter((file) => !isExampleFile(file.path)));
  const examples = game.levels.length === 0;
  const catalogue = examples
    ? loadCatalogue(bundledFiles.filter((file) => isExampleFile(file.path)))
    : game;
  if (catalogue.levels.length === 0) {
    throw new DataError([{ file: 'data/levels', field: '', message: 'no level to load' }]);
  }
  return { content: { catalogue, numbers }, examples };
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
    const { content, examples } = loadContent();
    const store = createGameStore(content, createGame(seed));
    logStateForDebugging(store);
    store.dispatch({ type: 'startRun' });
    return (
      <GameContext.Provider value={store}>
        <App exampleMap={examples} />
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
