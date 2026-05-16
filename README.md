# Mood Room

A quiet place to land for five minutes, for bored, lonely, or tired moments.

> Open this when you are bored, lonely, or tired, but do not want to scroll
> short videos or force yourself to socialize.

It is not a learning app, not a productivity tool, not a chatbot, not a short
video feed, and not a social network. It is closer to a quiet switch you can
flip on for five minutes.

## What it is

The home screen asks one question:

> What kind of boredom is this?

You pick a state. There are three modes.

### Room

Passive companionship. Two fictional characters talk nearby and you overhear
them. There is no input box. No chatbot loop. No prompts asking for your
participation.

- Three character pairs: Kai/Mina, Jules/Nori, Ada/Sol
- Lines drip in slowly, with longer gaps between conversations
- Stream rolls over: only the most recent six lines stay on screen, older
  lines fade upward
- Initial tone and topic pool are biased by local hour (late night → quieter,
  morning → cozy, evening → domestic)
- Tap `quieter` or `weirder` at the bottom to nudge the vibe; the room
  smoothly transitions
- Soft ambient bed: two filtered sines plus pink noise, with a slow LFO so it
  breathes. Auto-starts when you enter Room

### Tiny Story

A short, weird, low-pressure interactive story. Each step has 2–3 plain
choices. Most stories take 1–3 minutes. There are 17 hand-written stories,
each with several endings.

- Lora serif typography to feel more like a paperback than a UI
- The story ends quietly with an italicized closing line, separated by a hair
  rule. No achievement, no celebration

### Stupid Mission

A tiny, real-world, deliberately useless mission for the room you are
already in. Examples:

- Find the saddest object in your room.
- Pretend a clock is your assistant scheduling something nonsense.
- Decide what genre your room is.

There is no streak, no points, no review screen. Just a mission and an
`another` button.

## What this app deliberately does not have

- A chat input
- An infinite feed
- Likes, comments, sharing
- Profiles or accounts
- Streaks, points, levels, progress trees
- Any kind of onboarding flow

The whole product surface is a switch, not a platform.

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 3
- Local content data with optional DeepSeek-backed generation
- Web Audio API for the ambient sound bed
- localStorage-backed event log + a hidden debug view
- Minimal PWA (manifest, SVG icon, pass-through service worker)

## Run locally

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173/>.

## Build

```bash
npm run build      # tsc --noEmit && vite build
npm run preview    # serve the production build
```

## Optional AI generation

By default the app runs entirely on local content and needs no API key.
Generation can be turned on for richer Room conversations, Story branches,
and Missions.

```bash
cp .env.example .env
```

Then fill in:

```bash
DEEPSEEK_API_KEY=your_key_here
DEEPSEEK_MODEL=deepseek-chat
VITE_USE_AI_GENERATION=true
```

How it works:

- The browser never sees `DEEPSEEK_API_KEY`. It is read only by the Vite
  middleware in `vite.config.ts`.
- The frontend always calls a local `/api/generate` endpoint. The middleware
  forwards to `https://api.deepseek.com/chat/completions` using
  `response_format: { type: "json_object" }`.
- If generation is disabled, fails, times out, or returns malformed JSON, the
  app silently falls back to the local content pool. Failure is invisible to
  the user.
- The default model is `deepseek-chat`. `deepseek-reasoner` works but tends
  to over-think playful content and is slower and more expensive.
- An optional `DEEPSEEK_BASE_URL` env var can point at any
  OpenAI-protocol-compatible proxy or self-hosted endpoint.

> Vite reads `.env` only at process start. After editing `.env`, restart
> `npm run dev` and hard-reload the browser tab so the new
> `VITE_USE_AI_GENERATION` value gets baked into the client bundle.

For production deployment the dev middleware needs to be moved to a real
backend or a serverless function. Never expose the model API key in the
client bundle.

## Hidden debug view

Append `?debug=events` to the URL:

<http://127.0.0.1:5173/?debug=events>

Shows:

- Total event counts by type
- Per-mode session aggregates: enters, sessions closed, total ms, average ms
- Generation stats: total attempts, success count, average latency
- A reverse-chronological log of recent events

The log is stored in `localStorage` (`mood-room.events`, capped at 500
entries). Tracked events include `mode_enter` / `mode_leave`,
`room_tone_change`, `room_auto_advance`, `story_choice`, `story_ending`,
`another_tap`, and `generation_attempt`. Useful for figuring out which mode
is actually held the longest before swapping in real analytics.

## PWA

A minimal manifest plus a small SVG icon make the app installable.

- Chrome / Edge mobile shows an "install" prompt
- iOS Safari: Share → Add to Home Screen, opens in standalone, no URL bar
- The current service worker is a no-op pass-through (it exists so the app
  meets installability criteria; offline strategy can be layered on later)

A real PNG icon set is still TODO; the SVG is fine on Chrome/Edge but iOS
sometimes falls back to a generic glyph.

## Keyboard

`Esc` exits any mode back to Home.

## Reduced motion

If the operating system sets `prefers-reduced-motion: reduce`, all enter
animations and CSS transitions are disabled.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.ts            # also hosts the dev /api/generate middleware
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.example
├── public
│   ├── manifest.webmanifest
│   ├── icon.svg
│   └── sw.js
└── src
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── components
    │   ├── Home.tsx
    │   ├── ModeCard.tsx
    │   ├── RoomMode.tsx
    │   ├── TinyStoryMode.tsx
    │   ├── MissionMode.tsx
    │   ├── ConversationBubble.tsx
    │   ├── PrimaryButton.tsx
    │   ├── SecondaryButton.tsx
    │   └── DebugView.tsx
    ├── data
    │   ├── characters.ts
    │   ├── roomConversations.ts
    │   ├── tinyStories.ts
    │   └── stupidMissions.ts
    ├── hooks
    │   ├── useAmbientSound.ts
    │   └── useEscape.ts
    ├── services
    │   ├── generationClient.ts
    │   └── analytics.ts
    └── utils
        └── random.ts
```

## Content data

All hand-written content lives in `src/data`:

- `characters.ts` — character pairs and relationship hints used by Room
- `roomConversations.ts` — overheard dialogue, tagged for tone selection
- `tinyStories.ts` — micro-stories with branching choices and endings
- `stupidMissions.ts` — playful single-line real-world missions

Room conversations carry tags from this set:

- `quiet`, `weird`, `cozy`, `domestic`, `night`, `rain`, `object-drama`,
  `absurd`

The `quiet` and `weird` tags also act as the two non-default tones the user
can request. Other tags are used by the time-of-day biasing logic.

## Writing rules

Content (hand-written and generated) should follow these principles:

- Characters never say "as an AI"
- No therapy, no life lessons, no advice, no self-improvement framing
- Not a podcast host voice, not a content creator voice
- Room mode never asks the user to participate or react
- Tone: like overhearing two relaxed people talk nearby
- Warm, domestic, gently funny, low pressure
- Strange but not childish
- Concise. A single funny line is better than a paragraph

These rules are encoded in the system prompt for the DeepSeek path
(`vite.config.ts` → `baseInstructions`).

## Scripts

```bash
npm run dev        # start the local dev server (with /api/generate middleware)
npm run build      # tsc --noEmit && vite build
npm run preview    # preview the production build
```
