// Cloudflare Pages Function: production /api/generate.
// Mirrors the Vite dev middleware but adds three protections against the
// "free + self-funded" failure mode where a runaway user burns the budget:
//   1. KV-backed daily token budget circuit breaker (UTC day).
//   2. Per-IP hourly rate limit.
//   3. Short-TTL response cache so identical requests share one upstream call.
//
// On any breaker trip or upstream failure the function returns 204, which the
// frontend already treats as "generation unavailable, use local content".

import {
  callDeepSeek,
  cacheKeyFor,
  isGenerationRequest,
  type GenerationRequest
} from "../../server/generation";

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
};

type Env = {
  MOOD_KV: KVNamespace;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  DEEPSEEK_BASE_URL?: string;
  DAILY_TOKEN_BUDGET?: string;
  RATE_LIMIT_PER_HOUR?: string;
  CACHE_TTL_SECONDS?: string;
};

type EventContext = {
  request: Request;
  env: Env;
  waitUntil(promise: Promise<unknown>): void;
};

const DEFAULTS = {
  dailyTokenBudget: 800_000,
  rateLimitPerHour: 60,
  cacheTtlSeconds: 900,
  budgetKeyTtl: 60 * 60 * 48,
  rateKeyTtl: 60 * 60 * 2
};

function noContent(): Response {
  return new Response(null, { status: 204 });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function parseInt32(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function utcHourKey(date = new Date()): string {
  return date.toISOString().slice(0, 13);
}

async function sha256Hex(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readBudget(env: Env): Promise<number> {
  const raw = await env.MOOD_KV.get(`budget:${utcDayKey()}`);
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

async function incrementBudget(env: Env, tokens: number) {
  const key = `budget:${utcDayKey()}`;
  const current = await readBudget(env);
  await env.MOOD_KV.put(key, String(current + tokens), {
    expirationTtl: DEFAULTS.budgetKeyTtl
  });
}

async function checkRateLimit(env: Env, ip: string, cap: number): Promise<boolean> {
  const key = `rate:${ip}:${utcHourKey()}`;
  const raw = await env.MOOD_KV.get(key);
  const current = raw ? Number.parseInt(raw, 10) || 0 : 0;
  if (current >= cap) return false;
  await env.MOOD_KV.put(key, String(current + 1), {
    expirationTtl: DEFAULTS.rateKeyTtl
  });
  return true;
}

async function readCache(
  env: Env,
  cacheKey: string
): Promise<unknown | null> {
  const raw = await env.MOOD_KV.get(`cache:${cacheKey}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(
  env: Env,
  cacheKey: string,
  content: unknown,
  ttlSeconds: number
) {
  await env.MOOD_KV.put(`cache:${cacheKey}`, JSON.stringify(content), {
    expirationTtl: ttlSeconds
  });
}

export const onRequestPost = async (
  context: EventContext
): Promise<Response> => {
  const { request, env, waitUntil } = context;

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return noContent();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }

  if (!isGenerationRequest(body) || !body.kind) {
    return jsonResponse(400, { error: "invalid_generation_request" });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const rateCap = parseInt32(env.RATE_LIMIT_PER_HOUR, DEFAULTS.rateLimitPerHour);
  const allowed = await checkRateLimit(env, ip, rateCap);
  if (!allowed) return noContent();

  const dailyBudget = parseInt32(
    env.DAILY_TOKEN_BUDGET,
    DEFAULTS.dailyTokenBudget
  );
  const tokensSoFar = await readBudget(env);
  if (tokensSoFar >= dailyBudget) return noContent();

  const generationRequest = body as GenerationRequest;
  const cacheKey = await sha256Hex(cacheKeyFor(generationRequest));

  const cached = await readCache(env, cacheKey);
  if (cached !== null) {
    return jsonResponse(200, { kind: body.kind, result: cached });
  }

  const result = await callDeepSeek(generationRequest, {
    apiKey,
    model: env.DEEPSEEK_MODEL,
    baseUrl: env.DEEPSEEK_BASE_URL
  });

  if (!result) return noContent();

  const ttl = parseInt32(env.CACHE_TTL_SECONDS, DEFAULTS.cacheTtlSeconds);
  // KV writes don't have to block the response.
  waitUntil(writeCache(env, cacheKey, result.content, ttl));
  if (result.tokensUsed > 0) {
    waitUntil(incrementBudget(env, result.tokensUsed));
  }

  return jsonResponse(200, { kind: body.kind, result: result.content });
};
