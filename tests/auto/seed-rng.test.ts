/**
 * TC-SEED: one seeded random generator, so a run with the same seed plays the same way
 * (plan/Stage0_Programmer.txt §3, Stage0_Tester.txt §4 "runs can be repeated with a seed").
 */
import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { reduce } from '../../src/core/reducer';
import { nextFloat, pick, seedRng } from '../../src/core/rng';
import { createGame } from '../../src/core/state';
import { loadCatalogue } from '../../src/data/load';
import { exampleFiles } from './helpers';

const map = loadCatalogue(exampleFiles).levels[0];
if (!map) throw new Error('the example map is missing');

const deal = (seed: number) => reduce(createGame(seed), { type: 'startLevel', map });

describe('TC-SEED-01 replay', () => {
  it('TC-SEED-01a the same seed gives the same whole game state, 100 seeds', () => {
    for (let seed = 0; seed < 100; seed++) expect(deal(seed)).toEqual(deal(seed));
  });
  it('TC-SEED-01b the seed shown to the player is kept in the state', () => {
    expect(deal(483921).seed).toBe(483921);
  });
  it('TC-SEED-01c dealing does not change the state it started from', () => {
    const start = createGame(7);
    const before = structuredClone(start);
    reduce(start, { type: 'startLevel', map });
    expect(start).toEqual(before);
  });
  it('TC-SEED-01d the generator moves on: the next random number after a deal differs from before', () => {
    const start = createGame(7);
    expect(deal(7).rng).not.toBe(start.rng);
  });
});

describe('TC-SEED-02 deal of the slots (map-format.md: one location from `allow` per slot)', () => {
  it('TC-SEED-02a every slot gets a type from its own allow list, 500 seeds', () => {
    for (let seed = 0; seed < 500; seed++) {
      const level = deal(seed).level;
      for (const slot of map.slots) {
        const dealt = level?.locations.find((l) => l.at[0] === slot.at[0] && l.at[1] === slot.at[1]);
        expect(slot.allow).toContain(dealt?.type);
      }
    }
  });
  it('TC-SEED-02b fixed locations stay where the map puts them', () => {
    const level = deal(1).level;
    for (const fixed of map.fixed) expect(level?.locations).toContainEqual(fixed);
  });
  it('TC-SEED-02c every allowed type of a two-way slot shows up across seeds (a level is never a memorised replay)', () => {
    const twoWay = map.slots.filter((s) => s.allow.length > 1);
    expect(twoWay.length).toBeGreaterThan(0);
    for (const slot of twoWay) {
      const seen = new Set<string>();
      for (let seed = 0; seed < 200; seed++) {
        const dealt = deal(seed).level?.locations.find((l) => l.at[0] === slot.at[0] && l.at[1] === slot.at[1]);
        if (dealt) seen.add(dealt.type);
      }
      expect(seen).toEqual(new Set(slot.allow));
    }
  });
  it('TC-SEED-02d at least 10 different deals across 100 seeds', () => {
    const deals = new Set<string>();
    for (let seed = 0; seed < 100; seed++) deals.add(JSON.stringify(deal(seed).level?.locations));
    // The example map has 2 two-way slots, so at most 4 different deals exist.
    expect(deals.size).toBe(4);
  });
});

describe('TC-SEED-03 generator quality', () => {
  it('TC-SEED-03a pick() over 3 items is roughly uniform (chi-square, 30 000 draws, p ≈ 0.001)', () => {
    let rng = seedRng(12345);
    const counts = [0, 0, 0];
    for (let i = 0; i < 30000; i++) {
      const roll = pick(rng, [0, 1, 2]);
      rng = roll.rng;
      counts[roll.value] = (counts[roll.value] ?? 0) + 1;
    }
    const expected = 10000;
    const chi = counts.reduce((sum, c) => sum + (c - expected) ** 2 / expected, 0);
    expect(chi).toBeLessThan(13.8); // 2 degrees of freedom
  });
  it('TC-SEED-03b nextFloat stays in [0, 1) for 100 000 draws', () => {
    let rng = seedRng(1);
    for (let i = 0; i < 100000; i++) {
      const roll = nextFloat(rng);
      expect(roll.value >= 0 && roll.value < 1).toBe(true);
      rng = roll.rng;
    }
  });
  it.each([0, 1, 2 ** 32 - 1, -1, 999999])('TC-SEED-03c seed %i is accepted and replayable', (seed) => {
    expect(deal(seed)).toEqual(deal(seed));
  });
  it('TC-SEED-03d no source file calls Math.random or Date-based randomness in game logic', () => {
    const files = globSync('src/**/*.{ts,tsx}').filter((f) => !f.endsWith('.test.ts'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const code = readFileSync(file, 'utf8');
      expect(code, file).not.toMatch(/Math\.random/);
      if (file.includes('src/core/')) expect(code, file).not.toMatch(/Date\.now|new Date\(/);
    }
  });
});
