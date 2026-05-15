// Shared server-side generation logic.
// Imported by both the Vite dev middleware (Node) and the Cloudflare Pages
// Function (Workers runtime). Must stay on Web-standard APIs only: fetch,
// JSON, no Node-specific imports.

export type GenerationKind = "room" | "story" | "mission";

export type GenerationRequest = {
  kind?: GenerationKind;
  tone?: "regular" | "quiet" | "weird";
  pair?: {
    id?: string;
    characterA?: { name?: string; personality?: string };
    characterB?: { name?: string; personality?: string };
    relationship?: string;
  };
  avoidTopic?: string;
  avoidTitle?: string;
  avoidMission?: string;
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

export function buildPrompts(request: GenerationRequest): {
  system: string;
  user: string;
} {
  const system = baseInstructions();

  if (request.kind === "room") {
    const firstSpeaker = request.pair?.characterA?.name ?? "Kai";
    const secondSpeaker = request.pair?.characterB?.name ?? "Mina";
    const user = [
      "Mode: Room.",
      "Write overheard dialogue between the two named characters. They talk to each other, never to the user.",
      "Quiet tone: softer, shorter, less punchline-driven. Weird tone: stranger and more object-focused, never frantic.",
      `Requested tone: ${request.tone ?? "regular"}.`,
      `Avoid repeating this topic: ${request.avoidTopic ?? "none"}.`,
      `Character context: ${JSON.stringify(request.pair)}.`,
      "",
      "Return JSON shaped like:",
      roomShape(firstSpeaker, secondSpeaker)
    ].join("\n");
    return { system, user };
  }

  if (request.kind === "story") {
    const user = [
      "Mode: Tiny Story.",
      "Create one absurd micro-story for 1-3 minutes of play. The start step must have 2 or 3 simple choices.",
      "Use id 'start' for the first step. Ending steps must have an empty choices array and a short ending string. Non-ending steps must have an empty string for ending.",
      `Avoid repeating this title: ${request.avoidTitle ?? "none"}.`,
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
    `Avoid repeating this mission: ${request.avoidMission ?? "none"}.`,
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
export function cacheKeyFor(request: GenerationRequest): string {
  const parts: string[] = [request.kind ?? "unknown"];
  if (request.kind === "room") {
    parts.push(request.tone ?? "regular");
    parts.push(request.pair?.id ?? "no-pair");
    parts.push(request.avoidTopic ?? "");
  } else if (request.kind === "story") {
    parts.push(request.avoidTitle ?? "");
  } else if (request.kind === "mission") {
    parts.push(request.avoidMission ?? "");
  }
  return parts.join("|");
}
