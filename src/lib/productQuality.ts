import { displayPriceSummary } from "@/lib/priceOptions";
import type { ProductDTO } from "@/lib/product";

const PLACEHOLDER_TITLES = new Set(["", "未命名商品"]);

export function hasValidPrice(product: Pick<ProductDTO, "title" | "description" | "price" | "priceText">) {
  const summary = displayPriceSummary(product.title, product.description, product.price, product.priceText);
  return summary !== "询价";
}

export function hasValidTitle(product: Pick<ProductDTO, "id" | "sourceId" | "title">) {
  const title = product.title.trim();
  if (!title || PLACEHOLDER_TITLES.has(title)) return false;
  if (title === product.id || title === product.sourceId) return false;
  return true;
}

export function pendingFixReasons(product: ProductDTO) {
  const reasons: string[] = [];
  if (!hasValidPrice(product)) reasons.push("缺少价格");
  if (!hasValidTitle(product)) reasons.push("未命名");
  if (!product.description.trim()) reasons.push("缺少描述");
  if (product.images.length < 2) reasons.push("图片不足");
  return reasons;
}

export function isPendingFix(product: ProductDTO) {
  return pendingFixReasons(product).length > 0;
}
