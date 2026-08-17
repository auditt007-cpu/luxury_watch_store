import fs from "node:fs";
import path from "node:path";
import { ROOT, loadEnv } from "./env.mjs";

loadEnv(ROOT);
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const BAD_URL =
  "https://pub-cad15ae40e5a4a548f582819ed9c99a8.r2.dev/uploads/goods/_dm6qfBKYCNlAeWYS4Txmm7cNzKeX4gFxtypjIsg/02.png";
const BAD_FRAGMENT = "_dm6qfBKYCNlAeWYS4Txmm7cNzKeX4gFxtypjIsg/02.png";

function containsBad(value) {
  return typeof value === "string" && (value.includes(BAD_URL) || value.includes(BAD_FRAGMENT));
}

function stripText(value) {
  if (typeof value !== "string" || !value) return value;
  return value.split(BAD_URL).join("").split(BAD_FRAGMENT).join("").trim();
}

function cleanProduct(item) {
  let changed = false;

  if (Array.isArray(item.images)) {
    const next = item.images.filter((src) => !containsBad(String(src)));
    if (next.length !== item.images.length) {
      item.images = next;
      changed = true;
    }
  }

  for (const field of ["title", "description", "content"]) {
    if (containsBad(item[field])) {
      item[field] = stripText(item[field]);
      changed = true;
    }
  }

  return changed;
}

async function syncDatabase(products) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    let updated = 0;
    for (const item of products) {
      const sourceId = String(item.id);
      const row = await prisma.product.findUnique({ where: { sourceId } });
      if (!row) continue;
      await prisma.product.update({
        where: { sourceId },
        data: {
          title: item.title || row.title,
          description: item.description || "",
          images: JSON.stringify(item.images || []),
        },
      });
      updated += 1;
    }
    console.log(`数据库已更新 ${updated} 件商品`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const jsonPath = path.join(ROOT, "data", "products.json");
  if (!fs.existsSync(jsonPath)) {
    console.warn("未找到 data/products.json");
    return;
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  let changedProducts = 0;
  let removedImages = 0;

  for (const item of products) {
    const before = Array.isArray(item.images) ? item.images.length : 0;
    if (cleanProduct(item)) changedProducts += 1;
    const after = Array.isArray(item.images) ? item.images.length : 0;
    removedImages += Math.max(0, before - after);
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify(products, null, 2)}\n`, "utf8");
  console.log(`已清洗 ${changedProducts} 件商品，移除 ${removedImages} 张冗余图片`);

  try {
    await syncDatabase(products);
  } catch (error) {
    console.warn("数据库同步跳过：", error.message || error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
