"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useI18n } from "@/lib/i18n";
import { loadMatchSession, saveMatchSession } from "@/lib/matchState";
import { useUI } from "@/lib/ui";

function MatchBackFabInner() {
  const pathname = usePathname();
  const params = useSearchParams();
  const { t } = useI18n();
  const { openMatch } = useUI();

  if (!pathname?.startsWith("/product/") || params.get("from") !== "match") return null;

  return (
    <Link
      href="/"
      onClick={() => {
        const session = loadMatchSession();
        if (session) saveMatchSession({ ...session, matchOpen: true, likesOpen: false });
        openMatch();
      }}
      className="match-back-fab fixed left-4 top-[4.5rem] z-[65] inline-flex items-center gap-2 rounded-full border border-gold/45 bg-black/80 px-4 py-2.5 text-xs tracking-[0.2em] text-gold shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-gold hover:bg-black/90"
    >
      <span aria-hidden>←</span>
      {t("backToMatch")}
    </Link>
  );
}

export function MatchBackFab() {
  return (
    <Suspense fallback={null}>
      <MatchBackFabInner />
    </Suspense>
  );
}
