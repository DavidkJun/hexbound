import type { z } from 'zod';
import { DataError, type DataProblem } from './data-error';
import { checkLevelRules } from './level-rules';
import {
  blessingsFileSchema,
  cardsFileSchema,
  enemiesFileSchema,
  eventsFileSchema,
  levelOrderSchema,
  levelSchema,
  numbersSchema,
  tutorialFileSchema,
  type Blessing,
  type Card,
  type Enemy,
  type GameEvent,
  type LevelMap,
  type Numbers,
  type Tutorial,
} from './schema';

/** A data file before parsing. `path` is relative to the repository: `data/cards/starter.json`. */
export interface RawFile {
  readonly path: string;
  readonly text: string;
}

/** All content of the game, checked and ready to use. */
export interface Catalogue {
  readonly cards: ReadonlyMap<string, Card>;
  readonly enemies: ReadonlyMap<string, Enemy>;
  readonly blessings: ReadonlyMap<string, Blessing>;
  readonly events: ReadonlyMap<string, GameEvent>;
  readonly levels: readonly LevelMap[];
  /** The scripted first fight of a new run. Optional until the PM writes it. */
  readonly tutorial: Tutorial | undefined;
}

/** The numbers of DD 4.9. One file, shared by the game and the examples: see loadNumbers. */
export const NUMBERS_FILE = 'data/numbers.json';

const CONTENT_FOLDERS = ['cards', 'enemies', 'blessings', 'events', 'levels', 'tutorial'];
const LEVEL_ORDER_FILE = 'levels';

/** Files starting with `_` are examples or drafts: checked, but never part of the game. */
export function isExampleFile(path: string): boolean {
  return fileName(path).startsWith('_');
}

/**
 * Parses and checks a set of files, which must be complete on their own: ids referred to from one
 * file must exist in the set. Throws a DataError listing every problem found.
 */
export function loadCatalogue(files: readonly RawFile[]): Catalogue {
  const problems: DataProblem[] = files
    .filter((file) => file.path !== NUMBERS_FILE)
    .filter((file) => !CONTENT_FOLDERS.includes(folderName(file.path)))
    .map((file) => ({ file: file.path, field: '', message: 'unknown data folder' }));

  const filesIn = (folder: string) => files.filter((file) => folderName(file.path) === folder);

  const cards = readEntries(filesIn('cards'), cardsFileSchema, problems);
  const enemies = readEntries(filesIn('enemies'), enemiesFileSchema, problems);
  const blessings = readEntries(filesIn('blessings'), blessingsFileSchema, problems);
  const events = readEntries(filesIn('events'), eventsFileSchema, problems);
  const levels = readLevels(filesIn('levels'), enemies, problems);
  const tutorial = readTutorial(filesIn('tutorial'), cards, enemies, problems);
  checkStarterDeck(cards, problems);

  if (problems.length > 0) throw new DataError(problems);
  return { cards, enemies, blessings, events, levels, tutorial };
}

/** Reads data/numbers.json. Throws a DataError listing every problem found. */
export function loadNumbers(files: readonly RawFile[]): Numbers {
  const file = files.find(({ path }) => path === NUMBERS_FILE);
  if (!file) throw new DataError([{ file: NUMBERS_FILE, field: '', message: 'file is missing' }]);

  const problems: DataProblem[] = [];
  const numbers = parseFile(file, numbersSchema, problems);
  if (!numbers) throw new DataError(problems);
  return numbers;
}

/** The starter deck is the cards with rarity "starter", so a set with cards needs some. */
function checkStarterDeck(cards: ReadonlyMap<string, Card>, problems: DataProblem[]): void {
  if (cards.size === 0 || [...cards.values()].some(({ rarity }) => rarity === 'starter')) return;
  problems.push({
    file: 'data/cards',
    field: '',
    message: 'no starter cards: the starter deck is the cards with rarity "starter"',
  });
}

/**
 * At most one tutorial file per set. Its references are checked once the set has cards or
 * enemies, like map rule 10, so a set that leaves them out can still be checked on its own.
 */
function readTutorial(
  files: readonly RawFile[],
  cards: ReadonlyMap<string, Card>,
  enemies: ReadonlyMap<string, Enemy>,
  problems: DataProblem[],
): Tutorial | undefined {
  const [file, ...others] = files;
  if (!file) return undefined;
  for (const other of others) {
    problems.push({ file: other.path, field: '', message: `${file.path} is already the tutorial` });
  }

  const tutorial = parseFile(file, tutorialFileSchema, problems);
  if (!tutorial) return undefined;
  const report = (field: string, message: string): void => {
    problems.push({ file: file.path, field, message });
  };

  const enemy = enemies.get(tutorial.enemy);
  if (enemies.size > 0 && !enemy) report('enemy', `no enemy with the id "${tutorial.enemy}"`);
  if (enemy && enemy.kind !== 'normal') {
    report('enemy', `"${enemy.id}" has kind "${enemy.kind}", the tutorial enemy must be normal`);
  }

  if (cards.size === 0) return tutorial;
  const copiesLeft = new Map<string, number>();
  for (const [i, id] of tutorial.drawOrder.entries()) {
    const field = `drawOrder[${i}]`;
    const card = cards.get(id);
    if (!card) {
      report(field, `no card with the id "${id}"`);
    } else if (card.rarity !== 'starter') {
      report(field, `"${id}" isn't a starter card`);
    } else {
      const left = copiesLeft.get(id) ?? card.copies ?? 0;
      if (left <= 0) report(field, `the starter deck has only ${card.copies ?? 0} "${id}"`);
      copiesLeft.set(id, left - 1);
    }
  }
  return tutorial;
}

/** Reads files that each hold a list of entries with ids. Ids are unique across all the files. */
function readEntries<Entry extends { readonly id: string }>(
  files: readonly RawFile[],
  schema: z.ZodType<Entry[]>,
  problems: DataProblem[],
): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  const fileOfId = new Map<string, string>();

  for (const file of files) {
    parseFile(file, schema, problems)?.forEach((entry, i) => {
      const firstFile = fileOfId.get(entry.id);
      if (firstFile) {
        problems.push({
          file: file.path,
          field: `[${i}].id`,
          message: `"${entry.id}" is already used in ${firstFile}`,
        });
      }
      entries.set(entry.id, entry);
      fileOfId.set(entry.id, file.path);
    });
  }
  return entries;
}

/** Levels in the order of levels.json. Without that file (examples): in file name order. */
function readLevels(
  files: readonly RawFile[],
  enemies: ReadonlyMap<string, Enemy>,
  problems: DataProblem[],
): LevelMap[] {
  const orderFile = files.find((file) => fileName(file.path) === LEVEL_ORDER_FILE);
  const levelFiles = files.filter((file) => file !== orderFile);

  const levels = new Map<string, LevelMap>();
  for (const file of levelFiles) {
    const level = parseFile(file, levelSchema, problems);
    if (!level) continue;
    levels.set(level.id, level);
    for (const problem of checkLevelRules(level, fileName(file.path), enemies)) {
      problems.push({ file: file.path, ...problem });
    }
  }

  if (!orderFile) return [...levels.values()];

  const order = parseFile(orderFile, levelOrderSchema, problems) ?? [];
  const fileNames = new Set(levelFiles.map((file) => fileName(file.path)));
  const listed = new Set<string>();
  for (const id of order) {
    if (listed.has(id)) {
      problems.push({ file: orderFile.path, field: '', message: `"${id}" is listed twice` });
    } else if (!fileNames.has(id)) {
      problems.push({ file: orderFile.path, field: '', message: `no level file for "${id}"` });
    }
    listed.add(id);
  }
  return order.flatMap((id) => levels.get(id) ?? []);
}

function parseFile<Output>(
  file: RawFile,
  schema: z.ZodType<Output>,
  problems: DataProblem[],
): Output | undefined {
  let json: unknown;
  try {
    json = JSON.parse(file.text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    problems.push({ file: file.path, field: '', message: `not valid JSON: ${reason}` });
    return undefined;
  }

  const result = schema.safeParse(json);
  if (result.success) return result.data;

  for (const issue of result.error.issues) {
    problems.push({ file: file.path, field: formatPath(issue.path), message: issue.message });
  }
  return undefined;
}

/** `['slots', 3, 'at']` becomes `slots[3].at`. */
function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((text, key) => {
    if (typeof key === 'number') return `${text}[${key}]`;
    return text ? `${text}.${String(key)}` : String(key);
  }, '');
}

function fileName(path: string): string {
  return (path.split('/').at(-1) ?? path).replace(/\.json$/, '');
}

function folderName(path: string): string {
  return path.split('/').at(-2) ?? '';
}
