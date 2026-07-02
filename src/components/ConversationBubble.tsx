import type { ConversationLine } from "../types";

type ConversationBubbleProps = {
  line: ConversationLine;
  index: number;
  align: "left" | "right";
};

export function ConversationBubble({
  line,
  index,
  align
}: ConversationBubbleProps) {
  const isLeft = align === "left";

  return (
    <div
      className={`float-in flex ${isLeft ? "justify-start" : "justify-end"}`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className={`max-w-[88%] rounded-2xl border px-4 py-3 backdrop-blur-sm sm:max-w-[74%] ${
          isLeft
            ? "border-tide/25 bg-tide/[0.12]"
            : "border-clay/25 bg-clay/[0.12]"
        }`}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          {line.speaker}
        </div>
        <p className="text-[15px] leading-7 text-ink/85 sm:text-base">
          {line.text}
        </p>
      </div>
    </div>
  );
}
