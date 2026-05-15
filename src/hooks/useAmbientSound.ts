import { useEffect, useRef, useState } from "react";
import { getAudioContext } from "../audio/context";
import {
  BAND_GAIN_MULTIPLIER,
  gapForTone,
  makePinkNoiseBuffer,
  makeWhiteNoiseBuffer,
  playRandomTexture
} from "../audio/textures";
import { getTimeBand } from "../services/timeBand";
import type { RoomTone } from "../types";

const BASE_MASTER_GAIN = 0.04;

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

function scheduleNextTexture(nodes: AmbientNodes) {
  const gapMs = gapForTone(nodes.scheduler.tone) * 1000;
  nodes.scheduler.timeoutId = window.setTimeout(() => {
    playRandomTexture(
      nodes.context,
      nodes.textureBus,
      nodes.scheduler.tone,
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
      stopOsc(nodes.oscillators[0]);
      stopOsc(nodes.oscillators[1]);
      stopOsc(nodes.noiseSource);
      stopOsc(nodes.lfo);
      stopOsc(nodes.fridge.osc);
      stopOsc(nodes.fridge.lfo);
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

  return { isSoundOn, toggleSound, startSound, stopSound, setTone };
}
