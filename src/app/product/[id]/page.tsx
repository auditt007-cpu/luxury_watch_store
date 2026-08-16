import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Gallery } from "@/components/Gallery";
import { ProductDescription } from "@/components/ProductDescription";
import { formatPrice } from "@/lib/product";
import { getPublishedProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const dto = await getPublishedProduct(params.id);
  if (!dto) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-2">
        <Gallery images={dto.images} title={dto.title} />
        <div className="space-y-6">
          <p className="text-xs tracking-[0.3em] text-gold">{dto.category}</p>
          <h1 className="font-serif text-3xl text-gold-soft sm:text-4xl">{dto.title}</h1>
          <p className="text-2xl text-gold">{formatPrice(dto.price, dto.priceText)}</p>
          {dto.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dto.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-gold/20 px-3 py-1 text-xs text-gold-soft">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="gold-line h-px w-full" />
          <ProductDescription text={dto.description} />
        </div>
      </main>
    </>
  );
}
