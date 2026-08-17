import { NextResponse } from "next/server";
import { listPublishedProducts } from "@/lib/catalog";
import { coverOf } from "@/lib/product";
import { splitProductCopy } from "@/lib/formatText";
import { resolveMajorCategory } from "@/lib/category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await listPublishedProducts();
  const slim = products.map((item) => {
    const copy = splitProductCopy(item.title, item.description);
    return {
      id: item.id,
      title: copy.headline,
      fullTitle: item.title,
      category: resolveMajorCategory(item.category, item.title, item.description, item.tags),
      image: coverOf(item.images),
      price: item.price,
      priceText: item.priceText,
      highlights: copy.highlights,
    };
  });
  return NextResponse.json(slim);
}
