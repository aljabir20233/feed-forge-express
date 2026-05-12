import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchArticlesByCategory, fetchCategories, type Article } from "@/lib/queries";
import { ArticleCard } from "@/components/site/ArticleCard";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — খবর২৪` },
      { name: "description", content: `${params.slug} বিভাগের সর্বশেষ সংবাদ — খবর২৪` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [name, setName] = useState(slug);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchArticlesByCategory(slug), fetchCategories()])
      .then(([a, c]) => {
        setArticles(a);
        const cat = c.find(x => x.slug === slug);
        if (cat) setName(cat.name);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="news-container py-6">
      <div className="border-b-2 border-primary mb-6 pb-1">
        <h1 className="font-serif text-3xl font-bold">
          <span className="bg-primary text-primary-foreground px-4 py-2 rounded-t inline-block">{name}</span>
        </h1>
      </div>
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">লোড হচ্ছে...</div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">এই বিভাগে এখনও কোনো সংবাদ নেই</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map(a => <ArticleCard key={a.id} a={a} size="lg" />)}
        </div>
      )}
    </div>
  );
}
