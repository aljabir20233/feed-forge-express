import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/site/ArticleCard";
import type { Article } from "@/lib/queries";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().default("") }),
  head: () => ({
    meta: [{ title: "অনুসন্ধান — খবর২৪" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    supabase
      .from("articles")
      .select("*, categories(name,slug,color)")
      .eq("status", "published")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setResults((data as unknown as Article[]) ?? []);
        setLoading(false);
      });
  }, [q]);

  return (
    <div className="news-container py-8">
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-headline mb-2">অনুসন্ধান ফলাফল</h1>
      <p className="text-muted-foreground mb-6">"{q}" এর জন্য {loading ? "খোঁজা হচ্ছে..." : `${results.length} টি ফলাফল`}</p>
      {!loading && results.length === 0 && q && (
        <p className="text-muted-foreground py-12 text-center">কোনো সংবাদ পাওয়া যায়নি।</p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((a, i) => <ArticleCard key={a.id} a={a} index={i} />)}
      </div>
    </div>
  );
}
