/**
 * TC-LVL: design targets for every map in data/levels (map-format.md "Design targets per map" and
 * the design document). Runs on the example map now and on every real map the moment it is added,
 * so food and route maths are checked before a playtest depends on them.
 */
import { describe, expect, it } from 'vitest';
import { distance, neighbours, sameHex, type Hex } from '../../src/core/hex';
import { routeFoodCost, terrainAt } from '../../src/core/terrain';
import { loadCatalogue } from '../../src/data/load';
import type { LevelMap } from '../../src/data/schema';
import { exampleFiles, gameFiles } from './helpers';

const levels: LevelMap[] = [
  ...loadCatalogue(exampleFiles).levels,
  ...(gameFiles.length > 0 ? loadCatalogue(gameFiles).levels : []),
];
const at = (level: LevelMap, hex: Hex) =>
  [...level.fixed.map((f) => ({ at: f.at, types: [f.type] })), ...level.slots.map((s) => ({ at: s.at, types: s.allow }))].find(
    (p) => sameHex(p.at, hex),
  )?.types ?? [];
const passes = (level: LevelMap, route: readonly Hex[], type: string) => route.some((hex) => at(level, hex).includes(type as never));

/** Shortest path in food from start to boss using only normal tiles; Infinity if none. */
function hazardFreePathExists(level: LevelMap): boolean {
  const key = (h: Hex) => `${h[0]},${h[1]}`;
  const seen = new Set([key(level.start)]);
  const queue: Hex[] = [level.start];
  while (queue.length > 0) {
    const current = queue.shift() as Hex;
    if (sameHex(current, level.boss.at)) return true;
    for (const n of neighbours(current)) {
      if (!seen.has(key(n)) && terrainAt(level, n) === 'normal') {
        seen.add(key(n));
        queue.push(n);
      }
    }
  }
  return false;
}

describe.each(levels.map((l) => [l.id, l] as const))('TC-LVL map %s', (_, level) => {
  const { direct, safe, rich } = level.intendedRoutes;
  const cost = (route: readonly Hex[]) => routeFoodCost(level, route);

  it('TC-LVL-01 start and boss are in opposite corners, 9–10 steps apart', () => {
    const corners: Hex[] = [[0, 0], [8, 0], [0, 6], [8, 6]];
    expect(corners.some((c) => sameHex(c, level.start))).toBe(true);
    expect(corners.some((c) => sameHex(c, level.boss.at))).toBe(true);
    expect(level.start[0]).not.toBe(level.boss.at[0]);
    expect(level.start[1]).not.toBe(level.boss.at[1]);
    expect(distance(level.start, level.boss.at)).toBeGreaterThanOrEqual(9);
    expect(distance(level.start, level.boss.at)).toBeLessThanOrEqual(10);
  });
  it('TC-LVL-02 startFood covers the direct route plus about 3 spare steps (2–4)', () => {
    const spare = level.startFood - cost(direct);
    expect(spare).toBeGreaterThanOrEqual(2);
    expect(spare).toBeLessThanOrEqual(4);
  });
  it('TC-LVL-03 direct is the cheapest of the three routes in food', () => {
    expect(cost(direct)).toBeLessThanOrEqual(cost(safe));
    expect(cost(direct)).toBeLessThanOrEqual(cost(rich));
  });
  it('TC-LVL-04 every intended route is affordable with startFood', () => {
    for (const route of [direct, safe, rich]) expect(cost(route)).toBeLessThanOrEqual(level.startFood);
  });
  it('TC-LVL-05 direct passes an elite, safe passes a village, rich passes a chest or shrine', () => {
    expect(passes(level, direct, 'elite')).toBe(true);
    expect(passes(level, safe, 'village')).toBe(true);
    expect(passes(level, rich, 'chest') || passes(level, rich, 'shrine')).toBe(true);
  });
  it('TC-LVL-06 the three routes are different', () => {
    const s = (r: readonly Hex[]) => JSON.stringify(r);
    expect(new Set([s(direct), s(safe), s(rich)]).size).toBe(3);
  });
  it('TC-LVL-07 the boss can be reached without stepping on any hazard tile', () => {
    expect(hazardFreePathExists(level)).toBe(true);
  });
  it('TC-LVL-08 no route visits a tile twice', () => {
    for (const route of [direct, safe, rich]) expect(new Set(route.map((h) => `${h[0]},${h[1]}`)).size).toBe(route.length);
  });
  it('TC-LVL-09 the map uses its hazard (at least one hazard tile)', () => {
    expect(level.terrain.join('')).toMatch(/[sil]/);
  });
});
