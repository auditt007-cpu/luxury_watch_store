import type { Metadata } from "next";
import "./globals.css";
import { ContactFloat } from "@/components/ContactFloat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const brand = process.env.NEXT_PUBLIC_BRAND || "ATELIER HORLOGE";

export const metadata: Metadata = {
  title: `${brand} · 高端腕表`,
  description: "精选腕表独立展示，私洽询价。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ContactFloat />
      </body>
    </html>
  );
}
