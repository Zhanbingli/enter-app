import { useEffect, useRef, useState } from "react";

type AmbientNodes = {
  context: AudioContext;
  master: GainNode;
  oscillators: OscillatorNode[];
  noiseSource: AudioBufferSourceNode;
  lfo: OscillatorNode;
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

function createAmbientNodes(): AmbientNodes | null {
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

  lowOsc.start();
  highOsc.start();
  noiseSource.start();
  lfo.start();

  return {
    context,
    master,
    oscillators: [lowOsc, highOsc],
    noiseSource,
    lfo
  };
}

export function useAmbientSound() {
  const nodesRef = useRef<AmbientNodes | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  async function startSound() {
    if (!nodesRef.current) {
      nodesRef.current = createAmbientNodes();
    }

    const nodes = nodesRef.current;
    if (!nodes) return;

    if (nodes.context.state === "suspended") {
      await nodes.context.resume();
    }

    nodes.master.gain.cancelScheduledValues(nodes.context.currentTime);
    nodes.master.gain.setTargetAtTime(0.04, nodes.context.currentTime, 0.4);
    setIsSoundOn(true);
  }

  function stopSound() {
    const nodes = nodesRef.current;
    if (!nodes) {
      setIsSoundOn(false);
      return;
    }

    nodesRef.current = null;
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
      void nodes.context.close();
    }, 380);
    setIsSoundOn(false);
  }

  async function toggleSound() {
    if (isSoundOn) {
      stopSound();
      return;
    }
    await startSound();
  }

  return { isSoundOn, toggleSound, startSound, stopSound };
}
