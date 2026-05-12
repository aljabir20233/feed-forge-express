import { useState } from "react";
import type { Article } from "@/lib/queries";
import { ArticleCard } from "./ArticleCard";

export function SidebarTabs({ latest, popular }: { latest: Article[]; popular: Article[] }) {
  const [tab, setTab] = useState<"latest" | "popular">("latest");
  const items = tab === "latest" ? latest : popular;
  return (
    <aside>
      <div className="flex border-b-2 border-primary mb-4">
        <button
          onClick={() => setTab("latest")}
          className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors ${tab === "latest" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"}`}
        >
          সর্বশেষ প্রকাশিত
        </button>
        <button
          onClick={() => setTab("popular")}
          className={`px-4 py-2 text-sm font-semibold rounded-t ml-1 transition-colors ${tab === "popular" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"}`}
        >
          সর্বাধিক পঠিত
        </button>
      </div>
      <div className="bg-card rounded-lg border border-border px-4">
        {items.slice(0, 8).map((a) => (
          <ArticleCard key={a.id} a={a} size="sm" />
        ))}
      </div>
    </aside>
  );
}
