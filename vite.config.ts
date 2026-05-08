import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type GenerationRequest = {
  kind?: "room" | "story" | "mission";
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

const roomTags = [
  "quiet",
  "weird",
  "cozy",
  "domestic",
  "night",
  "rain",
  "object-drama",
  "absurd"
];

function readRequestBody(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function isGenerationRequest(value: unknown): value is GenerationRequest {
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
      tags: `array of 2-4 strings, each from ${JSON.stringify(roomTags)}`,
      lines: `array of 3-5 objects { "speaker": "${firstSpeaker}" or "${secondSpeaker}", "text": string }`
    },
    null,
    2
  );
}

const storyShape = JSON.stringify(
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

const missionShape = JSON.stringify(
  {
    id: "string slug",
    mission: "string, one short imperative sentence"
  },
  null,
  2
);

function buildPrompts(request: GenerationRequest): {
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
      storyShape
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
    missionShape
  ].join("\n");
  return { system, user };
}

async function callDeepSeek(
  request: GenerationRequest,
  env: Record<string, string>
) {
  const apiKey = env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;

  const model =
    env.DEEPSEEK_MODEL ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const baseUrl =
    env.DEEPSEEK_BASE_URL ??
    process.env.DEEPSEEK_BASE_URL ??
    "https://api.deepseek.com";

  const { system, user } = buildPrompts(request);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
  };

  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function aiGenerationPlugin(env: Record<string, string>): Plugin {
  return {
    name: "mood-entertainment-ai-generation",
    configureServer(server) {
      server.middlewares.use("/api/generate", async (request, response) => {
        if (request.method !== "POST") {
          sendJson(response, 405, { error: "method_not_allowed" });
          return;
        }

        try {
          const body = await readRequestBody(request);

          if (!isGenerationRequest(body) || !body.kind) {
            sendJson(response, 400, { error: "invalid_generation_request" });
            return;
          }

          const result = await callDeepSeek(body, env);

          if (!result) {
            sendJson(response, 204, {});
            return;
          }

          sendJson(response, 200, { kind: body.kind, result });
        } catch {
          sendJson(response, 204, {});
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), aiGenerationPlugin(env)],
    server: { host: "127.0.0.1" }
  };
});
