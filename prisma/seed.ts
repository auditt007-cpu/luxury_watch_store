import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type ScrapedProduct = {
  id: string;
  title: string;
  category?: string;
  tags?: string[];
  description?: string;
  price?: number;
  priceText?: string;
  images?: string[];
};

async function main() {
  const file = path.join(process.cwd(), "data", "products.json");
  if (!fs.existsSync(file)) {
    console.log("未找到 data/products.json，跳过导入。请先运行 python scraper.py");
    return;
  }

  const raw = fs.readFileSync(file, "utf-8");
  const items = JSON.parse(raw) as ScrapedProduct[];
  if (!Array.isArray(items) || items.length === 0) {
    console.log("products.json 为空，未导入商品。");
    return;
  }

  let upserts = 0;
  for (const item of items) {
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
        images: JSON.stringify(item.images || []),
        published: true,
      },
      update: {
        title: item.title || "未命名商品",
        category: item.category || "其他",
        tags: JSON.stringify(item.tags || []),
        description: item.description || "",
        price: Number(item.price || 0),
        priceText: item.priceText || "",
        images: JSON.stringify(item.images || []),
      },
    });
    upserts += 1;
  }

  console.log(`已导入 / 更新 ${upserts} 件商品`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
