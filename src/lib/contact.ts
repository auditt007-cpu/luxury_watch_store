export const WHATSAPP_NUMBER = "8618551214583";
export const WECHAT_ID = "2744760";

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function buildQuoteUrl(ids: string[]) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/quote?ids=${ids.map(encodeURIComponent).join(",")}`;
}

export function buildQuoteMessage(prefix: string, titles: string[], url: string) {
  const lines = titles.map((title, index) => `${index + 1}. ${title}`);
  return `${prefix}\n${lines.join("\n")}\n${url}`;
}
