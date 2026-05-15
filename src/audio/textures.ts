import { getTimeBand, type TimeBand } from "../services/timeBand";
import type { RoomTone } from "../types";

export function makePinkNoiseBuffer(
  context: AudioContext,
  seconds = 6
): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  // Voss-McCartney pink noise approximation.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] =
      (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  return buffer;
}

export function makeWhiteNoiseBuffer(
  context: AudioContext,
  seconds = 0.4
): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// A kettle starting to whistle, two rooms away.
function playKettle(
  ctx: AudioContext,
  dest: AudioNode,
  pinkBuf: AudioBuffer,
  when: number,
  pan: number
) {
  const src = ctx.createBufferSource();
  src.buffer = pinkBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 5;
  bp.frequency.setValueAtTime(900, when);
  bp.frequency.exponentialRampToValueAtTime(1850, when + 1.8);
  bp.frequency.linearRampToValueAtTime(1700, when + 3.2);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2400;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.05, when + 1.0);
  gain.gain.linearRampToValueAtTime(0.04, when + 2.4);
  gain.gain.linearRampToValueAtTime(0, when + 4.0);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  src.connect(bp);
  bp.connect(lp);
  lp.connect(gain);
  gain.connect(panner);
  panner.connect(dest);
  src.start(when);
  src.stop(when + 4.1);
}

// A short cluster of soft keyboard taps.
function playKeyboardCluster(
  ctx: AudioContext,
  dest: AudioNode,
  whiteBuf: AudioBuffer,
  when: number,
  pan: number
) {
  const count = 2 + Math.floor(Math.random() * 4);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  panner.connect(dest);
  for (let i = 0; i < count; i++) {
    const t = when + i * (0.11 + Math.random() * 0.18);
    const src = ctx.createBufferSource();
    src.buffer = whiteBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1300;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035 + Math.random() * 0.015, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);
    src.connect(hp);
    hp.connect(lp);
    lp.connect(gain);
    gain.connect(panner);
    src.start(t);
    src.stop(t + 0.1);
  }
}

// A floor or chair settling — pitch-swept resonant low pop.
function playCreak(
  ctx: AudioContext,
  dest: AudioNode,
  pinkBuf: AudioBuffer,
  when: number,
  pan: number
) {
  const src = ctx.createBufferSource();
  src.buffer = pinkBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 9;
  bp.frequency.setValueAtTime(170 + Math.random() * 80, when);
  bp.frequency.linearRampToValueAtTime(95, when + 0.55);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.06, when + 0.07);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.7);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  src.connect(bp);
  bp.connect(gain);
  gain.connect(panner);
  panner.connect(dest);
  src.start(when);
  src.stop(when + 0.8);
}

// Paper rustle / fabric shift.
function playPaper(
  ctx: AudioContext,
  dest: AudioNode,
  pinkBuf: AudioBuffer,
  when: number,
  pan: number
) {
  const src = ctx.createBufferSource();
  src.buffer = pinkBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2400;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 6200;
  const dur = 0.45 + Math.random() * 0.55;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.022, when + 0.05);
  for (let i = 0; i < 4; i++) {
    const t = when + 0.1 + (i * dur) / 5;
    gain.gain.linearRampToValueAtTime(0.012 + Math.random() * 0.018, t);
  }
  gain.gain.linearRampToValueAtTime(0, when + dur);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  src.connect(hp);
  hp.connect(lp);
  lp.connect(gain);
  gain.connect(panner);
  panner.connect(dest);
  src.start(when);
  src.stop(when + dur + 0.05);
}

// A cup placed on a surface — short ceramic-ish click.
function playCupClick(
  ctx: AudioContext,
  dest: AudioNode,
  whiteBuf: AudioBuffer,
  when: number,
  pan: number
) {
  const src = ctx.createBufferSource();
  src.buffer = whiteBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 11;
  bp.frequency.value = 760 + Math.random() * 380;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(0.055, when + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  src.connect(bp);
  bp.connect(gain);
  gain.connect(panner);
  panner.connect(dest);
  src.start(when);
  src.stop(when + 0.2);
}

type TextureFn = (
  ctx: AudioContext,
  dest: AudioNode,
  buf: AudioBuffer,
  when: number,
  pan: number
) => void;

type TextureSpec = {
  fn: TextureFn;
  buffer: "pink" | "white";
  weight: (tone: RoomTone) => number;
};

const TEXTURES: TextureSpec[] = [
  { fn: playKettle, buffer: "pink", weight: (t) => (t === "weird" ? 1 : 2) },
  {
    fn: playKeyboardCluster,
    buffer: "white",
    weight: (t) => (t === "quiet" ? 0.6 : 2)
  },
  { fn: playCreak, buffer: "pink", weight: (t) => (t === "weird" ? 3 : 1) },
  { fn: playPaper, buffer: "pink", weight: () => 1.5 },
  { fn: playCupClick, buffer: "white", weight: (t) => (t === "quiet" ? 1.6 : 1) }
];

export function playRandomTexture(
  ctx: AudioContext,
  dest: AudioNode,
  tone: RoomTone,
  pinkBuf: AudioBuffer,
  whiteBuf: AudioBuffer
) {
  if (ctx.state !== "running") return;
  const when = ctx.currentTime + 0.08;
  const pan = Math.random() * 1.6 - 0.8;

  const weighted = TEXTURES.map((spec) => ({ spec, weight: spec.weight(tone) }));
  const total = weighted.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const { spec, weight } of weighted) {
    r -= weight;
    if (r <= 0) {
      const buf = spec.buffer === "pink" ? pinkBuf : whiteBuf;
      spec.fn(ctx, dest, buf, when, pan);
      return;
    }
  }
}

// Base gap (seconds) before any time-band scaling.
function baseGapForTone(tone: RoomTone): number {
  if (tone === "quiet") return 50 + Math.random() * 60;
  if (tone === "weird") return 12 + Math.random() * 25;
  return 25 + Math.random() * 35;
}

const BAND_GAP_MULTIPLIER: Record<TimeBand, number> = {
  "deep-night": 1.6,
  dawn: 1.2,
  morning: 1.0,
  afternoon: 1.0,
  dusk: 1.05,
  evening: 1.15,
  late: 1.45
};

export function gapForTone(tone: RoomTone): number {
  const band = getTimeBand();
  return baseGapForTone(tone) * BAND_GAP_MULTIPLIER[band];
}

export const BAND_GAIN_MULTIPLIER: Record<TimeBand, number> = {
  "deep-night": 0.6,
  dawn: 0.9,
  morning: 1.0,
  afternoon: 1.0,
  dusk: 1.0,
  evening: 0.85,
  late: 0.7
};
