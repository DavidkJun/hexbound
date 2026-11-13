import { areNeighbours, hexKey, sameHex, type Hex } from '../core/hex';
import { routeFoodCost, TERRAIN_CHARS, terrainAt } from '../core/terrain';
import type { DataProblem } from './data-error';
import type { Enemy, LevelMap } from './schema';

/**
 * The map rules from design/levels/map-format.md that compare fields with each other. The rest
 * (terrain size, tiles inside the grid, location types, positive food) are in the level schema.
 */

type FieldProblem = Omit<DataProblem, 'file'>;

const HAZARD_OF_LAND = { whisperwood: 'swamp', frostpeak: 'ice', ashen: 'lava' } as const;

export function checkLevelRules(
  level: LevelMap,
  fileName: string,
  enemies: ReadonlyMap<string, Enemy>,
): FieldProblem[] {
  return [
    ...checkIdMatchesFile(level, fileName),
    ...checkLandMatchesHazard(level),
    ...checkTerrainChars(level),
    ...checkStartAndBossOnNormalTiles(level),
    ...checkNoSharedTiles(level),
    ...checkRoutes(level),
    ...checkStartFood(level),
    ...checkBossEnemy(level, enemies),
  ];
}

/** Rule 1 */
function checkIdMatchesFile(level: LevelMap, fileName: string): FieldProblem[] {
  return level.id === fileName
    ? []
    : [{ field: 'id', message: `"${level.id}" must equal the file name "${fileName}"` }];
}

/** Rule 2 */
function checkLandMatchesHazard({ land, hazard }: LevelMap): FieldProblem[] {
  const expected = HAZARD_OF_LAND[land];
  return hazard === expected
    ? []
    : [{ field: 'hazard', message: `"${hazard}" must be "${expected}" in the land "${land}"` }];
}

/** Rule 3: only normal ground and the level's own hazard. */
function checkTerrainChars({ terrain, hazard }: LevelMap): FieldProblem[] {
  const allowed = [TERRAIN_CHARS.normal, TERRAIN_CHARS[hazard]];
  return terrain.flatMap((line, row) =>
    Array.from(line).flatMap((char, col) =>
      allowed.includes(char)
        ? []
        : [
            {
              field: `terrain[${row}]`,
              message: `tile ${hexKey([col, row])}: "${char}" isn't allowed, this level's hazard is ${hazard}`,
            },
          ],
    ),
  );
}

/** Rule 5 */
function checkStartAndBossOnNormalTiles(level: LevelMap): FieldProblem[] {
  const places = [
    { field: 'start', at: level.start },
    { field: 'boss.at', at: level.boss.at },
  ];
  return places
    .filter(({ at }) => terrainAt(level, at) !== 'normal')
    .map(({ field, at }) => ({ field, message: `tile ${hexKey(at)} must be normal terrain` }));
}

/** Rule 6 */
function checkNoSharedTiles({ start, boss, fixed, slots }: LevelMap): FieldProblem[] {
  const places = [
    { field: 'start', at: start },
    { field: 'boss.at', at: boss.at },
    ...fixed.map(({ at }, i) => ({ field: `fixed[${i}].at`, at })),
    ...slots.map(({ at }, i) => ({ field: `slots[${i}].at`, at })),
  ];

  const firstUser = new Map<string, string>();
  return places.flatMap(({ field, at }) => {
    const key = hexKey(at);
    const usedBy = firstUser.get(key);
    if (usedBy) return [{ field, message: `tile ${key} is already used by ${usedBy}` }];
    firstUser.set(key, field);
    return [];
  });
}

/** Rule 8 */
function checkRoutes(level: LevelMap): FieldProblem[] {
  return Object.entries(level.intendedRoutes).flatMap(([name, route]) =>
    checkRoute(`intendedRoutes.${name}`, route, level),
  );
}

function checkRoute(field: string, route: readonly Hex[], level: LevelMap): FieldProblem[] {
  const problems: FieldProblem[] = [];
  if (!isAt(route[0], level.start)) {
    problems.push({ field, message: `must start at start ${hexKey(level.start)}` });
  }
  if (!isAt(route.at(-1), level.boss.at)) {
    problems.push({ field, message: `must end at the boss ${hexKey(level.boss.at)}` });
  }
  route.forEach((hex, i) => {
    const previous = route[i - 1];
    if (previous && !areNeighbours(previous, hex)) {
      problems.push({
        field: `${field}[${i}]`,
        message: `tile ${hexKey(hex)} is not next to ${hexKey(previous)}`,
      });
    }
  });
  return problems;
}

function isAt(hex: Hex | undefined, target: Hex): boolean {
  return hex !== undefined && sameHex(hex, target);
}

/** Rule 9 */
function checkStartFood(level: LevelMap): FieldProblem[] {
  const directCost = routeFoodCost(level, level.intendedRoutes.direct);
  return level.startFood >= directCost
    ? []
    : [
        {
          field: 'startFood',
          message: `${level.startFood} is less than the direct route's cost of ${directCost}`,
        },
      ];
}

/** Rule 10: applies once enemy content files exist. */
function checkBossEnemy({ boss }: LevelMap, enemies: ReadonlyMap<string, Enemy>): FieldProblem[] {
  if (enemies.size === 0) return [];
  const enemy = enemies.get(boss.enemy);
  if (!enemy) return [{ field: 'boss.enemy', message: `no enemy with the id "${boss.enemy}"` }];
  if (enemy.kind !== 'boss') {
    const message = `"${enemy.id}" has kind "${enemy.kind}", the boss must have kind "boss"`;
    return [{ field: 'boss.enemy', message }];
  }
  return [];
}
