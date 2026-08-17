import fs from "node:fs";
import path from "node:path";
import { matchesMajorCategory } from "./category";
import { toDTO } from "./serialize";
import type { ProductDTO } from "./product";

type ScrapedProduct = {
  id: string;
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  price?: number;
  priceText?: string;
  images?: string[];
};

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function withCdn(images: string[]) {
  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
  return images.map((src) => {
    if (!src || src.startsWith("http://") || src.startsWith("https://")) return src;
    if (base && src.startsWith("/uploads/")) return `${base}${src}`;
    if (base && src.startsWith("uploads/")) return `${base}/${src}`;
    return src;
  });
}

export function productsFromJson(): ProductDTO[] {
  const file = path.join(process.cwd(), "data", "products.json");
  if (!fs.existsSync(file)) return [];
  const items = JSON.parse(fs.readFileSync(file, "utf8")) as ScrapedProduct[];
  const now = new Date().toISOString();
  return items.map((item) => ({
    id: String(item.id),
    sourceId: String(item.id),
    title: item.title || "未命名商品",
    category: item.category || "其他",
    tags: item.tags || [],
    description: item.description || "",
    price: Number(item.price || 0),
    priceText: item.priceText || "",
    images: withCdn(item.images || []),
    published: true,
    createdAt: now,
    updatedAt: now,
  }));
}

function filterProducts(list: ProductDTO[], q: string, category: string) {
  const keyword = q.trim().toLowerCase();
  return list.filter((item) => {
    if (!matchesMajorCategory(category, item.category, item.title, item.description, item.tags)) {
      return false;
    }
    if (!keyword) return true;
    const blob = `${item.title} ${item.description} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
    return blob.includes(keyword);
  });
}

async function seedIfEmpty() {
  const { prisma } = await import("./prisma");
  const count = await prisma.product.count();
  if (count > 0) return;
  const items = productsFromJson();
  for (const item of items) {
    await prisma.product.upsert({
      where: { sourceId: item.sourceId },
      create: {
        sourceId: item.sourceId,
        title: item.title,
        category: item.category,
        tags: JSON.stringify(item.tags),
        description: item.description,
        price: item.price,
        priceText: item.priceText,
        images: JSON.stringify(item.images),
        published: true,
      },
      update: {},
    });
  }
}

export async function listPublishedProducts(q = "", category = ""): Promise<ProductDTO[]> {
  if (!isBuildPhase()) {
    try {
      await seedIfEmpty();
      const { prisma } = await import("./prisma");
      const rows = await prisma.product.findMany({
        where: {
          published: true,
          ...(q
            ? {
                OR: [
                  { title: { contains: q } },
                  { description: { contains: q } },
                  { category: { contains: q } },
                  { tags: { contains: q } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      if (rows.length) return filterProducts(rows.map(toDTO), q, category);
    } catch (error) {
      console.warn("SQLite unavailable, falling back to products.json", error);
    }
  }
  return filterProducts(productsFromJson(), q, category);
}

export async function getPublishedProduct(id: string): Promise<ProductDTO | null> {
  if (!isBuildPhase()) {
    try {
      await seedIfEmpty();
      const { prisma } = await import("./prisma");
      const row = await prisma.product.findFirst({
        where: { OR: [{ id }, { sourceId: id }], published: true },
      });
      if (row) return toDTO(row);
    } catch (error) {
      console.warn("SQLite unavailable, falling back to products.json", error);
    }
  }
  return (
    productsFromJson().find((item) => item.id === id || item.sourceId === id) || null
  );
}
