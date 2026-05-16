// Rain bed: filtered pink noise as steady rain, occasional emphasized
// droplets. Distinct from useAmbientSound (which carries Room's full
// procedural mix). Shares the singleton AudioContext.

import { useEffect, useRef } from "react";
import { getAudioContext } from "../audio/context";
import {
  BAND_GAIN_MULTIPLIER,
  makePinkNoiseBuffer,
  makeWhiteNoiseBuffer
} from "../audio/textures";
import { getTimeBand } from "../services/timeBand";

const BASE_GAIN = 0.05;

type RainNodes = {
  context: AudioContext;
  master: GainNode;
  rain: AudioBufferSourceNode;
  rainGain: GainNode;
  whiteBuffer: AudioBuffer;
  dropletTimeoutId: number | null;
};

function scheduleDroplet(nodes: RainNodes) {
  const ctx = nodes.context;
  const gap = 0.4 + Math.random() * 2.4;
  nodes.dropletTimeoutId = window.setTimeout(() => {
    if (ctx.state === "running") {
      const when = ctx.currentTime + 0.02;
      const pan = Math.random() * 1.6 - 0.8;
      const src = ctx.createBufferSource();
      src.buffer = nodes.whiteBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 8;
      bp.frequency.value = 1800 + Math.random() * 2200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(
        0.04 + Math.random() * 0.04,
        when + 0.003
      );
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.12);
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      src.connect(bp);
      bp.connect(gain);
      gain.connect(panner);
      panner.connect(nodes.master);
      src.start(when);
      src.stop(when + 0.15);
    }
    scheduleDroplet(nodes);
  }, gap * 1000);
}

function createRainNodes(context: AudioContext): RainNodes {
  const master = context.createGain();
  master.gain.value = 0.0001;
  master.connect(context.destination);

  // Steady rain hiss: looped pink noise through a bandpass, slight modulation.
  const rain = context.createBufferSource();
  rain.buffer = makePinkNoiseBuffer(context, 6);
  rain.loop = true;

  const bp = context.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1200;
  bp.Q.value = 0.6;

  const hp = context.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 500;

  const rainGain = context.createGain();
  rainGain.gain.value = 0.55;

  rain.connect(hp);
  hp.connect(bp);
  bp.connect(rainGain);
  rainGain.connect(master);

  // Slow LFO on rain gain so it feels weather-shaped, not static.
  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 0.08;
  lfo.connect(lfoDepth);
  lfoDepth.connect(rainGain.gain);
  lfo.start();

  rain.start();

  const whiteBuffer = makeWhiteNoiseBuffer(context, 0.3);

  return {
    context,
    master,
    rain,
    rainGain,
    whiteBuffer,
    dropletTimeoutId: null
  };
}

export function useRainBed() {
  const nodesRef = useRef<RainNodes | null>(null);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!nodesRef.current) {
      nodesRef.current = createRainNodes(ctx);
    }
    const nodes = nodesRef.current;

    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    const targetGain = BASE_GAIN * BAND_GAIN_MULTIPLIER[getTimeBand()];
    nodes.master.gain.cancelScheduledValues(ctx.currentTime);
    nodes.master.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.5);

    if (nodes.dropletTimeoutId === null) {
      scheduleDroplet(nodes);
    }
  }

  function stop() {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodesRef.current = null;
    if (nodes.dropletTimeoutId !== null) {
      window.clearTimeout(nodes.dropletTimeoutId);
    }
    const ctx = nodes.context;
    nodes.master.gain.cancelScheduledValues(ctx.currentTime);
    nodes.master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
    window.setTimeout(() => {
      try {
        nodes.rain.stop();
      } catch {
        /* already stopped */
      }
      try {
        nodes.master.disconnect();
      } catch {
        /* ignore */
      }
    }, 500);
  }

  return { start, stop };
}
