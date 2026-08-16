"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, type ProductDTO } from "@/lib/product";

export default function AdminHomePage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: ProductDTO[]; total: number; pages: number } | null>(
    null,
  );

  async function load(nextPage = page, keyword = q) {
    const res = await fetch(`/api/admin/products?page=${nextPage}&q=${encodeURIComponent(keyword)}`);
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    setData(await res.json());
  }

  useEffect(() => {
    load(1, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(id: string, published: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    load();
  }

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

      <div className="mt-8 flex gap-3">
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
            load(1, q);
          }}
          className="bg-gold px-5 text-ink"
        >
          搜索
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-gold/20">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/5 text-gold">
            <tr>
              <th className="px-4 py-3">商品</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">价格</th>
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
                <td className="px-4 py-3">{formatPrice(item.price, item.priceText)}</td>
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

      <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
        <span>共 {data?.total || 0} 件</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1;
              setPage(next);
              load(next);
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
              load(next);
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
