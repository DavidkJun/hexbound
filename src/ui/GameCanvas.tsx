import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { tokens } from './design';
import './GameCanvas.css';

function fitToWindow(): number {
  const { width, height } = tokens.size.screen;
  return Math.min(window.innerWidth / width, window.innerHeight / height);
}

/** The fixed 1280 × 720 logical canvas, scaled uniformly to fit the window (ui-rules.md §1). */
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

  return (
    <div
      id="GameCanvas"
      class="game-canvas"
      style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
    >
      {children}
    </div>
  );
}
