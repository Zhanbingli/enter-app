# Mood Room

A quiet place to land for five minutes, for bored, lonely, or tired moments.

→ Live: **<https://mood-room.pages.dev>**

> Open this when you are bored, lonely, or tired, but do not want to scroll
> short videos or force yourself to socialize.

It is not a learning app, not a productivity tool, not a chatbot, not a short
video feed, and not a social network. It is closer to a quiet switch you can
flip on for five minutes.

## What it is

The home screen asks one question:

> What kind of boredom is this?

You pick a state. There are three modes on the surface, and a hidden fourth.

### Room

Passive companionship. Two fictional characters talk nearby and you overhear
them. There is no input box. No chatbot loop. No prompts asking for your
participation.

- Three character pairs: Kai/Mina, Jules/Nori, Ada/Sol
- The first line waits ~3.5 seconds so the room exists before the
  conversation starts
- Lines drip in slowly, with longer gaps between conversations
- Stream rolls over: only the most recent six lines stay on screen, older
  lines fade upward
- Tone and topic pool are biased by local hour and the current time band
  (late night → quieter, morning → cozy, evening → domestic)
- Tap `quieter` or `weirder` at the bottom to nudge the vibe; the room
  smoothly transitions
- Procedural ambient bed: two filtered sines plus pink noise + fridge hum,
  with a slow LFO so the room breathes. Sparse stereo-panned textures
  (kettle, keyboard clicks, paper rustle, cup placement, floor creaks)
  arrive on a tone-aware schedule
- Master gain and inter-texture gap scale by time band — deep-night is
  60% gain and 1.6× gap; dawn is brighter; afternoon is full

### Tiny Story

A short, weird, low-pressure interactive story. Each step has 2–3 plain
choices. Most stories take 1–3 minutes. There are 17 hand-written stories,
each with several endings.

- Lora serif typography to feel more like a paperback than a UI
- Endings get a 28px hairline that fades in 4 seconds after the closing
  italic line lands — a visual full-stop
- After an ending, `another` is hidden for 6 seconds so the closing line
  gets its silent moment. `off` stays clickable

### Stupid Mission

A tiny, real-world, deliberately useless mission for the room you are
already in. Examples:

- Find the saddest object in your room.
- Pretend a clock is your assistant scheduling something nonsense.
- Decide what genre your room is.

There is no streak, no points, no review screen. Just a mission and an
`another` button.

### A fourth room

There is one more mode. It does not appear in the grid. After a few
real sessions it shows up as a single line below the cards, italicized,
no fanfare. Try the app for a while.

## The opening seconds

Home is not a menu. It's a room you're already in.

About 5 seconds after the page lands, a single italic line of dialogue
fades in at the bottom — a stranger you have not met saying something
about a window or a spoon. It holds, fades, comes back ~18 seconds later.

When you click `the room feels too quiet`, you enter the room of the
same pair you were overhearing. Continuity, not menu navigation.

## Atmosphere details

Things most apps do not bother with. Listed here because cumulatively
they are the product.

- **Time-of-day awareness across the whole app.** A 7-band classification
  (`deep-night / dawn / morning / afternoon / dusk / evening / late`) keys
  off the local hour and is exposed as `<html data-band>`. The Home opener
  phrase rotates by band ("still up." / "before the kettle." / "the room
  has settled."), Home's background subtly tints by band, and the audio
  bed scales gain and texture frequency by band.
- **Returning-visitor opener.** The app remembers when you last opened it.
  Within an hour it says nothing. Same day → "back already." Few days →
  "back." Weeks → "two weeks, easy." Long time → "look who's back."
  Priority chain on Home: special moment > returning > band.
- **Time-moment easter eggs.** 11:11 → "11:11, somewhere." The minute
  around midnight → "tomorrow, almost." Friday evening → "it's friday,
  somewhere." Sunday afternoon → "the long sunday."
- **Cinematic mode swap.** Mode transitions use the View Transitions API:
  the outgoing room fades and scales 0.985, the incoming room fades up
  from 1.015. Feels like stepping through a doorway. Graceful-degrades
  on older browsers and `prefers-reduced-motion`.
- **Tactile click feedback.** Three click voices via the singleton
  AudioContext: `tap` (1.1kHz triangle pulse, mode card / story choice),
  `off` (420Hz sine, lamp-click for every exit), `toggle` (760Hz, room
  tone changes). Plus a 5–8ms `navigator.vibrate` on supported devices.
  Silent under reduced-motion or before the AudioContext is unlocked.
- **iOS audio unlock.** Singleton AudioContext resumed inside the
  ModeCard click handler — fixes iOS Safari's autoplay policy killing
  Room audio.
- **First-paint fix.** Inline critical CSS so the very first frame is
  the paper color, not the default white flash before the bundle loads.

## What this app deliberately does not have

- A chat input
- An infinite feed
- Likes, comments, sharing
- Profiles or accounts
- Streaks, points, levels, progress trees
- Any kind of onboarding flow

The whole product surface is a switch, not a platform.

## Stack

- React 19 + TypeScript, code-split per mode via `React.lazy`
- Vite 6
- Tailwind CSS 3
- Web Audio API for the procedural ambient bed + click feedback
- Cloudflare Pages + Pages Function for production hosting and the
  `/api/generate` endpoint (optional DeepSeek-backed generation)
- localStorage-backed event log + a hidden debug view
- PWA: manifest, PNG + SVG icons, service worker with cache-first static
  + network-first navigation

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

## Deploy (Cloudflare Pages)

The live site runs on Cloudflare Pages. The Pages Function at
`functions/api/generate.ts` handles AI generation with KV-backed daily
token budget, per-IP rate limit, and short-TTL response cache.

```bash
npm install -D wrangler

# one-time setup
npx wrangler login
npx wrangler kv namespace create MOOD_KV   # paste the id into wrangler.toml
npx wrangler pages project create mood-room --production-branch main

# (optional) enable AI generation by setting the secret
npx wrangler pages secret put DEEPSEEK_API_KEY --project-name mood-room

# deploy
npm run build
npx wrangler pages deploy dist --project-name mood-room --branch main
```

The product works without `DEEPSEEK_API_KEY` — the function returns 204
and the frontend silently uses the local content pool. AI is a bonus,
not a dependency.

## Optional AI generation

By default the app runs entirely on local content and needs no API key.
Generation can be turned on for richer Room conversations, Story branches,
and Missions.

For local dev:

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

- The browser never sees `DEEPSEEK_API_KEY`. In dev it is read only by the
  Vite middleware; in production it is a Pages secret read only by the
  Function.
- The frontend always calls `/api/generate`. The server side
  (dev middleware or Pages Function) forwards to DeepSeek using
  `response_format: { type: "json_object" }`.
- If generation is disabled, fails, times out, or returns malformed JSON,
  the app silently falls back to the local content pool. Failure is
  invisible to the user.
- The Pages Function adds a daily token budget circuit breaker
  (default 800K tokens / UTC day), a per-IP hourly rate limit
  (default 60/hour), and a short-TTL response cache (default 15 min)
  so identical requests share one upstream call.

The shared prompt + DeepSeek wiring lives in `server/generation.ts`.
Defaults like `DAILY_TOKEN_BUDGET`, `RATE_LIMIT_PER_HOUR`, and
`CACHE_TTL_SECONDS` are configured in `wrangler.toml`.

## Hidden debug view

Append `?debug=events` to the URL:

<https://mood-room.pages.dev/?debug=events>

Shows:

- Total event counts by type
- Per-mode session aggregates: enters, sessions closed, total ms, average ms
- Generation stats: total attempts, success count, average latency
- A reverse-chronological log of recent events

The log is stored in `localStorage` (`mood-room.events`, capped at 500
entries). Tracked events include `mode_enter` / `mode_leave`,
`room_tone_change`, `room_auto_advance`, `story_choice`, `story_ending`,
`another_tap`, and `generation_attempt`.

## PWA

A manifest plus PNG and SVG icons make the app installable.

- Chrome / Edge mobile shows an "install" prompt
- iOS Safari: Share → Add to Home Screen, opens in standalone, no URL bar
- Service worker is cache-first for static assets and network-first for
  navigations, with the full app shell precached so it works offline

## Keyboard

`Esc` exits any mode back to Home. Same click voice as the `off` button.

## Reduced motion

If the operating system sets `prefers-reduced-motion: reduce`:

- Enter animations and CSS transitions are disabled
- View Transitions API is bypassed
- Click audio + haptic feedback is suppressed
- The drifting Home eavesdrop is not rendered at all (drifting text is
  exactly the kind of background motion the setting is meant to disable)

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.ts            # dev /api/generate middleware
├── wrangler.toml             # Cloudflare Pages config + KV binding
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.example
├── .dev.vars.example         # for `wrangler pages dev`
├── server
│   └── generation.ts         # shared DeepSeek prompts + API call
├── functions
│   └── api
│       └── generate.ts       # production Pages Function
├── public
│   ├── manifest.webmanifest
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── og.png
│   ├── og.svg
│   └── sw.js
└── src
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── audio
    │   ├── context.ts        # singleton AudioContext + iOS unlock
    │   ├── feedback.ts       # click voices (tap / off / toggle)
    │   └── textures.ts       # procedural Room sound textures
    ├── components
    │   ├── Home.tsx
    │   ├── ModeCard.tsx
    │   ├── RoomMode.tsx
    │   ├── TinyStoryMode.tsx
    │   ├── MissionMode.tsx
    │   ├── RainMode.tsx      # the hidden fourth
    │   ├── ConversationBubble.tsx
    │   ├── PrimaryButton.tsx
    │   ├── SecondaryButton.tsx
    │   └── DebugView.tsx
    ├── data
    │   ├── characters.ts
    │   ├── roomConversations.ts
    │   ├── tinyStories.ts
    │   ├── stupidMissions.ts
    │   └── rainConversations.ts
    ├── hooks
    │   ├── useAmbientSound.ts
    │   ├── useRainBed.ts
    │   ├── useRoomStream.ts
    │   ├── useEavesdrop.ts   # Home's overheard-dialogue layer
    │   └── useEscape.ts
    ├── services
    │   ├── generationClient.ts
    │   ├── analytics.ts
    │   ├── lastSeen.ts
    │   ├── sessions.ts       # session counter (unlocks Rain)
    │   ├── timeBand.ts       # 7-band classification + openers
    │   ├── moments.ts        # 11:11, midnight, Friday, Sunday
    │   ├── visitor.ts        # last-visit / returning phrases
    │   └── eavesdrop.ts      # Home→Room pair handoff
    └── utils
        └── random.ts
```

## Content data

All hand-written content lives in `src/data`:

- `characters.ts` — character pairs and relationship hints used by Room
- `roomConversations.ts` — overheard dialogue, tagged for tone selection
- `tinyStories.ts` — micro-stories with branching choices and endings
- `stupidMissions.ts` — playful single-line real-world missions
- `rainConversations.ts` — rin and hal sharing a window

Room conversations carry tags from this set:

- `quiet`, `weird`, `cozy`, `domestic`, `night`, `rain`, `object-drama`,
  `absurd`

The `quiet` and `weird` tags also act as the two non-default tones the user
can request. Other tags are used by the time-of-day biasing logic. The
Home eavesdrop layer biases toward `weird` / `absurd` / `object-drama` so
overheard lines are striking enough to stand alone without context.

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
(`server/generation.ts` → `baseInstructions`).

## Scripts

```bash
npm run dev        # start the local dev server (with /api/generate middleware)
npm run build      # tsc --noEmit && vite build
npm run preview    # preview the production build
```
