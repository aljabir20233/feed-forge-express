import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ShieldCheck, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import type { Article } from "@/lib/queries";
import { CssDebugPanel } from "@/components/admin/CssDebugPanel";
import { MotionDefaultSetting } from "@/components/admin/MotionDefaultSetting";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, isEditor, isAdmin, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading || !rolesLoaded) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isEditor) { setBusy(false); return; }
    supabase.from("articles").select("*, categories(name,slug,color)").order("created_at", { ascending: false })
      .then(({ data }) => { setArticles((data ?? []) as unknown as Article[]); setBusy(false); });
  }, [loading, rolesLoaded, user, isEditor, navigate]);

  const onDelete = async (id: string) => {
    if (!confirm("সংবাদটি মুছে ফেলবেন?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setArticles(s => s.filter(a => a.id !== id));
    toast.success("মুছে ফেলা হয়েছে");
  };

  const claimAdmin = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("অ্যাডমিন রোল যুক্ত হয়েছে — পেজ রিফ্রেশ করুন");
    setTimeout(() => location.reload(), 800);
  };

  if (loading || busy) return <div className="news-container py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;

  if (!isEditor) {
    return (
      <div className="news-container py-16 max-w-lg">
        <div className="bg-card rounded-lg border border-border p-6">
          <ShieldCheck className="w-10 h-10 text-primary mb-3" />
          <h1 className="font-serif text-2xl font-bold mb-2">অ্যাক্সেস নেই</h1>
          <p className="text-sm text-muted-foreground mb-4">আপনার অ্যাডমিন বা এডিটর রোল প্রয়োজন। প্রথম ব্যবহারকারী হিসেবে নিচের বোতাম চেপে নিজেকে অ্যাডমিন বানিয়ে নিন।</p>
          <Button onClick={claimAdmin}>অ্যাডমিন হন</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-headline">অ্যাডমিন প্যানেল</h1>
          <p className="text-sm text-muted-foreground">{isAdmin ? "অ্যাডমিন" : "এডিটর"} হিসেবে লগইন</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <Link to="/admin/users"><Button variant="outline"><Users className="w-4 h-4 mr-1" /> ব্যবহারকারী</Button></Link>}
          <Link to="/admin/new"><Button><Plus className="w-4 h-4 mr-1" /> নতুন সংবাদ</Button></Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="মোট সংবাদ" value={articles.length} />
        <Stat label="প্রকাশিত" value={articles.filter(a => a.status === "published").length} />
        <Stat label="খসড়া" value={articles.filter(a => a.status === "draft").length} />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 font-semibold">
          <FileText className="w-4 h-4" /> সকল সংবাদ
        </div>
        <div className="divide-y divide-border">
          {articles.map(a => (
            <div key={a.id} className="px-4 py-3 flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                {a.cover_image && <img src={a.cover_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                  <span className={`px-1.5 rounded text-[10px] ${a.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {a.status === "published" ? "প্রকাশিত" : "খসড়া"}
                  </span>
                  {a.categories && <span>{a.categories.name}</span>}
                  {a.is_featured && <span className="text-primary">★ ফিচার্ড</span>}
                </div>
              </div>
              <Link to="/admin/edit/$id" params={{ id: a.id }}><Button variant="outline" size="sm"><Pencil className="w-3.5 h-3.5" /></Button></Link>
              {isAdmin && <Button variant="outline" size="sm" onClick={() => onDelete(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
            </div>
          ))}
          {articles.length === 0 && <div className="px-4 py-10 text-center text-muted-foreground">কোনো সংবাদ নেই</div>}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {isAdmin && <MotionDefaultSetting />}
        <CssDebugPanel />
      </div>
    </div>
  );
}


function Stat({ label, value }: { label: string; value: number }) {
  const bn = (n: number) => n.toString().replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[+x]);
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-serif text-3xl font-bold text-primary mt-1">{bn(value)}</div>
    </div>
  );
}
