import { lazy, Suspense, useCallback, useState } from "react";
import { DebugView } from "./components/DebugView";
import { Home } from "./components/Home";
import type { Mode } from "./types";

// document.startViewTransition is widely supported in 2026 (Chromium since
// 111, Safari since 18.2) but graceful-degrades to a plain state swap on
// older browsers and in reduced-motion mode.
type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

function withViewTransition(swap: () => void) {
  const doc = typeof document !== "undefined" ? document : null;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const vtDoc = doc as ViewTransitionDoc | null;
  if (!vtDoc?.startViewTransition || prefersReduced) {
    swap();
    return;
  }
  vtDoc.startViewTransition(swap);
}

const RoomMode = lazy(() =>
  import("./components/RoomMode").then((m) => ({ default: m.RoomMode }))
);
const TinyStoryMode = lazy(() =>
  import("./components/TinyStoryMode").then((m) => ({
    default: m.TinyStoryMode
  }))
);
const MissionMode = lazy(() =>
  import("./components/MissionMode").then((m) => ({ default: m.MissionMode }))
);
const RainMode = lazy(() =>
  import("./components/RainMode").then((m) => ({ default: m.RainMode }))
);

function App() {
  const [isDebug] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).get("debug") === "events"
    );
  });
  const [mode, setMode] = useState<Mode>("home");

  const navigate = useCallback((next: Mode) => {
    withViewTransition(() => setMode(next));
  }, []);

  if (isDebug) {
    return (
      <div className="soft-noise min-h-screen text-ink">
        <DebugView />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink">
      {mode === "home" ? <Home onSelectMode={navigate} /> : null}
      <Suspense fallback={<div className="min-h-screen" />}>
        {mode === "room" ? <RoomMode onOff={() => navigate("home")} /> : null}
        {mode === "story" ? (
          <TinyStoryMode onBack={() => navigate("home")} />
        ) : null}
        {mode === "mission" ? (
          <MissionMode onBack={() => navigate("home")} />
        ) : null}
        {mode === "rain" ? (
          <RainMode onBack={() => navigate("home")} />
        ) : null}
      </Suspense>
    </div>
  );
}

export default App;
