import { useEffect, useMemo, useState } from "react";
import { tinyStories } from "../data/tinyStories";
import { useEscape } from "../hooks/useEscape";
import { track, useTrackMode } from "../services/analytics";
import { generateTinyStory } from "../services/generationClient";
import type { TinyStory } from "../types";
import { randomItem, randomItemExcept } from "../utils/random";

type TinyStoryModeProps = {
  onBack: () => void;
};

function getStartStep(story: TinyStory) {
  return story.steps.find((step) => step.id === story.startStepId)!;
}

export function TinyStoryMode({ onBack }: TinyStoryModeProps) {
  const [story, setStory] = useState(() => randomItem(tinyStories));
  const [stepId, setStepId] = useState(() => story.startStepId);
  const [isLoading, setIsLoading] = useState(false);

  useTrackMode("story");
  useEscape(onBack);

  const currentStep = useMemo(
    () => story.steps.find((step) => step.id === stepId) ?? getStartStep(story),
    [story, stepId]
  );
  const isStart = stepId === story.startStepId;
  const isEnding = Boolean(currentStep.ending);

  useEffect(() => {
    if (isEnding) {
      track("story_ending", { storyId: story.id, stepId });
    }
  }, [isEnding, story.id, stepId]);

  function chooseStep(nextStepId: string) {
    track("story_choice", {
      storyId: story.id,
      fromStepId: stepId,
      toStepId: nextStepId
    });
    setStepId(nextStepId);
  }

  async function newStory() {
    setIsLoading(true);
    const fromId = story.id;
    try {
      const generated = await generateTinyStory(story.title);
      const next = generated ?? randomItemExcept(tinyStories, story.id);
      setStory(next);
      setStepId(next.startStepId);
      track("another_tap", {
        mode: "story",
        fromId,
        toId: next.id,
        source: generated ? "generated" : "local"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="soft-story min-h-screen font-serif">
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink/35">
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink"
            onClick={onBack}
          >
            back
          </button>
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => void newStory()}
            disabled={isLoading}
          >
            another
          </button>
        </div>

        <section
          key={`${story.id}-${stepId}`}
          className={`enter my-auto transition-opacity duration-500 ${
            isLoading ? "opacity-40" : "opacity-100"
          }`}
        >
          {isStart ? (
            <p className="text-lg leading-8 text-ink/70 sm:text-xl">
              {story.scenario}
            </p>
          ) : null}
          <p
            className={`${
              isStart ? "mt-5" : ""
            } text-base leading-8 text-ink/85`}
          >
            {currentStep.text}
          </p>
          {currentStep.ending ? (
            <p className="mt-6 border-t border-ink/15 pt-5 text-base italic leading-7 text-cocoa">
              {currentStep.ending}
            </p>
          ) : null}

          {currentStep.choices && currentStep.choices.length > 0 ? (
            <div className="mt-7 flex flex-col items-start gap-3">
              {currentStep.choices.map((choice) => (
                <button
                  key={choice.nextStepId}
                  className="min-h-11 py-2 text-left text-base text-ink/72 underline decoration-ink/20 underline-offset-4 transition hover:text-ink hover:decoration-ink"
                  onClick={() => chooseStep(choice.nextStepId)}
                >
                  → {choice.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
