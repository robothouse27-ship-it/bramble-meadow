import meadow from "../../assets/scene/meadow.png";
import "./scene.css";

type Phase = "morning" | "day" | "dusk" | "night";

function currentPhase(): Phase {
  // ?time=night|dusk|morning|day forces a phase (handy for preview/screenshots)
  const override = new URLSearchParams(window.location.search).get("time");
  if (override === "morning" || override === "day" || override === "dusk" || override === "night") {
    return override;
  }
  const h = new Date().getHours();
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

export function Scene() {
  const phase = currentPhase();
  return (
    <div className={`scene scene--${phase}`} aria-hidden="true">
      <div className="scene-meadow" style={{ backgroundImage: `url(${meadow})` }} />
      <div className="scene-tint" />
      <div className="scene-skyfade" />
    </div>
  );
}
