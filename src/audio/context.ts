// Singleton AudioContext shared across the app.
//
// iOS Safari only allows audio playback when an AudioContext is *created* or
// *resumed* synchronously inside a user-gesture event handler. By the time
// React renders Room and runs its useEffect, that gesture is gone — so we
// have to unlock the context inside the click handler that picks a mode.
//
// Keeping one shared context also avoids the per-Room-visit create/close
// churn the old code did, and respects the browser's small cap on
// concurrent AudioContexts.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

// Call from inside a click/touch handler. Idempotent — safe to call on every
// gesture.
export async function unlockAudio(): Promise<void> {
  const c = getAudioContext();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      // resume() can throw if the context was closed; ignore.
    }
  }
}
