import type {
  CharacterPair,
  RoomConversation,
  RoomTone,
  RoomTopicTag,
  StupidMission,
  TinyStory
} from "../types";
import { track } from "./analytics";

type GenerationKind = "room" | "story" | "mission";

type GenerationRequest =
  | {
      kind: "room";
      tone: RoomTone;
      pair: CharacterPair;
      avoidTopic?: string;
    }
  | {
      kind: "story";
      avoidTitle?: string;
    }
  | {
      kind: "mission";
      avoidMission?: string;
    };

const generationEnabled = import.meta.env.VITE_USE_AI_GENERATION === "true";
const validTags = new Set<RoomTopicTag>([
  "quiet",
  "weird",
  "cozy",
  "domestic",
  "night",
  "rain",
  "object-drama",
  "absurd"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeTags(value: unknown): RoomTopicTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((tag): tag is RoomTopicTag => validTags.has(tag));
}

async function requestGeneration(kind: GenerationKind, body: GenerationRequest) {
  if (!generationEnabled) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 9000);
  const startedAt = Date.now();
  let ok = false;
  let result: unknown = null;
  let failureReason: string | undefined;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      failureReason = `http_${response.status}`;
    } else {
      const payload = (await response.json()) as {
        kind?: string;
        result?: unknown;
      };
      if (payload.kind === kind && payload.result) {
        result = payload.result;
        ok = true;
      } else {
        failureReason = "empty_result";
      }
    }
  } catch (error) {
    failureReason =
      error instanceof DOMException && error.name === "AbortError"
        ? "timeout"
        : "network_error";
  } finally {
    window.clearTimeout(timeoutId);
    track("generation_attempt", {
      kind,
      ms: Date.now() - startedAt,
      ok,
      ...(failureReason ? { reason: failureReason } : {})
    });
  }

  return result;
}

export async function generateRoomConversation(
  tone: RoomTone,
  pair: CharacterPair,
  avoidTopic?: string
): Promise<RoomConversation | null> {
  const result = await requestGeneration("room", {
    kind: "room",
    tone,
    pair,
    avoidTopic
  });

  if (!isRecord(result) || !isString(result.topic) || !Array.isArray(result.lines)) {
    return null;
  }

  const lines = result.lines
    .filter(
      (line): line is { speaker: string; text: string } =>
        isRecord(line) && isString(line.speaker) && isString(line.text)
    )
    .slice(0, tone === "quiet" ? 3 : 5);

  if (lines.length < 3) {
    return null;
  }

  return {
    id: isString(result.id) ? result.id : `generated-room-${Date.now()}`,
    pairId: pair.id,
    topic: result.topic,
    texture: isString(result.texture) ? result.texture : tone,
    tags: normalizeTags(result.tags),
    lines,
    source: "generated"
  };
}

export async function generateTinyStory(
  avoidTitle?: string
): Promise<TinyStory | null> {
  const result = await requestGeneration("story", {
    kind: "story",
    avoidTitle
  });

  if (
    !isRecord(result) ||
    !isString(result.title) ||
    !isString(result.scenario) ||
    !isString(result.startStepId) ||
    !Array.isArray(result.steps)
  ) {
    return null;
  }

  const steps = result.steps.filter((step) => {
    if (!isRecord(step) || !isString(step.id) || !isString(step.text)) {
      return false;
    }

    if (step.choices === undefined) {
      return step.ending === undefined || isString(step.ending);
    }

    return (
      Array.isArray(step.choices) &&
      step.choices.every(
        (choice) =>
          isRecord(choice) &&
          isString(choice.label) &&
          isString(choice.nextStepId)
      )
    );
  }) as TinyStory["steps"];

  if (!steps.some((step) => step.id === result.startStepId)) {
    return null;
  }

  return {
    id: isString(result.id) ? result.id : `generated-story-${Date.now()}`,
    title: result.title,
    scenario: result.scenario,
    startStepId: result.startStepId,
    steps,
    source: "generated"
  };
}

export async function generateMission(
  avoidMission?: string
): Promise<StupidMission | null> {
  const result = await requestGeneration("mission", {
    kind: "mission",
    avoidMission
  });

  if (!isRecord(result) || !isString(result.mission)) {
    return null;
  }

  return {
    id: isString(result.id) ? result.id : `generated-mission-${Date.now()}`,
    mission: result.mission,
    source: "generated"
  };
}
