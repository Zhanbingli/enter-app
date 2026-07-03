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
import { playMurmur, type MurmurOptions } from "../audio/voice";
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
  // Everything that needs stopping on teardown (noise beds + the breathing LFO).
  sources: AudioScheduledSourceNode[];
  // The "air" layer's low-pass — the scene opens or closes it so the room
  // sounds brighter or more hushed.
  airFilter: BiquadFilterNode;
  rain: RainInsert | null;
  scheduler: SchedulerState;
};

// How open the room's air sounds, per scene. A kitchen is bright and present;
// the hush before rain is closed and hollow; an odd room sits a little muffled.
// This is a filter cutoff on broadband noise — not a musical pitch — so it
// shapes the *air*, never hums.
const SCENE_AIR: Record<RoomScene, number> = {
  kitchen: 1800,
  still: 1300,
  "before-rain": 950,
  odd: 1150
};

function setSceneOn(nodes: AmbientNodes, scene: RoomScene) {
  const now = nodes.context.currentTime;
  // Bias which foley the scheduler tends to pick, too.
  nodes.scheduler.scene = scene;
  nodes.airFilter.frequency.setTargetAtTime(SCENE_AIR[scene], now, 1.4);
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

  // Room tone, not a drone. A real room doesn't hum a chord — it has air:
  // warm low presence plus a soft high wash. The old sustained sine pad read
  // as an electrical "hum" and killed the sense of being somewhere, so the
  // bed is now two layers of filtered pink noise instead of any pitch:
  //   - body: low-passed noise for warm room presence (the weight in the air)
  //   - air:  band-limited noise for the soft hiss of a quiet room
  // The murmur, textures and rain ride on top; together they read as a place.

  const bodySource = context.createBufferSource();
  bodySource.buffer = makePinkNoiseBuffer(context, 6);
  bodySource.loop = true;
  const bodyFilter = context.createBiquadFilter();
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.value = 220;
  bodyFilter.Q.value = 0.4;
  const bodyGain = context.createGain();
  bodyGain.gain.value = 0.5;
  bodySource.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(master);

  const airSource = context.createBufferSource();
  airSource.buffer = makePinkNoiseBuffer(context, 6);
  airSource.loop = true;
  const airHighpass = context.createBiquadFilter();
  airHighpass.type = "highpass";
  airHighpass.frequency.value = 240;
  const airFilter = context.createBiquadFilter();
  airFilter.type = "lowpass";
  airFilter.frequency.value = 1300; // scene opens/closes this
  airFilter.Q.value = 0.3;
  const airGain = context.createGain();
  airGain.gain.value = 0.24;
  airSource.connect(airHighpass);
  airHighpass.connect(airFilter);
  airFilter.connect(airGain);
  airGain.connect(master);

  // Slow LFO on the air so the room breathes rather than sitting perfectly
  // still — a gentle swell, like a draft moving through.
  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.05;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 0.08;
  lfo.connect(lfoDepth);
  lfoDepth.connect(airGain.gain);

  // Texture bus: receives sparse procedural events (foley + murmur).
  const textureBus = context.createGain();
  textureBus.gain.value = 0.85;
  textureBus.connect(master);

  const textureBuffer = makePinkNoiseBuffer(context, 2);
  const whiteBuffer = makeWhiteNoiseBuffer(context, 0.4);

  const sources: AudioScheduledSourceNode[] = [bodySource, airSource, lfo];
  sources.forEach((source) => source.start());

  return {
    context,
    master,
    textureBus,
    textureBuffer,
    whiteBuffer,
    sources,
    airFilter,
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

  // A muffled murmur for a line as it lands — you hear them talking through
  // the wall. Goes through the texture bus, so muting the room silences it too.
  function murmur(options: MurmurOptions) {
    const nodes = nodesRef.current;
    if (!nodes) return;
    playMurmur(nodes.context, nodes.textureBus, options);
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
      nodes.sources.forEach(stopOsc);
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
    setScene,
    murmur
  };
}
