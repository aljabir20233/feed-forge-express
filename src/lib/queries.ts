import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sort_order: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  is_breaking: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string; slug: string; color: string | null } | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data as Category[];
}

export async function fetchPublishedArticles(limit = 30): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name,slug,color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as Article[];
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name,slug,color)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Article | null;
}

export async function fetchArticlesByCategory(slug: string): Promise<Article[]> {
  const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (!cat) return [];
  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name,slug,color)")
    .eq("category_id", cat.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Article[];
}

export function formatBnDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const bnNum = (n: number) => n.toString().replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[+x]);
  const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  return `${bnNum(d.getDate())} ${months[d.getMonth()]} ${bnNum(d.getFullYear())}`;
}

export function timeAgoBn(iso: string | null): string {
  if (!iso) return "";
  const bnNum = (n: number) => n.toString().replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[+x]);
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "এইমাত্র";
  if (diff < 3600) return `${bnNum(Math.floor(diff/60))} মিনিট আগে`;
  if (diff < 86400) return `${bnNum(Math.floor(diff/3600))} ঘণ্টা আগে`;
  return `${bnNum(Math.floor(diff/86400))} দিন আগে`;
}
