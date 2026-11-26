import { MapScreen } from './screens/map/MapScreen';
import { BuildInfo } from './ui/BuildInfo';
import { useGame } from './ui/game-context';

/** Picks the screen for the current game state. */
export function App() {
  const { state } = useGame();
  return (
    <>
      {/* TODO(stage-1): the fight, reward and boss confirm screens (#33, #34) read state.run.phase. */}
      {state.run && <MapScreen level={state.run.level} />}
      <BuildInfo seed={state.seed} />
    </>
  );
}
