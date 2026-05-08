# Mood Room MVP

A React + TypeScript + Tailwind MVP for mood-based AI entertainment in bored, lonely, or tired moments.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Optional AI generation

The app works with local fallback content by default. To try real generation in local dev:

```bash
cp .env.example .env
```

Then set:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-nano
VITE_USE_AI_GENERATION=true
```

The browser never receives `OPENAI_API_KEY`. Vite serves a local `/api/generate` endpoint during development, and the frontend falls back to local data if generation is disabled or unavailable.

## Build

```bash
npm run build
```
