// A muffled, wordless murmur — the sound of someone talking on the other side
// of a wall. A voiced sawtooth carrier is shaped by a vowel-ish band-pass and a
// heavy "through the wall" low-pass, then gated into syllables with a little
// melodic wander. You overhear the rhythm, pitch and side of a person talking,
// never the words. This is deliberately NOT speech synthesis (see the project's
// audio direction) — clear speech would turn overhearing into a chatbot.

export type MurmurOptions = {
  // The higher-voiced of the two speakers (keeps the pair distinguishable).
  high: boolean;
  // Where in the room they are, -1..1, matching their bubble's side.
  pan: number;
  // Roughly how long they talk for — derived from the line's length.
  syllables: number;
  // Lift the final syllable if the line is a question.
  question: boolean;
};

export function playMurmur(
  ctx: AudioContext,
  dest: AudioNode,
  { high, pan, syllables, question }: MurmurOptions
) {
  if (ctx.state !== "running") return;

  const start = ctx.currentTime + 0.03;
  const base = high ? 178 : 112;

  const carrier = ctx.createOscillator();
  carrier.type = "sawtooth";

  const sub = ctx.createOscillator();
  sub.type = "sine";

  const subGain = ctx.createGain();
  subGain.gain.value = 0.5;

  // A single vowel-ish formant, then a heavy low-pass so it reads as muffled
  // through a wall rather than clear speech.
  const formant = ctx.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.value = high ? 620 : 500;
  formant.Q.value = 1.1;

  const wall = ctx.createBiquadFilter();
  wall.type = "lowpass";
  wall.frequency.value = 780;
  wall.Q.value = 0.3;

  // The VCA is gated per syllable to make the "mm-mm-mmm" rhythm.
  const vca = ctx.createGain();
  vca.gain.value = 0.0001;

  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;

  carrier.connect(formant);
  sub.connect(subGain);
  subGain.connect(formant);
  formant.connect(wall);
  wall.connect(vca);
  vca.connect(panner);
  panner.connect(dest);

  const peak = 0.11;
  const sylDur = 0.17;
  let t = start;
  carrier.frequency.setValueAtTime(base, t);

  for (let i = 0; i < syllables; i++) {
    const isLast = i === syllables - 1;
    // small melodic wander mid-phrase; settle down at the end, or up for a
    // question.
    const dir = isLast ? (question ? 1.16 : 0.88) : 1 + (Math.random() - 0.5) * 0.12;
    const nextPitch = Math.max(60, base * dir);
    carrier.frequency.exponentialRampToValueAtTime(nextPitch, t + sylDur);
    sub.frequency.setValueAtTime(nextPitch / 2, t);

    const amp = peak * (0.6 + Math.random() * 0.4);
    vca.gain.setValueAtTime(0.0001, t);
    vca.gain.linearRampToValueAtTime(amp, t + 0.04);
    vca.gain.exponentialRampToValueAtTime(0.0001, t + sylDur);

    t += sylDur + 0.05 * (0.7 + Math.random());
  }

  carrier.start(start);
  sub.start(start);
  carrier.stop(t + 0.12);
  sub.stop(t + 0.12);
}
