const LABEL_KEYS = [
  "配置",
  "机芯",
  "材质",
  "差异",
  "主体",
  "里料",
  "尺寸",
  "编号",
  "表壳",
  "表带",
  "功能",
  "防水",
  "亮点",
  "颜色",
  "重量",
  "产地",
];

export function formatProductText(text: string): string {
  if (!text?.trim()) return "";
  let s = text.replace(/\r\n/g, "\n").replace(/\u00a0/g, " ");
  s = s.replace(/([^\n])\s*((?:[1-9]\d?)[、.．])/g, "$1\n$2");
  const labels = LABEL_KEYS.join("|");
  s = s.replace(new RegExp(`([^\\n])\\s*((?:${labels})[：:])`, "g"), "$1\n$2");
  s = s.replace(/[；;]+[ \t]*/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export function splitProductCopy(title: string, description = "") {
  const raw = [title, description]
    .map((part) => part?.trim() || "")
    .filter(Boolean)
    .join("\n\n");
  const formatted = formatProductText(raw);
  const lines = formatted
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return { headline: title?.trim() || "", body: "", highlights: [] as string[] };

  let headline = lines[0];
  const rest = lines.slice(1);

  if (headline.length > 84) {
    const cut = headline.search(/[。！？!?\s]/);
    if (cut >= 12 && cut <= 84) {
      rest.unshift(headline.slice(cut + 1).trim());
      headline = headline.slice(0, cut + 1).trim();
    } else {
      rest.unshift(headline.slice(48).trim());
      headline = headline.slice(0, 48).trim();
    }
  }

  const body = rest.filter(Boolean).join("\n");
  const highlights = rest.filter(Boolean).slice(0, 4);
  return { headline, body, highlights };
}
