export type Mode = "home" | "room" | "story" | "mission";

export type Character = {
  name: "Kai" | "Mina";
  personality: string;
};

export type CharacterPair = {
  id: string;
  characterA: Character;
  characterB: Character;
  relationship: string;
};

export type ConversationLine = {
  speaker: "Kai" | "Mina";
  text: string;
};

export type RoomConversation = {
  id: string;
  topic: string;
  texture: string;
  lines: ConversationLine[];
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
};

export type StupidMission = {
  id: string;
  mission: string;
  weirderMission: string;
  doneResponse: string;
};
