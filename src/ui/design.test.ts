import { describe, expect, it } from 'vitest';
import { cssVariables, rectStyle, tokens } from './design';

describe('cssVariables', () => {
  const variables = new Map(cssVariables());

  it('names variables after the token path', () => {
    expect(variables.get('--color-resource-food')).toBe(tokens.color.resource.food);
    expect(variables.get('--font-heading')).toBe(tokens.font.heading);
  });

  it('gives sizes a pixel unit', () => {
    expect(variables.get('--text-h1')).toBe(`${tokens.text.h1}px`);
    expect(variables.get('--size-button-end-turn-width')).toBe(
      `${tokens.size.button['end-turn'].width}px`,
    );
  });

  it('leaves opacities and font weights without a unit', () => {
    expect(variables.get('--opacity-disabled')).toBe(`${tokens.opacity.disabled}`);
    expect(variables.get('--font-weight-heading')).toBe(`${tokens.font.weight.heading}`);
  });
});

describe('rectStyle', () => {
  it('places an element by its top-left corner', () => {
    expect(rectStyle({ x: 1, y: 2, w: 3, h: 4 })).toEqual({
      position: 'absolute',
      left: '1px',
      top: '2px',
      width: '3px',
      height: '4px',
    });
  });
});
