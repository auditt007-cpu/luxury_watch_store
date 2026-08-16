import Link from "next/link";

const brand = process.env.NEXT_PUBLIC_BRAND || "ATELIER HORLOGE";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-serif text-xl tracking-[0.28em] text-gold">
          {brand}
        </Link>
        <nav className="flex items-center gap-6 text-xs tracking-[0.2em] text-gold-soft/80">
          <Link href="/#collection">COLLECTION</Link>
          <Link href="/admin">ADMIN</Link>
        </nav>
      </div>
    </header>
  );
}
