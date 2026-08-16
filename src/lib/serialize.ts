import type { Product } from "@prisma/client";
import { parseJsonArray, type ProductDTO } from "./product";

export function toDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    sourceId: product.sourceId,
    title: product.title,
    category: product.category,
    tags: parseJsonArray(product.tags),
    description: product.description,
    price: product.price,
    priceText: product.priceText,
    images: parseJsonArray(product.images),
    published: product.published,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
