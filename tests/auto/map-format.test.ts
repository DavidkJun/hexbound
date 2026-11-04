/**
 * TC-MAP: acceptance tests for the map file format, design/levels/map-format.md.
 * One block per rule, a valid case and at least one invalid case each, plus boundaries.
 * Every failure must name the file and the field (ui-rules.md §9).
 */
import { describe, expect, it } from 'vitest';
import {
  EXAMPLE_LEVEL_PATH,
  exampleFiles,
  levelWith,
  problemsOf,
  rawFile,
  withLevel,
} from './helpers';

const fieldsOf = (changes: Record<string, unknown>, path = EXAMPLE_LEVEL_PATH) =>
  problemsOf(withLevel(levelWith(changes), path)).map((p) => p.field);

const problemsWith = (changes: Record<string, unknown>, path = EXAMPLE_LEVEL_PATH) =>
  problemsOf(withLevel(levelWith(changes), path));

describe('TC-MAP-00 baseline', () => {
  it('TC-MAP-00 the example map is valid as written', () => {
    expect(problemsOf(exampleFiles)).toEqual([]);
  });
});

describe('TC-MAP-01 rule 1: id equals the file name', () => {
  it('TC-MAP-01a accepts the id of a renamed file when they match', () => {
    expect(problemsWith({ id: 'whisperwood' }, 'data/levels/whisperwood.json')).toEqual([]);
  });
  it('TC-MAP-01b rejects an id that differs from the file name', () => {
    const problems = problemsWith({ id: 'frostpeak' }, 'data/levels/whisperwood.json');
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ file: 'data/levels/whisperwood.json', field: 'id' });
  });
  it('TC-MAP-01c rejects an id that is not kebab-case', () => {
    expect(fieldsOf({ id: 'Ashen_Citadel' }, 'data/levels/Ashen_Citadel.json')).toContain('id');
  });
});

describe('TC-MAP-02 rule 2: land and hazard go together', () => {
  const pairs = [
    ['whisperwood', 'swamp', 's'],
    ['frostpeak', 'ice', 'i'],
    ['ashen', 'lava', 'l'],
  ] as const;

  it.each(pairs)('TC-MAP-02a accepts %s + %s', (land, hazard, char) => {
    const terrain = ['.........', '.........', `...${char}${char}....`, '.........', '.........', '.........', '.........'];
    expect(problemsWith({ land, hazard, terrain })).toEqual([]);
  });

  it.each([
    ['whisperwood', 'ice'],
    ['frostpeak', 'lava'],
    ['ashen', 'swamp'],
  ])('TC-MAP-02b rejects %s + %s', (land, hazard) => {
    const terrain = Array(7).fill('.........');
    expect(fieldsOf({ land, hazard, terrain })).toEqual(['hazard']);
  });

  it('TC-MAP-02c rejects an unknown land', () => {
    expect(fieldsOf({ land: 'desert' })).toContain('land');
  });
});

describe('TC-MAP-03 rule 3: terrain is 7 × 9 of "." and the own hazard', () => {
  const rows = (lines: string[]) => ({ terrain: lines });
  const normal = Array<string>(7).fill('.........');

  it('TC-MAP-03a accepts an all-normal map', () => {
    expect(problemsWith(rows(normal))).toEqual([]);
  });
  it('TC-MAP-03b rejects 6 rows', () => {
    expect(fieldsOf(rows(normal.slice(1)))).toContain('terrain');
  });
  it('TC-MAP-03c rejects 8 rows', () => {
    expect(fieldsOf(rows([...normal, '.........']))).toContain('terrain');
  });
  it('TC-MAP-03d rejects a row of 8 characters and names the row', () => {
    const lines = [...normal];
    lines[3] = '........';
    expect(fieldsOf(rows(lines))).toEqual(['terrain[3]']);
  });
  it('TC-MAP-03e rejects a row of 10 characters', () => {
    const lines = [...normal];
    lines[0] = '..........';
    expect(fieldsOf(rows(lines))).toEqual(['terrain[0]']);
  });
  it('TC-MAP-03f rejects another level\'s hazard and names the tile', () => {
    const lines = [...normal];
    lines[2] = '....i....';
    const problems = problemsWith(rows(lines));
    expect(problems).toHaveLength(1);
    expect(problems[0]?.field).toBe('terrain[2]');
    expect(problems[0]?.message).toContain('4,2');
  });
  it('TC-MAP-03g rejects an unknown character', () => {
    const lines = [...normal];
    lines[1] = '...x.....';
    expect(fieldsOf(rows(lines))).toEqual(['terrain[1]']);
  });
  it('TC-MAP-03h rejects terrain that is not a list of strings', () => {
    expect(fieldsOf({ terrain: '.........' })).toContain('terrain');
  });
});

describe('TC-MAP-04 rule 4: every coordinate is inside the grid', () => {
  const corners = [
    [0, 0],
    [8, 0],
    [0, 6],
    [8, 6],
  ];

  it.each(corners)('TC-MAP-04a accepts a slot on the corner %i,%i (boundary)', (col, row) => {
    const level = levelWith({});
    const slots = (level.slots as { at: number[] }[]).filter(
      (s) => !(s.at[0] === col && s.at[1] === row),
    );
    const taken = [level.start, (level.boss as { at: number[] }).at].some(
      (at) => (at as number[])[0] === col && (at as number[])[1] === row,
    );
    if (taken) return; // start and boss sit on two of the corners
    expect(problemsOf(withLevel({ ...level, slots: [...slots, { at: [col, row], allow: ['chest'] }] }))).toEqual([]);
  });

  it.each([
    ['col -1', [-1, 3]],
    ['col 9', [9, 3]],
    ['row -1', [3, -1]],
    ['row 7', [3, 7]],
    ['a fraction', [2.5, 3]],
    ['three numbers', [2, 3, 1]],
    ['one number', [2]],
  ])('TC-MAP-04b rejects a slot at %s', (_, at) => {
    const level = levelWith({});
    const slots = [...(level.slots as object[]), { at, allow: ['chest'] }];
    const fields = problemsOf(withLevel({ ...level, slots })).map((p) => p.field);
    expect(fields.some((f) => f.startsWith('slots[11].at'))).toBe(true);
  });

  it('TC-MAP-04c rejects a start outside the grid', () => {
    expect(fieldsOf({ start: [0, 7] }).some((f) => f.startsWith('start'))).toBe(true);
  });

  it('TC-MAP-04d rejects a route step outside the grid', () => {
    const level = levelWith({});
    const routes = level.intendedRoutes as Record<string, number[][]>;
    const direct = [...(routes.direct ?? [])];
    direct.splice(1, 0, [-1, 6]);
    const fields = problemsOf(withLevel({ ...level, intendedRoutes: { ...routes, direct } })).map(
      (p) => p.field,
    );
    expect(fields.some((f) => f.startsWith('intendedRoutes.direct[1]'))).toBe(true);
  });

  // ui-rules.md §9 asks for "file, field, coordinate". The schema message only says "Too big".
  it.fails('BUG-004 TC-MAP-04e the message for a tile outside the grid shows the bad coordinate', () => {
    const problems = problemsWith({ start: [9, 6] });
    expect(problems.some((p) => p.message.includes('9'))).toBe(true);
  });
});

describe('TC-MAP-05 rule 5: start and boss are on normal tiles', () => {
  const terrainWithSwampAt = (col: number, row: number) => {
    const lines = Array<string>(7).fill('.........');
    const line = lines[row] ?? '';
    lines[row] = line.slice(0, col) + 's' + line.slice(col + 1);
    return lines;
  };

  it('TC-MAP-05a rejects a start on swamp', () => {
    expect(fieldsOf({ terrain: terrainWithSwampAt(0, 6) })).toEqual(['start']);
  });
  it('TC-MAP-05b rejects a boss on swamp', () => {
    expect(fieldsOf({ terrain: terrainWithSwampAt(8, 0) })).toEqual(['boss.at']);
  });
  it('TC-MAP-05c allows a fixed village on a hazard tile', () => {
    expect(problemsWith({ terrain: terrainWithSwampAt(1, 3) })).toEqual([]);
  });
  it('TC-MAP-05d allows a slot on a hazard tile', () => {
    expect(problemsWith({ terrain: terrainWithSwampAt(5, 3) })).toEqual([]);
  });
});

describe('TC-MAP-06 rule 6: no two places share a tile', () => {
  it('TC-MAP-06a rejects a slot on the start tile', () => {
    const level = levelWith({});
    const slots = [...(level.slots as object[]), { at: [0, 6], allow: ['chest'] }];
    expect(problemsOf(withLevel({ ...level, slots })).map((p) => p.field)).toEqual(['slots[11].at']);
  });
  it('TC-MAP-06b rejects a fixed location on the boss tile', () => {
    expect(fieldsOf({ fixed: [{ at: [8, 0], type: 'village' }] })).toEqual(['fixed[0].at']);
  });
  it('TC-MAP-06c rejects two slots on one tile', () => {
    const level = levelWith({});
    const slots = [...(level.slots as object[]), { at: [2, 5], allow: ['chest'] }];
    const problems = problemsOf(withLevel({ ...level, slots }));
    expect(problems.map((p) => p.field)).toEqual(['slots[11].at']);
    expect(problems[0]?.message).toContain('slots[0].at');
  });
  it('TC-MAP-06d rejects start and boss on the same tile', () => {
    expect(fieldsOf({ boss: { at: [0, 6], enemy: 'goblin-chief' } })).toContain('boss.at');
  });
});

describe('TC-MAP-07 rule 7: location types and allow lists', () => {
  it.each(['monster', 'elite', 'chest', 'locked-chest', 'village', 'shrine', 'mystery'])(
    'TC-MAP-07a accepts the type %s',
    (type) => {
      expect(problemsWith({ fixed: [{ at: [1, 3], type }] })).toEqual([]);
    },
  );
  it.each(['start', 'boss', 'shop', 'Village', ''])('TC-MAP-07b rejects the type "%s"', (type) => {
    expect(fieldsOf({ fixed: [{ at: [1, 3], type }] })).toEqual(['fixed[0].type']);
  });
  it('TC-MAP-07c rejects an empty allow list', () => {
    const level = levelWith({});
    const slots = [...(level.slots as object[]), { at: [0, 0], allow: [] }];
    expect(problemsOf(withLevel({ ...level, slots })).map((p) => p.field)).toEqual([
      'slots[11].allow',
    ]);
  });
  it('TC-MAP-07d rejects an unknown type inside an allow list', () => {
    const level = levelWith({});
    const slots = [...(level.slots as object[]), { at: [0, 0], allow: ['chest', 'casino'] }];
    expect(problemsOf(withLevel({ ...level, slots })).map((p) => p.field)).toEqual([
      'slots[11].allow[1]',
    ]);
  });
  it('TC-MAP-07e accepts a map with no fixed locations and no slots', () => {
    expect(problemsWith({ fixed: [], slots: [] })).toEqual([]);
  });
});

describe('TC-MAP-08 rule 8: intended routes are walkable', () => {
  const routes = () => structuredClone(levelWith({}).intendedRoutes) as Record<string, number[][]>;

  it('TC-MAP-08a rejects a route that does not start at start', () => {
    const r = routes();
    r.safe = (r.safe ?? []).slice(1);
    expect(fieldsOf({ intendedRoutes: r })).toContain('intendedRoutes.safe');
  });
  it('TC-MAP-08b rejects a route that does not end at the boss', () => {
    const r = routes();
    r.rich = (r.rich ?? []).slice(0, -1);
    expect(fieldsOf({ intendedRoutes: r })).toContain('intendedRoutes.rich');
  });
  it('TC-MAP-08c rejects a jump between tiles that are not neighbours and names the step', () => {
    const r = routes();
    r.direct = [[0, 6], [2, 5], ...(r.direct ?? []).slice(3)];
    const problems = problemsWith({ intendedRoutes: r });
    expect(problems.map((p) => p.field)).toEqual(['intendedRoutes.direct[1]']);
    expect(problems[0]?.message).toContain('2,5');
  });
  it('TC-MAP-08d uses odd-q neighbours: [1,5] → [2,5] is a step, [1,5] → [2,4] is not', () => {
    // odd column 1: neighbours of [1,5] are [2,5] [2,6] [0,5] [0,6] [1,4] [1,6]
    const r = routes();
    r.direct = [[0, 6], [1, 5], [2, 4], [3, 4], [4, 4], [5, 3], [6, 3], [7, 2], [8, 2], [8, 1], [8, 0]];
    expect(fieldsOf({ intendedRoutes: r })).toEqual(['intendedRoutes.direct[2]']);
  });
  it('TC-MAP-08e rejects a route of one tile', () => {
    const r = routes();
    r.safe = [[0, 6]];
    expect(fieldsOf({ intendedRoutes: r }).some((f) => f.startsWith('intendedRoutes.safe'))).toBe(true);
  });
  it('TC-MAP-08f rejects a missing route', () => {
    const r = routes();
    delete r.rich;
    expect(fieldsOf({ intendedRoutes: r })).toContain('intendedRoutes.rich');
  });
  it('TC-MAP-08g rejects a fourth, unknown route', () => {
    const r = routes();
    r.scenic = r.safe ?? [];
    expect(fieldsOf({ intendedRoutes: r })).toContain('intendedRoutes');
  });
});

describe('TC-MAP-09 rule 9: startFood is a positive whole number ≥ the direct route cost', () => {
  // Direct route of the example: 10 steps, all on normal tiles → cost 10.
  it('TC-MAP-09a accepts startFood equal to the direct cost (boundary)', () => {
    expect(problemsWith({ startFood: 10 })).toEqual([]);
  });
  it('TC-MAP-09b rejects startFood one below the direct cost (boundary)', () => {
    const problems = problemsWith({ startFood: 9 });
    expect(problems.map((p) => p.field)).toEqual(['startFood']);
    expect(problems[0]?.message).toContain('10');
  });
  it('TC-MAP-09c counts a swamp step as 2 food', () => {
    // Put swamp on [1,5], the first step of the direct route: cost becomes 11.
    const terrain = ['.........', '.........', '...ss....', '...ss....', '..s......', '.s.......', '.........'];
    expect(problemsWith({ terrain, startFood: 11 })).toEqual([]);
    expect(fieldsOf({ terrain, startFood: 10 })).toEqual(['startFood']);
  });
  it.each([0, -3, 12.5, '13', null])('TC-MAP-09d rejects startFood %s', (startFood) => {
    expect(fieldsOf({ startFood })).toContain('startFood');
  });
});

describe('TC-MAP-10 rule 10: boss.enemy is an existing enemy', () => {
  it('TC-MAP-10a accepts the example boss goblin-chief', () => {
    expect(problemsOf(exampleFiles)).toEqual([]);
  });
  it('TC-MAP-10b rejects an unknown boss id when enemy files exist', () => {
    expect(fieldsOf({ boss: { at: [8, 0], enemy: 'ember-dragon' } })).toEqual(['boss.enemy']);
  });
  it('TC-MAP-10c skips the check while there are no enemy files (stage 0)', () => {
    const level = levelWith({ boss: { at: [8, 0], enemy: 'ember-dragon' } });
    expect(problemsOf([rawFile(EXAMPLE_LEVEL_PATH, level)])).toEqual([]);
  });
});

describe('TC-MAP-11 file-level checks', () => {
  it('TC-MAP-11a reports broken JSON with the file name', () => {
    const problems = problemsOf(withLevel('{ "id": "_example", ', EXAMPLE_LEVEL_PATH));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ file: EXAMPLE_LEVEL_PATH, field: '' });
    expect(problems[0]?.message).toMatch(/JSON/);
  });
  it('TC-MAP-11b rejects an unknown field (typo protection)', () => {
    expect(fieldsOf({ startfood: 13 })).toContain('');
  });
  it('TC-MAP-11c reports every problem at once', () => {
    const problems = problemsWith({ id: 'x', startFood: 1, hazard: 'ice' });
    expect(new Set(problems.map((p) => p.field))).toEqual(new Set(['id', 'hazard', 'terrain[2]', 'terrain[3]', 'terrain[4]', 'startFood']));
  });
});

describe('TC-MAP-12 levels.json', () => {
  const realLevel = (id: string) => rawFile(`data/levels/${id}.json`, levelWith({ id }));

  it('TC-MAP-12a plays the levels in the listed order', () => {
    const files = [
      ...exampleFiles.filter((f) => !f.path.startsWith('data/levels/')),
      realLevel('frostpeak-test'),
      realLevel('whisperwood-test'),
      rawFile('data/levels/levels.json', ['whisperwood-test', 'frostpeak-test']),
    ];
    expect(problemsOf(files)).toEqual([]);
  });

  it('TC-MAP-12b reports a listed level without a file', () => {
    const files = [
      ...exampleFiles.filter((f) => !f.path.startsWith('data/levels/')),
      realLevel('whisperwood-test'),
      rawFile('data/levels/levels.json', ['whisperwood-test', 'frostpeak']),
    ];
    expect(problemsOf(files).map((p) => p.file)).toEqual(['data/levels/levels.json']);
  });

  // map-format.md: "The game loads exactly these files, in this order" — a level listed twice
  // would be played twice. Nothing in the format allows that, but the loader accepts it.
  it.fails('BUG-002 TC-MAP-12c rejects a level listed twice in levels.json', () => {
    const files = [
      ...exampleFiles.filter((f) => !f.path.startsWith('data/levels/')),
      realLevel('whisperwood-test'),
      rawFile('data/levels/levels.json', ['whisperwood-test', 'whisperwood-test']),
    ];
    expect(problemsOf(files)).not.toEqual([]);
  });
});
