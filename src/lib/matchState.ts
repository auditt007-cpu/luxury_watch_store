export type SavedMatchCard = {
  id: string;
  title: string;
  fullTitle: string;
  category: string;
  image: string;
  price: number;
  priceText: string;
  highlights: string[];
  displayPrice?: string;
};

export type MatchSession = {
  pool: SavedMatchCard[];
  deck: SavedMatchCard[];
  matchOpen: boolean;
  likesOpen: boolean;
};

const KEY = "atelier-match-session";

export function saveMatchSession(session: MatchSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function loadMatchSession(): MatchSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(KEY) || "null");
    return parsed && Array.isArray(parsed.deck) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearMatchSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
