"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { displayPriceSummary } from "@/lib/priceOptions";
import { pendingFixReasons } from "@/lib/productQuality";
import { type ProductDTO } from "@/lib/product";

type ViewMode = "all" | "pending";

export default function AdminHomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("all");
  const [data, setData] = useState<{
    items: ProductDTO[];
    total: number;
    pages: number;
    pendingCount?: number;
  } | null>(null);
  const [quickEdits, setQuickEdits] = useState<Record<string, { title: string; priceText: string }>>({});

  const load = useCallback(
    async (nextPage = page, keyword = q, mode = view) => {
      const res = await fetch(
        `/api/admin/products?page=${nextPage}&q=${encodeURIComponent(keyword)}&pending=${mode === "pending" ? "1" : "0"}`,
      );
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      setData(json);
      setQuickEdits((prev) => {
        const next = { ...prev };
        for (const item of json.items as ProductDTO[]) {
          if (!next[item.id]) {
            next[item.id] = { title: item.title, priceText: item.priceText || "" };
          }
        }
        return next;
      });
    },
    [page, q, router, view],
  );

  useEffect(() => {
    load(1, q, view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  async function toggle(id: string, published: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    load();
  }

  async function quickSave(item: ProductDTO) {
    const draft = quickEdits[item.id];
    if (!draft) return;
    const res = await fetch(`/api/admin/products/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title.trim() || item.title,
        priceText: draft.priceText,
      }),
    });
    if (!res.ok) {
      alert("保存失败");
      return;
    }
    load();
  }

  const pendingCount = data?.pendingCount ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.4em] text-gold">DASHBOARD</p>
          <h1 className="mt-2 font-serif text-3xl text-gold-soft">商品管理</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="border border-gold/30 px-4 py-2 text-sm text-gold-soft">
            前台
          </Link>
          <Link href="/admin/products/new" className="bg-gold px-4 py-2 text-sm text-ink">
            新增商品
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            className="border border-gold/30 px-4 py-2 text-sm"
          >
            退出
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setView("all");
            setPage(1);
          }}
          className={`rounded-full px-4 py-2 text-sm ${view === "all" ? "bg-gold text-ink" : "border border-gold/30 text-gold-soft"}`}
        >
          全部商品
        </button>
        <button
          type="button"
          onClick={() => {
            setView("pending");
            setPage(1);
          }}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
            view === "pending" ? "bg-gold text-ink" : "border border-amber-400/50 text-amber-200"
          }`}
        >
          待补全资料
          {pendingCount > 0 ? (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              {pendingCount}
            </span>
          ) : null}
        </button>
      </div>

      {view === "pending" ? (
        <p className="mt-3 text-xs text-zinc-400">
          缺少价格 / 未命名 / 无描述 / 图片少于 2 张 — 快速填价或命名后保存，条目将自动移出此列表。
        </p>
      ) : null}

      <div className="mt-6 flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="关键词搜索"
          className="flex-1 border border-gold/25 bg-transparent px-4 py-2 outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            load(1, q, view);
          }}
          className="bg-gold px-5 text-ink"
        >
          搜索
        </button>
      </div>

      {view === "pending" ? (
        <div className="mt-6 space-y-3">
          {data?.items.map((item) => {
            const reasons = pendingFixReasons(item);
            const draft = quickEdits[item.id] || { title: item.title, priceText: item.priceText || "" };
            return (
              <div key={item.id} className="rounded-xl border border-gold/20 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <img
                    src={item.images[0] || "/placeholder-watch.svg"}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((reason) => (
                        <span key={reason} className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-200">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <div className="grid gap-2 lg:grid-cols-[1fr_180px_auto_auto]">
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setQuickEdits((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, title: e.target.value },
                          }))
                        }
                        placeholder="商品标题"
                        className="border border-gold/25 bg-transparent px-3 py-2 text-sm"
                      />
                      <input
                        value={draft.priceText}
                        onChange={(e) =>
                          setQuickEdits((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, priceText: e.target.value },
                          }))
                        }
                        placeholder="价格文案 如 1350/2800/4500"
                        className="border border-gold/25 bg-transparent px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => quickSave(item)}
                        className="rounded-full bg-gold px-4 py-2 text-xs text-ink"
                      >
                        快速保存
                      </button>
                      <Link href={`/admin/products/${item.id}`} className="rounded-full border border-gold/35 px-4 py-2 text-xs text-gold">
                        完整编辑
                      </Link>
                    </div>
                    <p className="text-xs text-gold-soft">
                      解析价：{displayPriceSummary(item.title, item.description, item.price, item.priceText)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {!data?.items.length ? <p className="py-10 text-center text-sm text-zinc-400">暂无待补全商品</p> : null}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border border-gold/20">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-gold">
              <tr>
                <th className="px-4 py-3">商品</th>
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">解析价格</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.id} className="border-t border-gold/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images[0] || "/placeholder-watch.svg"}
                        alt=""
                        className="h-12 w-12 object-cover"
                      />
                      <span className="line-clamp-2 max-w-md">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 text-gold-soft">
                    {displayPriceSummary(item.title, item.description, item.price, item.priceText)}
                  </td>
                  <td className="px-4 py-3">{item.published ? "上架" : "下架"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => toggle(item.id, item.published)}>
                        {item.published ? "下架" : "上架"}
                      </button>
                      <Link href={`/admin/products/${item.id}`} className="text-gold">
                        编辑
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
        <span>
          {view === "pending" ? "待补全" : "共"} {data?.total || 0} 件
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              load(next, q, view);
            }}
            className="border border-gold/20 px-3 py-1 disabled:opacity-30"
          >
            上一页
          </button>
          <span>
            {page} / {data?.pages || 1}
          </span>
          <button
            type="button"
            disabled={page >= (data?.pages || 1)}
            onClick={() => {
              const next = page + 1;
              setPage(next);
              load(next, q, view);
            }}
            className="border border-gold/20 px-3 py-1 disabled:opacity-30"
          >
            下一页
          </button>
        </div>
      </div>
    </main>
  );
}
