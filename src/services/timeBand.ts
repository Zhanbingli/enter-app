// Time-of-day awareness. The same product should feel different at 3am, 9am,
// and 8pm. Everything else (CSS atmosphere, Home opener, audio mix, content
// biasing) keys off this single classification.

export type TimeBand =
  | "deep-night"
  | "dawn"
  | "morning"
  | "afternoon"
  | "dusk"
  | "evening"
  | "late";

export function getTimeBand(date = new Date()): TimeBand {
  const hour = date.getHours();
  if (hour < 5) return "deep-night";
  if (hour < 7) return "dawn";
  if (hour < 11) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "dusk";
  if (hour < 23) return "evening";
  return "late";
}

const OPENERS: Record<TimeBand, string[]> = {
  "deep-night": [
    "still up.",
    "the world is asleep.",
    "it's late, again.",
    "the quiet kind of late."
  ],
  dawn: [
    "before the kettle.",
    "the day is still getting dressed.",
    "early. the light isn't sure yet."
  ],
  morning: [
    "morning.",
    "an unhurried morning.",
    "the day is still warming up."
  ],
  afternoon: [
    "an afternoon.",
    "the long part of the day.",
    "the room is quiet, again."
  ],
  dusk: [
    "the light is folding.",
    "somewhere, a kettle is on.",
    "almost dinner, somewhere."
  ],
  evening: [
    "evening.",
    "the room has settled.",
    "after dinner, somewhere."
  ],
  late: ["almost tomorrow.", "it's later than you think."]
};

// Deterministic pick per day+hour so the phrase doesn't reshuffle on every
// re-render but does change across sessions.
function pickStable<T>(items: T[], date = new Date()): T {
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate() +
    date.getHours() * 31;
  return items[seed % items.length];
}

export function getOpener(band: TimeBand = getTimeBand()): string {
  return pickStable(OPENERS[band]);
}
