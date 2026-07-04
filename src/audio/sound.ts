let ctx: AudioContext | null = null;
let soundEnabled = true;

/** Toggle sound effects (chimes / place / mistake). Ambient bed is separate. */
export function setSoundEnabled(v: boolean) {
  soundEnabled = v;
}

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return ctx;
}

/** Shared AudioContext, so chimes and the ambient bed share one graph. */
export function getAudioContext(): AudioContext {
  return getCtx();
}

/** A single voice: a warm sine with a quieter triangle overtone for body. */
function tone(
  freq: number,
  startOffset: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine",
) {
  const audioCtx = getCtx();
  const start = audioCtx.currentTime + startOffset;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  gain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  osc.start(start);
  osc.stop(start + duration + 0.05);

  // soft shimmer an octave up
  const over = audioCtx.createOscillator();
  const overGain = audioCtx.createGain();
  over.type = "triangle";
  over.frequency.value = freq * 2;
  overGain.gain.setValueAtTime(0, start);
  overGain.gain.linearRampToValueAtTime(gainPeak * 0.25, start + 0.02);
  overGain.gain.exponentialRampToValueAtTime(0.001, start + duration * 0.8);
  over.connect(overGain);
  overGain.connect(audioCtx.destination);
  over.start(start);
  over.stop(start + duration + 0.05);
}

/**
 * Gentle kalimba-like chime, rising in pitch for bigger completions.
 * `combo` shifts the whole chime up by semitones (capped) so back-to-back
 * completions climb a cheerful little scale.
 */
export function playChime(level: "cell" | "line" | "win" = "cell", combo = 0) {
  if (!soundEnabled) return;
  try {
    const bases = {
      cell: [523, 659],
      line: [523, 659, 784, 880],
      win: [523, 659, 784, 988, 1175, 1319],
    };
    const semitones = Math.min(Math.max(combo - 1, 0), 7); // first completion = no shift
    const mul = Math.pow(2, semitones / 12);
    const notes = bases[level];
    const dur = level === "win" ? 0.7 : 0.5;
    notes.forEach((f, i) => tone(f * mul, i * 0.075, dur, 0.12));
  } catch {
    // audio not available; ignore silently
  }
}

/** A soft, short "plip" for placing a correct digit (no completion). */
export function playPlace() {
  if (!soundEnabled) return;
  try {
    tone(880, 0, 0.14, 0.06);
    tone(1174, 0.03, 0.12, 0.035);
  } catch {
    // ignore
  }
}

export function playMistake() {
  if (!soundEnabled) return;
  try {
    tone(220, 0, 0.25, 0.1, "sine");
    tone(180, 0.1, 0.3, 0.08, "sine");
  } catch {
    // ignore
  }
}
