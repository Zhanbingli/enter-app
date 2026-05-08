import { useEffect, useMemo, useState } from "react";
import { characterPairs } from "../data/characters";
import { roomConversations } from "../data/roomConversations";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useEscape } from "../hooks/useEscape";
import { track, useTrackMode } from "../services/analytics";
import { generateRoomConversation } from "../services/generationClient";
import type {
  CharacterPair,
  ConversationLine,
  RoomConversation,
  RoomTone,
  RoomTopicTag
} from "../types";
import { randomItem, randomItemExcept } from "../utils/random";
import { ConversationBubble } from "./ConversationBubble";

type RoomModeProps = {
  onOff: () => void;
};

type StreamLine = ConversationLine & {
  key: string;
  align: "left" | "right";
};

const STREAM_CAP = 6;

function getTimeHint(): RoomTopicTag | undefined {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 11) return "cozy";
  if (hour < 18) return undefined;
  if (hour < 22) return "domestic";
  return "night";
}

function getInitialTone(): RoomTone {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 23 ? "quiet" : "regular";
}

function getConversationPool(
  pairId: string,
  tone: RoomTone,
  hint?: RoomTopicTag
): RoomConversation[] {
  const all = roomConversations.filter((c) => c.pairId === pairId);
  if (tone === "regular") {
    if (hint) {
      const hinted = all.filter((c) => c.tags.includes(hint));
      if (hinted.length >= 2) return hinted;
    }
    return all;
  }
  const tagged = all.filter((c) => c.tags.includes(tone));
  return tagged.length > 0 ? tagged : all;
}

function pickConversation(
  pairId: string,
  tone: RoomTone,
  currentId?: string,
  hint?: RoomTopicTag
) {
  return randomItemExcept(getConversationPool(pairId, tone, hint), currentId);
}

export function RoomMode({ onOff }: RoomModeProps) {
  const [pair] = useState<CharacterPair>(() => randomItem(characterPairs));
  const [tone, setTone] = useState<RoomTone>(getInitialTone);
  const [conversation, setConversation] = useState<RoomConversation>(() =>
    pickConversation(pair.id, getInitialTone(), undefined, getTimeHint())
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [streamLines, setStreamLines] = useState<StreamLine[]>([]);
  const [isToneLoading, setIsToneLoading] = useState(false);
  const { startSound, stopSound } = useAmbientSound();

  const lineLimit = useMemo(
    () =>
      tone === "quiet"
        ? Math.min(3, conversation.lines.length)
        : conversation.lines.length,
    [tone, conversation.lines.length]
  );
  const isAtEnd = lineIndex >= lineLimit;

  function leaveRoom() {
    stopSound();
    onOff();
  }

  useTrackMode("room");
  useEscape(leaveRoom);

  useEffect(() => {
    void startSound();
    return () => stopSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAtEnd || isToneLoading) return;
    const pace = tone === "quiet" ? 6500 : tone === "weird" ? 4500 : 5500;
    const delay = streamLines.length === 0 ? 250 : pace;
    const timer = window.setTimeout(() => {
      const line = conversation.lines[lineIndex];
      setStreamLines((prev) => {
        const next: StreamLine = {
          speaker: line.speaker,
          text: line.text,
          align:
            line.speaker === pair.characterA.name ? "left" : "right",
          key: `${conversation.id}-${lineIndex}`
        };
        const updated = [...prev, next];
        return updated.length > STREAM_CAP
          ? updated.slice(-STREAM_CAP)
          : updated;
      });
      setLineIndex((i) => i + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [
    isAtEnd,
    isToneLoading,
    lineIndex,
    tone,
    conversation,
    pair,
    streamLines.length
  ]);

  useEffect(() => {
    if (!isAtEnd || isToneLoading) return;
    const gap = tone === "quiet" ? 8500 : 6500;
    const fromConvId = conversation.id;
    const timer = window.setTimeout(() => {
      track("room_auto_advance", { tone, fromConvId });
      void loadNextConversation(tone);
    }, gap);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAtEnd, isToneLoading, tone, conversation.id]);

  async function loadNextConversation(nextTone: RoomTone) {
    if (nextTone !== tone) setTone(nextTone);
    const generated = await generateRoomConversation(
      nextTone,
      pair,
      conversation.topic
    );
    const next =
      generated ??
      pickConversation(pair.id, nextTone, conversation.id, getTimeHint());
    setConversation(next);
    setLineIndex(0);
  }

  async function changeTone(nextTone: RoomTone) {
    track("room_tone_change", { from: tone, to: nextTone });
    setIsToneLoading(true);
    try {
      await loadNextConversation(nextTone);
    } finally {
      setIsToneLoading(false);
    }
  }

  const total = streamLines.length;

  return (
    <div className="soft-room min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <button
          className="inline-flex min-h-11 items-center self-start px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35 transition hover:text-ink"
          onClick={leaveRoom}
        >
          off
        </button>

      <section className="mt-auto space-y-4" aria-live="polite">
        {streamLines.map((line, index) => {
          const age = total - 1 - index;
          const opacity = Math.max(1 - age * 0.15, 0.3);
          return (
            <div
              key={line.key}
              style={{ opacity }}
              className="transition-opacity duration-700"
            >
              <ConversationBubble
                line={{ speaker: line.speaker, text: line.text }}
                index={0}
                align={line.align}
              />
            </div>
          );
        })}
      </section>

        <div className="mt-10 flex justify-center gap-8">
          <button
            className="inline-flex min-h-11 items-center px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => void changeTone("quiet")}
            disabled={isToneLoading}
          >
            quieter
          </button>
          <button
            className="inline-flex min-h-11 items-center px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/35 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => void changeTone("weird")}
            disabled={isToneLoading}
          >
            weirder
          </button>
        </div>
      </main>
    </div>
  );
}
