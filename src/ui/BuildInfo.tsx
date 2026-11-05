import { t } from './text';
import './BuildInfo.css';

/**
 * Which build and seed this is, so a bug report can name them and the tester can replay the run
 * with `?seed=<seed>`.
 *
 * TODO(design): not in any screen spec yet; the place and the style are a stand-in.
 */
export function BuildInfo({ seed }: { seed: number }) {
  return (
    <div id="BuildInfo" class="build-info">
      {t('build.commit')} {__BUILD_COMMIT__} · {t('build.seed')} {seed}
    </div>
  );
}
