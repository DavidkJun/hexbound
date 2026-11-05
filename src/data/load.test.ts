import { describe, expect, it } from 'vitest';
import exampleLevel from '../../data/levels/_example.json';
import { DataError, type DataProblem } from './data-error';
import { readDataFiles } from './disk-files';
import { isExampleFile, loadCatalogue, type RawFile } from './load';

const EXAMPLE_PATH = 'data/levels/_example.json';

const exampleFiles = readDataFiles().filter((example) => isExampleFile(example.path));

function problemsOf(files: readonly RawFile[]): readonly DataProblem[] {
  try {
    loadCatalogue(files);
  } catch (error) {
    if (error instanceof DataError) return error.problems;
    throw error;
  }
  return [];
}

function file(path: string, content: unknown): RawFile {
  return { path, text: JSON.stringify(content) };
}

/** The problems of the example map after changing some of its fields. */
function levelProblems(changes: object, path = EXAMPLE_PATH): readonly DataProblem[] {
  return problemsOf([
    ...exampleFiles.filter((example) => example.path !== EXAMPLE_PATH),
    file(path, { ...exampleLevel, ...changes }),
  ]);
}

describe('the example files', () => {
  it('pass every check', () => {
    expect(problemsOf(exampleFiles)).toEqual([]);
  });

  it('hold one or more entries of every type', () => {
    const catalogue = loadCatalogue(exampleFiles);
    expect(catalogue.cards.size).toBeGreaterThan(0);
    expect(catalogue.enemies.size).toBeGreaterThan(0);
    expect(catalogue.blessings.size).toBeGreaterThan(0);
    expect(catalogue.events.size).toBeGreaterThan(0);
    expect(catalogue.levels.map((level) => level.id)).toEqual(['_example']);
  });
});

describe('isExampleFile', () => {
  it('goes by the underscore at the start of the file name', () => {
    expect(isExampleFile('data/cards/_example.json')).toBe(true);
    expect(isExampleFile('data/cards/starter.json')).toBe(false);
  });
});

describe('map rules from design/levels/map-format.md', () => {
  const route = exampleLevel.intendedRoutes.direct;

  it.each<[rule: string, changes: object, field: string, message: string]>([
    ['1: id equals the file name', { id: 'other' }, 'id', 'must equal the file name'],
    ['2: land goes with hazard', { hazard: 'ice' }, 'hazard', 'must be "swamp"'],
    [
      '3: seven rows',
      { terrain: ['.........'] },
      'terrain',
      'Too small', // zod's wording for a list of the wrong size
    ],
    [
      '3: nine characters per row',
      { terrain: ['...', ...exampleLevel.terrain.slice(1)] },
      'terrain[0]',
      'must be 9 of the characters',
    ],
    [
      "3: only the level's own hazard",
      { terrain: ['i........', ...exampleLevel.terrain.slice(1)] },
      'terrain[0]',
      'tile 0,0: "i"',
    ],
    ['4: tiles inside the grid', { start: [9, 0] }, 'start[0]', 'Too big'],
    [
      '5: start on normal terrain',
      { terrain: Array<string>(7).fill('sssssssss') },
      'start',
      'tile 0,6 must be normal',
    ],
    [
      '6: no shared tiles',
      { fixed: [{ at: exampleLevel.start, type: 'village' }] },
      'fixed[0].at',
      'already used by start',
    ],
    [
      '7: known location types',
      { fixed: [{ at: [1, 3], type: 'castle' }] },
      'fixed[0].type',
      'Invalid option',
    ],
    [
      '7: allow lists are not empty',
      { slots: [{ at: [2, 5], allow: [] }] },
      'slots[0].allow',
      'Too small',
    ],
    [
      '8: routes start at start',
      { intendedRoutes: { ...exampleLevel.intendedRoutes, direct: route.slice(1) } },
      'intendedRoutes.direct',
      'must start at start',
    ],
    [
      '8: routes end at the boss',
      { intendedRoutes: { ...exampleLevel.intendedRoutes, direct: route.slice(0, -1) } },
      'intendedRoutes.direct',
      'must end at the boss',
    ],
    [
      '8: each step is a neighbour',
      {
        intendedRoutes: {
          ...exampleLevel.intendedRoutes,
          direct: [route[0], ...route.slice(2)],
        },
      },
      'intendedRoutes.direct[1]',
      'is not next to',
    ],
    ['9: food is positive', { startFood: 0 }, 'startFood', 'Too small'],
    ['9: food covers the direct route', { startFood: 9 }, 'startFood', 'cost of 10'],
    [
      '10: boss enemy exists',
      { boss: { ...exampleLevel.boss, enemy: 'nobody' } },
      'boss.enemy',
      'no enemy with the id "nobody"',
    ],
  ])('rule %s', (_rule, changes, field, message) => {
    expect(levelProblems(changes)).toContainEqual({
      file: EXAMPLE_PATH,
      field,
      message: expect.stringContaining(message) as string,
    });
  });

  it('skips rule 10 until enemy files exist', () => {
    expect(problemsOf([file(EXAMPLE_PATH, exampleLevel)])).toEqual([]);
  });

  it('lists every problem at once, not just the first', () => {
    const fields = levelProblems({ id: 'other', startFood: 9 }).map(({ field }) => field);
    expect(fields).toEqual(['id', 'startFood']);
  });
});

describe('level order', () => {
  const level = (id: string) => file(`data/levels/${id}.json`, { ...exampleLevel, id });

  it('follows levels.json', () => {
    const { levels } = loadCatalogue([
      level('aaa'),
      level('bbb'),
      file('data/levels/levels.json', ['bbb', 'aaa']),
    ]);
    expect(levels.map(({ id }) => id)).toEqual(['bbb', 'aaa']);
  });

  it('loads only the levels it lists', () => {
    const { levels } = loadCatalogue([
      level('aaa'),
      level('bbb'),
      file('data/levels/levels.json', ['bbb']),
    ]);
    expect(levels.map(({ id }) => id)).toEqual(['bbb']);
  });

  it('reports a listed level with no file', () => {
    expect(problemsOf([file('data/levels/levels.json', ['gone'])])).toEqual([
      { file: 'data/levels/levels.json', field: '', message: 'no level file for "gone"' },
    ]);
  });
});

describe('content files', () => {
  const card = {
    id: 'strike',
    name: 'Strike',
    family: 'weapon',
    cost: 1,
    effects: [{ type: 'dealDamage', amount: 6 }],
    text: 'Deal 6 damage.',
  };
  const boss = {
    id: 'chief',
    name: 'Chief',
    kind: 'boss',
    health: 90,
    moves: [
      { id: 'hit', name: 'Hit', intent: 'attack', effects: [{ type: 'dealDamage', amount: 1 }] },
    ],
    pattern: { type: 'cycle', order: ['hit'] },
    signature: { move: 'hit', text: 'Hits.' },
  };
  const event = {
    id: 'well',
    name: 'Well',
    text: 'A well.',
    choices: [
      { label: 'Stay', outcomes: [{ chance: 100, text: 'Nothing.', effects: [] }] },
      { label: 'Go', outcomes: [{ chance: 100, text: 'Nothing.', effects: [] }] },
    ],
  };

  it('names the file when the JSON is broken', () => {
    const problems = problemsOf([{ path: 'data/cards/bad.json', text: '{ nope' }]);
    expect(problems).toEqual([
      {
        file: 'data/cards/bad.json',
        field: '',
        message: expect.stringContaining('not valid JSON') as string,
      },
    ]);
  });

  it('names the field that is wrong', () => {
    const problems = problemsOf([
      file('data/cards/a.json', [{ ...card, effects: [{ type: 'fireball', amount: 1 }] }]),
    ]);
    expect(problems[0]).toMatchObject({ file: 'data/cards/a.json', field: '[0].effects[0].type' });
  });

  it('rejects unknown fields, so typos are found', () => {
    const problems = problemsOf([file('data/cards/a.json', [{ ...card, costt: 2 }])]);
    expect(problems[0]).toMatchObject({ field: '[0]' });
  });

  it('finds an id used twice across files', () => {
    const problems = problemsOf([
      file('data/cards/a.json', [card]),
      file('data/cards/b.json', [card]),
    ]);
    expect(problems).toEqual([
      {
        file: 'data/cards/b.json',
        field: '[0].id',
        message: '"strike" is already used in data/cards/a.json',
      },
    ]);
  });

  it('reports a file in an unknown folder', () => {
    expect(problemsOf([file('data/spells/a.json', [])])).toEqual([
      { file: 'data/spells/a.json', field: '', message: 'unknown data folder' },
    ]);
  });

  it('checks that enemy moves exist', () => {
    const problems = problemsOf([
      file('data/enemies/a.json', [{ ...boss, pattern: { type: 'cycle', order: ['nope'] } }]),
    ]);
    expect(problems[0]).toMatchObject({ field: '[0].pattern.order[0]', message: 'no move "nope"' });
  });

  it('requires at least one move in random weights', () => {
    const problems = problemsOf([
      file('data/enemies/a.json', [{ ...boss, pattern: { type: 'random', weights: {} } }]),
    ]);
    expect(problems).toEqual([
      {
        file: 'data/enemies/a.json',
        field: '[0].pattern.weights',
        message: 'needs at least one move',
      },
    ]);
  });

  it('requires a signature on a boss', () => {
    const problems = problemsOf([file('data/enemies/a.json', [{ ...boss, signature: undefined }])]);
    expect(problems[0]).toMatchObject({ field: '[0].signature' });
  });

  it('requires event chances to add up to 100', () => {
    const choices = [
      { label: 'Stay', outcomes: [{ chance: 60, text: 'Nothing.', effects: [] }] },
      event.choices[1],
    ];
    const problems = problemsOf([file('data/events/a.json', [{ ...event, choices }])]);
    expect(problems[0]).toMatchObject({ field: '[0].choices[0].outcomes' });
  });
});
