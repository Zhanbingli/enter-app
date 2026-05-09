import { useEffect, useRef, useState } from "react";
import type { RoomTone } from "../types";

type SchedulerState = {
  timeoutId: number | null;
  tone: RoomTone;
};

type AmbientNodes = {
  context: AudioContext;
  master: GainNode;
  textureBus: GainNode;
  textureBuffer: AudioBuffer;
  whiteBuffer: AudioBuffer;
  oscillators: OscillatorNode[];
  noiseSource: AudioBufferSourceNode;
  lfo: OscillatorNode;
  fridge: { osc: OscillatorNode; lfo: OscillatorNode };
  scheduler: SchedulerState;
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function makePinkNoiseBuffer(context: AudioContext, seconds = 6): AudioBuffer {
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

function makeWhiteNoiseBuffer(context: AudioContext, seconds = 0.4): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// --- Texture events ---------------------------------------------------------

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
  {
    fn: playKettle,
    buffer: "pink",
    weight: (t) => (t === "weird" ? 1 : 2)
  },
  {
    fn: playKeyboardCluster,
    buffer: "white",
    weight: (t) => (t === "quiet" ? 0.6 : 2)
  },
  {
    fn: playCreak,
    buffer: "pink",
    weight: (t) => (t === "weird" ? 3 : 1)
  },
  {
    fn: playPaper,
    buffer: "pink",
    weight: () => 1.5
  },
  {
    fn: playCupClick,
    buffer: "white",
    weight: (t) => (t === "quiet" ? 1.6 : 1)
  }
];

function fireRandomTexture(nodes: AmbientNodes) {
  const ctx = nodes.context;
  if (ctx.state !== "running") return;
  const tone = nodes.scheduler.tone;
  const when = ctx.currentTime + 0.08;
  const pan = Math.random() * 1.6 - 0.8;

  const weighted = TEXTURES.map((spec) => ({
    spec,
    weight: spec.weight(tone)
  }));
  const total = weighted.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const { spec, weight } of weighted) {
    r -= weight;
    if (r <= 0) {
      const buf =
        spec.buffer === "pink" ? nodes.textureBuffer : nodes.whiteBuffer;
      spec.fn(ctx, nodes.textureBus, buf, when, pan);
      return;
    }
  }
}

function gapForTone(tone: RoomTone): number {
  if (tone === "quiet") return 50 + Math.random() * 60;
  if (tone === "weird") return 12 + Math.random() * 25;
  return 25 + Math.random() * 35;
}

function scheduleNextTexture(nodes: AmbientNodes) {
  const gapMs = gapForTone(nodes.scheduler.tone) * 1000;
  nodes.scheduler.timeoutId = window.setTimeout(() => {
    fireRandomTexture(nodes);
    scheduleNextTexture(nodes);
  }, gapMs);
}

function clearScheduler(nodes: AmbientNodes) {
  if (nodes.scheduler.timeoutId !== null) {
    window.clearTimeout(nodes.scheduler.timeoutId);
    nodes.scheduler.timeoutId = null;
  }
}

// --- Bed setup --------------------------------------------------------------

function createAmbientNodes(initialTone: RoomTone): AmbientNodes | null {
  const AudioContextCtor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!AudioContextCtor) return null;

  const context = new AudioContextCtor();

  const master = context.createGain();
  master.gain.value = 0.0001;
  master.connect(context.destination);

  // Tone bed: two soft sines through a gentle low-pass.
  const toneFilter = context.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = 520;
  toneFilter.Q.value = 0.4;

  const toneGain = context.createGain();
  toneGain.gain.value = 0.7;
  toneFilter.connect(toneGain);
  toneGain.connect(master);

  const lowOsc = context.createOscillator();
  lowOsc.type = "sine";
  lowOsc.frequency.value = 78;
  lowOsc.connect(toneFilter);

  const highOsc = context.createOscillator();
  highOsc.type = "sine";
  highOsc.frequency.value = 156.7;
  highOsc.connect(toneFilter);

  // Pink noise bed for breath/texture.
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = makePinkNoiseBuffer(context, 6);
  noiseSource.loop = true;

  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 900;
  noiseFilter.Q.value = 0.5;

  const noiseGain = context.createGain();
  noiseGain.gain.value = 0.55;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);

  // Slow LFO modulating master volume so the bed breathes.
  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.07;

  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 0.006;
  lfo.connect(lfoDepth);
  lfoDepth.connect(master.gain);

  // Fridge hum: low sine with a slow vibrato so it doesn't sit perfectly still.
  const fridgeOsc = context.createOscillator();
  fridgeOsc.type = "sine";
  fridgeOsc.frequency.value = 60;
  const fridgeMod = context.createOscillator();
  fridgeMod.type = "sine";
  fridgeMod.frequency.value = 0.13;
  const fridgeModDepth = context.createGain();
  fridgeModDepth.gain.value = 1.2;
  fridgeMod.connect(fridgeModDepth);
  fridgeModDepth.connect(fridgeOsc.frequency);
  const fridgeGain = context.createGain();
  fridgeGain.gain.value = 0.07;
  fridgeOsc.connect(fridgeGain);
  fridgeGain.connect(master);

  // Texture bus: receives sparse procedural events.
  const textureBus = context.createGain();
  textureBus.gain.value = 0.85;
  textureBus.connect(master);

  const textureBuffer = makePinkNoiseBuffer(context, 2);
  const whiteBuffer = makeWhiteNoiseBuffer(context, 0.4);

  lowOsc.start();
  highOsc.start();
  noiseSource.start();
  lfo.start();
  fridgeOsc.start();
  fridgeMod.start();

  return {
    context,
    master,
    textureBus,
    textureBuffer,
    whiteBuffer,
    oscillators: [lowOsc, highOsc],
    noiseSource,
    lfo,
    fridge: { osc: fridgeOsc, lfo: fridgeMod },
    scheduler: { timeoutId: null, tone: initialTone }
  };
}

export function useAmbientSound() {
  const nodesRef = useRef<AmbientNodes | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    return () => {
      stopSound();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSound(tone: RoomTone = "regular") {
    if (!nodesRef.current) {
      nodesRef.current = createAmbientNodes(tone);
    }

    const nodes = nodesRef.current;
    if (!nodes) return;

    nodes.scheduler.tone = tone;

    if (nodes.context.state === "suspended") {
      await nodes.context.resume();
    }

    nodes.master.gain.cancelScheduledValues(nodes.context.currentTime);
    nodes.master.gain.setTargetAtTime(0.04, nodes.context.currentTime, 0.4);

    if (nodes.scheduler.timeoutId === null) {
      scheduleNextTexture(nodes);
    }

    setIsSoundOn(true);
  }

  function setTone(tone: RoomTone) {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodes.scheduler.tone = tone;
  }

  function stopSound() {
    const nodes = nodesRef.current;
    if (!nodes) {
      setIsSoundOn(false);
      return;
    }

    nodesRef.current = null;
    clearScheduler(nodes);
    nodes.master.gain.cancelScheduledValues(nodes.context.currentTime);
    nodes.master.gain.setTargetAtTime(0.0001, nodes.context.currentTime, 0.15);
    window.setTimeout(() => {
      nodes.oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        nodes.noiseSource.stop();
      } catch {
        /* already stopped */
      }
      try {
        nodes.lfo.stop();
      } catch {
        /* already stopped */
      }
      try {
        nodes.fridge.osc.stop();
      } catch {
        /* already stopped */
      }
      try {
        nodes.fridge.lfo.stop();
      } catch {
        /* already stopped */
      }
      void nodes.context.close();
    }, 380);
    setIsSoundOn(false);
  }

  async function toggleSound(tone: RoomTone = "regular") {
    if (isSoundOn) {
      stopSound();
      return;
    }
    await startSound(tone);
  }

  return { isSoundOn, toggleSound, startSound, stopSound, setTone };
}
