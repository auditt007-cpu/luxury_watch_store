import { MAJOR_CATEGORIES } from "./category";

export const CATEGORIES = MAJOR_CATEGORIES;

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
