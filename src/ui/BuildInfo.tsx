import { t } from './text';
import './BuildInfo.css';

/**
 * Which build and seed this is, so a bug report can name them and the tester can replay the run
 * with `?seed=<seed>`. On every screen: design/screens.md → System screens.
 *
 * `exampleMap` adds the "Example map" warning while the game plays the example files
 * (design/levels/map-format.md).
 * TODO(design): the spec doesn't say where that warning goes, so it sits here for now.
 */
export function BuildInfo({ seed, exampleMap = false }: { seed: number; exampleMap?: boolean }) {
  return (
    <div id="BuildInfo" class="build-info">
      {t('build.commit')} {__BUILD_COMMIT__} · {t('build.seed')} {seed}
      {exampleMap && <> · {t('build.exampleMap')}</>}
    </div>
  );
}
