// Two suggested figures in the Room — soft head-and-shoulders shadows on the
// far wall, one on each side (matching the speakers' bubble sides). They're
// shapes, not portraits: you sense two people without their faces being fixed,
// the same reason the voices are a wordless murmur rather than speech. The one
// currently talking warms, leans in and breathes a little faster.

type Side = "left" | "right";

function Silhouette({ side, active }: { side: Side; active: boolean }) {
  return (
    <div className={`figure figure-${side}`} data-active={active} aria-hidden>
      <svg viewBox="0 0 200 320" preserveAspectRatio="xMidYMax meet">
        <circle cx="100" cy="66" r="40" />
        <path d="M28 320 C 30 210, 55 168, 100 158 C 145 168, 170 210, 172 320 Z" />
      </svg>
    </div>
  );
}

export function RoomFigures({ speaking }: { speaking: Side | null }) {
  return (
    <div className="room-figures" aria-hidden>
      <Silhouette side="left" active={speaking === "left"} />
      <Silhouette side="right" active={speaking === "right"} />
    </div>
  );
}
