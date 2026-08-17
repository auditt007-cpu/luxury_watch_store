import { NextResponse } from "next/server";
import { listPublishedProducts } from "@/lib/catalog";
import { coverOf } from "@/lib/product";
import { splitProductCopy } from "@/lib/formatText";
import { resolveMajorCategory } from "@/lib/category";
import { displayPriceSummary, productHeadline } from "@/lib/priceOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const products = await listPublishedProducts("", "腕表");
  const slim = products
    .map((item) => {
      const copy = splitProductCopy(item.title, item.description);
      const category = resolveMajorCategory(item.category, item.title, item.description, item.tags);
      const headline = productHeadline(item.title);
      return {
        id: item.id,
        title: headline,
        fullTitle: item.title,
        category,
        image: coverOf(item.images),
        price: item.price,
        priceText: item.priceText,
        displayPrice: displayPriceSummary(
          item.title,
          item.description,
          item.price,
          item.priceText,
          "询价",
        ),
        highlights: copy.highlights,
      };
    })
    .filter((item) => item.category === "腕表");
  return NextResponse.json(slim);
}
