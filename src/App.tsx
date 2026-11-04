import { MapScreen } from './screens/map/MapScreen';
import { BuildInfo } from './ui/BuildInfo';
import { useGame } from './ui/game-context';

/** Picks the screen for the current game state. */
export function App() {
  const { state } = useGame();
  return (
    <>
      {state.level && <MapScreen level={state.level} />}
      <BuildInfo seed={state.seed} />
    </>
  );
}
