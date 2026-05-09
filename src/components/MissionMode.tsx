import { useState } from "react";
import { stupidMissions } from "../data/stupidMissions";
import { useEscape } from "../hooks/useEscape";
import { track, useTrackMode } from "../services/analytics";
import { generateMission } from "../services/generationClient";
import { getLastSeen, setLastSeen } from "../services/lastSeen";
import { randomItemExcept } from "../utils/random";

type MissionModeProps = {
  onBack: () => void;
};

export function MissionMode({ onBack }: MissionModeProps) {
  const [mission, setMission] = useState(() => {
    const next = randomItemExcept(stupidMissions, getLastSeen("mission"));
    setLastSeen("mission", next.id);
    return next;
  });
  const [isLoading, setIsLoading] = useState(false);

  useTrackMode("mission");
  useEscape(onBack);

  async function nextMission() {
    setIsLoading(true);
    const fromId = mission.id;
    try {
      const generated = await generateMission(mission.mission);
      const next = generated ?? randomItemExcept(stupidMissions, mission.id);
      setMission(next);
      setLastSeen("mission", next.id);
      track("another_tap", {
        mode: "mission",
        fromId,
        toId: next.id,
        source: generated ? "generated" : "local"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="soft-mission min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/35">
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink"
            onClick={onBack}
          >
            off
          </button>
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => void nextMission()}
            disabled={isLoading}
          >
            another
          </button>
        </div>

        <section
          key={mission.id}
          className={`enter my-auto transition-opacity duration-500 ${
            isLoading ? "opacity-40" : "opacity-100"
          }`}
        >
          <p className="text-2xl font-medium leading-snug text-ink sm:text-3xl">
            {mission.mission}
          </p>
        </section>
      </main>
    </div>
  );
}
