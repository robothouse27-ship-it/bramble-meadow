import meadow from "../../assets/scene/meadow.png";
import "./scene.css";

export function Scene() {
  return (
    <div className="scene" aria-hidden="true">
      <div
        className="scene-meadow"
        style={{ backgroundImage: `url(${meadow})` }}
      />
      <div className="scene-skyfade" />
    </div>
  );
}
