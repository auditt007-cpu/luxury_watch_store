import fs from "node:fs";
import path from "node:path";
import { ROOT, loadEnv, requireEnv } from "./env.mjs";

loadEnv(ROOT);
requireEnv(["R2_PUBLIC_URL", "DATABASE_URL"]);

const publicBase = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");

function rewrite(value) {
  if (typeof value !== "string" || !value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads/")) return `${publicBase}${value}`;
  if (value.startsWith("uploads/")) return `${publicBase}/${value}`;
  return value;
}

function rewriteList(list) {
  return list.map(rewrite);
}

async function main() {
  const jsonPath = path.join(ROOT, "data", "products.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error("未找到 data/products.json");
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let jsonChanged = 0;
  for (const item of products) {
    if (!Array.isArray(item.images)) continue;
    const next = rewriteList(item.images);
    if (JSON.stringify(next) !== JSON.stringify(item.images)) {
      item.images = next;
      jsonChanged += 1;
    }
  }
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  console.log(`products.json 已更新 ${jsonChanged} 件商品`);

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.product.findMany();
    let dbChanged = 0;
    for (const row of rows) {
      let images = [];
      try {
        images = JSON.parse(row.images || "[]");
      } catch {
        images = [];
      }
      const next = rewriteList(Array.isArray(images) ? images : []);
      if (JSON.stringify(next) === JSON.stringify(images)) continue;
      await prisma.product.update({
        where: { id: row.id },
        data: { images: JSON.stringify(next) },
      });
      dbChanged += 1;
    }
    console.log(`数据库已更新 ${dbChanged} 件商品`);
    console.log(`CDN 前缀: ${publicBase}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
