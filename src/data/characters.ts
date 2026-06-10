import type { CharacterPair } from "../types";
import {
  characterPairs as canonicalPairs,
  defaultCharacterPair as canonicalDefault
} from "../../server/characterPairs";

// The server owns the canonical pair data (it builds LLM prompts from it and
// must not trust client copies). Re-export it here so both sides stay in sync.
export const characterPairs: CharacterPair[] = canonicalPairs;

export const defaultCharacterPair: CharacterPair = canonicalDefault;
