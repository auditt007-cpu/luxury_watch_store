"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";
import { readLikes } from "@/lib/wishlist";

export function ContactFloat() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { openWechat, openMatch, matchOpen, likesOpen } = useUI();
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const sync = () => setLikeCount(readLikes().length);
    sync();
    window.addEventListener("atelier-likes-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("atelier-likes-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (pathname?.startsWith("/admin") || matchOpen || likesOpen) return null;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={openMatch}
        className="quote-cta-pulse relative flex h-12 items-center gap-2 rounded-full border border-gold bg-gold px-4 text-sm text-ink shadow-gold"
      >
        {t("pickMatch")}
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] text-gold">
          {likeCount}
        </span>
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
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink px-4 text-sm text-gold"
      >
        {t("wechat")}
      </button>
    </div>
  );
}
