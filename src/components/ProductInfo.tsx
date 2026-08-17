"use client";

import { Suspense, useMemo, useState } from "react";
import { ProductDescription } from "@/components/ProductDescription";
import { ConfigPriceSelector } from "@/components/ConfigPriceSelector";
import { ProductBackLink } from "@/components/ProductBackLink";
import { resolveMajorCategory } from "@/lib/category";
import { splitProductCopy } from "@/lib/formatText";
import { useI18n } from "@/lib/i18n";
import { translateCategory } from "@/lib/messages";
import {
  parsePriceOptions,
  productHeadline,
  type PriceOption,
} from "@/lib/priceOptions";
import { type ProductDTO } from "@/lib/product";
import { whatsappLink } from "@/lib/contact";
import { useUI } from "@/lib/ui";

export function ProductInfo({ product }: { product: ProductDTO }) {
  const { locale, t } = useI18n();
  const { openWechat, showToast } = useUI();
  const major = resolveMajorCategory(product.category, product.title, product.description, product.tags);
  const headline = productHeadline(product.title);
  const { body } = splitProductCopy(product.title, product.description);

  const options = useMemo(
    () => parsePriceOptions(product.title, product.description, product.price, product.priceText),
    [product.description, product.price, product.priceText, product.title],
  );

  const [selected, setSelected] = useState<PriceOption | null>(options[0] || null);

  const inquiry = useMemo(() => {
    const configLine = selected?.label
      ? `\n配置：${selected.label}（${selected.priceText}）`
      : selected?.price
        ? `\n价格：${selected.priceText}`
        : "";
    return `${t("inquiryPrefix")}${headline}${configLine}`;
  }, [headline, selected, t]);

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <ProductBackLink />
      </Suspense>
      <p className="text-xs tracking-[0.3em] text-gold">{translateCategory(major, locale)}</p>
      <h1 className="whitespace-pre-wrap font-serif text-3xl text-gold-soft sm:text-4xl">{headline}</h1>
      <ConfigPriceSelector options={options} onChange={setSelected} />
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-gold/20 px-3 py-1 text-xs text-gold-soft">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <a
          href={whatsappLink(inquiry)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-gold px-5 py-2 text-sm text-ink"
        >
          {t("inquireWA")}
        </a>
        <button
          type="button"
          className="rounded-full border border-gold/35 px-5 py-2 text-sm text-gold"
          onClick={async () => {
            await navigator.clipboard.writeText(inquiry);
            showToast(t("copiedGeneric"));
            openWechat(inquiry);
          }}
        >
          {t("inquireWechat")}
        </button>
      </div>
      <div className="gold-line h-px w-full" />
      <ProductDescription text={body} />
    </div>
  );
}
