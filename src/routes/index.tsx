import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchPublishedArticles, fetchCategories, type Article } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/site/ArticleCard";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SidebarTabs } from "@/components/site/SidebarTabs";

import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ব্যাংক বীমা খবর — A Financial Magazine Monthly" },
      { name: "description", content: "ব্যাংক, বীমা, অর্থনীতি, রাজনীতি, খেলা ও বিনোদনের সর্বশেষ বাংলা সংবাদ।" },
      { property: "og:title", content: "ব্যাংক বীমা খবর — A Financial Magazine Monthly" },
    ],
  }),
  component: HomePage,
});

function Section({ title, slug, articles }: { title: string; slug: string; articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between border-b-2 border-primary mb-4 pb-1">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-headline relative">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-t inline-block">{title}</span>
        </h2>
        <Link to="/category/$slug" params={{ slug }} className="text-xs text-primary hover:underline">আরও দেখুন →</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.slice(0, 4).map(a => <ArticleCard key={a.id} a={a} />)}
      </div>
    </section>
  );
}

function HomePage() {
  const qc = useQueryClient();
  const { data: articles = [], isLoading: la } = useQuery({
    queryKey: ["articles", "home"],
    queryFn: () => fetchPublishedArticles(50),
    staleTime: 1000 * 30,
  });
  const { data: cats = [], isLoading: lc } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const ch = supabase
      .channel("articles-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        qc.invalidateQueries({ queryKey: ["articles"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (la || lc) {
    return <div className="news-container py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;
  }

  const breaking = articles.filter((a: Article) => a.is_breaking);
  const featured = articles.filter((a: Article) => a.is_featured);
  const hero = featured[0] ?? articles[0];
  const heroSide = (featured.slice(1, 3).length ? featured.slice(1, 3) : articles.slice(1, 3));
  const latest = articles.slice(0, 6);

  const bySlug = (slug: string) => articles.filter((a: Article) => a.categories?.slug === slug);

  return (
    <>
      <BreakingTicker items={breaking.length ? breaking : articles.slice(0, 5)} />
      <div className="news-container py-6">
        {/* SLIDER */}
        <div className="mb-6">
          <HeroSlider items={featured.length >= 3 ? featured : articles.slice(0, 8)} />
        </div>

        {/* HERO */}
        {hero && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ArticleCard a={hero} size="hero" />
            </div>
            <div className="space-y-4">
              {heroSide.map((a: Article) => <ArticleCard key={a.id} a={a} size="lg" />)}
            </div>
          </div>
        )}

        {/* LATEST + SIDEBAR */}
        <div className="grid lg:grid-cols-3 gap-6 mt-10">
          <div className="lg:col-span-2">
            <div className="border-b-2 border-primary mb-4 pb-1">
              <h2 className="font-serif text-2xl font-bold text-headline">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-t inline-block">প্রধান খবর</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {latest.map((a: Article) => <ArticleCard key={a.id} a={a} />)}
            </div>
          </div>
          <SidebarTabs
            latest={articles.slice(0, 8)}
            popular={[...articles].sort((x: Article, y: Article) => y.view_count - x.view_count).slice(0, 8)}
          />
        </div>


        {/* CATEGORY SECTIONS */}
        {cats.filter((c: any) => bySlug(c.slug).length > 0).slice(0, 8).map((c: any) => (
          <Section key={c.id} title={c.name} slug={c.slug} articles={bySlug(c.slug)} />
        ))}
      </div>
    </>
  );
}
