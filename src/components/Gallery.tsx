"use client";

import { useState } from "react";
import { coverOf } from "@/lib/product";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const list = images.length ? images : [coverOf([])];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-black">
        <img src={list[active]} alt={title} className="aspect-square w-full object-contain" />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {list.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-lg border ${
                active === index ? "border-gold" : "border-gold/15"
              }`}
            >
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
