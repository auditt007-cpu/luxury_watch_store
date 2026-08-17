export type PriceOption = {
  id: string;
  label: string;
  price: number;
  priceText: string;
};

const TIER_LABELS = ["标配档", "进阶档", "顶级档", "尊享档", "旗舰档"];

function parseAmount(raw: string) {
  const value = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(value) && value >= 100 ? value : 0;
}

export function formatExactPrice(price: number) {
  return `¥ ${price.toLocaleString("zh-CN")}`;
}

function option(price: number, label: string, id: string): PriceOption | null {
  if (!price) return null;
  const cleanLabel = label.trim().replace(/[。.，,|]+$/g, "");
  return {
    id,
    label: cleanLabel,
    price,
    priceText: formatExactPrice(price),
  };
}

function mergeOptions(items: PriceOption[]) {
  const map = new Map<string, PriceOption>();
  for (const item of items) {
    const key = `${item.price}:${item.label}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()].sort((a, b) => a.price - b.price);
}

function parseNumberedTiers(text: string) {
  const tiers: PriceOption[] = [];
  const tierRe =
    /(?:^|\n)\s*(\d+)\s*[，,、.．]\s*([\s\S]*?)[，,]\s*(?:P|批)\s*[¥￥]?\s*(\d{3,5})\s*[。.]?/gi;
  let match: RegExpExecArray | null;
  while ((match = tierRe.exec(text)) !== null) {
    const label = match[2].replace(/\s+/g, " ").trim();
    const amount = parseAmount(match[3]);
    const row = option(amount, label, `tier-${match[1]}`);
    if (row) tiers.push(row);
  }
  return tiers;
}

function parseEqualsTiers(text: string) {
  const tiers: PriceOption[] = [];
  const re = /([^\n=|，,。]{2,48}?)\s*[=＝]\s*(\d{3,5})/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const label = match[1].replace(/\s+/g, " ").trim();
    if (!label || /^\d+$/.test(label)) continue;
    const amount = parseAmount(match[2]);
    const row = option(amount, label, `eq-${tiers.length + 1}`);
    if (row) tiers.push(row);
  }
  return tiers;
}

function parseSlashTiers(text: string) {
  const tiers: PriceOption[] = [];
  const re = /(?:^|[\s：:，,|])\s*((?:\d{3,5}\s*\/\s*)+\d{3,5})\s*(?:$|[\s。，,|])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const amounts = match[1]
      .split("/")
      .map((part) => parseAmount(part))
      .filter(Boolean);
    if (amounts.length < 2) continue;
    amounts.forEach((amount, index) => {
      const label = TIER_LABELS[index] || `配置 ${index + 1}`;
      const row = option(amount, label, `slash-${index + 1}`);
      if (row) tiers.push(row);
    });
  }
  return tiers;
}

function parseInlineLabelPrices(text: string) {
  const tiers: PriceOption[] = [];
  const re = /([^\d\n|，,=]{2,32}?)(\d{3,5})(?=\s*[（(]|$|\n|。|，|,|\||\s)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const label = match[1].replace(/\s+/g, " ").trim();
    if (!label || /mm|尺寸|码数|size/i.test(label)) continue;
    const amount = parseAmount(match[2]);
    const row = option(amount, label, `inline-${tiers.length + 1}`);
    if (row) tiers.push(row);
  }
  return tiers;
}

function parseSinglePrice(text: string, price = 0, priceText = "") {
  const patterns = [
    /(?:^|\s)(?:P|批)\s*[¥￥]?\s*(\d{4,5})(?!\d)/i,
    /[¥￥]\s*(\d{3,5})/,
    /特价\s*[¥￥]?\s*(\d{3,5})/,
  ];
  for (const pattern of patterns) {
    const hit = text.match(pattern);
    if (!hit) continue;
    const amount = parseAmount(hit[1]);
    const row = option(amount, "", "single");
    if (row) return [row];
  }
  if (price >= 100) {
    const row = option(price, "", "single");
    if (row) return [row];
  }
  if (priceText && /[¥$€]|万/.test(priceText)) {
    return [{ id: "single", label: "", price: 0, priceText: priceText.trim() }];
  }
  return [];
}

export function parsePriceOptions(
  title: string,
  description = "",
  price = 0,
  priceText = "",
): PriceOption[] {
  const text = [title, description].filter(Boolean).join("\n");

  const numbered = parseNumberedTiers(text);
  if (numbered.length >= 2) return mergeOptions(numbered);

  const equals = parseEqualsTiers(text);
  if (equals.length >= 2) return mergeOptions(equals);

  const slash = parseSlashTiers(text);
  if (slash.length >= 2) return mergeOptions(slash);

  const inline = parseInlineLabelPrices(text);
  if (inline.length >= 2) return mergeOptions(inline);

  if (numbered.length === 1) return numbered;
  if (equals.length === 1) return equals;
  if (slash.length === 1) return slash;
  if (inline.length === 1) return inline;

  return parseSinglePrice(text, price, priceText);
}

export function displayPriceSummary(
  title: string,
  description = "",
  price = 0,
  priceText = "",
  inquireLabel = "询价",
  selected: PriceOption | null = null,
) {
  if (selected?.price) return selected.priceText;
  if (selected?.priceText) return selected.priceText;

  const options = parsePriceOptions(title, description, price, priceText);
  if (!options.length) return inquireLabel;
  if (options.length === 1) {
    return options[0].price ? options[0].priceText : options[0].priceText || inquireLabel;
  }
  return `${formatExactPrice(options[0].price)} 起`;
}

export function productHeadline(title: string) {
  const first = title.split(/\n/)[0]?.trim() || title.trim();
  return first.split(/[,，]\s*配置[：:]/)[0]?.trim() || first;
}
