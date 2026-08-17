"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";

const brand = process.env.NEXT_PUBLIC_BRAND || "ATELIER HORLOGE";

export function Header() {
  const { locale, setLocale, t } = useI18n();
  const { openMatch, openLikes } = useUI();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4">
        <Link href="/" className="font-serif text-lg tracking-[0.22em] text-gold sm:text-xl sm:tracking-[0.28em]">
          {brand}
        </Link>
        <nav className="flex items-center gap-3 text-[10px] tracking-[0.16em] text-gold-soft/80 sm:gap-5 sm:text-xs sm:tracking-[0.2em]">
          <Link href="/#collection" className="hidden sm:inline">
            {t("collection")}
          </Link>
          <button type="button" onClick={openMatch} className="text-gold">
            {t("pickMatch")}
          </button>
          <button type="button" onClick={openLikes} className="text-gold" aria-label={t("likesTitle")}>
            ♥
          </button>
          <div className="flex overflow-hidden rounded-full border border-gold/30">
            <button
              type="button"
              onClick={() => setLocale("zh")}
              className={`px-2.5 py-1 ${locale === "zh" ? "bg-gold text-ink" : "text-gold-soft"}`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 ${locale === "en" ? "bg-gold text-ink" : "text-gold-soft"}`}
            >
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
