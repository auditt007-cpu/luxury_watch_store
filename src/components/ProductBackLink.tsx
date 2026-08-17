"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function ProductBackLink() {
  const params = useSearchParams();
  const { t } = useI18n();
  if (params.get("from") !== "match") return null;

  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/35 px-4 py-2 text-xs tracking-widest text-gold"
    >
      ← {t("backToMatch")}
    </Link>
  );
}
