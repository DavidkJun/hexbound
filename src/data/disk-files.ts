import { globSync, readFileSync } from 'node:fs';
import type { RawFile } from './load';

/** Every file in data/, read from disk. Only for tests and scripts; the game uses bundled-files. */
export function readDataFiles(): RawFile[] {
  return globSync(['data/*/*.json', 'data/numbers.json']).map((match) => {
    const path = match.replaceAll('\\', '/');
    return { path, text: readFileSync(path, 'utf8') };
  });
}
