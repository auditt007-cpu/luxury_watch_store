import { ROOT, loadEnv } from "./env.mjs";
import fs from "node:fs";
import path from "node:path";

loadEnv(ROOT);
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");

function rewrite(value) {
  if (typeof value !== "string" || !value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (!publicBase) return value;
  if (value.startsWith("/uploads/")) return `${publicBase}${value}`;
  if (value.startsWith("uploads/")) return `${publicBase}/${value}`;
  return value;
}

async function main() {
  const jsonPath = path.join(ROOT, "data", "products.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn("未找到 data/products.json，跳过同步");
    return;
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let jsonChanged = 0;
  for (const item of products) {
    if (!Array.isArray(item.images)) continue;
    const next = item.images.map(rewrite);
    if (JSON.stringify(next) !== JSON.stringify(item.images)) {
      item.images = next;
      jsonChanged += 1;
    }
  }
  if (jsonChanged) {
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  }
  console.log(`products.json 已同步 ${jsonChanged} 件商品图片路径`);

  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      let upserts = 0;
      for (const item of products) {
        const sourceId = String(item.id);
        await prisma.product.upsert({
          where: { sourceId },
          create: {
            sourceId,
            title: item.title || "未命名商品",
            category: item.category || "其他",
            tags: JSON.stringify(item.tags || []),
            description: item.description || "",
            price: Number(item.price || 0),
            priceText: item.priceText || "",
            images: JSON.stringify((item.images || []).map(rewrite)),
            published: true,
          },
          update: {
            title: item.title || "未命名商品",
            category: item.category || "其他",
            tags: JSON.stringify(item.tags || []),
            description: item.description || "",
            price: Number(item.price || 0),
            priceText: item.priceText || "",
            images: JSON.stringify((item.images || []).map(rewrite)),
          },
        });
        upserts += 1;
      }
      console.log(`数据库已填充 / 更新 ${upserts} 件商品`);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.warn("数据库同步跳过（构建仍可使用 products.json）：", error.message || error);
  }
}

main().catch((error) => {
  console.warn("sync-r2-urls 非致命错误：", error.message || error);
});
