import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchArticlesByCategory, fetchCategories } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ব্যাংক বীমা খবর` },
      { name: "description", content: `${params.slug} বিভাগের সর্বশেষ সংবাদ` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles-by-category", slug],
    queryFn: () => fetchArticlesByCategory(slug),
    staleTime: 30_000,
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
  const name = cats.find((c: any) => c.slug === slug)?.name ?? slug;

  useEffect(() => {
    const ch = supabase
      .channel(`articles-cat-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        qc.invalidateQueries({ queryKey: ["articles-by-category", slug] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [slug, qc]);

  return (
    <div className="news-container py-6">
      <div className="border-b-2 border-primary mb-6 pb-1">
        <h1 className="font-serif text-3xl font-bold">
          <span className="bg-primary text-primary-foreground px-4 py-2 rounded-t inline-block">{name}</span>
        </h1>
      </div>
      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">এই বিভাগে এখনও কোনো সংবাদ নেই</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a: any, i: number) => <ArticleCard key={a.id} a={a} size="lg" index={i} />)}
        </div>
      )}
    </div>
  );
}
