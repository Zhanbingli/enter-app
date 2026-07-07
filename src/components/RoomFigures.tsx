import type { ReactNode } from "react";
import type { RoomTone } from "../types";

// Two suggested figures in the Room — soft head-and-shoulders shadows on the
// far wall, one on each side (matching the speakers' bubble sides). They're
// shapes, not portraits: you sense two people without their faces being fixed,
// the same reason the voices are a wordless murmur rather than speech. The one
// talking warms and leans in; the whole pair's posture shifts with the tone.

type Side = "left" | "right";
type ShapeKey = "round" | "bun" | "tall" | "crop";

// Four silhouette outlines, so different rooms hold visibly different people.
const SHAPES: Record<ShapeKey, ReactNode> = {
  round: (
    <>
      <circle cx="100" cy="66" r="40" />
      <path d="M28 320 C 30 210, 55 168, 100 158 C 145 168, 170 210, 172 320 Z" />
    </>
  ),
  bun: (
    <>
      <circle cx="100" cy="32" r="13" />
      <circle cx="100" cy="70" r="38" />
      <path d="M30 320 C 32 212, 56 170, 100 160 C 144 170, 168 212, 170 320 Z" />
    </>
  ),
  tall: (
    <>
      <ellipse cx="100" cy="58" rx="32" ry="43" />
      <path d="M38 320 C 40 222, 62 178, 100 170 C 138 178, 160 222, 162 320 Z" />
    </>
  ),
  crop: (
    <>
      <ellipse cx="100" cy="68" rx="43" ry="37" />
      <path d="M18 320 C 22 200, 52 162, 100 154 C 148 162, 178 200, 182 320 Z" />
    </>
  )
};

// Each pair gets two contrasting outlines, so its two people look different and
// the room's occupants change when the pair does.
const PAIR_SHAPES: Record<string, Record<Side, ShapeKey>> = {
  "kai-mina": { left: "round", right: "bun" },
  "jules-nori": { left: "tall", right: "crop" },
  "ada-sol": { left: "bun", right: "tall" }
};
const DEFAULT_SHAPES: Record<Side, ShapeKey> = { left: "round", right: "tall" };

function Silhouette({
  side,
  shape,
  active,
  tone
}: {
  side: Side;
  shape: ShapeKey;
  active: boolean;
  tone: RoomTone;
}) {
  return (
    <div
      className={`figure figure-${side}`}
      data-active={active}
      data-tone={tone}
      aria-hidden
    >
      <div className="figure-posture">
        <svg viewBox="0 0 200 320" preserveAspectRatio="xMidYMax meet">
          {SHAPES[shape]}
        </svg>
      </div>
    </div>
  );
}

export function RoomFigures({
  speaking,
  pairId,
  tone
}: {
  speaking: Side | null;
  pairId: string;
  tone: RoomTone;
}) {
  const shapes = PAIR_SHAPES[pairId] ?? DEFAULT_SHAPES;
  return (
    <div className="room-figures" aria-hidden>
      <Silhouette
        side="left"
        shape={shapes.left}
        active={speaking === "left"}
        tone={tone}
      />
      <Silhouette
        side="right"
        shape={shapes.right}
        active={speaking === "right"}
        tone={tone}
      />
    </div>
  );
}
