import { useEffect } from "react";

export type AnalyticsEvent = {
  type: string;
  ts: number;
  props: Record<string, unknown>;
};

const STORAGE_KEY = "mood-room.events";
const MAX_EVENTS = 500;

function readStored(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(events: AnalyticsEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage might be disabled or quota exceeded
  }
}

export function track(type: string, props: Record<string, unknown> = {}) {
  const events = readStored();
  const event: AnalyticsEvent = {
    type,
    ts: Date.now(),
    props
  };
  const updated = [...events, event];
  writeStored(
    updated.length > MAX_EVENTS ? updated.slice(-MAX_EVENTS) : updated
  );
}

export function readEvents(): AnalyticsEvent[] {
  return readStored();
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useTrackMode(mode: string) {
  useEffect(() => {
    const enteredAt = Date.now();
    track("mode_enter", { mode });
    return () => {
      track("mode_leave", {
        mode,
        durationMs: Date.now() - enteredAt
      });
    };
  }, [mode]);
}
