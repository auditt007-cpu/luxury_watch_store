"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

function isWeChatBrowser() {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger/i.test(navigator.userAgent || "");
}

export function WeChatBrowserGuide() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isWeChatBrowser()) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[2px]">
      <div className="pointer-events-none absolute right-3 top-2 flex flex-col items-end">
        <div className="wechat-corner-arrow text-gold">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
            <path
              d="M18 54C28 40 40 28 58 18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M40 16h20v20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-1 rounded-full border border-gold/50 bg-black/70 px-3 py-1 text-[11px] tracking-widest text-gold">
          ···
        </p>
      </div>

      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-gold/45 bg-[#120f0c]/92 p-7 shadow-gold">
          <p className="text-xs tracking-[0.35em] text-gold">WECHAT</p>
          <p className="swipe-text-glow mt-4 text-sm leading-7 text-gold-soft">{t("wechatBrowserTip")}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-7 w-full rounded-full border border-gold/50 bg-gold px-5 py-3 text-sm text-ink"
          >
            {t("wechatBrowserContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}
