import { allHexes, hexKey, type Hex } from '../../core/hex';
import { terrainAt } from '../../core/terrain';
import type { LevelMap } from '../../data/schema';
import { layout, rectStyle, tokens } from '../../ui/design';
import { t } from '../../ui/text';
import { HEX_CORNERS, HEX_HALF_HEIGHT, tileCentre } from './hex-layout';
import './HexGrid.css';

/**
 * How far a terrain marker starts below the top of the tile's bounding box.
 * TODO(design): measured from design/screens/map.png; map.md only gives location labels (ty + 54).
 */
const MARKER_TOP = 56.5;

/** All 63 tiles of a map: terrain only so far. Icons, visibility and routes come in stage 1. */
export function HexGrid({ map }: { map: LevelMap }) {
  const rect = layout.MapScreen.HexGrid;
  return (
    <svg
      id="HexGrid"
      class="hex-grid"
      style={rectStyle(rect)}
      viewBox={`0 0 ${rect.w} ${rect.h}`}
      data-land={map.land}
    >
      {allHexes().map((hex) => (
        <HexTile key={hexKey(hex)} hex={hex} map={map} />
      ))}
    </svg>
  );
}

function HexTile({ hex, map }: { hex: Hex; map: LevelMap }) {
  const { x, y } = tileCentre(hex);
  const terrain = terrainAt(map, hex);
  const colours = tokens.color.land[map.land];

  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon
        class="hex-tile"
        points={HEX_CORNERS}
        fill={terrain === 'normal' ? colours.ground : colours.hazard}
      />
      {terrain !== 'normal' && (
        <text class="hex-marker" y={MARKER_TOP - HEX_HALF_HEIGHT}>
          {t(`terrain.${terrain}`)}
        </text>
      )}
    </g>
  );
}
