import type { RawFile } from './load';

// Raw text, so a file with broken JSON reaches the game's own error screen instead of failing the
// build with a bundler error.
const modules = import.meta.glob<string>(['/data/*/*.json', '/data/numbers.json'], {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** Every file in data/, bundled into the game. Only code that runs in the browser can use this. */
export const bundledFiles: readonly RawFile[] = Object.entries(modules).map(([path, text]) => ({
  path: path.slice(1),
  text,
}));
