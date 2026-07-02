import type { CSSProperties } from "react";
import { unlockAudio } from "../audio/context";
import { playClick } from "../audio/feedback";
import type { Mode } from "../types";

type ModeCardProps = {
  title: string;
  mood: string;
  accent: "clay" | "moss" | "tide";
  onSelect: (mode: Mode) => void;
  mode: Mode;
};

// Each card is lit by its own lamp. The accent drives both the glow pooling
// inside the card and the small filament-orb — set once as a CSS variable so
// the .lamp-glow / .lamp-orb rules in index.css can read it.
const accentVar = {
  clay: "--color-clay",
  moss: "--color-moss",
  tide: "--color-tide"
} as const;

export function ModeCard({
  title,
  mood,
  accent,
  onSelect,
  mode
}: ModeCardProps) {
  const glowStyle = {
    "--glow": `var(${accentVar[accent]})`
  } as CSSProperties;

  return (
    <button
      style={glowStyle}
      className="group relative flex min-h-48 w-full flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-cream/60 p-6 text-left backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-ink/25 hover:bg-cream/80 focus:outline-none focus:ring-2 focus:ring-lamp/70 focus:ring-offset-2 focus:ring-offset-paper"
      onClick={() => {
        // iOS Safari needs the AudioContext to be resumed inside a user
        // gesture — Room's later useEffect is past that gesture window.
        void unlockAudio();
        playClick("tap");
        onSelect(mode);
      }}
    >
      <span className="lamp-glow" aria-hidden />
      <span className="lamp-orb" aria-hidden />
      <span className="relative space-y-3">
        <span className="block font-serif text-xl leading-snug text-ink sm:text-2xl">
          {title}
        </span>
        <span className="block text-sm leading-6 text-ink/55">{mood}</span>
      </span>
    </button>
  );
}
