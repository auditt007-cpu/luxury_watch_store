export const CATEGORIES = [
  "全部",
  "劳力士",
  "水鬼",
  "迪通拿",
  "爱彼",
  "百达翡丽",
  "欧米茄",
  "卡地亚",
  "浪琴",
  "其他",
] as const;

export type ProductDTO = {
  id: string;
  sourceId: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  price: number;
  priceText: string;
  images: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function formatPrice(price: number, priceText?: string) {
  if (priceText && /[¥$€]|万/.test(priceText)) return priceText;
  if (!price) return "询价";
  return `¥ ${price.toLocaleString("zh-CN")}`;
}

export function coverOf(images: string[]) {
  return images[0] || "/placeholder-watch.svg";
}
