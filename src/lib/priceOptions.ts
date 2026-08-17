import { formatPrice } from "./product";

export type PriceOption = {
  id: string;
  label: string;
  price: number;
  priceText: string;
};

function parseAmount(raw: string) {
  const value = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function toRmb(price: number) {
  return `¥ ${price.toLocaleString("zh-CN")} RMB`;
}

export function parsePriceOptions(
  title: string,
  description = "",
  price = 0,
  priceText = "",
): PriceOption[] {
  const text = [title, description].filter(Boolean).join("\n");
  const tiers: PriceOption[] = [];
  const tierRe =
    /(?:^|\n)\s*(\d+)\s*[，,、.．]\s*([\s\S]*?)[，,]\s*(?:P|批)\s*[¥￥]?\s*(\d{3,5})\s*[。.]?/gi;

  let match: RegExpExecArray | null;
  while ((match = tierRe.exec(text)) !== null) {
    const label = match[2].replace(/\s+/g, " ").trim().replace(/[。.，,]+$/, "");
    const amount = parseAmount(match[3]);
    if (!label || !amount) continue;
    tiers.push({
      id: `tier-${match[1]}`,
      label,
      price: amount,
      priceText: toRmb(amount),
    });
  }

  if (tiers.length >= 2) return tiers;

  const singles = [
    /(?:^|\s)(?:P|批)\s*[¥￥]?\s*(\d{3,5})/i,
    /[¥￥]\s*(\d{3,5})/,
    /机芯\s*[=＝]\s*(\d{3,5})/,
    /配[^=\n]{0,24}[=＝]\s*(\d{3,5})/,
  ];

  for (const pattern of singles) {
    const hit = text.match(pattern);
    if (!hit) continue;
    const amount = parseAmount(hit[1]);
    if (!amount) continue;
    return [{ id: "single", label: "", price: amount, priceText: toRmb(amount) }];
  }

  if (price > 0) {
    return [{ id: "single", label: "", price, priceText: formatPrice(price, priceText) }];
  }
  if (priceText?.trim()) {
    return [{ id: "single", label: "", price: 0, priceText: priceText.trim() }];
  }
  return [];
}

export function productHeadline(title: string) {
  const first = title.split(/\n/)[0]?.trim() || title.trim();
  return first.split(/[,，]\s*配置[：:]/)[0]?.trim() || first;
}
