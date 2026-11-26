/**
 * Checks every data file with the same code the game uses: `npm run check:data`.
 * The game's own files and the `_` examples are checked as two separate sets; numbers.json is shared.
 */
import { DataError, formatProblem } from '../src/data/data-error';
import { readDataFiles } from '../src/data/disk-files';
import { isExampleFile, loadCatalogue, loadNumbers, type RawFile } from '../src/data/load';

function check(name: string, load: () => string): boolean {
  try {
    console.log(`${name}: ok (${load()})`);
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

function contentSummary(files: RawFile[]): string {
  const { cards, enemies, blessings, events, levels, tutorial } = loadCatalogue(files);
  return (
    `${cards.size} cards, ${enemies.size} enemies, ${blessings.size} blessings, ` +
    `${events.size} events, ${levels.length} levels, ${tutorial ? 'a' : 'no'} tutorial`
  );
}

const files = readDataFiles();
const results = [
  check('numbers', () => {
    loadNumbers(files);
    return 'data/numbers.json';
  }),
  check('game data', () => contentSummary(files.filter((file) => !isExampleFile(file.path)))),
  check('examples', () => contentSummary(files.filter((file) => isExampleFile(file.path)))),
];

process.exitCode = results.every(Boolean) ? 0 : 1;
