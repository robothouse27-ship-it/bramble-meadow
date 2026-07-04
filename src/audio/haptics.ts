// Light haptic feedback via the Vibration API. Supported on most Android
// browsers; silently a no-op where unsupported (e.g. iOS Safari).

let hapticsEnabled = true;

/** Toggle vibration feedback. */
export function setHapticsEnabled(v: boolean) {
  hapticsEnabled = v;
}

function buzz(pattern: number | number[]) {
  if (!hapticsEnabled) return;
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // ignore
  }
}

/** Placing a correct digit. */
export function hapticTap() {
  buzz(12);
}

/** Completing a row / column / box. */
export function hapticSuccess() {
  buzz([0, 18, 40, 24]);
}

/** A wrong entry. */
export function hapticError() {
  buzz([0, 40, 30, 40]);
}

/** Solving the whole puzzle. */
export function hapticWin() {
  buzz([0, 30, 50, 30, 50, 60]);
}
