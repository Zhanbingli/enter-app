export type Mode = "home" | "room" | "story" | "mission";

export type Character = {
  name: string;
  personality: string;
};

export type CharacterPair = {
  id: string;
  characterA: Character;
  characterB: Character;
  relationship: string;
};

export type ConversationLine = {
  speaker: string;
  text: string;
};

export type RoomTone = "regular" | "quiet" | "weird";

export type RoomTopicTag =
  | "quiet"
  | "weird"
  | "cozy"
  | "domestic"
  | "night"
  | "rain"
  | "object-drama"
  | "absurd";

export type RoomConversation = {
  id: string;
  pairId: string;
  topic: string;
  texture: string;
  tags: RoomTopicTag[];
  lines: ConversationLine[];
  source?: "local" | "generated";
};

export type StoryChoice = {
  label: string;
  nextStepId: string;
};

export type StoryStep = {
  id: string;
  text: string;
  choices?: StoryChoice[];
  ending?: string;
};

export type TinyStory = {
  id: string;
  title: string;
  scenario: string;
  startStepId: string;
  steps: StoryStep[];
  source?: "local" | "generated";
};

export type StupidMission = {
  id: string;
  mission: string;
  source?: "local" | "generated";
};
