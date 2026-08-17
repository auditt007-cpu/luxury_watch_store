"use client";

import { WECHAT_ID } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { useUI } from "@/lib/ui";

export function WeChatModal() {
  const { t } = useI18n();
  const { wechatOpen, wechatNote, closeWechat, showToast } = useUI();
  if (!wechatOpen) return null;

  async function copyId() {
    await navigator.clipboard.writeText(WECHAT_ID);
    showToast(t("copied"));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-5">
      <button type="button" className="absolute inset-0 bg-black/75" onClick={closeWechat} aria-label={t("close")} />
      <div className="relative w-full max-w-md rounded-2xl border border-gold/40 bg-ink p-7 shadow-gold">
        <p className="text-xs tracking-[0.35em] text-gold">{t("wechat")}</p>
        <h2 className="mt-4 font-serif text-2xl text-gold-soft">
          {t("wechatIdLabel")}：{WECHAT_ID}
        </h2>
        {wechatNote ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">{wechatNote}</p>
        ) : null}
        <p className="mt-5 text-sm leading-7 text-zinc-300">{t("wechatGuide")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={copyId}
            className="flex-1 rounded-full bg-gold px-5 py-3 text-sm text-ink"
          >
            {t("copyWechat")}
          </button>
          <button
            type="button"
            onClick={closeWechat}
            className="flex-1 rounded-full border border-gold/35 px-5 py-3 text-sm text-gold"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useUI();
  if (!toast) return null;
  return (
    <div className="fixed bottom-8 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-gold/40 bg-ink px-5 py-2 text-sm text-gold shadow-gold">
      {toast}
    </div>
  );
}
