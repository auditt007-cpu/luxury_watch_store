"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type ProductDTO } from "@/lib/product";

export default function ProductEditor({
  params,
}: {
  params: { id?: string };
}) {
  const router = useRouter();
  const isNew = !params.id;
  const [loading, setLoading] = useState(!isNew);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("其他");
  const [price, setPrice] = useState("0");
  const [priceText, setPriceText] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json();
      })
      .then((item: ProductDTO) => {
        setTitle(item.title);
        setCategory(item.category);
        setPrice(String(item.price || 0));
        setPriceText(item.priceText || "");
        setDescription(item.description);
        setPublished(item.published);
        setImages(item.images);
      })
      .finally(() => setLoading(false));
  }, [isNew, params.id]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData();
    form.set("title", title);
    form.set("category", category);
    form.set("price", price);
    form.set("priceText", priceText);
    form.set("description", description);
    form.set("published", published ? "1" : "0");
    form.set("existingImages", JSON.stringify(images));
    if (files) {
      Array.from(files).forEach((file) => form.append("files", file));
    }

    const url = isNew ? "/api/admin/products" : `/api/admin/products/${params.id}`;
    const res = await fetch(url, { method: isNew ? "POST" : "PUT", body: form });
    if (!res.ok) {
      alert("保存失败");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  if (loading) return <p className="px-5 py-10 text-zinc-400">加载中...</p>;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-serif text-3xl text-gold-soft">{isNew ? "新增商品" : "编辑商品"}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block space-y-2 text-sm">
          标题
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gold/25 bg-transparent px-3 py-2"
          />
        </label>
        <label className="block space-y-2 text-sm">
          分类
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gold/25 bg-ink px-3 py-2"
          >
            {CATEGORIES.filter((c) => c !== "全部").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm">
            价格数字
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gold/25 bg-transparent px-3 py-2"
            />
          </label>
          <label className="block space-y-2 text-sm">
            价格文案
            <input
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              className="w-full border border-gold/25 bg-transparent px-3 py-2"
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm">
          描述（支持换行，Clean厂/VS厂参数会自动排版）
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={12}
            className="w-full border border-gold/25 bg-transparent px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          上架
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((src) => (
              <div key={src} className="relative">
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 bg-black/70 px-2 text-xs"
                  onClick={() => setImages(images.filter((img) => img !== src))}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="block space-y-2 text-sm">
          追加图片（本地存储）
          <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
        </label>
        <button type="submit" className="bg-gold px-6 py-3 text-ink">
          保存
        </button>
      </form>
    </main>
  );
}
