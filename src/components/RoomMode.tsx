import { useEffect, useMemo, useState } from "react";
import { characterPairs } from "../data/characters";
import { roomConversations } from "../data/roomConversations";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { generateRoomConversation } from "../services/generationClient";
import type { CharacterPair, RoomConversation, RoomTone } from "../types";
import { randomItem, randomItemExcept } from "../utils/random";
import { ConversationBubble } from "./ConversationBubble";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type RoomModeProps = {
  onOff: () => void;
};

type RoomState = {
  pair: CharacterPair;
  conversation: RoomConversation;
};

function getConversationPool(pairId: string, tone: RoomTone) {
  const pairConversations = roomConversations.filter(
    (conversation) => conversation.pairId === pairId
  );

  if (tone === "regular") {
    return pairConversations;
  }

  const tagged = pairConversations.filter((conversation) =>
    conversation.tags.includes(tone)
  );

  return tagged.length > 0 ? tagged : pairConversations;
}

function pickConversation(
  pairId: string,
  tone: RoomTone,
  currentId?: string
) {
  return randomItemExcept(getConversationPool(pairId, tone), currentId);
}

function createInitialRoomState(): RoomState {
  const pair = randomItem(characterPairs);
  return {
    pair,
    conversation: pickConversation(pair.id, "regular")
  };
}

export function RoomMode({ onOff }: RoomModeProps) {
  const [{ pair, conversation }, setRoomState] = useState(createInitialRoomState);
  const [tone, setTone] = useState<RoomTone>("regular");
  const [revealedCount, setRevealedCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isSoundOn, toggleSound, stopSound } = useAmbientSound();

  const lineLimit =
    tone === "quiet"
      ? Math.min(3, conversation.lines.length)
      : conversation.lines.length;
  const visibleLines = useMemo(
    () => conversation.lines.slice(0, lineLimit).slice(0, revealedCount),
    [conversation.lines, lineLimit, revealedCount]
  );
  const isComplete = revealedCount >= lineLimit;

  useEffect(() => {
    setRevealedCount(1);
    setIsPaused(false);
  }, [conversation.id, tone]);

  useEffect(() => {
    if (isPaused || isComplete) {
      return;
    }

    const pace = tone === "quiet" ? 1850 : tone === "weird" ? 1050 : 1350;
    const timer = window.setTimeout(() => {
      setRevealedCount((count) => Math.min(count + 1, lineLimit));
    }, pace);

    return () => window.clearTimeout(timer);
  }, [isPaused, isComplete, lineLimit, tone, revealedCount]);

  async function loadConversation(nextTone: RoomTone, nextPair = pair) {
    setTone(nextTone);
    setIsGenerating(true);

    const generatedConversation = await generateRoomConversation(
      nextTone,
      nextPair,
      conversation.topic
    );

    setRoomState({
      pair: nextPair,
      conversation:
        generatedConversation ??
        pickConversation(nextPair.id, nextTone, conversation.id)
    });
    setIsGenerating(false);
  }

  function changePair() {
    const nextPair = randomItemExcept(characterPairs, pair.id);
    void loadConversation("regular", nextPair);
  }

  function leaveRoom() {
    stopSound();
    onOff();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          className="text-sm font-semibold text-ink/56 transition hover:text-ink"
          onClick={leaveRoom}
        >
          Back
        </button>
        <span className="rounded-full border border-ink/10 bg-cream/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink/48">
          Room
        </span>
      </div>

      <section className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="enter rounded-lg border border-ink/10 bg-cream/78 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cocoa/50">
            Current pair
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
            {pair.characterA.name} and {pair.characterB.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/62">
            {pair.relationship}
          </p>

          <div className="mt-8 space-y-5 border-t border-ink/10 pt-5">
            <div>
              <p className="text-sm font-semibold text-tide">
                {pair.characterA.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/62">
                {pair.characterA.personality}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-clay">
                {pair.characterB.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/62">
                {pair.characterB.personality}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {conversation.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink/10 bg-white/50 px-3 py-1 text-xs font-semibold text-ink/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </aside>

        <section className="enter rounded-lg border border-ink/10 bg-cream/88 p-4 shadow-soft backdrop-blur sm:p-6">
          <div className="border-b border-ink/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cocoa/50">
              Current topic
            </p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {conversation.topic}
            </h2>
          </div>

          <div
            key={`${conversation.id}-${tone}`}
            className={`mt-6 min-h-[18rem] space-y-4 ${
              tone === "quiet" ? "opacity-80" : "opacity-100"
            }`}
          >
            {visibleLines.map((line, index) => (
              <ConversationBubble
                key={`${conversation.id}-${index}`}
                line={line}
                index={index}
                align={line.speaker === pair.characterA.name ? "left" : "right"}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton
              onClick={() => void loadConversation("regular")}
              disabled={isGenerating}
            >
              {isGenerating ? "Finding..." : "Next topic"}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => void loadConversation("quiet")}
              disabled={isGenerating}
            >
              Quieter
            </SecondaryButton>
            <SecondaryButton
              onClick={() => void loadConversation("weird")}
              disabled={isGenerating}
            >
              Weirder
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setIsPaused((value) => !value)}
              disabled={isComplete && !isPaused}
            >
              {isPaused ? "Resume" : "Pause"}
            </SecondaryButton>
            <SecondaryButton onClick={() => void toggleSound()}>
              {isSoundOn ? "Sound off" : "Sound on"}
            </SecondaryButton>
            <SecondaryButton onClick={changePair} disabled={isGenerating}>
              New pair
            </SecondaryButton>
            <SecondaryButton onClick={leaveRoom}>Off</SecondaryButton>
          </div>
        </section>
      </section>
    </main>
  );
}
