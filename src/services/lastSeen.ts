type LastSeenKind = "roomPair" | "story" | "mission";

const STORAGE_KEY = "mood-room.lastSeen";

type Store = Partial<Record<LastSeenKind, string>>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage might be disabled or quota exceeded
  }
}

export function getLastSeen(kind: LastSeenKind): string | undefined {
  return read()[kind];
}

export function setLastSeen(kind: LastSeenKind, id: string) {
  const store = read();
  if (store[kind] === id) return;
  store[kind] = id;
  write(store);
}
