"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";

export function ContactFloat() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { openWechat, openMatch, matchOpen, likesOpen } = useUI();
  if (pathname?.startsWith("/admin") || matchOpen || likesOpen) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3">
      <button
        type="button"
        onClick={openMatch}
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink px-4 text-sm text-gold shadow-gold"
      >
        {t("pickMatch")}
      </button>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink px-4 text-sm text-gold shadow-gold"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => openWechat()}
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-gold px-4 text-sm text-ink"
      >
        {t("wechat")}
      </button>
    </div>
  );
}
