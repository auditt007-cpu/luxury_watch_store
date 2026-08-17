import { coverOf } from "@/lib/product";
import { loadMatchSession, saveMatchSession, type SavedMatchCard } from "@/lib/matchState";
import { readLikes, upsertLike } from "@/lib/wishlist";

export function getCurrentMatchCard(productId: string): SavedMatchCard | null {
  const session = loadMatchSession();
  if (!session?.matchOpen || !session.deck.length) return null;
  const head = session.deck[0];
  return head.id === productId ? head : null;
}

export function advanceMatchDeck(productId: string, liked: boolean) {
  const session = loadMatchSession();
  if (!session?.matchOpen || session.deck[0]?.id !== productId) {
    return { nextId: null as string | null, deckEmpty: true };
  }

  const current = session.deck[0];
  if (liked) {
    upsertLike(
      {
        id: current.id,
        title: current.fullTitle || current.title,
        category: current.category,
        image: current.image || coverOf([]),
        priceText: current.displayPrice || current.priceText || "询价",
      },
      readLikes(),
    );
  }

  const deck = session.deck.slice(1);
  saveMatchSession({ ...session, deck, likesOpen: false });
  return { nextId: deck[0]?.id || null, deckEmpty: deck.length === 0 };
}
