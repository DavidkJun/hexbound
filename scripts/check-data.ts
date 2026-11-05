/**
 * Checks every data file with the same code the game uses: `npm run check:data`.
 * The game's own files and the `_` examples are checked as two separate sets.
 */
import { DataError, formatProblem } from '../src/data/data-error';
import { readDataFiles } from '../src/data/disk-files';
import { isExampleFile, loadCatalogue, type RawFile } from '../src/data/load';

function check(name: string, files: RawFile[]): boolean {
  try {
    const { cards, enemies, blessings, events, levels } = loadCatalogue(files);
    console.log(
      `${name}: ok (${cards.size} cards, ${enemies.size} enemies, ${blessings.size} blessings, ` +
        `${events.size} events, ${levels.length} levels)`,
    );
    return true;
  } catch (error) {
    if (!(error instanceof DataError)) throw error;
    console.error(`${name}: ${error.problems.length} problem(s)`);
    error.problems.forEach((problem) => {
      console.error(`  ${formatProblem(problem)}`);
    });
    return false;
  }
}

const files = readDataFiles();
const gameOk = check(
  'game data',
  files.filter((file) => !isExampleFile(file.path)),
);
const examplesOk = check(
  'examples',
  files.filter((file) => isExampleFile(file.path)),
);

process.exitCode = gameOk && examplesOk ? 0 : 1;
