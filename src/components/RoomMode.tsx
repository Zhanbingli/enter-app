import { useMemo, useState } from "react";
import { characterPair } from "../data/characters";
import { roomConversations } from "../data/roomConversations";
import { randomItem, randomItemExcept } from "../utils/random";
import { ConversationBubble } from "./ConversationBubble";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

type RoomModeProps = {
  onOff: () => void;
};

type RoomTone = "regular" | "quiet" | "weird";

const quietTextures = new Set(["quiet", "soft", "rainy", "glow", "still", "cozy"]);

export function RoomMode({ onOff }: RoomModeProps) {
  const [conversation, setConversation] = useState(() =>
    randomItem(roomConversations)
  );
  const [tone, setTone] = useState<RoomTone>("regular");

  const visibleLines = useMemo(() => {
    if (tone === "quiet") {
      return conversation.lines.slice(0, 3);
    }

    return conversation.lines;
  }, [conversation, tone]);

  function nextTopic(nextTone: RoomTone = tone) {
    const pool =
      nextTone === "quiet"
        ? roomConversations.filter((item) => quietTextures.has(item.texture))
        : roomConversations;

    setTone(nextTone);
    setConversation(randomItemExcept(pool, conversation.id));
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          className="text-sm font-semibold text-ink/56 transition hover:text-ink"
          onClick={onOff}
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
            {characterPair.characterA.name} and {characterPair.characterB.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/62">
            {characterPair.relationship}
          </p>

          <div className="mt-8 space-y-5 border-t border-ink/10 pt-5">
            <div>
              <p className="text-sm font-semibold text-tide">
                {characterPair.characterA.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/62">
                {characterPair.characterA.personality}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-clay">
                {characterPair.characterB.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/62">
                {characterPair.characterB.personality}
              </p>
            </div>
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
            className={`mt-6 space-y-4 ${
              tone === "quiet" ? "opacity-80" : "opacity-100"
            }`}
          >
            {visibleLines.map((line, index) => (
              <ConversationBubble
                key={`${conversation.id}-${index}`}
                line={line}
                index={index}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => nextTopic("regular")}>
              Next topic
            </PrimaryButton>
            <SecondaryButton onClick={() => nextTopic("quiet")}>
              Quieter
            </SecondaryButton>
            <SecondaryButton onClick={() => nextTopic("weird")}>
              Weirder
            </SecondaryButton>
            <SecondaryButton onClick={onOff}>Off</SecondaryButton>
          </div>
        </section>
      </section>
    </main>
  );
}
