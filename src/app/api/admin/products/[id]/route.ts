import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toDTO } from "@/lib/serialize";
import { parseExistingImages, saveUploads } from "@/lib/upload";

export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(toDTO(product));
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json();
  const product = await prisma.product.update({
    where: { id: params.id },
    data: { published: Boolean(body.published) },
  });
  return NextResponse.json(toDTO(product));
}

export async function PUT(request: Request, { params }: Ctx) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const form = await request.formData();
  const uploaded = await saveUploads(existing.sourceId, form);
  const images = [...parseExistingImages(form), ...uploaded];
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: String(form.get("title") || existing.title),
      category: String(form.get("category") || existing.category),
      description: String(form.get("description") || ""),
      price: Number(form.get("price") || 0),
      priceText: String(form.get("priceText") || ""),
      published: String(form.get("published")) === "1",
      images: JSON.stringify(images),
    },
  });
  return NextResponse.json(toDTO(product));
}
