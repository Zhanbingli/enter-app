import { useState } from "react";
import { stupidMissions } from "../data/stupidMissions";
import { randomItem, randomItemExcept } from "../utils/random";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type MissionModeProps = {
  onBack: () => void;
};

export function MissionMode({ onBack }: MissionModeProps) {
  const [mission, setMission] = useState(() => randomItem(stupidMissions));
  const [isWeird, setIsWeird] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function skipMission() {
    setMission(randomItemExcept(stupidMissions, mission.id));
    setIsWeird(false);
    setIsDone(false);
  }

  function makeWeirder() {
    setIsWeird(true);
    setIsDone(false);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          className="text-sm font-semibold text-ink/56 transition hover:text-ink"
          onClick={onBack}
        >
          Back
        </button>
        <span className="rounded-full border border-ink/10 bg-cream/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/48">
          Stupid Mission
        </span>
      </div>

      <section
        key={`${mission.id}-${isWeird ? "weird" : "plain"}`}
        className="enter my-auto rounded-lg border border-ink/10 bg-cream/88 p-6 shadow-soft backdrop-blur sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
          Tiny real-world mission
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          {isWeird ? mission.weirderMission : mission.mission}
        </h1>

        {isDone ? (
          <div className="float-in mt-7 border-t border-ink/10 pt-5">
            <p className="text-lg font-semibold leading-8 text-cocoa">
              {mission.doneResponse}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <PrimaryButton className="sm:flex-1" onClick={() => setIsDone(true)}>
            Done
          </PrimaryButton>
          <SecondaryButton className="sm:flex-1" onClick={skipMission}>
            Skip
          </SecondaryButton>
          <SecondaryButton
            className="sm:flex-1"
            onClick={makeWeirder}
            disabled={isWeird}
          >
            Make it weirder
          </SecondaryButton>
        </div>
      </section>
    </main>
  );
}
