import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPendingFix } from "@/lib/productQuality";
import { toDTO } from "@/lib/serialize";
import { parseExistingImages, saveUploads } from "@/lib/upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const pending = searchParams.get("pending") === "1";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const take = pending ? 20 : 12;

  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
        ],
      }
    : {};

  const rows = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
  const all = rows.map(toDTO);
  const pendingAll = all.filter(isPendingFix);
  const filtered = pending ? pendingAll : all;
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / take));
  const items = filtered.slice((page - 1) * take, page * take);

  return NextResponse.json({
    items,
    total,
    pages,
    pendingCount: pendingAll.length,
  });
}

export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const form = await request.formData();
  const sourceId = randomUUID();
  const images = [...parseExistingImages(form), ...(await saveUploads(sourceId, form))];
  const product = await prisma.product.create({
    data: {
      sourceId,
      title: String(form.get("title") || "未命名商品"),
      category: String(form.get("category") || "其他"),
      description: String(form.get("description") || ""),
      price: Number(form.get("price") || 0),
      priceText: String(form.get("priceText") || ""),
      published: String(form.get("published")) === "1",
      images: JSON.stringify(images),
      tags: "[]",
    },
  });
  return NextResponse.json(toDTO(product));
}
