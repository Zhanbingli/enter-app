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
  weird?: boolean;
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

function extractOutputText(payload: unknown) {
  const response = payload as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ type?: string; text?: unknown }> }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
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
    "Return only content that matches the JSON schema."
  ].join("\n");
}

function roomSchema(firstSpeaker: string, secondSpeaker: string) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["id", "topic", "texture", "tags", "lines"],
    properties: {
      id: { type: "string" },
      topic: { type: "string" },
      texture: { type: "string" },
      tags: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: { type: "string", enum: roomTags }
      },
      lines: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["speaker", "text"],
          properties: {
            speaker: { type: "string", enum: [firstSpeaker, secondSpeaker] },
            text: { type: "string" }
          }
        }
      }
    }
  };
}

const storySchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "title", "scenario", "startStepId", "steps"],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    scenario: { type: "string" },
    startStepId: { type: "string", enum: ["start"] },
    steps: {
      type: "array",
      minItems: 4,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "text", "choices", "ending"],
        properties: {
          id: { type: "string" },
          text: { type: "string" },
          choices: {
            type: "array",
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["label", "nextStepId"],
              properties: {
                label: { type: "string" },
                nextStepId: { type: "string" }
              }
            }
          },
          ending: { type: "string" }
        }
      }
    }
  }
};

const missionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "mission", "weirderMission", "doneResponse"],
  properties: {
    id: { type: "string" },
    mission: { type: "string" },
    weirderMission: { type: "string" },
    doneResponse: { type: "string" }
  }
};

function buildGenerationPrompt(request: GenerationRequest) {
  if (request.kind === "room") {
    return [
      baseInstructions(),
      "Mode: Room.",
      "Write overheard dialogue between the two named characters. They talk to each other, never to the user.",
      "Quiet tone should feel softer, shorter, and less punchline-driven. Weird tone should be stranger and more object-focused without becoming frantic.",
      `Requested tone: ${request.tone ?? "regular"}.`,
      `Avoid repeating this topic: ${request.avoidTopic ?? "none"}.`,
      `Character context: ${JSON.stringify(request.pair)}.`
    ].join("\n");
  }

  if (request.kind === "story") {
    return [
      baseInstructions(),
      "Mode: Tiny Story.",
      "Create one absurd micro-story for 1-3 minutes of play. The start step must have 2 or 3 simple choices.",
      "Use id 'start' for the first step. Ending steps should have an empty choices array and a short ending string.",
      `Avoid repeating this title: ${request.avoidTitle ?? "none"}.`
    ].join("\n");
  }

  return [
    baseInstructions(),
    "Mode: Stupid Mission.",
    "Create one tiny real-world mission. It must be pure entertainment, not productivity, wellness, learning, cleaning, exercise, or self-improvement.",
    "The mission should be doable in the room in under a minute.",
    `Make the base mission especially weird: ${request.weird ? "yes" : "no"}.`,
    `Avoid repeating this mission: ${request.avoidMission ?? "none"}.`
  ].join("\n");
}

function schemaForRequest(request: GenerationRequest) {
  if (request.kind === "room") {
    const firstSpeaker = request.pair?.characterA?.name ?? "Kai";
    const secondSpeaker = request.pair?.characterB?.name ?? "Mina";
    return roomSchema(firstSpeaker, secondSpeaker);
  }

  if (request.kind === "story") {
    return storySchema;
  }

  return missionSchema;
}

async function callOpenAI(
  request: GenerationRequest,
  env: Record<string, string>
) {
  const apiKey = env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = env.OPENAI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-5.4-nano";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: buildGenerationPrompt(request),
      max_output_tokens: request.kind === "story" ? 1200 : 700,
      text: {
        format: {
          type: "json_schema",
          name: `${request.kind}_entertainment`,
          strict: true,
          schema: schemaForRequest(request)
        }
      }
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  return outputText ? JSON.parse(outputText) : null;
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

          const result = await callOpenAI(body, env);

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
    plugins: [react(), aiGenerationPlugin(env)]
  };
});
