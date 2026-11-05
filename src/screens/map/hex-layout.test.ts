import { describe, expect, it } from 'vitest';
import { layout } from '../../ui/design';
import { tileCentre } from './hex-layout';

describe('tileCentre', () => {
  // The three tiles the checklist in design/screens/map.md asks to check.
  it.each([
    [[0, 0], 46, 39.84],
    [[1, 0], 115, 79.67],
    [[8, 6], 598, 517.86],
  ] as const)('places tile %j at the formula from ui-rules.md', (hex, x, y) => {
    const centre = tileCentre(hex);
    expect(centre.x).toBeCloseTo(x, 1);
    expect(centre.y).toBeCloseTo(y, 1);
  });

  it('fills the HexGrid rectangle from layout.json exactly', () => {
    const { w, h } = layout.MapScreen.HexGrid;
    const lastColumn = tileCentre([8, 0]);
    const lastOddColumnBottom = tileCentre([7, 6]);

    expect(lastColumn.x + 46).toBeCloseTo(w, 1);
    expect(lastOddColumnBottom.y + (Math.sqrt(3) * 46) / 2).toBeCloseTo(h, 1);
  });
});
