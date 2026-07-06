import { useEffect, useRef, useState } from "react";
import { playClick } from "../audio/feedback";
import { characterPairs } from "../data/characters";
import { roomConversations } from "../data/roomConversations";
import { useAmbientSound } from "../hooks/useAmbientSound";
import { useEscape } from "../hooks/useEscape";
import { useRoomStream } from "../hooks/useRoomStream";
import { track, useTrackMode } from "../services/analytics";
import { takeEavesdropPair } from "../services/eavesdrop";
import { generateRoomConversation } from "../services/generationClient";
import { getLastSeen, setLastSeen } from "../services/lastSeen";
import { sceneForConversation } from "../services/roomScene";
import { isSoundEnabled, setSoundEnabled } from "../services/soundPref";
import type {
  CharacterPair,
  RoomConversation,
  RoomTone,
  RoomTopicTag
} from "../types";
import { randomItemExcept } from "../utils/random";
import { ConversationBubble } from "./ConversationBubble";

type RoomModeProps = {
  onOff: () => void;
};

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
  const [pair] = useState<CharacterPair>(() => {
    // If the user was just overhearing this pair on Home, enter their room.
    const fromHome = takeEavesdropPair();
    const carried = fromHome
      ? characterPairs.find((p) => p.id === fromHome)
      : undefined;
    const next =
      carried ?? randomItemExcept(characterPairs, getLastSeen("roomPair"));
    setLastSeen("roomPair", next.id);
    return next;
  });
  const [tone, setTone] = useState<RoomTone>(getInitialTone);
  const [conversation, setConversation] = useState<RoomConversation>(() =>
    pickConversation(pair.id, getInitialTone(), undefined, getTimeHint())
  );
  const [isToneLoading, setIsToneLoading] = useState(false);
  const [raining, setRaining] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  // The last few sounds the room actually made — sent to the generator so a
  // freshly written exchange can lightly acknowledge them.
  const recentCuesRef = useRef<string[]>([]);
  const {
    startSound,
    stopSound,
    setTone: setAmbientTone,
    playCue,
    setRain,
    setScene,
    murmur
  } = useAmbientSound();

  const { streamLines, isAtEnd } = useRoomStream({
    pair,
    tone,
    conversation,
    paused: isToneLoading,
    onEmit: (line) => {
      // Every line is murmured through the wall as it lands — you hear the
      // two of them talking, never the words.
      const words = line.text.split(/\s+/).length;
      murmur({
        high: line.align === "right",
        pan: line.align === "right" ? 0.32 : -0.32,
        syllables: Math.max(2, Math.min(8, Math.round(words * 0.8))),
        question: line.text.trim().endsWith("?")
      });
      if (!line.cue) return;
      recentCuesRef.current = [...recentCuesRef.current, line.cue].slice(-3);
      if (line.cue === "rain") {
        // The bridge: a line about rain pulls the weather into the room —
        // rain bed under the pad, rain streaks over the walls.
        setRaining(true);
        setRain(true);
        return;
      }
      // Foley, but sparse on purpose: the room answers most cues, not every
      // one, so it feels overheard rather than sound-tracked.
      if (Math.random() < 0.7) playCue(line.cue);
    }
  });

  // When the room moves on to a conversation that isn't about rain, let the
  // weather clear.
  useEffect(() => {
    const hasRain = conversation.lines.some((line) => line.cue === "rain");
    if (!hasRain) {
      setRaining(false);
      setRain(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Let the bed take on the character of the room this conversation happens
  // in — warmer in a kitchen, hollower before rain, slightly sour when odd.
  useEffect(() => {
    setScene(sceneForConversation(conversation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  function leaveRoom() {
    playClick("off");
    stopSound();
    onOff();
  }

  function toggleSound() {
    playClick("toggle");
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) {
        void startSound(tone);
        setScene(sceneForConversation(conversation));
      } else {
        stopSound();
      }
      return next;
    });
  }

  useTrackMode("room");
  useEscape(leaveRoom);

  useEffect(() => {
    // The room can be read in silence — only build the ambient bed if the
    // user hasn't muted it.
    if (soundOn) {
      void startSound(tone);
      // Apply the opening conversation's scene once the bed exists (the
      // conversation-scene effect above runs before startSound builds it).
      setScene(sceneForConversation(conversation));
    }
    return () => stopSound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAmbientTone(tone);
  }, [tone, setAmbientTone]);

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
      conversation.topic,
      {
        scene: sceneForConversation(conversation),
        raining,
        recentSounds: recentCuesRef.current
      }
    );
    const next =
      generated ??
      pickConversation(pair.id, nextTone, conversation.id, getTimeHint());
    setConversation(next);
  }

  async function changeTone(nextTone: RoomTone) {
    playClick("toggle");
    track("room_tone_change", { from: tone, to: nextTone });
    setIsToneLoading(true);
    try {
      await loadNextConversation(nextTone);
    } finally {
      setIsToneLoading(false);
    }
  }

  const total = streamLines.length;
  // The room's light temperature follows what's being talked about — warm in
  // a kitchen, cool before rain, a little off when odd. A slow wash over the
  // base so the room visibly breathes with the conversation.
  const currentScene = sceneForConversation(conversation);

  return (
    <div className="soft-room min-h-screen">
      <div className="room-tint" data-scene={currentScene} aria-hidden />
      <div
        className={`pointer-events-none fixed inset-0 z-[1] transition-opacity duration-[2500ms] ${
          raining ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div className="rain-layer" />
        <div className="rain-layer rain-layer-2" />
      </div>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink"
            onClick={leaveRoom}
          >
            off
          </button>
          <button
            className="inline-flex min-h-11 items-center px-2 py-2 transition hover:text-ink"
            onClick={toggleSound}
            aria-pressed={!soundOn}
          >
            {soundOn ? "mute" : "unmute"}
          </button>
        </div>

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
            className="inline-flex min-h-11 items-center px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => void changeTone("quiet")}
            disabled={isToneLoading}
          >
            quieter
          </button>
          <button
            className="inline-flex min-h-11 items-center px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
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
