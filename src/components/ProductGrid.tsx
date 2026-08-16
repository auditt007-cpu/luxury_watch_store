import Link from "next/link";
import { coverOf, formatPrice, type ProductDTO } from "@/lib/product";

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  if (!products.length) {
    return (
      <div className="mx-auto max-w-7xl px-5 pb-24 text-center text-zinc-500">
        暂无商品。请先运行 <code className="text-gold">python scraper.py</code>，再执行{" "}
        <code className="text-gold">npm run db:seed</code>。
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="luxury-card group overflow-hidden rounded-2xl transition duration-300"
        >
          <div className="aspect-[4/5] overflow-hidden bg-black">
            <img
              src={coverOf(product.images)}
              alt={product.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
          <div className="space-y-2 p-5">
            <p className="text-[11px] tracking-[0.25em] text-gold">{product.category}</p>
            <h3 className="line-clamp-2 font-serif text-lg text-gold-soft">{product.title}</h3>
            <p className="text-sm text-zinc-400">{formatPrice(product.price, product.priceText)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
