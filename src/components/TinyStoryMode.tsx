import { useMemo, useState } from "react";
import { tinyStories } from "../data/tinyStories";
import { generateTinyStory } from "../services/generationClient";
import type { TinyStory } from "../types";
import { randomItem, randomItemExcept } from "../utils/random";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type TinyStoryModeProps = {
  onBack: () => void;
};

function getStartStep(story: TinyStory) {
  return story.steps.find((step) => step.id === story.startStepId)!;
}

export function TinyStoryMode({ onBack }: TinyStoryModeProps) {
  const [story, setStory] = useState(() => randomItem(tinyStories));
  const [stepId, setStepId] = useState(() => story.startStepId);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStep = useMemo(
    () => story.steps.find((step) => step.id === stepId) ?? getStartStep(story),
    [story, stepId]
  );

  async function newStory() {
    setIsGenerating(true);
    const generatedStory = await generateTinyStory(story.title);
    const nextStory = generatedStory ?? randomItemExcept(tinyStories, story.id);
    setStory(nextStory);
    setStepId(nextStory.startStepId);
    setIsGenerating(false);
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
          Tiny Story
        </span>
      </div>

      <section
        key={`${story.id}-${stepId}`}
        className="enter my-auto rounded-lg border border-ink/10 bg-cream/88 p-6 shadow-soft backdrop-blur sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay/70">
          {story.title}
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-5xl">
          {story.scenario}
        </h1>

        <div className="mt-7 border-t border-ink/10 pt-6">
          <p className="text-lg leading-8 text-ink/82">{currentStep.text}</p>
          {currentStep.ending ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-base font-semibold leading-7 text-cocoa">
              {currentStep.ending}
            </p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {currentStep.choices?.map((choice) => (
            <SecondaryButton
              key={choice.nextStepId}
              className="sm:flex-1"
              onClick={() => setStepId(choice.nextStepId)}
            >
              {choice.label}
            </SecondaryButton>
          ))}
          <PrimaryButton
            onClick={() => void newStory()}
            disabled={isGenerating}
          >
            {isGenerating ? "Finding..." : "New story"}
          </PrimaryButton>
        </div>
      </section>
    </main>
  );
}
