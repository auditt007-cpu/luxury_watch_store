"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useI18n } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <Header />
      <div className="px-5 py-24 text-center">
        <p className="font-serif text-4xl text-gold">404</p>
        <p className="mt-3 text-zinc-400">{t("notFound")}</p>
        <Link href="/" className="mt-8 inline-block border border-gold px-6 py-2 text-sm text-gold">
          {t("back")}
        </Link>
      </div>
    </>
  );
}
