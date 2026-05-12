import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCategories, type Category } from "@/lib/queries";

export function Footer() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => { fetchCategories().then(setCats).catch(() => {}); }, []);
  return (
    <footer className="mt-16 bg-sidebar text-sidebar-foreground">
      <div className="news-container py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded bg-primary text-primary-foreground grid place-items-center font-serif font-bold text-xl">খ</div>
            <div className="font-serif text-2xl font-bold">খবর<span className="text-primary">২৪</span></div>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">দেশের সর্বশেষ এবং নির্ভরযোগ্য সংবাদের ঠিকানা। ব্যাংক, বীমা, অর্থনীতি এবং জাতীয় খবরে আপনার বিশ্বস্ত সঙ্গী।</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-primary">বিভাগ</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {cats.slice(0, 7).map(c => (
              <li key={c.id}><Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-primary">আরও</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {cats.slice(7).map(c => (
              <li key={c.id}><Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-primary">যোগাযোগ</h4>
          <p className="text-sm opacity-80 leading-relaxed">সম্পাদক: জনাব কামাল হোসেন<br/>ইমেইল: editor@khobor24.bd<br/>ফোন: +৮৮ ০২ ৯৮৭৬৫৪৩</p>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="news-container py-4 text-xs opacity-70 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} খবর২৪ • সর্বস্বত্ব সংরক্ষিত</span>
          <span>প্রকাশক ও সম্পাদক কর্তৃক প্রকাশিত</span>
        </div>
      </div>
    </footer>
  );
}
