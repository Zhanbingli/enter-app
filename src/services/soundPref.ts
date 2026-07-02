// Whether ambient sound should play, remembered across visits. Sound is on
// by default; a user who mutes once stays muted until they turn it back on.
const KEY = "mood:sound";

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Private mode / storage disabled — the in-memory toggle still works for
    // this session.
  }
}
