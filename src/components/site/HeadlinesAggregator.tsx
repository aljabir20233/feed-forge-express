import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { fetchHeadlines, type Headline } from "@/lib/headlines.functions";
import { ExternalLink, Newspaper } from "lucide-react";

export function HeadlinesAggregator() {
  const fn = useServerFn(fetchHeadlines);
  const { data, isLoading } = useQuery({
    queryKey: ["headlines"],
    queryFn: () => fn(),
    staleTime: 1000 * 60 * 10,
  });
  const items: Headline[] = data?.items ?? [];

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between border-b-2 border-primary mb-4 pb-1">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-headline">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-t inline-block flex items-center gap-2">
            <Newspaper className="w-4 h-4" /> অন্যান্য সূত্র থেকে শিরোনাম
          </span>
        </h2>
        <span className="text-[11px] text-muted-foreground">সূত্র: Google News</span>
      </div>
      {isLoading ? (
        <div className="text-center text-muted-foreground py-6 text-sm">শিরোনাম লোড হচ্ছে...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-muted-foreground py-6 text-sm">এই মুহূর্তে শিরোনাম পাওয়া যায়নি।</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2 bg-card border border-border rounded-lg p-4">
          {items.map((h, i) => (
            <li key={i} className="border-b border-border/60 last:border-0 py-2">
              <a href={h.link} target="_blank" rel="noopener noreferrer" className="group flex gap-2 items-start text-sm">
                <ExternalLink className="w-3.5 h-3.5 mt-1 text-primary shrink-0" />
                <span className="text-foreground group-hover:text-primary leading-snug">
                  {h.title}
                  {h.source && <span className="text-[11px] text-muted-foreground ml-1">— {h.source}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
