import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FilterBar } from "@/components/FilterBar";
import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";
import { toDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const category = searchParams.category?.trim() || "";

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category && category !== "全部" ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { category: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <Hero />
      <main id="collection">
        <Suspense>
          <FilterBar current={category} query={q} />
        </Suspense>
        <ProductGrid products={products.map(toDTO)} />
      </main>
    </>
  );
}
