"use client";

import Link from "next/link";
import { resolveMajorCategory } from "@/lib/category";
import { splitProductCopy } from "@/lib/formatText";
import { useI18n } from "@/lib/i18n";
import { translateCategory } from "@/lib/messages";
import { coverOf, type ProductDTO } from "@/lib/product";
import { displayPriceSummary } from "@/lib/priceOptions";

export function ProductGrid({ products }: { products: ProductDTO[] }) {
  const { locale, t } = useI18n();

  if (!products.length) {
    return (
      <div className="mx-auto max-w-7xl px-5 pb-24 text-center text-zinc-500">{t("empty")}</div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 pb-24 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const major = resolveMajorCategory(product.category, product.title, product.description, product.tags);
        const { headline } = splitProductCopy(product.title, product.description);
        return (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="luxury-card group overflow-hidden rounded-2xl transition duration-300"
          >
            <div className="aspect-[4/5] overflow-hidden bg-black">
              <img
                src={coverOf(product.images)}
                alt={headline}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="space-y-2 p-5">
              <p className="text-[11px] tracking-[0.25em] text-gold">{translateCategory(major, locale)}</p>
              <h3 className="line-clamp-2 whitespace-pre-wrap font-serif text-lg text-gold-soft">{headline}</h3>
              <p className="text-sm text-zinc-400">
                {displayPriceSummary(
                  product.title,
                  product.description,
                  product.price,
                  product.priceText,
                  t("inquire"),
                )}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
