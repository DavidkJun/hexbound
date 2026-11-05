import { formatProblem, type DataProblem } from '../../data/data-error';
import { t } from '../../ui/text';
import './DataErrorScreen.css';

/**
 * Shown instead of the game when a data file is broken, naming the file, field and problem.
 *
 * TODO(design): design/screens.md lists this state as programmer side, with no spec yet.
 */
export function DataErrorScreen({ problems }: { problems: readonly DataProblem[] }) {
  return (
    <div id="DataErrorScreen" class="data-error">
      <h1 class="data-error-title">{t('dataError.title')}</h1>
      <ul class="data-error-list">
        {problems.map((problem) => {
          const line = formatProblem(problem);
          return <li key={line}>{line}</li>;
        })}
      </ul>
    </div>
  );
}
