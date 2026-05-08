import { useState } from "react";
import { DebugView } from "./components/DebugView";
import { Home } from "./components/Home";
import { MissionMode } from "./components/MissionMode";
import { RoomMode } from "./components/RoomMode";
import { TinyStoryMode } from "./components/TinyStoryMode";
import type { Mode } from "./types";

function App() {
  const [isDebug] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      new URLSearchParams(window.location.search).get("debug") === "events"
    );
  });
  const [mode, setMode] = useState<Mode>("home");

  if (isDebug) {
    return (
      <div className="soft-noise min-h-screen text-ink">
        <DebugView />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink">
      {mode === "home" ? <Home onSelectMode={setMode} /> : null}
      {mode === "room" ? <RoomMode onOff={() => setMode("home")} /> : null}
      {mode === "story" ? (
        <TinyStoryMode onBack={() => setMode("home")} />
      ) : null}
      {mode === "mission" ? (
        <MissionMode onBack={() => setMode("home")} />
      ) : null}
    </div>
  );
}

export default App;
