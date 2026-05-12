import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Article } from "@/lib/queries";
import { timeAgoBn } from "@/lib/queries";

export function HeroSlider({ items }: { items: Article[] }) {
  const [idx, setIdx] = useState(0);
  const len = items.length;

  useEffect(() => {
    if (len < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % len), 5000);
    return () => clearInterval(id);
  }, [len]);

  if (!len) return null;
  const visible = Array.from({ length: Math.min(4, len) }, (_, i) => items[(idx + i) % len]);

  return (
    <div className="relative bg-card rounded-lg border border-border p-3 md:p-4">
      <button
        onClick={() => setIdx((i) => (i - 1 + len) % len)}
        aria-label="previous"
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-md hover:scale-110 transition-transform"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setIdx((i) => (i + 1) % len)}
        aria-label="next"
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-md hover:scale-110 transition-transform"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-8">
        {visible.map((a) => (
          <Link key={a.id} to="/article/$slug" params={{ slug: a.slug }} className="group block">
            <div className="aspect-[4/3] overflow-hidden rounded bg-muted">
              {a.cover_image && (
                <img src={a.cover_image} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <h3 className="font-serif text-sm md:text-base font-semibold mt-2 text-headline group-hover:text-primary line-clamp-2 leading-snug">
              {a.title}
            </h3>
            <div className="text-[11px] text-muted-foreground mt-1">{timeAgoBn(a.published_at)}</div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {items.slice(0, Math.min(8, len)).map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx % Math.min(8, len) ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
