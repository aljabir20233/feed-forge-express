import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/queries";
import { timeAgoBn } from "@/lib/queries";
import { useReveal } from "@/hooks/use-reveal";

export function ArticleCard({ a, size = "md" }: { a: Article; size?: "sm" | "md" | "lg" | "hero" }) {
  const reveal = useReveal<HTMLAnchorElement>();
  const cat = a.categories;
  if (size === "hero") {
    return (
      <Link ref={reveal} to="/article/$slug" params={{ slug: a.slug }} className="group block relative overflow-hidden rounded-lg bg-card">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
          {cat && <span className="inline-block bg-primary text-primary-foreground text-xs px-2 py-1 rounded mb-3 font-medium">{cat.name}</span>}
          <h2 className="font-serif text-xl md:text-3xl font-bold leading-snug mb-2 group-hover:text-primary-foreground/90">{a.title}</h2>
          {a.excerpt && <p className="text-sm md:text-base opacity-90 line-clamp-2 hidden md:block">{a.excerpt}</p>}
          <div className="text-xs opacity-75 mt-2">{timeAgoBn(a.published_at)}</div>
        </div>
      </Link>
    );
  }
  if (size === "lg") {
    return (
      <Link ref={reveal} to="/article/$slug" params={{ slug: a.slug }} className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
        </div>
        <div className="p-4">
          {cat && <span className="text-xs text-primary font-semibold">{cat.name}</span>}
          <h3 className="font-serif text-lg font-bold leading-snug mt-1 mb-2 group-hover:text-primary line-clamp-2">{a.title}</h3>
          {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
          <div className="text-xs text-muted-foreground mt-2">{timeAgoBn(a.published_at)}</div>
        </div>
      </Link>
    );
  }
  if (size === "sm") {
    return (
      <Link ref={reveal} to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3 py-3 border-b border-border last:border-0">
        <div className="w-24 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
          {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover" loading="lazy" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary">{a.title}</h4>
          <div className="text-[11px] text-muted-foreground mt-1">{timeAgoBn(a.published_at)}</div>
        </div>
      </Link>
    );
  }
  return (
    <Link ref={reveal} to="/article/$slug" params={{ slug: a.slug }} className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
      </div>
      <div className="p-3">
        {cat && <span className="text-[11px] text-primary font-semibold">{cat.name}</span>}
        <h3 className="font-serif text-base font-bold leading-snug mt-1 group-hover:text-primary line-clamp-2">{a.title}</h3>
        <div className="text-[11px] text-muted-foreground mt-2">{timeAgoBn(a.published_at)}</div>
      </div>
    </Link>
  );
}
