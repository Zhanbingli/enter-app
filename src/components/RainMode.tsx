import { useEffect, useState } from "react";
import { playClick } from "../audio/feedback";
import { useEscape } from "../hooks/useEscape";
import { useRainBed } from "../hooks/useRainBed";
import { rainConversations, type RainConversation } from "../data/rainConversations";
import { useTrackMode } from "../services/analytics";
import { randomItemExcept } from "../utils/random";

type RainModeProps = {
  onBack: () => void;
};

type StreamLine = {
  speaker: "rin" | "hal";
  text: string;
  key: string;
};

const STREAM_CAP = 5;
const LINE_GAP_MS = 7000;
const FIRST_LINE_DELAY_MS = 1200;
const NEXT_CONVERSATION_GAP_MS = 12000;

export function RainMode({ onBack }: RainModeProps) {
  const [conversation, setConversation] = useState<RainConversation>(() =>
    randomItemExcept(rainConversations)
  );
  const [stream, setStream] = useState<StreamLine[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const { start: startRain, stop: stopRain } = useRainBed();

  useTrackMode("rain");

  function exit() {
    playClick("off");
    stopRain();
    onBack();
  }

  useEscape(exit);

  useEffect(() => {
    void startRain();
    return () => stopRain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lineIndex >= conversation.lines.length) return;
    const delay = lineIndex === 0 ? FIRST_LINE_DELAY_MS : LINE_GAP_MS;
    const timer = window.setTimeout(() => {
      const line = conversation.lines[lineIndex];
      setStream((prev) => {
        const next: StreamLine = {
          speaker: line.speaker,
          text: line.text,
          key: `${conversation.id}-${lineIndex}`
        };
        const updated = [...prev, next];
        return updated.length > STREAM_CAP
          ? updated.slice(-STREAM_CAP)
          : updated;
      });
      setLineIndex((i) => i + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [conversation, lineIndex]);

  useEffect(() => {
    if (lineIndex < conversation.lines.length) return;
    const timer = window.setTimeout(() => {
      const next = randomItemExcept(rainConversations, conversation.id);
      setConversation(next);
      setLineIndex(0);
    }, NEXT_CONVERSATION_GAP_MS);
    return () => window.clearTimeout(timer);
  }, [conversation, lineIndex]);

  return (
    <div className="soft-rain min-h-screen">
      <div className="rain-layer" aria-hidden />
      <div className="rain-layer rain-layer-2" aria-hidden />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <button
          className="inline-flex min-h-11 items-center self-start px-2 py-2 text-xs font-medium lowercase tracking-[0.18em] text-ink/40 transition hover:text-ink"
          onClick={exit}
        >
          off
        </button>

        <section className="mt-auto space-y-4" aria-live="polite">
          {stream.map((line, index) => {
            const age = stream.length - 1 - index;
            const opacity = Math.max(1 - age * 0.18, 0.28);
            const align = line.speaker === "rin" ? "items-start" : "items-end";
            return (
              <div
                key={line.key}
                style={{ opacity }}
                className={`flex flex-col ${align} transition-opacity duration-700`}
              >
                <span className="text-[11px] lowercase tracking-[0.22em] text-ink/45">
                  {line.speaker}
                </span>
                <p className="mt-1 max-w-md text-base italic leading-7 text-ink/85">
                  {line.text}
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-12 text-center text-[11px] lowercase tracking-[0.22em] text-ink/35">
          the window stays open.
        </div>
      </main>
    </div>
  );
}
