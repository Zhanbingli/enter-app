import { useEffect, useState } from "react";
import { getCurrentMoment } from "../services/moments";
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

  useEffect(() => {
    recordVisit();
  }, []);

  return (
    <div className="soft-noise min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10 sm:px-8">
        <section className="enter max-w-3xl">
          <p className="mb-4 text-sm font-medium lowercase tracking-[0.18em] text-cocoa/55">
            {opener}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] text-ink sm:text-6xl">
            What kind of boredom is this?
          </h1>
          <p className="mt-5 text-lg leading-8 text-ink/64 sm:text-xl">
            Pick a state. No scrolling required.
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

        <p className="mt-12 text-xs uppercase tracking-[0.18em] text-ink/30">
          esc anywhere to step out
        </p>
      </main>
    </div>
  );
}
