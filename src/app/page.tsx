import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { QuoteBanner } from "@/components/QuoteBanner";
import { FilterBar } from "@/components/FilterBar";
import { ProductGrid } from "@/components/ProductGrid";
import { listPublishedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const category = searchParams.category?.trim() || "";
  const products = await listPublishedProducts(q, category);

  return (
    <>
      <Header />
      <Hero />
      <QuoteBanner />
      <main id="collection">
        <Suspense>
          <FilterBar current={category} query={q} />
        </Suspense>
        <ProductGrid products={products} />
      </main>
    </>
  );
}
