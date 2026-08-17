"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { coverOf, formatPrice } from "@/lib/product";
import { whatsappLink } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { translateCategory } from "@/lib/messages";
import { useUI } from "@/lib/ui";
import { readLikes, removeLike, upsertLike, type LikedItem } from "@/lib/wishlist";

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
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setLikes(readLikes());
  }, []);

  useEffect(() => {
    if (!matchOpen || pool.length) return;
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((rows: MatchCard[]) => {
        setPool(rows);
        setDeck(shuffle(rows));
      })
      .catch(() => undefined);
  }, [matchOpen, pool.length]);

  const current = deck[0];
  const next = deck[1];

  const restart = useCallback(() => {
    setDeck(shuffle(pool));
    setOffset({ x: 0, y: 0 });
  }, [pool]);

  const decide = useCallback(
    (liked: boolean) => {
      if (!current) return;
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
    [current],
  );

  function onPointerDown(event: React.PointerEvent) {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    setDragging(true);
    start.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!dragging) return;
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
    <div className="fixed inset-0 z-[70] bg-black/88">
      <div className="mx-auto flex h-full max-w-xl flex-col px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.3em] text-gold">{t("pickMatch")}</p>
            <p className="mt-1 text-xs text-zinc-500">{t("matchHint")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openLikes}
              className="rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold"
            >
              {t("viewLikes")} · {likes.length}
            </button>
            <button
              type="button"
              onClick={() => {
                if (likesOpen) closeLikes();
                else closeMatch();
              }}
              className="rounded-full border border-gold/30 px-3 py-1.5 text-xs text-gold-soft"
            >
              {t("close")}
            </button>
          </div>
        </div>

        {likesOpen ? (
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gold/20 bg-ink/80 p-4">
            <h2 className="font-serif text-2xl text-gold-soft">{t("likesTitle")}</h2>
            {!likesView.length ? (
              <p className="mt-6 text-sm text-zinc-500">{t("noLikes")}</p>
            ) : (
              <div className="mt-5 space-y-4">
                {likesView.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-xl border border-gold/15 p-3">
                    <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] tracking-[0.2em] text-gold">
                        {translateCategory(item.category, locale)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-gold-soft">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.priceText}</p>
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
                          className="rounded-full border border-gold/30 px-3 py-1 text-[11px] text-gold"
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
                          className="rounded-full border border-gold/20 px-3 py-1 text-[11px] text-zinc-400"
                        >
                          {t("viewProduct")}
                        </Link>
                        <button
                          type="button"
                          className="text-[11px] text-zinc-600"
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
              <article className="absolute w-full max-w-sm scale-95 rounded-3xl border border-gold/10 bg-ink opacity-50">
                <img src={next.image} alt="" className="aspect-[4/5] w-full rounded-3xl object-cover" />
              </article>
            ) : null}
            <article
              className="relative w-full max-w-sm cursor-grab touch-none overflow-hidden rounded-3xl border border-gold/30 bg-ink shadow-gold active:cursor-grabbing"
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
              <div className="absolute left-4 top-4 rounded-full border border-rose-400/70 px-3 py-1 text-xs text-rose-300" style={{ opacity: likeOpacity }}>
                {t("like")} ❤️
              </div>
              <div className="absolute right-4 top-4 rounded-full border border-zinc-400/70 px-3 py-1 text-xs text-zinc-300" style={{ opacity: skipOpacity }}>
                {t("skip")} ✕
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-5">
                <p className="text-[11px] tracking-[0.25em] text-gold">
                  {translateCategory(current.category, locale)}
                </p>
                <h3 className="mt-2 font-serif text-xl text-gold-soft">{current.title}</h3>
                <p className="mt-1 text-sm text-gold">{formatPrice(current.price, current.priceText)}</p>
                {current.highlights.length > 0 && (
                  <div className="mt-3 space-y-1 whitespace-pre-wrap text-xs leading-5 text-zinc-400">
                    {current.highlights.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="font-serif text-2xl text-gold-soft">{t("deckEmpty")}</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={restart} className="rounded-full bg-gold px-5 py-2 text-sm text-ink">
                {t("restart")}
              </button>
              <button type="button" onClick={openLikes} className="rounded-full border border-gold/30 px-5 py-2 text-sm text-gold">
                {t("viewLikes")}
              </button>
            </div>
          </div>
        )}

        {!likesOpen && current ? (
          <div className="mt-5 flex items-center justify-center gap-6 pb-3">
            <button
              type="button"
              onClick={() => decide(false)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-500 text-xl text-zinc-300"
              aria-label={t("skip")}
            >
              ✕
            </button>
            <button
              type="button"
              onClick={() => decide(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-xl text-ink"
              aria-label={t("like")}
            >
              ❤
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
