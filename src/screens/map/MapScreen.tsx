import type { LevelState } from '../../core/state';
import { HexGrid } from './HexGrid';

/** The map screen, design/screens/map.md. Stage 0 draws only the grid. */
export function MapScreen({ level }: { level: LevelState }) {
  return (
    <div id="MapScreen">
      <HexGrid map={level.map} />
    </div>
  );
}
