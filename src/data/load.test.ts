import { describe, expect, it } from 'vitest';
import exampleLevel from '../../data/levels/_example.json';
import { DataError, type DataProblem } from './data-error';
import { readDataFiles } from './disk-files';
import { isExampleFile, loadCatalogue, loadNumbers, NUMBERS_FILE, type RawFile } from './load';

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
    [
      '4: a column inside the grid',
      { start: [9, 0] },
      'start[0]',
      'tile 9,0 is outside the grid (col 0–8, row 0–6)',
    ],
    [
      '4: a row inside the grid',
      { start: [0, 7] },
      'start[1]',
      'tile 0,7 is outside the grid (col 0–8, row 0–6)',
    ],
    ['4: no negative numbers', { start: [0, -1] }, 'start[1]', 'tile 0,-1 is outside the grid'],
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
      '7: allow lists name each type once',
      { slots: [{ at: [2, 5], allow: ['monster', 'monster', 'chest'] }] },
      'slots[0].allow',
      '"monster" is listed twice',
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
    [
      '10: the boss is a boss, not a normal enemy',
      { boss: { ...exampleLevel.boss, enemy: 'bog-rat' } },
      'boss.enemy',
      '"bog-rat" has kind "normal", the boss must have kind "boss"',
    ],
    [
      '10: the boss is a boss, not an elite',
      { boss: { ...exampleLevel.boss, enemy: 'frost-wisp' } },
      'boss.enemy',
      '"frost-wisp" has kind "elite"',
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

  it('reports a level listed twice', () => {
    expect(problemsOf([level('aaa'), file('data/levels/levels.json', ['aaa', 'aaa'])])).toEqual([
      { file: 'data/levels/levels.json', field: '', message: '"aaa" is listed twice' },
    ]);
  });

  it('reports a level listed twice along with a level with no file', () => {
    const problems = problemsOf([
      level('aaa'),
      file('data/levels/levels.json', ['aaa', 'aaa', 'gone']),
    ]);
    expect(problems.map(({ message }) => message)).toEqual([
      '"aaa" is listed twice',
      'no level file for "gone"',
    ]);
  });
});

describe('content files', () => {
  const card = {
    id: 'strike',
    name: 'Strike',
    family: 'weapon',
    rarity: 'starter',
    copies: 4,
    cost: 1,
    effects: [{ type: 'dealDamage', amount: 6 }],
    text: 'Deal 6 damage.',
  };
  const boss = {
    id: 'chief',
    name: 'Chief',
    kind: 'boss',
    land: 'whisperwood',
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

  it('finds a move id used twice in one enemy', () => {
    const problems = problemsOf([
      file('data/enemies/a.json', [{ ...boss, moves: [...boss.moves, ...boss.moves] }]),
    ]);
    expect(problems).toEqual([
      { file: 'data/enemies/a.json', field: '[0].moves[1].id', message: '"hit" is already used' },
    ]);
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

describe('cards and the starter deck', () => {
  const card = {
    id: 'flurry',
    name: 'Flurry',
    family: 'weapon',
    rarity: 'common',
    cost: 1,
    effects: [{ type: 'dealDamage', amount: 3 }],
    text: 'Deal 3 damage.',
  };
  const starter = { ...card, id: 'strike', rarity: 'starter', copies: 4 };
  const cardProblems = (...cards: object[]) => problemsOf([file('data/cards/a.json', cards)]);

  it('needs a rarity on every card', () => {
    expect(cardProblems(starter, { ...card, rarity: 'legendary' })[0]).toMatchObject({
      field: '[1].rarity',
    });
  });

  it('gives copies to starter cards and to no others', () => {
    expect(cardProblems({ ...starter, copies: undefined })).toEqual([
      { file: 'data/cards/a.json', field: '[0].copies', message: 'a starter card needs copies' },
    ]);
    expect(cardProblems(starter, { ...card, copies: 2 })).toEqual([
      { file: 'data/cards/a.json', field: '[1].copies', message: 'only starter cards have copies' },
    ]);
  });

  it('needs at least one starter card once there are cards', () => {
    expect(cardProblems(card)).toEqual([
      {
        file: 'data/cards',
        field: '',
        message: 'no starter cards: the starter deck is the cards with rarity "starter"',
      },
    ]);
    expect(problemsOf([])).toEqual([]);
  });

  it('needs exhaust on a card that applies Freeze', () => {
    const freeze = { ...card, effects: [{ type: 'applyFreeze' }] };
    expect(cardProblems(starter, freeze)).toEqual([
      {
        file: 'data/cards/a.json',
        field: '[1].effects',
        message: 'a card that applies Freeze also needs exhaust',
      },
    ]);
    const withExhaust = { ...freeze, effects: [{ type: 'applyFreeze' }, { type: 'exhaust' }] };
    expect(cardProblems(starter, withExhaust)).toEqual([]);
  });

  it('has no amount on Freeze, because Freeze does not stack', () => {
    const effects = [{ type: 'applyFreeze', amount: 2 }, { type: 'exhaust' }];
    expect(cardProblems(starter, { ...card, effects })[0]).toMatchObject({
      field: '[1].effects[0]',
    });
  });
});

describe('enemy moves', () => {
  const enemy = (effects: object[]) => ({
    id: 'rat',
    name: 'Rat',
    kind: 'normal',
    land: 'whisperwood',
    health: 10,
    moves: [{ id: 'act', name: 'Act', intent: 'buff', effects }],
    pattern: { type: 'cycle', order: ['act'] },
  });

  it('can gain strength', () => {
    expect(
      problemsOf([file('data/enemies/a.json', [enemy([{ type: 'gainStrength', amount: 2 }])])]),
    ).toEqual([]);
  });

  it('never apply Freeze', () => {
    expect(problemsOf([file('data/enemies/a.json', [enemy([{ type: 'applyFreeze' }])])])).toEqual([
      {
        file: 'data/enemies/a.json',
        field: '[0].moves[0].effects',
        message: 'enemies never apply Freeze',
      },
    ]);
  });
});

describe('enemy pools', () => {
  const ENEMIES = 'data/enemies/_example.json';
  const enemies = JSON.parse(exampleFiles.find(({ path }) => path === ENEMIES)?.text ?? '[]') as {
    land: string;
  }[];
  const moveTo = (land: string) =>
    problemsOf([
      ...exampleFiles.filter(({ path }) => path !== ENEMIES && !path.includes('/tutorial/')),
      file(
        ENEMIES,
        enemies.map((enemy, i) => (i < 2 ? { ...enemy, land } : enemy)),
      ),
    ]);

  it('needs a normal and an elite enemy of the land for monster and elite tiles', () => {
    expect(moveTo('frostpeak')).toEqual([
      {
        file: EXAMPLE_PATH,
        field: '',
        message: 'a monster can be dealt here, but no normal enemy has land "whisperwood"',
      },
      {
        file: EXAMPLE_PATH,
        field: '',
        message: 'an elite can be dealt here, but no elite enemy has land "whisperwood"',
      },
    ]);
  });
});

describe('tutorial', () => {
  const TUTORIAL = 'data/tutorial/_example.json';
  const exampleTutorial = exampleFiles.find(({ path }) => path === TUTORIAL);
  const tutorial = JSON.parse(exampleTutorial?.text ?? '{}') as Record<string, unknown>;

  const tutorialProblems = (changes: object) =>
    problemsOf([
      ...exampleFiles.filter(({ path }) => path !== TUTORIAL),
      file(TUTORIAL, { ...tutorial, ...changes }),
    ]);

  it('is loaded from the examples', () => {
    expect(loadCatalogue(exampleFiles).tutorial?.enemy).toBe('bog-rat');
  });

  it('is optional', () => {
    expect(loadCatalogue(exampleFiles.filter(({ path }) => path !== TUTORIAL)).tutorial).toBe(
      undefined,
    );
  });

  it('uses a normal enemy', () => {
    expect(tutorialProblems({ enemy: 'frost-wisp' })).toEqual([
      {
        file: TUTORIAL,
        field: 'enemy',
        message: '"frost-wisp" has kind "elite", the tutorial enemy must be normal',
      },
    ]);
    expect(tutorialProblems({ enemy: 'nobody' })[0]).toMatchObject({
      message: 'no enemy with the id "nobody"',
    });
  });

  it('draws only starter cards, each at most as often as the deck holds it', () => {
    expect(tutorialProblems({ drawOrder: ['strike', 'flurry', 'nothing'] })).toEqual([
      { file: TUTORIAL, field: 'drawOrder[1]', message: '"flurry" isn\'t a starter card' },
      { file: TUTORIAL, field: 'drawOrder[2]', message: 'no card with the id "nothing"' },
    ]);
    expect(tutorialProblems({ drawOrder: ['ration', 'ration', 'ration'] })).toEqual([
      { file: TUTORIAL, field: 'drawOrder[1]', message: 'the starter deck has only 1 "ration"' },
      { file: TUTORIAL, field: 'drawOrder[2]', message: 'the starter deck has only 1 "ration"' },
    ]);
  });

  it('allows one tutorial file per set', () => {
    const problems = problemsOf([...exampleFiles, file('data/tutorial/_other.json', tutorial)]);
    expect(problems).toEqual([
      {
        file: 'data/tutorial/_other.json',
        field: '',
        message: `${TUTORIAL} is already the tutorial`,
      },
    ]);
  });
});

describe('numbers', () => {
  const allFiles = readDataFiles();
  const numbersFile = allFiles.find(({ path }) => path === NUMBERS_FILE);
  const numbers = JSON.parse(numbersFile?.text ?? '{}') as Record<string, Record<string, unknown>>;

  it('loads the numbers of DD 4.9', () => {
    expect(loadNumbers(allFiles).fight).toEqual({
      energyPerTurn: 3,
      cardsPerTurn: 5,
      handLimit: 10,
    });
  });

  it('is not a content file, so the content check skips it', () => {
    expect(problemsOf(numbersFile ? [numbersFile] : [])).toEqual([]);
  });

  it('reports a missing file and a bad range', () => {
    const numberProblems = (text: string) => {
      try {
        loadNumbers([{ path: NUMBERS_FILE, text }]);
      } catch (error) {
        if (error instanceof DataError) return error.problems;
        throw error;
      }
      return [];
    };
    expect(() => loadNumbers([])).toThrow(DataError);
    const rewards = { ...numbers.rewards, monsterGold: { min: 15, max: 10 } };
    expect(numberProblems(JSON.stringify({ ...numbers, rewards }))).toEqual([
      { file: NUMBERS_FILE, field: 'rewards.monsterGold', message: 'min must not be above max' },
    ]);
  });
});
