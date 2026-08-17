"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { coverOf, formatPrice } from "@/lib/product";
import { whatsappLink } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { translateCategory } from "@/lib/messages";
import { useUI } from "@/lib/ui";
import { clearLikes, readLikes, removeLike, upsertLike, type LikedItem } from "@/lib/wishlist";

type MatchCard = {
  id: string;
  title: string;
  fullTitle: string;
  category: string;
  image: string;
  price: number;
  priceText: string;
  highlights: string[];
};

const GUIDE_KEY = "has_seen_swipe_guide";

function shuffle<T>(list: T[]) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function PickMatch() {
  const { locale, t } = useI18n();
  const { matchOpen, likesOpen, closeMatch, openLikes, closeLikes, openWechat, showToast } = useUI();
  const [pool, setPool] = useState<MatchCard[]>([]);
  const [deck, setDeck] = useState<MatchCard[]>([]);
  const [likes, setLikes] = useState<LikedItem[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const sync = () => setLikes(readLikes());
    sync();
    window.addEventListener("atelier-likes-changed", sync);
    return () => window.removeEventListener("atelier-likes-changed", sync);
  }, []);

  useEffect(() => {
    if (!matchOpen) return;
    const seen = window.localStorage.getItem(GUIDE_KEY) === "1";
    setShowGuide(!seen);
  }, [matchOpen]);

  useEffect(() => {
    if (!matchOpen || pool.length) return;
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((rows: MatchCard[]) => {
        const watches = rows.filter((item) => item.category === "腕表");
        setPool(watches);
        setDeck(shuffle(watches));
      })
      .catch(() => undefined);
  }, [matchOpen, pool.length]);

  const current = deck[0];
  const next = deck[1];

  const dismissGuide = useCallback(() => {
    window.localStorage.setItem(GUIDE_KEY, "1");
    setShowGuide(false);
  }, []);

  const restart = useCallback(() => {
    setDeck(shuffle(pool));
    setOffset({ x: 0, y: 0 });
  }, [pool]);

  const decide = useCallback(
    (liked: boolean) => {
      if (!current || showGuide) return;
      if (liked) {
        setLikes((list) =>
          upsertLike(
            {
              id: current.id,
              title: current.fullTitle || current.title,
              category: current.category,
              image: current.image || coverOf([]),
              priceText: formatPrice(current.price, current.priceText),
            },
            list,
          ),
        );
      }
      setOffset({ x: liked ? 480 : -480, y: 12 });
      window.setTimeout(() => {
        setDeck((rows) => rows.slice(1));
        setOffset({ x: 0, y: 0 });
      }, 180);
    },
    [current, showGuide],
  );

  function onPointerDown(event: React.PointerEvent) {
    if (showGuide) return;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    setDragging(true);
    start.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!dragging || showGuide) return;
    setOffset({
      x: event.clientX - start.current.x,
      y: event.clientY - start.current.y,
    });
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (offset.x > 90) decide(true);
    else if (offset.x < -90) decide(false);
    else setOffset({ x: 0, y: 0 });
  }

  const rotate = offset.x / 18;
  const likeOpacity = Math.min(1, Math.max(0, offset.x / 120));
  const skipOpacity = Math.min(1, Math.max(0, -offset.x / 120));

  const inquiry = useCallback(
    (title: string) => `${t("inquiryPrefix")}${title}`,
    [t],
  );

  const overlayOpen = matchOpen || likesOpen;
  const likesView = useMemo(() => likes, [likes]);

  if (!overlayOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-[radial-gradient(circle_at_top,#3a2f18_0%,#1c1812_42%,#12100d_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="relative mx-auto flex h-full max-w-xl flex-col px-5 py-5">
        <div className="swipe-toolbar flex items-center justify-between gap-3 rounded-2xl px-3 py-3">
          <div className="min-w-0">
            <p className="swipe-text-glow text-xs tracking-[0.3em] text-gold">{t("pickMatch")}</p>
            <p className="mt-1 text-xs text-white/80">{t("matchHint")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="swipe-toolbar-btn flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
              aria-label={t("helpGuide")}
              title={t("helpGuide")}
            >
              ?
            </button>
            <button type="button" onClick={restart} className="swipe-toolbar-btn rounded-full px-3 py-1.5 text-xs">
              {t("restart")}
            </button>
            <button type="button" onClick={openLikes} className="swipe-toolbar-btn rounded-full px-3 py-1.5 text-xs">
              ♥ {likes.length}
            </button>
            <button
              type="button"
              onClick={() => {
                if (likesOpen) closeLikes();
                else closeMatch();
              }}
              className="swipe-toolbar-btn rounded-full bg-gold/90 px-3 py-1.5 text-xs text-ink"
            >
              {t("close")}
            </button>
          </div>
        </div>

        {likesOpen ? (
          <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gold/40 bg-black/45 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <h2 className="swipe-text-glow font-serif text-2xl text-gold-soft">{t("likesTitle")}</h2>
              {likesView.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/50 bg-rose-500/15 px-3 py-1.5 text-xs text-rose-100"
                >
                  <span aria-hidden>🗑</span>
                  {t("clearAll")}
                </button>
              ) : null}
            </div>
            {confirmClear ? (
              <div className="mt-4 rounded-xl border border-gold/35 bg-black/60 p-4">
                <p className="text-sm leading-6 text-white">{t("clearConfirm")}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearLikes();
                      setLikes([]);
                      setConfirmClear(false);
                    }}
                    className="rounded-full bg-gold px-4 py-2 text-xs text-ink"
                  >
                    {t("confirmYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="rounded-full border border-white/30 px-4 py-2 text-xs text-white"
                  >
                    {t("confirmNo")}
                  </button>
                </div>
              </div>
            ) : null}
            {!likesView.length ? (
              <p className="mt-6 text-sm text-white/70">{t("noLikes")}</p>
            ) : (
              <div className="mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto">
                {likesView.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-gold/25 bg-black/35 p-3">
                    <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] tracking-[0.2em] text-gold">
                        {translateCategory(item.category, locale)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gold-soft">{item.priceText}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={whatsappLink(inquiry(item.title))}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-gold px-3 py-1 text-[11px] text-ink"
                        >
                          {t("inquireWA")}
                        </a>
                        <button
                          type="button"
                          className="rounded-full border border-gold/50 bg-black/40 px-3 py-1 text-[11px] text-gold"
                          onClick={async () => {
                            await navigator.clipboard.writeText(inquiry(item.title));
                            showToast(t("copiedGeneric"));
                            openWechat(inquiry(item.title));
                          }}
                        >
                          {t("inquireWechat")}
                        </button>
                        <Link
                          href={`/product/${item.id}`}
                          onClick={() => {
                            closeLikes();
                            closeMatch();
                          }}
                          className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white"
                        >
                          {t("viewProduct")}
                        </Link>
                        <button
                          type="button"
                          className="text-[11px] text-white/70"
                          onClick={() => setLikes((list) => removeLike(item.id, list))}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : current ? (
          <div className="relative mt-6 flex min-h-0 flex-1 items-center justify-center">
            {next ? (
              <article className="absolute w-full max-w-sm scale-95 rounded-3xl border border-gold/20 bg-[#2a2418] opacity-60">
                <img src={next.image} alt="" className="aspect-[4/5] w-full rounded-3xl object-cover" />
              </article>
            ) : null}
            <article
              className="relative w-full max-w-sm cursor-grab touch-none overflow-hidden rounded-3xl border-2 border-gold/55 bg-[#2a2418] shadow-gold active:cursor-grabbing"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate}deg)`,
                transition: dragging ? "none" : "transform 180ms ease",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <img src={current.image} alt={current.title} className="aspect-[4/5] w-full object-cover" />
              <div
                className="absolute left-4 top-4 rounded-full border-2 border-emerald-300 bg-black/70 px-3 py-1 text-xs font-semibold text-emerald-200"
                style={{ opacity: likeOpacity }}
              >
                {t("like")} ❤️
              </div>
              <div
                className="absolute right-4 top-4 rounded-full border-2 border-rose-300 bg-black/70 px-3 py-1 text-xs font-semibold text-white"
                style={{ opacity: skipOpacity }}
              >
                {t("skip")} ✕
              </div>
              <div className="absolute inset-x-0 bottom-0 flex max-h-[25%] items-end bg-gradient-to-t from-black via-black/80 to-transparent px-5 py-4">
                <h3 className="swipe-text-glow line-clamp-2 font-serif text-lg leading-snug text-white">
                  {current.title}
                </h3>
              </div>
            </article>

            {showGuide ? (
              <button
                type="button"
                className="absolute inset-0 z-10 flex flex-col items-center justify-end rounded-3xl bg-black/55 px-5 pb-8 backdrop-blur-[2px]"
                onClick={dismissGuide}
              >
                <div className="mb-auto mt-16 flex w-full max-w-xs justify-between px-2 text-3xl text-white">
                  <span className="swipe-hint-left drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">👈</span>
                  <span className="swipe-hint-right drop-shadow-[0_0_10px_rgba(201,162,39,0.9)]">👉</span>
                </div>
                <div className="w-full max-w-sm rounded-2xl border border-gold/50 bg-black/70 p-5 text-left shadow-gold">
                  <p className="swipe-text-glow text-sm leading-7 text-white">{t("guideRight")}</p>
                  <p className="swipe-text-glow mt-2 text-sm leading-7 text-white">{t("guideLeft")}</p>
                  <div className="mt-4 flex items-center justify-center gap-10 text-xs tracking-widest text-gold-soft">
                    <span>✕ {t("skipLabel")}</span>
                    <span>❤️ {t("likeLabel")}</span>
                  </div>
                  <span className="mt-5 flex w-full justify-center rounded-full bg-gold px-5 py-2.5 text-sm text-ink">
                    {t("startPick")}
                  </span>
                </div>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="swipe-text-glow font-serif text-2xl text-gold-soft">{t("deckEmpty")}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={restart} className="rounded-full bg-gold px-5 py-2 text-sm text-ink">
                {t("restart")}
              </button>
              <button type="button" onClick={openLikes} className="swipe-toolbar-btn rounded-full px-5 py-2 text-sm">
                {t("viewLikes")}
              </button>
            </div>
          </div>
        )}

        {!likesOpen && current ? (
          <div className="mt-5 flex items-end justify-center gap-10 pb-3">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => decide(false)}
                className="swipe-btn-skip swipe-icon-glow flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                aria-label={t("skip")}
              >
                ✕
              </button>
              <span className="swipe-text-glow text-[11px] tracking-widest text-white">{t("skipLabel")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => decide(true)}
                className="swipe-btn-like swipe-icon-glow flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-2xl"
                aria-label={t("like")}
              >
                ❤
              </button>
              <span className="swipe-text-glow text-[11px] tracking-widest text-gold">{t("likeLabel")}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
