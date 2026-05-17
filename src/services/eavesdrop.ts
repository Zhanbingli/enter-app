// Hand-off between Home's eavesdropping pair and Room's initial pair pick.
// When the user clicks into Room after overhearing kai/mina on Home, they
// should enter kai/mina's room — not a different pair. Stored in
// sessionStorage so it's per-tab and disappears on close.

const KEY = "mood-room.eavesdropPair";

export function setEavesdropPair(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, id);
  } catch {
    // sessionStorage may be unavailable in some embed contexts
  }
}

export function takeEavesdropPair(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(KEY);
    if (v) window.sessionStorage.removeItem(KEY);
    return v;
  } catch {
    return null;
  }
}
