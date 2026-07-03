import { getAudioContext } from "./sound";

// A gentle, generative meadow bed: soft wind (filtered noise that slowly
// "breathes") plus occasional birdsong chirps. No audio assets. Kept very quiet
// so it sits under the chimes. Everything fades in/out so toggling is smooth.

interface Running {
  master: GainNode;
  sources: AudioScheduledSourceNode[];
  birdTimer: number | null;
}

let running: Running | null = null;

function scheduleChirp(ctx: AudioContext, master: GainNode): number {
  const chirp = () => {
    const t = ctx.currentTime;
    const notes = Math.random() > 0.5 ? 2 : 1;
    for (let n = 0; n < notes; n++) {
      const start = t + n * 0.16;
      const base = 1700 + Math.random() * 1500;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(base, start);
      osc.frequency.exponentialRampToValueAtTime(base * 1.6, start + 0.06);
      osc.frequency.exponentialRampToValueAtTime(base * 0.85, start + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.05, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + 0.25);
    }
    if (running) running.birdTimer = window.setTimeout(chirp, 5000 + Math.random() * 11000);
  };
  return window.setTimeout(chirp, 2500 + Math.random() * 4000);
}

export function startAmbient() {
  if (running) return;
  let ctx: AudioContext;
  try {
    ctx = getAudioContext();
  } catch {
    return; // audio unavailable
  }
  // AudioContext may be suspended until a user gesture — nudge it.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3); // gentle fade-in
  master.connect(ctx.destination);

  // wind — looping white noise through a slowly modulated lowpass
  const bufSize = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 480;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.07;
  noise.connect(lp);
  lp.connect(windGain);
  windGain.connect(master);
  noise.start();

  // LFO to make the wind swell and settle
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lfo.start();

  running = { master, sources: [noise, lfo], birdTimer: null };
  running.birdTimer = scheduleChirp(ctx, master);
}

export function stopAmbient() {
  if (!running) return;
  const r = running;
  running = null;
  const ctx = getAudioContext();
  if (r.birdTimer) clearTimeout(r.birdTimer);
  r.master.gain.cancelScheduledValues(ctx.currentTime);
  r.master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
  window.setTimeout(() => {
    for (const s of r.sources) {
      try {
        s.stop();
      } catch {
        // already stopped
      }
    }
    r.master.disconnect();
  }, 900);
}
