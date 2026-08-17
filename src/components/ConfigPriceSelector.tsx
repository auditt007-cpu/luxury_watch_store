"use client";

import { useEffect, useState } from "react";
import type { PriceOption } from "@/lib/priceOptions";
import { useI18n } from "@/lib/i18n";

export function ConfigPriceSelector({
  options,
  onChange,
}: {
  options: PriceOption[];
  onChange: (option: PriceOption | null) => void;
}) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState(options[0]?.id || "");

  useEffect(() => {
    const first = options[0] || null;
    setActiveId(first?.id || "");
    onChange(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  if (!options.length) {
    return <p className="text-2xl text-gold">{t("inquire")}</p>;
  }

  if (options.length === 1) {
    return <p className="text-2xl text-gold">{options[0].priceText}</p>;
  }

  const active = options.find((item) => item.id === activeId) || options[0];

  return (
    <div className="space-y-4">
      <p className="text-xs tracking-[0.3em] text-gold">{t("configSelect")}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.id === active.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setActiveId(option.id);
                onChange(option);
              }}
              className={`rounded-full border px-4 py-2 text-left text-xs leading-5 transition ${
                selected
                  ? "border-gold bg-gold text-ink shadow-gold"
                  : "border-gold/30 bg-black/30 text-gold-soft hover:border-gold/60"
              }`}
            >
              <span className="block">{option.label}</span>
              <span className={`mt-0.5 block ${selected ? "text-ink/80" : "text-gold"}`}>
                {option.priceText}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-2xl text-gold">{active.priceText}</p>
    </div>
  );
}
