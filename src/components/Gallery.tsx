"use client";

import Image from "next/image";
import { useState } from "react";
import { coverOf } from "@/lib/product";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const list = images.length ? images : [coverOf([])];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gold/20 bg-black">
        <img
          src={list[active]}
          alt={title}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="aspect-square w-full object-contain"
        />
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
              <Image
                src={src}
                alt=""
                width={160}
                height={160}
                unoptimized
                priority
                loading="eager"
                className="aspect-square h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
