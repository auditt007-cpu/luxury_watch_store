"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/product";

export function FilterBar({ current, query }: { current: string; query: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    });
    router.push(`/?${sp.toString()}#collection`);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8">
      <div className="category-tabs -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-5 pb-1">
        {CATEGORIES.map((cat) => {
          const active = current === cat || (cat === "全部" && !current);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => update({ category: cat === "全部" ? "" : cat })}
              className={`snap-start whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-widest transition ${
                active
                  ? "border-gold bg-gold text-ink"
                  : "border-gold/25 text-gold-soft hover:border-gold/60"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <input
        defaultValue={query}
        placeholder="搜索型号 / 文案 / 工厂..."
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            update({ q: (event.target as HTMLInputElement).value.trim() });
          }
        }}
        className="w-full rounded-full border border-gold/25 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-gold"
      />
    </div>
  );
}
