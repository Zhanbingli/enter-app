// Tactile click feedback. Three voices, all running through the singleton
// AudioContext — borrowing the audio infrastructure that's already there for
// the ambient bed.
//
//   tap    — generic press (mode card, story choice, another)
//   off    — exit press, slightly deeper, lamp-off feel
//   toggle — tone change, a hair brighter than tap, "knob turn" feel
//
// Plus a short navigator.vibrate on devices that support it.
//
// Silently no-ops when prefers-reduced-motion is set, or when the audio
// context isn't yet running (first click of a session is always silent
// because that gesture is the one unlocking the context).

import { getAudioContext } from "./context";

type ClickKind = "tap" | "off" | "toggle";

type ClickProfile = {
  oscType: OscillatorType;
  freq: number;
  q: number;
  gain: number;
  duration: number;
  vibrateMs: number;
};

const PROFILES: Record<ClickKind, ClickProfile> = {
  tap: {
    oscType: "triangle",
    freq: 1100,
    q: 9,
    gain: 0.025,
    duration: 0.08,
    vibrateMs: 5
  },
  off: {
    oscType: "sine",
    freq: 420,
    q: 7,
    gain: 0.03,
    duration: 0.12,
    vibrateMs: 8
  },
  toggle: {
    oscType: "triangle",
    freq: 760,
    q: 8,
    gain: 0.022,
    duration: 0.07,
    vibrateMs: 6
  }
};

function reduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function playClick(kind: ClickKind = "tap") {
  if (reduceMotion()) return;

  const ctx = getAudioContext();
  if (ctx && ctx.state === "running") {
    const profile = PROFILES[kind];
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = profile.oscType;
    osc.frequency.value = profile.freq;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = profile.freq;
    filter.Q.value = profile.q;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(profile.gain, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + profile.duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + profile.duration + 0.02);
  }

  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(PROFILES[kind].vibrateMs);
    } catch {
      // some platforms throw if vibration is disabled or unavailable
    }
  }
}
