import { useEffect, useState } from "react";
import type {
  CharacterPair,
  RoomConversation,
  RoomTone
} from "../types";

export type StreamLine = {
  speaker: string;
  text: string;
  key: string;
  align: "left" | "right";
};

const STREAM_CAP = 6;

type UseRoomStreamOptions = {
  pair: CharacterPair;
  tone: RoomTone;
  conversation: RoomConversation;
  paused?: boolean;
};

function pacingFor(tone: RoomTone): number {
  if (tone === "quiet") return 6500;
  if (tone === "weird") return 4500;
  return 5500;
}

export function useRoomStream({
  pair,
  tone,
  conversation,
  paused = false
}: UseRoomStreamOptions) {
  // Tie lineIndex to the conversation it belongs to, so a mid-flight
  // conversation swap can't drip a stale index into a new conversation.
  const [progress, setProgress] = useState(() => ({
    convId: conversation.id,
    index: 0
  }));
  const [streamLines, setStreamLines] = useState<StreamLine[]>([]);

  const lineIndex = progress.convId === conversation.id ? progress.index : 0;
  const lineLimit =
    tone === "quiet"
      ? Math.min(3, conversation.lines.length)
      : conversation.lines.length;
  const isAtEnd = lineIndex >= lineLimit;

  useEffect(() => {
    if (isAtEnd || paused) return;
    const delay = streamLines.length === 0 ? 250 : pacingFor(tone);
    const timer = window.setTimeout(() => {
      const line = conversation.lines[lineIndex];
      setStreamLines((prev) => {
        const next: StreamLine = {
          speaker: line.speaker,
          text: line.text,
          align: line.speaker === pair.characterA.name ? "left" : "right",
          key: `${conversation.id}-${lineIndex}`
        };
        const updated = [...prev, next];
        return updated.length > STREAM_CAP
          ? updated.slice(-STREAM_CAP)
          : updated;
      });
      setProgress({ convId: conversation.id, index: lineIndex + 1 });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [
    isAtEnd,
    paused,
    lineIndex,
    tone,
    conversation,
    pair,
    streamLines.length
  ]);

  return { streamLines, isAtEnd };
}
