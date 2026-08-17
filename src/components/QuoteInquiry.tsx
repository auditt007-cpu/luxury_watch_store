"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { whatsappLink, buildQuoteMessage, buildQuoteUrl } from "@/lib/contact";
import { splitProductCopy } from "@/lib/formatText";
import { useI18n } from "@/lib/i18n";
import { coverOf, formatPrice, type ProductDTO } from "@/lib/product";
import { useUI } from "@/lib/ui";

export function QuoteInquiry({ products }: { products: ProductDTO[] }) {
  const { t } = useI18n();
  const { openWechat, showToast } = useUI();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const titles = products.map((item) => splitProductCopy(item.title, item.description).headline);
  const url = ready ? buildQuoteUrl(products.map((item) => item.id)) : "";
  const message = useMemo(
    () => (url ? buildQuoteMessage(t("quoteSharePrefix"), titles, url) : ""),
    [t, titles, url],
  );

  if (!products.length) {
    return <p className="mt-10 text-center text-sm text-zinc-500">{t("quoteEmpty")}</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-xs tracking-[0.35em] text-gold">QUOTE</p>
      <h1 className="font-serif text-3xl text-gold-soft">{t("quoteListTitle")}</h1>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-gold px-4 py-2 text-sm text-ink"
        >
          {t("shareListWA")}
        </a>
        <button
          type="button"
          className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
          onClick={async () => {
            await navigator.clipboard.writeText(message);
            showToast(t("copiedGeneric"));
            openWechat(message);
          }}
        >
          {t("shareListWechat")}
        </button>
      </div>
      <div className="space-y-4">
        {products.map((product) => {
          const { headline } = splitProductCopy(product.title, product.description);
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="flex gap-4 rounded-2xl border border-gold/20 p-3"
            >
              <img src={coverOf(product.images)} alt="" className="h-24 w-24 rounded-xl object-cover" />
              <div className="min-w-0">
                <h2 className="line-clamp-2 font-serif text-lg text-gold-soft">{headline}</h2>
                <p className="mt-2 text-sm text-gold">{formatPrice(product.price, product.priceText, t("inquire"))}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
