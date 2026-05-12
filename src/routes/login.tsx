import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (mode: "in" | "up") => {
    setBusy(true);
    const res = mode === "in" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    if (mode === "up") { toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।"); return; }
    toast.success("সফলভাবে লগইন হয়েছে");
    navigate({ to: "/" });
  };

  return (
    <div className="news-container py-16 max-w-md">
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-bold mb-1 text-headline">খবর২৪-এ স্বাগতম</h1>
        <p className="text-sm text-muted-foreground mb-5">লগইন করুন অথবা নতুন অ্যাকাউন্ট খুলুন</p>
        <Tabs defaultValue="in">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="in">লগইন</TabsTrigger>
            <TabsTrigger value="up">নিবন্ধন</TabsTrigger>
          </TabsList>
          <TabsContent value="in" className="space-y-3 mt-4">
            <div><Label>ইমেইল</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>পাসওয়ার্ড</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button onClick={() => submit("in")} disabled={busy} className="w-full">{busy ? "..." : "লগইন"}</Button>
          </TabsContent>
          <TabsContent value="up" className="space-y-3 mt-4">
            <div><Label>নাম</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>ইমেইল</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>পাসওয়ার্ড</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button onClick={() => submit("up")} disabled={busy} className="w-full">{busy ? "..." : "অ্যাকাউন্ট খুলুন"}</Button>
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          <Link to="/" className="hover:text-primary">← হোমে ফিরে যান</Link>
        </p>
      </div>
    </div>
  );
}
