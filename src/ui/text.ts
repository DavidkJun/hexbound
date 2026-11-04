import strings from '../../data/text.json';

/** Text the player sees that isn't part of a content file. Never type it in code. */
export function t(key: keyof typeof strings): string {
  return strings[key];
}
