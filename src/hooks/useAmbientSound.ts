import { useEffect, useRef, useState } from "react";
import { getAudioContext } from "../audio/context";
import {
  BAND_GAIN_MULTIPLIER,
  createRainHiss,
  gapForTone,
  makePinkNoiseBuffer,
  makeWhiteNoiseBuffer,
  playNamedTexture,
  playRandomTexture,
  type NamedTexture
} from "../audio/textures";
import { getTimeBand } from "../services/timeBand";
import type { RoomScene, RoomTone } from "../types";

const BASE_MASTER_GAIN = 0.04;

type SchedulerState = {
  timeoutId: number | null;
  tone: RoomTone;
  scene: RoomScene;
};

// A rain bed, faded in under the pad when a line summons rain. Created lazily
// so a room that never mentions rain never builds it.
type RainInsert = {
  source: AudioBufferSourceNode;
  gain: GainNode;
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
  // The pad's low-pass and the fifth's two voices — held so the scene can
  // warm or cool the bed and lean the fifth slightly sour.
  toneFilter: BiquadFilterNode;
  fifthVoices: OscillatorNode[];
  rain: RainInsert | null;
  scheduler: SchedulerState;
};

// Colour the pad to the room's character. Warmth is the filter cutoff — a
// kitchen is a touch brighter and closer, the hush before rain is darker and
// hollower. When the talk turns odd, the fifth's twin drifts a few cents so
// the drone sits slightly sour without becoming unpleasant. All ramps are
// slow so the room never seems to flip a switch.
const SCENE_WARMTH: Record<RoomScene, number> = {
  kitchen: 760,
  still: 640,
  "before-rain": 560,
  odd: 660
};

function setSceneOn(nodes: AmbientNodes, scene: RoomScene) {
  const now = nodes.context.currentTime;
  // Bias which foley the scheduler tends to pick, too.
  nodes.scheduler.scene = scene;
  nodes.toneFilter.frequency.setTargetAtTime(SCENE_WARMTH[scene], now, 1.2);
  const twinDetune = scene === "odd" ? -16 : 0;
  const [rootVoice, twinVoice] = nodes.fifthVoices;
  rootVoice?.detune.setTargetAtTime(0, now, 1.5);
  twinVoice?.detune.setTargetAtTime(twinDetune, now, 1.5);
}

// Fade a rain bed in (or out) under the ambient pad. Same recipe as the
// hidden Rain window — looped pink noise, high-passed and band-passed into a
// hiss — so the two rooms share a weather. Ramps over a few seconds so rain
// arrives like weather, not a switch.
function setRainOn(nodes: AmbientNodes, on: boolean) {
  const { context } = nodes;
  const now = context.currentTime;

  if (on) {
    if (!nodes.rain) {
      const { source, gain } = createRainHiss(context, nodes.master);
      gain.gain.value = 0.0001;
      nodes.rain = { source, gain };
    }
    nodes.rain.gain.gain.cancelScheduledValues(now);
    nodes.rain.gain.gain.setTargetAtTime(0.6, now, 1.6);
    return;
  }

  if (!nodes.rain) return;
  const rain = nodes.rain;
  rain.gain.gain.cancelScheduledValues(now);
  rain.gain.gain.setTargetAtTime(0.0001, now, 1.0);
  window.setTimeout(() => {
    try {
      rain.source.stop();
      rain.gain.disconnect();
    } catch {
      // already gone
    }
    if (nodes.rain === rain) nodes.rain = null;
  }, 3200);
}

function scheduleNextTexture(nodes: AmbientNodes) {
  const gapMs = gapForTone(nodes.scheduler.tone) * 1000;
  nodes.scheduler.timeoutId = window.setTimeout(() => {
    playRandomTexture(
      nodes.context,
      nodes.textureBus,
      nodes.scheduler.tone,
      nodes.scheduler.scene,
      nodes.textureBuffer,
      nodes.whiteBuffer
    );
    scheduleNextTexture(nodes);
  }, gapMs);
}

function clearScheduler(nodes: AmbientNodes) {
  if (nodes.scheduler.timeoutId !== null) {
    window.clearTimeout(nodes.scheduler.timeoutId);
    nodes.scheduler.timeoutId = null;
  }
}

function createAmbientNodes(
  context: AudioContext,
  initialTone: RoomTone
): AmbientNodes {
  const master = context.createGain();
  master.gain.value = 0.0001;
  master.connect(context.destination);

  // Tone bed: a warm, consonant pad instead of a muddy hum. An open fifth
  // in A — root (A2) + fifth (E3) — with a sub an octave below (A1) for
  // body. Everything is harmonically related, so there's no dissonant
  // low-end beating. (The old bed layered a 60 Hz "fridge" sine against a
  // 78 Hz drone; 60 and 78 beat at 18 Hz and 60 Hz reads as mains hum, so
  // the whole thing sounded electrical.) Paired voices are detuned by a
  // fraction of a hertz for a slow, warm chorus rather than a still tone.
  const toneFilter = context.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = 640;
  toneFilter.Q.value = 0.3;

  const toneGain = context.createGain();
  toneGain.gain.value = 0.8;
  toneFilter.connect(toneGain);
  toneGain.connect(master);

  const makeVoice = (freq: number, level: number) => {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = context.createGain();
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(toneFilter);
    return osc;
  };

  // Root A2 (110 Hz) + fifth E3 (164.81 Hz), each with a detuned twin, plus
  // a quiet octave (A3) so there's some presence on small speakers that
  // roll off the low end.
  const rootA = makeVoice(110, 0.34);
  const rootB = makeVoice(110.25, 0.34);
  const fifthA = makeVoice(164.81, 0.2);
  const fifthB = makeVoice(164.4, 0.2);
  const octave = makeVoice(220, 0.1);

  // Sub an octave below the root (A1, 55 Hz) — quiet body, consonant with
  // everything above it. Replaces the old fridge hum.
  const subOsc = context.createOscillator();
  subOsc.type = "sine";
  subOsc.frequency.value = 55;
  const subGain = context.createGain();
  subGain.gain.value = 0.28;
  subOsc.connect(subGain);
  subGain.connect(master);

  // Pink noise bed for breath/texture.
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = makePinkNoiseBuffer(context, 6);
  noiseSource.loop = true;

  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 900;
  noiseFilter.Q.value = 0.5;

  const noiseGain = context.createGain();
  noiseGain.gain.value = 0.5;

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

  // Texture bus: receives sparse procedural events.
  const textureBus = context.createGain();
  textureBus.gain.value = 0.85;
  textureBus.connect(master);

  const textureBuffer = makePinkNoiseBuffer(context, 2);
  const whiteBuffer = makeWhiteNoiseBuffer(context, 0.4);

  const oscillators = [rootA, rootB, fifthA, fifthB, octave, subOsc];
  oscillators.forEach((osc) => osc.start());
  noiseSource.start();
  lfo.start();

  return {
    context,
    master,
    textureBus,
    textureBuffer,
    whiteBuffer,
    oscillators,
    noiseSource,
    lfo,
    toneFilter,
    fifthVoices: [fifthA, fifthB],
    rain: null,
    scheduler: { timeoutId: null, tone: initialTone, scene: "still" }
  };
}

function stopOsc(node: { stop: () => void } | undefined) {
  if (!node) return;
  try {
    node.stop();
  } catch {
    // already stopped
  }
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
    const context = getAudioContext();
    if (!context) return;

    if (!nodesRef.current) {
      nodesRef.current = createAmbientNodes(context, tone);
    }

    const nodes = nodesRef.current;
    nodes.scheduler.tone = tone;

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    const targetGain =
      BASE_MASTER_GAIN * BAND_GAIN_MULTIPLIER[getTimeBand()];
    nodes.master.gain.cancelScheduledValues(context.currentTime);
    nodes.master.gain.setTargetAtTime(targetGain, context.currentTime, 0.4);

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

  // Fire a specific foley texture — called when a line carries a cue, so the
  // room answers what was just said.
  function playCue(name: NamedTexture) {
    const nodes = nodesRef.current;
    if (!nodes) return;
    playNamedTexture(
      nodes.context,
      nodes.textureBus,
      name,
      nodes.textureBuffer,
      nodes.whiteBuffer
    );
  }

  function setRain(on: boolean) {
    const nodes = nodesRef.current;
    if (!nodes) return;
    setRainOn(nodes, on);
  }

  function setScene(scene: RoomScene) {
    const nodes = nodesRef.current;
    if (!nodes) return;
    setSceneOn(nodes, scene);
  }

  function stopSound() {
    const nodes = nodesRef.current;
    if (!nodes) {
      setIsSoundOn(false);
      return;
    }

    nodesRef.current = null;
    clearScheduler(nodes);
    const { context } = nodes;
    nodes.master.gain.cancelScheduledValues(context.currentTime);
    nodes.master.gain.setTargetAtTime(0.0001, context.currentTime, 0.15);
    // Disconnect after the fade so we don't click. The shared context stays
    // alive so the next visit doesn't need another user gesture.
    window.setTimeout(() => {
      nodes.oscillators.forEach(stopOsc);
      stopOsc(nodes.noiseSource);
      stopOsc(nodes.lfo);
      stopOsc(nodes.rain?.source);
      try {
        nodes.master.disconnect();
        nodes.textureBus.disconnect();
      } catch {
        // ignore
      }
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

  return {
    isSoundOn,
    toggleSound,
    startSound,
    stopSound,
    setTone,
    playCue,
    setRain,
    setScene
  };
}
