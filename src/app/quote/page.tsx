import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { QuoteInquiry } from "@/components/QuoteInquiry";
import { listPublishedByIds } from "@/lib/catalog";
import { splitProductCopy } from "@/lib/formatText";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseIds(raw?: string) {
  return (raw || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { ids?: string };
}): Promise<Metadata> {
  const products = await listPublishedByIds(parseIds(searchParams.ids));
  const titles = products.map((item) => splitProductCopy(item.title, item.description).headline);
  const brand = process.env.NEXT_PUBLIC_BRAND || "ATELIER HORLOGE";
  return {
    title: `${brand} · 询价单`,
    description: titles.slice(0, 6).join(" / ") || "专属询价单",
    openGraph: {
      title: `询价单 · ${products.length} 件心仪单品`,
      description: titles.slice(0, 6).join(" / "),
      images: products[0]?.images?.[0] ? [products[0].images[0]] : undefined,
    },
  };
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const products = await listPublishedByIds(parseIds(searchParams.ids));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <QuoteInquiry products={products} />
      </main>
    </>
  );
}
