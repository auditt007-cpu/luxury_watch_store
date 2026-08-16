const brand = process.env.NEXT_PUBLIC_BRAND || "ATELIER HORLOGE";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gold/20">
      <div className="grain pointer-events-none absolute inset-0 opacity-20" />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-24 text-center">
        <p className="text-xs tracking-[0.5em] text-gold">PRIVATE SALON</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight text-gold-soft sm:text-6xl">
          {brand}
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-400">
          精选机械腕表独立展厅。Clean 厂 / VS 厂参数对照，私洽询价，所见即所得。
        </p>
        <div className="gold-line mt-10 h-px w-40" />
      </div>
    </section>
  );
}
