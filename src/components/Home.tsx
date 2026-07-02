import { useEffect, useState, type CSSProperties } from "react";
import { unlockAudio } from "../audio/context";
import { playClick } from "../audio/feedback";
import { useEavesdrop } from "../hooks/useEavesdrop";
import { getCurrentMoment } from "../services/moments";
import { isRainUnlocked } from "../services/sessions";
import { getOpener } from "../services/timeBand";
import { getReturningPhrase, recordVisit } from "../services/visitor";
import type { Mode } from "../types";
import { ModeCard } from "./ModeCard";

type HomeProps = {
  onSelectMode: (mode: Mode) => void;
};

export function Home({ onSelectMode }: HomeProps) {
  const [opener] = useState(
    () => getCurrentMoment()?.opener ?? getReturningPhrase() ?? getOpener()
  );
  const [rainUnlocked] = useState(() => isRainUnlocked());
  const eavesdrop = useEavesdrop();

  useEffect(() => {
    recordVisit();
  }, []);

  return (
    <div className="soft-noise min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10 sm:px-8">
        <section className="enter max-w-3xl">
          <p className="mb-5 flex items-center gap-3 text-sm font-medium lowercase tracking-[0.18em] text-cocoa/75">
            <span
              className="lamp-orb"
              style={{ "--glow": "var(--color-lamp)" } as CSSProperties}
              aria-hidden
            />
            {opener}
          </p>
          <h1 className="max-w-2xl font-serif text-4xl font-medium leading-[1.08] text-ink sm:text-6xl">
            What kind of boredom is this?
          </h1>
          <p className="mt-5 text-lg leading-8 text-ink/55 sm:text-xl">
            Pick a room to sit near. Nothing to scroll, no one to answer.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <ModeCard
            title="The room feels too quiet"
            mood="Two people talk nearby. You don't have to do anything."
            accent="tide"
            mode="room"
            onSelect={onSelectMode}
          />
          <ModeCard
            title="I want a tiny weird thing"
            mood="A small odd story with a few choices."
            accent="clay"
            mode="story"
            onSelect={onSelectMode}
          />
          <ModeCard
            title="I want something stupid to do"
            mood="A tiny mission for the room you're already in."
            accent="moss"
            mode="mission"
            onSelect={onSelectMode}
          />
        </section>

        {rainUnlocked ? (
          <button
            className="rain-hint mt-10 self-start text-sm italic lowercase tracking-wide text-ink/55 transition hover:text-ink"
            onClick={() => {
              void unlockAudio();
              playClick("tap");
              onSelectMode("rain");
            }}
          >
            — the window is open.
          </button>
        ) : null}

        <p className="mt-12 text-xs uppercase tracking-[0.18em] text-ink/45">
          esc anywhere to step out
        </p>
      </main>

      {eavesdrop ? (
        <aside
          key={eavesdrop.id}
          className="eavesdrop"
          aria-hidden
        >
          <span className="eavesdrop-speaker">{eavesdrop.speaker.toLowerCase()}</span>
          <span className="eavesdrop-text">{eavesdrop.text}</span>
        </aside>
      ) : null}
    </div>
  );
}
