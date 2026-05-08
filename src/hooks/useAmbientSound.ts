import { useEffect, useRef, useState } from "react";

type AmbientNodes = {
  context: AudioContext;
  gain: GainNode;
  low: OscillatorNode;
  high: OscillatorNode;
};

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function createAmbientNodes(): AmbientNodes | null {
  const AudioContextCtor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  const context = new AudioContextCtor();
  const gain = context.createGain();
  const low = context.createOscillator();
  const high = context.createOscillator();

  low.type = "sine";
  low.frequency.value = 92;
  high.type = "triangle";
  high.frequency.value = 184;

  gain.gain.value = 0.0001;
  low.connect(gain);
  high.connect(gain);
  gain.connect(context.destination);

  low.start();
  high.start();

  return { context, gain, low, high };
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
    if (!nodes) {
      return;
    }

    if (nodes.context.state === "suspended") {
      await nodes.context.resume();
    }

    nodes.gain.gain.cancelScheduledValues(nodes.context.currentTime);
    nodes.gain.gain.setTargetAtTime(0.018, nodes.context.currentTime, 0.08);
    setIsSoundOn(true);
  }

  function stopSound() {
    const nodes = nodesRef.current;
    if (!nodes) {
      setIsSoundOn(false);
      return;
    }

    nodesRef.current = null;
    nodes.gain.gain.cancelScheduledValues(nodes.context.currentTime);
    nodes.gain.gain.setTargetAtTime(0.0001, nodes.context.currentTime, 0.05);
    window.setTimeout(() => {
      nodes.low.stop();
      nodes.high.stop();
      nodes.context.close();
    }, 160);
    setIsSoundOn(false);
  }

  async function toggleSound() {
    if (isSoundOn) {
      stopSound();
      return;
    }

    await startSound();
  }

  return { isSoundOn, toggleSound, stopSound };
}
