// Shared server-side generation logic.
// Imported by both the Vite dev middleware (Node) and the Cloudflare Pages
// Function (Workers runtime). Must stay on Web-standard APIs only: fetch,
// JSON, no Node-specific imports.

import { resolveCharacterPair } from "./characterPairs";

export type GenerationKind = "room" | "story" | "mission";

// The room's current sound world, sent so a generated exchange can lightly
// react to what's audible (the kettle that just went, the rain that came in).
// Every field is whitelisted below — nothing here reaches the prompt as free
// text, so it can't be used to inject instructions.
export type Soundscape = {
  scene?: string;
  raining?: boolean;
  recentSounds?: string[];
};

export type GenerationRequest = {
  kind?: GenerationKind;
  tone?: "regular" | "quiet" | "weird";
  pairId?: string;
  avoidTopic?: string;
  avoidTitle?: string;
  avoidMission?: string;
  soundscape?: Soundscape;
};

export type GenerationConfig = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
};

export type DeepSeekResult = {
  content: unknown;
  tokensUsed: number;
};

const ROOM_TAGS = [
  "quiet",
  "weird",
  "cozy",
  "domestic",
  "night",
  "rain",
  "object-drama",
  "absurd"
];

export function isGenerationRequest(value: unknown): value is GenerationRequest {
  return typeof value === "object" && value !== null && "kind" in value;
}

const TONES = new Set(["regular", "quiet", "weird"]);

function normalizeTone(value: unknown): "regular" | "quiet" | "weird" {
  return typeof value === "string" && TONES.has(value)
    ? (value as "regular" | "quiet" | "weird")
    : "regular";
}

const ROOM_SCENES: Record<string, string> = {
  kitchen: "a warm kitchen, close and domestic",
  "before-rain": "hushed, the air just before rain",
  odd: "still, but very slightly off",
  still: "a still, quiet room"
};
const ROOM_SOUNDS = new Set([
  "kettle",
  "cup",
  "keyboard",
  "creak",
  "paper",
  "rain"
]);

type NormalizedSoundscape = {
  scene: string;
  raining: boolean;
  sounds: string[];
};

// Reduce the client soundscape to whitelisted values only. Returns null when
// there's nothing worth telling the model.
function normalizeSoundscape(value: unknown): NormalizedSoundscape | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const scene =
    typeof v.scene === "string" && v.scene in ROOM_SCENES ? v.scene : null;
  const raining = v.raining === true;
  const sounds = Array.isArray(v.recentSounds)
    ? Array.from(
        new Set(
          v.recentSounds.filter(
            (s): s is string => typeof s === "string" && ROOM_SOUNDS.has(s)
          )
        )
      ).slice(0, 4)
    : [];
  if (!scene && !raining && sounds.length === 0) return null;
  return { scene: scene ?? "still", raining, sounds };
}

function describeSoundscape(sc: NormalizedSoundscape): string {
  const bits = [`The room sounds like ${ROOM_SCENES[sc.scene]}.`];
  if (sc.raining) bits.push("Rain is falling outside.");
  if (sc.sounds.length > 0) {
    bits.push(`Sounds just heard nearby: ${sc.sounds.join(", ")}.`);
  }
  bits.push(
    "At most one line may lightly acknowledge a sound or the weather in passing; most lines should ignore it. Never announce or narrate the sound."
  );
  return bits.join(" ");
}

// Client-supplied free text goes into the prompt as a single line, so strip
// newlines (no breaking out of the line structure) and cap the length (no
// padding the token bill).
function sanitizeFreeText(value: unknown): string {
  if (typeof value !== "string") return "none";
  const cleaned = value.replace(/\s+/g, " ").trim().slice(0, 120);
  return cleaned || "none";
}

function baseInstructions() {
  return [
    "You generate tiny entertainment content for a calm mood app.",
    "The app is not a chatbot, not productivity, not learning, not therapy, not social media.",
    "No user participation prompts unless the mode is a Stupid Mission.",
    "Never say or imply 'as an AI'.",
    "No lessons, advice, diagnosis, self-improvement, inspirational framing, or podcast-host language.",
    "Tone: warm, casual, gently strange, slightly funny, low-pressure, emotionally soft but not childish.",
    "Keep wording concise. Avoid direct address in Room mode.",
    "Return ONLY a single JSON object that matches the requested shape. No prose, no markdown, no code fence."
  ].join("\n");
}

function roomShape(firstSpeaker: string, secondSpeaker: string) {
  return JSON.stringify(
    {
      id: "string slug",
      topic: "string, one short phrase",
      texture: "string, one word like quiet, weird, hummed",
      tags: `array of 2-4 strings, each from ${JSON.stringify(ROOM_TAGS)}`,
      lines: `array of 3-5 objects { "speaker": "${firstSpeaker}" or "${secondSpeaker}", "text": string }`
    },
    null,
    2
  );
}

const STORY_SHAPE = JSON.stringify(
  {
    id: "string slug",
    title: "string",
    scenario: "string, one or two sentences",
    startStepId: "exactly the string 'start'",
    steps:
      "array of 4-7 step objects: { id: string, text: string, choices: array of 0-3 { label: string, nextStepId: string }, ending: string (empty string if this step is not an ending) }"
  },
  null,
  2
);

const MISSION_SHAPE = JSON.stringify(
  {
    id: "string slug",
    mission: "string, one short imperative sentence"
  },
  null,
  2
);

// One-shot voice anchors, lifted from the hand-written content, so generated
// output lands in the same warm, small, gently strange register instead of
// generic assistant prose. The model is told to match the voice, not reuse
// the content.
const ROOM_VOICE_EXAMPLE = [
  "Match this voice — a tiny, warm, gently strange overheard exchange, often about an everyday object. Do not reuse the content:",
  'A: "The fridge is humming again. It sounds like it knows one note and trusts it completely."',
  'B: "Confidence like that is rare in an appliance."'
].join("\n");

const STORY_VOICE_EXAMPLE =
  'Match this whimsical, low-stakes register (do not reuse it) — scenario example: "A crow on your windowsill has questions about your spending this month. It is holding a small clipboard."';

const MISSION_VOICE_EXAMPLE =
  'Match this register (do not reuse these) — example missions: "Name the quietest object in the room." / "Give a houseplant a job title." / "Find the oldest thing you can see and nod at it."';

export function buildPrompts(request: GenerationRequest): {
  system: string;
  user: string;
} {
  const system = baseInstructions();

  if (request.kind === "room") {
    // Prompt content comes from the server-side pair table only; the client
    // contributes nothing but an id (unknown ids fall back to the default).
    const pair = resolveCharacterPair(request.pairId);
    const soundscape = normalizeSoundscape(request.soundscape);
    const user = [
      "Mode: Room.",
      "Write overheard dialogue between the two named characters. They talk to each other, never to the user.",
      "Quiet tone: softer, shorter, less punchline-driven. Weird tone: stranger and more object-focused, never frantic.",
      `Requested tone: ${normalizeTone(request.tone)}.`,
      `Avoid repeating this topic: ${sanitizeFreeText(request.avoidTopic)}.`,
      ...(soundscape ? [describeSoundscape(soundscape)] : []),
      `Character context: ${JSON.stringify(pair)}.`,
      "",
      ROOM_VOICE_EXAMPLE,
      "",
      "Return JSON shaped like:",
      roomShape(pair.characterA.name, pair.characterB.name)
    ].join("\n");
    return { system, user };
  }

  if (request.kind === "story") {
    const user = [
      "Mode: Tiny Story.",
      "Create one absurd micro-story for 1-3 minutes of play. The start step must have 2 or 3 simple choices.",
      "Use id 'start' for the first step. Ending steps must have an empty choices array and a short ending string. Non-ending steps must have an empty string for ending.",
      `Avoid repeating this title: ${sanitizeFreeText(request.avoidTitle)}.`,
      "",
      STORY_VOICE_EXAMPLE,
      "",
      "Return JSON shaped like:",
      STORY_SHAPE
    ].join("\n");
    return { system, user };
  }

  const user = [
    "Mode: Stupid Mission.",
    "Create one tiny real-world mission. It must be pure entertainment, not productivity, wellness, learning, cleaning, exercise, or self-improvement.",
    "The mission should be doable in the room in under a minute.",
    "No reward language, no scoring, no follow-up celebration. Just the mission line itself.",
    `Avoid repeating this mission: ${sanitizeFreeText(request.avoidMission)}.`,
    "",
    MISSION_VOICE_EXAMPLE,
    "",
    "Return JSON shaped like:",
    MISSION_SHAPE
  ].join("\n");
  return { system, user };
}

export async function callDeepSeek(
  request: GenerationRequest,
  config: GenerationConfig
): Promise<DeepSeekResult | null> {
  if (!config.apiKey) return null;

  const model = config.model ?? "deepseek-chat";
  const baseUrl = config.baseUrl ?? "https://api.deepseek.com";
  const { system, user } = buildPrompts(request);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      response_format: { type: "json_object" },
      max_tokens: request.kind === "story" ? 1400 : 800,
      temperature: 1.3
    })
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    usage?: { total_tokens?: number };
  };

  const raw = payload.choices?.[0]?.message?.content;
  if (typeof raw !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return {
    content: parsed,
    tokensUsed: payload.usage?.total_tokens ?? 0
  };
}

// Canonical cache key for a generation request. Same inputs → same key, so
// identical requests within the cache window share one DeepSeek call.
// Built from the same normalized values buildPrompts uses, so two request
// bodies that produce the same prompt always share a cache entry.
export function cacheKeyFor(request: GenerationRequest): string {
  const parts: string[] = [request.kind ?? "unknown"];
  if (request.kind === "room") {
    parts.push(normalizeTone(request.tone));
    parts.push(resolveCharacterPair(request.pairId).id);
    parts.push(sanitizeFreeText(request.avoidTopic));
    // Different sound worlds should generate different exchanges, so fold the
    // normalized soundscape into the key (sorted sounds so order doesn't split
    // the cache).
    const sc = normalizeSoundscape(request.soundscape);
    if (sc) {
      parts.push(sc.scene, sc.raining ? "rain" : "dry", [...sc.sounds].sort().join(","));
    }
  } else if (request.kind === "story") {
    parts.push(sanitizeFreeText(request.avoidTitle));
  } else if (request.kind === "mission") {
    parts.push(sanitizeFreeText(request.avoidMission));
  }
  return parts.join("|");
}
