import type { DataProblem } from '../../data/data-error';
import { t } from '../../ui/text';
import './DataErrorScreen.css';

/** "file · field: message", as design/screens.md → System screens asks. */
function problemLine({ file, field, message }: DataProblem): string {
  return field ? `${file} · ${field}: ${message}` : `${file}: ${message}`;
}

/** Replaces the whole canvas when a data file is broken: design/screens.md → System screens. */
export function DataErrorScreen({ problems }: { problems: readonly DataProblem[] }) {
  return (
    <div id="DataErrorScreen" class="data-error">
      <h1 class="data-error-title">{t('dataError.title')}</h1>
      <ul class="data-error-list">
        {problems.map((problem) => {
          const line = problemLine(problem);
          return <li key={line}>{line}</li>;
        })}
      </ul>
    </div>
  );
}
