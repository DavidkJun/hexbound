import { readFileSync } from 'node:fs';
import { DataError, type DataProblem } from '../../src/data/data-error';
import { readDataFiles } from '../../src/data/disk-files';
import { isExampleFile, loadCatalogue, type RawFile } from '../../src/data/load';

export const EXAMPLE_LEVEL_PATH = 'data/levels/_example.json';

/** The example map as plain JSON, so tests can break one field at a time. */
export const exampleLevel = JSON.parse(readFileSync(EXAMPLE_LEVEL_PATH, 'utf8')) as Record<
  string,
  unknown
>;

/** All `_` example files: a complete, valid set (cards, enemies, blessings, events, one level). */
export const exampleFiles: readonly RawFile[] = readDataFiles().filter((f) => isExampleFile(f.path));

/** The real game files (no `_` prefix). Empty in stage 0. */
export const gameFiles: readonly RawFile[] = readDataFiles().filter((f) => !isExampleFile(f.path));

export function rawFile(path: string, content: unknown): RawFile {
  return { path, text: typeof content === 'string' ? content : JSON.stringify(content) };
}

/** Problems the loader reports for a set of files; [] when the set loads. */
export function problemsOf(files: readonly RawFile[]): readonly DataProblem[] {
  try {
    loadCatalogue(files);
  } catch (error) {
    if (error instanceof DataError) return error.problems;
    throw error;
  }
  return [];
}

/** The example set with the example map replaced by `level` (written at `path`). */
export function withLevel(level: unknown, path = EXAMPLE_LEVEL_PATH): RawFile[] {
  return [...exampleFiles.filter((f) => f.path !== EXAMPLE_LEVEL_PATH), rawFile(path, level)];
}

/** The example map with some fields changed. */
export function levelWith(changes: Record<string, unknown>): Record<string, unknown> {
  return { ...structuredClone(exampleLevel), ...changes };
}

/** The example set with one content file replaced. */
export function withFile(path: string, content: unknown): RawFile[] {
  return [...exampleFiles.filter((f) => f.path !== path), rawFile(path, content)];
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function readText(path: string): string {
  return readFileSync(path, 'utf8');
}
