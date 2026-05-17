// Home's overheard-dialogue layer. Slowly drips single lines from a randomly
// picked Room pair, biased toward the more striking conversation tags
// (weird / absurd / object-drama). The pair is stashed so Room picks it up
// on entry — same characters continue their conversation in the proper room.

import { useEffect, useRef, useState } from "react";
import { characterPairs } from "../data/characters";
import { roomConversations } from "../data/roomConversations";
import { setEavesdropPair } from "../services/eavesdrop";
import { getLastSeen } from "../services/lastSeen";
import type { CharacterPair, RoomTopicTag } from "../types";
import { randomItem, randomItemExcept } from "../utils/random";

export type EavesdropLine = {
  id: number;
  speaker: string;
  text: string;
};

const FIRST_LINE_DELAY_MS = 5500;
const LINE_HOLD_MS = 7500;
const GAP_MIN_MS = 14000;
const GAP_MAX_MS = 22000;

const PREFERRED_TAGS: RoomTopicTag[] = ["weird", "absurd", "object-drama"];

function reduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function pickPair(): CharacterPair {
  const next = randomItemExcept(characterPairs, getLastSeen("roomPair"));
  setEavesdropPair(next.id);
  return next;
}

function pickLineForPair(pair: CharacterPair): {
  speaker: string;
  text: string;
} | null {
  const pool = roomConversations.filter((c) => c.pairId === pair.id);
  if (pool.length === 0) return null;
  const preferred = pool.filter((c) =>
    c.tags.some((t) => PREFERRED_TAGS.includes(t))
  );
  const conv = randomItem(preferred.length > 0 ? preferred : pool);
  const line = randomItem(conv.lines);
  return { speaker: line.speaker, text: line.text };
}

export function useEavesdrop(): EavesdropLine | null {
  const [line, setLine] = useState<EavesdropLine | null>(null);
  const pairRef = useRef<CharacterPair | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (reduceMotion()) return;

    pairRef.current = pickPair();
    let cancelled = false;
    let timerId: number | null = null;

    function showLine() {
      if (cancelled || !pairRef.current) return;
      const next = pickLineForPair(pairRef.current);
      if (next) {
        counterRef.current += 1;
        setLine({ id: counterRef.current, ...next });
      }
      timerId = window.setTimeout(() => {
        if (cancelled) return;
        setLine(null);
        const gap = GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS);
        timerId = window.setTimeout(showLine, gap);
      }, LINE_HOLD_MS);
    }

    timerId = window.setTimeout(showLine, FIRST_LINE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, []);

  return line;
}
