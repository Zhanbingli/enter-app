import { useState } from "react";
import {
  clearEvents,
  readEvents,
  type AnalyticsEvent
} from "../services/analytics";

const STRICT_MODE_NOISE_MS = 500;

type ModeStat = {
  enters: number;
  closed: number;
  totalMs: number;
};

export function DebugView() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => readEvents());

  const filtered = events.filter((e) => {
    if (e.type === "mode_leave") {
      const ms = typeof e.props.durationMs === "number" ? e.props.durationMs : 0;
      if (ms < STRICT_MODE_NOISE_MS) return false;
    }
    return true;
  });

  const counts = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  const modeStats: Record<string, ModeStat> = {};
  filtered.forEach((e) => {
    const mode = typeof e.props.mode === "string" ? e.props.mode : null;
    if (!mode) return;
    modeStats[mode] ??= { enters: 0, closed: 0, totalMs: 0 };
    if (e.type === "mode_enter") modeStats[mode].enters += 1;
    if (e.type === "mode_leave") {
      const ms = typeof e.props.durationMs === "number" ? e.props.durationMs : 0;
      modeStats[mode].closed += 1;
      modeStats[mode].totalMs += ms;
    }
  });

  const genEvents = filtered.filter((e) => e.type === "generation_attempt");
  const genTotal = genEvents.length;
  const genOk = genEvents.filter((e) => e.props.ok === true).length;
  const genAvgMs =
    genTotal === 0
      ? 0
      : Math.round(
          genEvents.reduce((sum, e) => {
            const ms = typeof e.props.ms === "number" ? e.props.ms : 0;
            return sum + ms;
          }, 0) / genTotal
        );

  function handleClear() {
    clearEvents();
    setEvents([]);
  }

  function handleRefresh() {
    setEvents(readEvents());
  }

  const countLines =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${v.toString().padStart(4)}  ${k}`)
      .join("\n") || "(none)";

  const modeLines =
    Object.entries(modeStats)
      .map(([mode, s]) => {
        const avg = s.closed === 0 ? 0 : Math.round(s.totalMs / s.closed);
        return `${mode.padEnd(10)} enters=${s.enters} closed=${s.closed} totalMs=${s.totalMs} avgMs=${avg}`;
      })
      .join("\n") || "(none)";

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 font-mono text-xs leading-5 text-ink">
      <header className="flex items-center justify-between border-b border-ink/20 pb-3">
        <h1 className="text-base font-semibold">
          events ({filtered.length} shown / {events.length} stored)
        </h1>
        <div className="flex gap-3">
          <button className="underline" onClick={handleRefresh}>
            refresh
          </button>
          <button className="underline" onClick={handleClear}>
            clear
          </button>
          <a className="underline" href="/">
            back to app
          </a>
        </div>
      </header>

      <section className="mt-5">
        <h2 className="font-semibold">counts</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-cream/60 p-3">
          {countLines}
        </pre>
      </section>

      <section className="mt-5">
        <h2 className="font-semibold">mode sessions</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-cream/60 p-3">
          {modeLines}
        </pre>
      </section>

      <section className="mt-5">
        <h2 className="font-semibold">generation</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded bg-cream/60 p-3">
          {`total=${genTotal} ok=${genOk} fail=${genTotal - genOk} avgMs=${genAvgMs}`}
        </pre>
      </section>

      <section className="mt-5">
        <h2 className="font-semibold">log (newest first)</h2>
        <ul className="mt-2 max-h-[60vh] overflow-auto rounded bg-cream/60 p-3">
          {filtered
            .slice()
            .reverse()
            .map((e, i) => (
              <li key={`${e.ts}-${i}`}>
                {new Date(e.ts).toISOString().slice(11, 19)} |{" "}
                {e.type.padEnd(22)} | {JSON.stringify(e.props)}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
