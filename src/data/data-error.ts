/** One thing wrong with a data file. `field` is empty when the whole file is the problem. */
export interface DataProblem {
  readonly file: string;
  readonly field: string;
  readonly message: string;
}

/** Thrown when data files fail to load; lists every problem, not just the first. */
export class DataError extends Error {
  readonly problems: readonly DataProblem[];

  constructor(problems: readonly DataProblem[]) {
    super(problems.map(formatProblem).join('\n'));
    this.name = 'DataError';
    this.problems = problems;
  }
}

export function formatProblem({ file, field, message }: DataProblem): string {
  return field ? `${file} › ${field}: ${message}` : `${file}: ${message}`;
}
