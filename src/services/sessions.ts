// Tracks how many "real" mode sessions the user has finished. A real session
// is any mode visit lasting longer than 30 seconds — short bounces don't
// count toward unlocking the hidden mode.

const KEY = "mood-room.sessions";
const REAL_SESSION_MS = 30_000;
const RAIN_UNLOCK_THRESHOLD = 3;

function read(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function write(count: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, String(count));
  } catch {
    // localStorage may be unavailable
  }
}

export function recordSession(durationMs: number) {
  if (durationMs < REAL_SESSION_MS) return;
  write(read() + 1);
}

export function getSessionCount(): number {
  return read();
}

export function isRainUnlocked(): boolean {
  return read() >= RAIN_UNLOCK_THRESHOLD;
}
