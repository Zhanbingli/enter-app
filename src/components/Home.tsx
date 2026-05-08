import type { Mode } from "../types";
import { ModeCard } from "./ModeCard";

type HomeProps = {
  onSelectMode: (mode: Mode) => void;
};

export function Home({ onSelectMode }: HomeProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10 sm:px-8">
      <section className="enter max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cocoa/55">
          Ambient mischief
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] text-ink sm:text-6xl">
          What kind of boredom is this?
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink/64 sm:text-xl">
          Choose a mood. No scrolling required.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <ModeCard
          title="Make the room less quiet"
          mood="Two old roommates quietly talk nearby."
          accent="tide"
          mode="room"
          onSelect={onSelectMode}
        />
        <ModeCard
          title="Give me a tiny strange story"
          mood="A short odd thing with a few choices."
          accent="clay"
          mode="story"
          onSelect={onSelectMode}
        />
        <ModeCard
          title="Give me something stupid to do"
          mood="A tiny mission for the room you are already in."
          accent="moss"
          mode="mission"
          onSelect={onSelectMode}
        />
      </section>
    </main>
  );
}
