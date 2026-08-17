"use client";

import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";

export function QuoteBanner() {
  const { t } = useI18n();
  const { openMatch } = useUI();

  return (
    <section className="px-5 pt-4 sm:pt-6">
      <button
        type="button"
        onClick={openMatch}
        className="quote-banner relative mx-auto flex w-full max-w-7xl flex-col items-start overflow-hidden rounded-2xl px-5 py-6 text-left sm:px-8 sm:py-8"
      >
        <p className="text-[10px] tracking-[0.35em] text-gold sm:text-xs">{t("pickMatchEn")}</p>
        <h2 className="swipe-text-glow mt-2 font-serif text-2xl leading-tight text-gold-soft sm:text-4xl">
          {t("quoteBannerTitle")}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">{t("quoteBannerSub")}</p>
        <span className="quote-cta-pulse mt-5 inline-flex items-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink">
          {t("quoteBannerCta")} →
        </span>
      </button>
    </section>
  );
}
