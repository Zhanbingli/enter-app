// Canonical character pair data, owned by the server.
// The /api/generate prompt is built ONLY from this table — never from
// client-supplied character text — so a forged request body cannot inject
// prompt content or poison the response cache for other users.
// `src/data/characters.ts` re-exports this so the frontend stays in sync.

export type ServerCharacter = {
  name: string;
  personality: string;
};

export type ServerCharacterPair = {
  id: string;
  characterA: ServerCharacter;
  characterB: ServerCharacter;
  relationship: string;
};

export const characterPairs: ServerCharacterPair[] = [
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

export function resolveCharacterPair(id: unknown): ServerCharacterPair {
  if (typeof id !== "string") return defaultCharacterPair;
  return characterPairs.find((pair) => pair.id === id) ?? defaultCharacterPair;
}
