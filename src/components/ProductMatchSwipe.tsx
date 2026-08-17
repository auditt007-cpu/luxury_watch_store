"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { advanceMatchDeck, getCurrentMatchCard } from "@/lib/matchActions";
import { useI18n } from "@/lib/i18n";

function ProductMatchSwipeInner({
  productId,
  children,
}: {
  productId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const fromMatch = params.get("from") === "match";
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const pointerActive = useRef(false);
  const enabled = fromMatch && Boolean(getCurrentMatchCard(productId));

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setLeaving(false);
  }, [productId]);

  const finish = useCallback(
    (liked: boolean) => {
      if (!enabled || leaving) return;
      setLeaving(true);
      setOffset({ x: liked ? 520 : -520, y: 16 });
      window.setTimeout(() => {
        const { nextId, deckEmpty } = advanceMatchDeck(productId, liked);
        if (nextId) {
          router.replace(`/product/${nextId}?from=match`);
          return;
        }
        if (deckEmpty) router.push("/");
      }, 220);
    },
    [enabled, leaving, productId, router],
  );

  function onPointerDown(event: React.PointerEvent) {
    if (!enabled || leaving) return;
    if ((event.target as HTMLElement).closest("a,button,input,textarea,select,label")) return;
    pointerActive.current = true;
    start.current = { x: event.clientX, y: event.clientY };
    setDragging(true);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!pointerActive.current || !dragging || leaving) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    if (Math.abs(dx) < Math.abs(dy) * 0.8) return;
    setOffset({ x: dx, y: dy * 0.2 });
  }

  function onPointerUp() {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    setDragging(false);
    if (leaving) return;
    if (offset.x > 90) finish(true);
    else if (offset.x < -90) finish(false);
    else setOffset({ x: 0, y: 0 });
  }

  if (!enabled) return <>{children}</>;

  const rotate = offset.x / 24;
  const likeOpacity = Math.min(1, Math.max(0, offset.x / 120));
  const skipOpacity = Math.min(1, Math.max(0, -offset.x / 120));

  return (
    <div
      className="relative touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="relative will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotate}deg)`,
          transition: dragging || leaving ? "none" : "transform 180ms ease",
        }}
      >
        {children}
      </div>
      <div
        className="pointer-events-none absolute left-6 top-24 rounded-full border-2 border-emerald-300 bg-black/70 px-4 py-2 text-sm font-semibold text-emerald-200"
        style={{ opacity: likeOpacity }}
      >
        {t("like")} ❤️
      </div>
      <div
        className="pointer-events-none absolute right-6 top-24 rounded-full border-2 border-rose-300 bg-black/70 px-4 py-2 text-sm font-semibold text-white"
        style={{ opacity: skipOpacity }}
      >
        {t("skip")} ✕
      </div>
      <p className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-gold/30 bg-black/70 px-4 py-1.5 text-[11px] tracking-widest text-gold-soft backdrop-blur-sm">
        {t("matchHint")}
      </p>
    </div>
  );
}

export function ProductMatchSwipe({
  productId,
  children,
}: {
  productId: string;
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={children}>
      <ProductMatchSwipeInner productId={productId}>{children}</ProductMatchSwipeInner>
    </Suspense>
  );
}
