export const WHATSAPP_NUMBER = "8618551214583";
export const WECHAT_ID = "2744760";

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}
