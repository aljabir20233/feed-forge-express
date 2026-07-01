import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchArticleBySlug, fetchPublishedArticles, formatBnDate, type Article } from "@/lib/queries";
import { ArticleCard } from "@/components/site/ArticleCard";
import { ShareButtons } from "@/components/site/ShareButtons";
import { incrementArticleView } from "@/lib/article-views.functions";
import { Calendar, Eye } from "lucide-react";

export const Route = createFileRoute("/article/$slug")({
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [a, setA] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchArticleBySlug(slug).then(setA).finally(() => setLoading(false));
    fetchPublishedArticles(8).then(setRelated);
    incrementArticleView({ data: { slug } }).catch(() => {});
  }, [slug]);

  if (loading) return <div className="news-container py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;
  if (!a) return (
    <div className="news-container py-20 text-center">
      <h1 className="text-2xl font-serif font-bold mb-3">সংবাদটি পাওয়া যায়নি</h1>
      <Link to="/" className="text-primary hover:underline">হোমে ফিরে যান</Link>
    </div>
  );

  const bnNum = (n: number) => n.toString().replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[+x]);

  return (
    <div className="news-container py-6">
      <div className="grid lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          {a.categories && (
            <Link to="/category/$slug" params={{ slug: a.categories.slug }} className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded font-medium mb-4">
              {a.categories.name}
            </Link>
          )}
          <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight mb-4 text-headline">{a.title}</h1>
          {a.excerpt && <p className="text-lg text-muted-foreground mb-5 leading-relaxed">{a.excerpt}</p>}
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground border-y border-border py-3 mb-6">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatBnDate(a.published_at)}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {bnNum(a.view_count)} জন পড়েছেন</span>
            <div className="ml-auto"><ShareButtons title={a.title} /></div>
          </div>
          {a.cover_image && (
            <img src={a.cover_image} alt={a.title} className="w-full rounded-lg mb-6 aspect-[16/9] object-cover" />
          )}
          <div className="article-content text-foreground">
            {a.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </article>
        <aside>
          <div className="border-b-2 border-primary mb-4 pb-1">
            <h2 className="font-serif text-lg font-bold">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-t inline-block">আরও পড়ুন</span>
            </h2>
          </div>
          <div className="bg-card rounded-lg border border-border px-4">
            {related.filter(r => r.id !== a.id).slice(0, 6).map(r => <ArticleCard key={r.id} a={r} size="sm" />)}
          </div>
        </aside>
      </div>
    </div>
  );
}
