"use client";

import { useMemo } from "react";
import {
  applyPriceTiersToDescription,
  displayPriceSummary,
  parsePriceOptions,
  serializePriceTiers,
  type PriceOption,
} from "@/lib/priceOptions";

type TierDraft = { label: string; price: string };

export function AdminPriceEditor({
  title,
  description,
  price,
  priceText,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onPriceTextChange,
}: {
  title: string;
  description: string;
  price: string;
  priceText: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onPriceTextChange: (value: string) => void;
}) {
  const parsed = useMemo(
    () => parsePriceOptions(title, description, Number(price) || 0, priceText),
    [description, price, priceText, title],
  );

  const preview = displayPriceSummary(title, description, Number(price) || 0, priceText);

  const tierDrafts: TierDraft[] = useMemo(() => {
    if (parsed.length) {
      return parsed.map((item) => ({ label: item.label, price: String(item.price) }));
    }
    return [{ label: "", price: price || "" }];
  }, [parsed, price]);

  function applyTiers(nextTiers: TierDraft[]) {
    const normalized = nextTiers
      .map((tier) => ({ label: tier.label.trim(), price: Number(tier.price) || 0 }))
      .filter((tier) => tier.price >= 100);

    if (!normalized.length) {
      onPriceChange("0");
      onPriceTextChange("");
      onDescriptionChange(applyPriceTiersToDescription(description, ""));
      return;
    }

    const serialized = serializePriceTiers(normalized);
    onPriceChange(String(serialized.price || normalized[0].price));
    onPriceTextChange(serialized.priceText);
    onDescriptionChange(applyPriceTiersToDescription(description, serialized.descriptionSuffix));
  }

  function updateTier(index: number, patch: Partial<TierDraft>) {
    const next = tierDrafts.map((tier, i) => (i === index ? { ...tier, ...patch } : tier));
    applyTiers(next);
  }

  function addTier() {
    applyTiers([...tierDrafts, { label: "", price: "" }]);
  }

  function removeTier(index: number) {
    applyTiers(tierDrafts.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4 rounded-xl border border-gold/25 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tracking-[0.3em] text-gold">价格解析预览</p>
        <p className="font-serif text-xl text-gold-soft">{preview}</p>
      </div>
      <p className="text-xs text-zinc-400">
        与前台相同算法：支持斜杠多档、P 价、等号配置。保存后前台自动同步。
      </p>
      <div className="space-y-3">
        {tierDrafts.map((tier, index) => (
          <div key={`tier-${index}`} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
            <input
              value={tier.label}
              onChange={(e) => updateTier(index, { label: e.target.value })}
              placeholder={`配置 ${index + 1} 名称（如 Clean厂+3235）`}
              className="border border-gold/25 bg-transparent px-3 py-2 text-sm"
            />
            <input
              value={tier.price}
              onChange={(e) => updateTier(index, { price: e.target.value })}
              placeholder="价格"
              className="border border-gold/25 bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeTier(index)}
              className="border border-gold/20 px-3 py-2 text-xs text-zinc-400"
            >
              删除
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addTier} className="text-xs text-gold">
        + 添加配置档位
      </button>
      <details className="text-xs text-zinc-500">
        <summary className="cursor-pointer text-gold-soft">原始字段（高级）</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            价格数字
            <input
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              className="w-full border border-gold/25 bg-transparent px-3 py-2"
            />
          </label>
          <label className="block space-y-1">
            价格文案
            <input
              value={priceText}
              onChange={(e) => onPriceTextChange(e.target.value)}
              className="w-full border border-gold/25 bg-transparent px-3 py-2"
            />
          </label>
        </div>
      </details>
      {parsed.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {parsed.map((item: PriceOption) => (
            <span key={item.id} className="rounded-full border border-gold/25 px-3 py-1 text-xs text-gold-soft">
              {item.label || "默认"} · {item.priceText}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
