import { render, type VNode } from 'preact';
import { App } from './App';
import { createGame } from './core/state';
import { createGameStore } from './core/store';
import { bundledFiles } from './data/bundled-files';
import { DataError } from './data/data-error';
import { isExampleFile, loadCatalogue, loadNumbers } from './data/load';
import type { LevelMap } from './data/schema';
import { DataErrorScreen } from './screens/data-error/DataErrorScreen';
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
 * TODO(stage-1): keep the whole catalogue in the game. Until data/levels/levels.json arrives with
 * the first real map there is nothing to play, so the example map is shown instead.
 */
function firstLevel(): LevelMap {
  const game = bundledFiles.filter((file) => !isExampleFile(file.path));
  const examples = bundledFiles.filter((file) => isExampleFile(file.path));

  const level = loadCatalogue(game).levels[0] ?? loadCatalogue(examples).levels[0];
  if (!level) {
    throw new DataError([{ file: 'data/levels', field: '', message: 'no level to load' }]);
  }
  return level;
}

function startGame(): VNode {
  try {
    // TODO(stage-1): the map and combat core take the numbers. Until then they are only checked.
    loadNumbers(bundledFiles);
    const store = createGameStore(createGame(readSeed()));
    store.dispatch({ type: 'startLevel', map: firstLevel() });
    return (
      <GameContext.Provider value={store}>
        <App />
      </GameContext.Provider>
    );
  } catch (error) {
    if (error instanceof DataError) return <DataErrorScreen problems={error.problems} />;
    throw error;
  }
}

applyTokens(document.documentElement);

const root = document.getElementById('app');
if (!root) throw new Error('index.html has no #app element');

render(<GameCanvas>{startGame()}</GameCanvas>, root);
