"use client";

import { usePathname } from "next/navigation";

const wa = process.env.NEXT_PUBLIC_WHATSAPP || "";
const wechat = process.env.NEXT_PUBLIC_WECHAT || "";

export function ContactFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const waHref = wa ? `https://wa.me/${wa.replace(/[^\d]/g, "")}` : "https://wa.me/";

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3">
      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-ink px-4 text-sm text-gold shadow-gold"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          if (wechat) {
            await navigator.clipboard.writeText(wechat);
            alert(`微信号已复制：${wechat}`);
          } else {
            alert("请在 .env 中配置 NEXT_PUBLIC_WECHAT");
          }
        }}
        className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-gold px-4 text-sm text-ink"
      >
        微信咨询
      </button>
    </div>
  );
}
