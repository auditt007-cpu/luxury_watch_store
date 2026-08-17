import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Gallery } from "@/components/Gallery";
import { ProductInfo } from "@/components/ProductInfo";
import { ProductMatchSwipe } from "@/components/ProductMatchSwipe";
import { getPublishedProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const dto = await getPublishedProduct(params.id);
  if (!dto) notFound();

  return (
    <>
      <Header />
      <ProductMatchSwipe productId={dto.id}>
        <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-2">
          <Gallery images={dto.images} title={dto.title} />
          <ProductInfo product={dto} />
        </main>
      </ProductMatchSwipe>
    </>
  );
}
