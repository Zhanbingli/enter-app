import type { CharacterPair } from "../types";

export const characterPairs: CharacterPair[] = [
  {
    id: "kai-mina",
    characterA: {
      name: "Kai",
      personality:
        "Calm, dry humor, observes tiny details, lightly philosophical."
    },
    characterB: {
      name: "Mina",
      personality:
        "Expressive, playful, strange associations, gently teases Kai."
    },
    relationship:
      "Old friends and roommates. They talk naturally and are not performing for anyone."
  },
  {
    id: "jules-nori",
    characterA: {
      name: "Jules",
      personality:
        "Warm, practical, quietly amused, treats tiny domestic problems with ceremony."
    },
    characterB: {
      name: "Nori",
      personality:
        "Restless imagination, gentle nonsense, turns ordinary objects into suspects."
    },
    relationship:
      "Downstairs neighbors who often end up in the same kitchen conversation by accident."
  },
  {
    id: "ada-sol",
    characterA: {
      name: "Ada",
      personality:
        "Soft-spoken, observant, fond of overly specific descriptions and small rituals."
    },
    characterB: {
      name: "Sol",
      personality:
        "Bright, dry, lightly chaotic, makes odd conclusions sound almost reasonable."
    },
    relationship:
      "Longtime friends who share a quiet apartment and a talent for making nothing into something."
  }
];

export const defaultCharacterPair = characterPairs[0];
