// Returning-visitor awareness. The app remembers when you last opened it
// (only the timestamp, nothing about what you did) and uses that gap to
// adjust the Home opener — a small acknowledgement that you came back.
//
// Priority chain on Home: moment > returning > time band.

const KEY = "mood-room.lastVisit";

const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;

function readLast(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function write(value: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, String(value));
  } catch {
    // localStorage unavailable
  }
}

export function recordVisit(now: number = Date.now()) {
  write(now);
}

export function getReturningPhrase(now: Date = new Date()): string | null {
  const last = readLast();
  if (last === null) return null;
  const gap = now.getTime() - last;
  if (gap < 30 * MINUTES) return null; // continuous session — say nothing
  if (gap < 6 * HOURS) return null; // same morning/afternoon — let the band speak
  if (gap < 1 * DAYS) return "back already.";
  if (gap < 4 * DAYS) return "back.";
  if (gap < 14 * DAYS) return "it's been a few days.";
  if (gap < 30 * DAYS) return "two weeks, easy.";
  if (gap < 180 * DAYS) return "look who's back.";
  return "a long time, that.";
}
