import { useGameStore } from "./state/gameStore";
import { Menu } from "./components/Menu/Menu";
import { GameScreen } from "./components/GameScreen";
import { Scene } from "./components/Scene/Scene";
import "./styles/global.css";

export default function App() {
  const status = useGameStore((s) => s.status);

  return (
    <>
      <Scene />
      <div className="grain" />
      <div className="app-center">{status === "menu" ? <Menu /> : <GameScreen />}</div>
    </>
  );
}
