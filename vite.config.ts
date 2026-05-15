import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { callDeepSeek, isGenerationRequest } from "./server/generation";

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

          const apiKey = env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY;
          if (!apiKey) {
            sendJson(response, 204, {});
            return;
          }

          const result = await callDeepSeek(body, {
            apiKey,
            model: env.DEEPSEEK_MODEL ?? process.env.DEEPSEEK_MODEL,
            baseUrl: env.DEEPSEEK_BASE_URL ?? process.env.DEEPSEEK_BASE_URL
          });

          if (!result) {
            sendJson(response, 204, {});
            return;
          }

          sendJson(response, 200, { kind: body.kind, result: result.content });
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
