import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ensureMiltonAdmin } from "@/lib/admin-setup.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

const ADMIN_USERNAME = "milton";
const ADMIN_PASSWORD = "milton551233";

function AdminLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const setupAdmin = useServerFn(ensureMiltonAdmin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      toast.error("ভুল ইউজারনেম বা পাসওয়ার্ড");
      return;
    }
    setBusy(true);
    try {
      const creds = await setupAdmin();
      const { error } = await signIn(creds.email, creds.password);
      if (error) { toast.error(error); setBusy(false); return; }
      toast.success("অ্যাডমিন হিসেবে লগইন সফল");
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="news-container py-16 max-w-md">
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="font-serif text-2xl font-bold text-headline">অ্যাডমিন লগইন</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-5">শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>ইউজারনেম</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <Label>পাসওয়ার্ড</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={busy} className="w-full" style={{ background: "linear-gradient(90deg, #c8102e 0%, #ff6a00 100%)" }}>
            {busy ? "..." : "লগইন"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          <Link to="/" className="hover:text-primary">← হোমে ফিরে যান</Link>
        </p>
      </div>
    </div>
  );
}
