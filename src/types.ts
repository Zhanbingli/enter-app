export type Mode = "home" | "room" | "story" | "mission" | "rain";

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

// A sound a line can summon into the room as it lands. Foley cues fire a
// one-shot texture; "rain" fades a rain bed (and the visual rain layer) in
// under the ambient pad, so the talk and the room share one world.
export type LineCue = "kettle" | "cup" | "keyboard" | "creak" | "paper" | "rain";

export type ConversationLine = {
  speaker: string;
  text: string;
  cue?: LineCue;
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

// The kind of place a conversation happens in. Derived from its tags rather
// than hand-labelled, so the sound bed can take on the room's character
// (a warm kitchen, the hush before rain, something slightly off) without
// every conversation needing new metadata.
export type RoomScene = "kitchen" | "before-rain" | "odd" | "still";

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
