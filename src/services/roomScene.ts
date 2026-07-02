import type { RoomConversation, RoomScene } from "../types";

// Read the room's character off the conversation's existing tags. Order
// matters: rain sets the mood over everything, then oddness, then domestic
// warmth; anything else is just a still room.
export function sceneForConversation(conversation: RoomConversation): RoomScene {
  const tags = conversation.tags;
  if (tags.includes("rain")) return "before-rain";
  if (tags.includes("weird") || tags.includes("absurd")) return "odd";
  if (tags.includes("domestic") || tags.includes("cozy")) return "kitchen";
  return "still";
}
