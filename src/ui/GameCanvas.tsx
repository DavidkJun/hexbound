import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { tokens } from './design';
import { t } from './text';
import './GameCanvas.css';

/** design/ui-rules.md §1: the smallest supported window is 960 × 540, the canvas at scale 0.75. */
const MIN_SCALE = 0.75;

function fitToWindow(): number {
  const { width, height } = tokens.size.screen;
  return Math.min(window.innerWidth / width, window.innerHeight / height);
}

/**
 * The fixed 1280 × 720 logical canvas, scaled uniformly to fit the window (ui-rules.md §1). In a
 * window that is too small it shows `WindowTooSmall` instead, and keeps the game mounted but
 * hidden, so nothing is lost when the window grows again.
 */
export function GameCanvas({ children }: { children: ComponentChildren }) {
  const [scale, setScale] = useState(fitToWindow);

  useEffect(() => {
    const onResize = () => {
      setScale(fitToWindow());
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const tooSmall = scale < MIN_SCALE;
  return (
    <>
      <div
        id="GameCanvas"
        class="game-canvas"
        hidden={tooSmall}
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
      {tooSmall && (
        <div id="WindowTooSmall" class="window-too-small">
          {t('windowTooSmall.message')}
        </div>
      )}
    </>
  );
}
