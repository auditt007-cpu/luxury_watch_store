export type LikedItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  priceText: string;
};

const KEY = "atelier-likes";

export function readLikes(): LikedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLikes(items: LikedItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("atelier-likes-changed"));
}

export function clearLikes() {
  writeLikes([]);
}

export function upsertLike(item: LikedItem, list: LikedItem[]) {
  if (list.some((row) => row.id === item.id)) return list;
  const next = [item, ...list];
  writeLikes(next);
  return next;
}

export function removeLike(id: string, list: LikedItem[]) {
  const next = list.filter((row) => row.id !== id);
  writeLikes(next);
  return next;
}
