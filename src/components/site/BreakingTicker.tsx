import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/queries";

export function BreakingTicker({ items }: { items: Article[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="bg-breaking text-breaking-foreground border-y border-black/10">
      <div className="news-container flex items-center gap-3 py-2 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0 pr-3 border-r border-white/30">
          <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
          <span className="text-xs font-bold tracking-wide">ব্রেকিং</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex gap-10 whitespace-nowrap">
            {loop.map((a, i) => (
              <Link key={i} to="/article/$slug" params={{ slug: a.slug }} className="text-sm hover:underline">
                ▸ {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
