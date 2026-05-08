import type { Mode } from "../types";

type ModeCardProps = {
  title: string;
  mood: string;
  accent: "clay" | "moss" | "tide";
  onSelect: (mode: Mode) => void;
  mode: Mode;
};

const accentClasses = {
  clay: "bg-clay",
  moss: "bg-moss",
  tide: "bg-tide"
};

export function ModeCard({
  title,
  mood,
  accent,
  onSelect,
  mode
}: ModeCardProps) {
  return (
    <button
      className="group flex min-h-44 w-full flex-col justify-between rounded-lg border border-ink/10 bg-cream/82 p-6 text-left shadow-soft backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-ink/20 hover:bg-cream focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 focus:ring-offset-paper"
      onClick={() => onSelect(mode)}
    >
      <span
        className={`h-2.5 w-12 rounded-full ${accentClasses[accent]} transition duration-200 group-hover:w-16`}
      />
      <span className="space-y-3">
        <span className="block text-xl font-semibold leading-tight text-ink sm:text-2xl">
          {title}
        </span>
        <span className="block text-sm leading-6 text-ink/62">{mood}</span>
      </span>
    </button>
  );
}
