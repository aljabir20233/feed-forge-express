import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCategories, type Category } from "@/lib/queries";
import { toast } from "sonner";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[\s\u0980-\u09FF]+/g, "-").replace(/[^\w-]+/g, "").slice(0, 80) || `post-${Date.now()}`;
}

export type ArticleForm = {
  title: string; slug: string; excerpt: string; content: string; cover_image: string;
  category_id: string; status: "draft" | "published"; is_featured: boolean; is_breaking: boolean;
};

const empty: ArticleForm = {
  title: "", slug: "", excerpt: "", content: "", cover_image: "",
  category_id: "", status: "draft", is_featured: false, is_breaking: false,
};

export function ArticleEditor({ id }: { id?: string }) {
  const { user, isEditor, loading } = useAuth();
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<ArticleForm>(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isEditor) navigate({ to: "/admin" });
  }, [loading, user, isEditor, navigate]);

  useEffect(() => {
    fetchCategories().then(setCats);
    if (id) {
      supabase.from("articles").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) setForm({
          title: data.title, slug: data.slug, excerpt: data.excerpt ?? "", content: data.content,
          cover_image: data.cover_image ?? "", category_id: data.category_id ?? "",
          status: data.status, is_featured: data.is_featured, is_breaking: data.is_breaking,
        });
      });
    }
  }, [id]);

  const set = <K extends keyof ArticleForm>(k: K, v: ArticleForm[K]) => setForm(s => ({ ...s, [k]: v }));

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("শিরোনাম ও বিবরণ আবশ্যক"); return; }
    setBusy(true);
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title, slug, excerpt: form.excerpt || null, content: form.content,
      cover_image: form.cover_image || null,
      category_id: form.category_id || null,
      status: form.status, is_featured: form.is_featured, is_breaking: form.is_breaking,
      published_at: form.status === "published" ? new Date().toISOString() : null,
      author_id: user?.id ?? null,
    };
    const { error } = id
      ? await supabase.from("articles").update(payload).eq("id", id)
      : await supabase.from("articles").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(id ? "আপডেট হয়েছে" : "প্রকাশিত হয়েছে");
    navigate({ to: "/admin" });
  };

  return (
    <div className="news-container py-8 max-w-4xl">
      <h1 className="font-serif text-3xl font-bold mb-6 text-headline">{id ? "সংবাদ সম্পাদনা" : "নতুন সংবাদ"}</h1>
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div>
          <Label>শিরোনাম *</Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} onBlur={() => !form.slug && set("slug", slugify(form.title))} placeholder="শিরোনাম লিখুন" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>স্লাগ (URL)</Label>
            <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto-generated" />
          </div>
          <div>
            <Label>বিভাগ</Label>
            <Select value={form.category_id} onValueChange={v => set("category_id", v)}>
              <SelectTrigger><SelectValue placeholder="বিভাগ নির্বাচন" /></SelectTrigger>
              <SelectContent>
                {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>কভার ইমেজ URL</Label>
          <Input value={form.cover_image} onChange={e => set("cover_image", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <Label>সারসংক্ষেপ</Label>
          <Textarea rows={2} value={form.excerpt} onChange={e => set("excerpt", e.target.value)} />
        </div>
        <div>
          <Label>বিবরণ * (অনুচ্ছেদ আলাদা করতে দু'টি Enter দিন)</Label>
          <Textarea rows={12} value={form.content} onChange={e => set("content", e.target.value)} className="font-sans" />
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => set("is_featured", v)} /><Label>ফিচার্ড</Label></div>
          <div className="flex items-center gap-2"><Switch checked={form.is_breaking} onCheckedChange={v => set("is_breaking", v)} /><Label>ব্রেকিং</Label></div>
          <div className="flex items-center gap-2 ml-auto">
            <Switch checked={form.status === "published"} onCheckedChange={v => set("status", v ? "published" : "draft")} />
            <Label>প্রকাশিত</Label>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={save} disabled={busy}>{busy ? "সংরক্ষণ..." : id ? "আপডেট" : "প্রকাশ করুন"}</Button>
          <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>বাতিল</Button>
        </div>
      </div>
    </div>
  );
}
