import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  listAppUsers, createAppUser, updateAppUser, setUserAdmin, deleteAppUser,
} from "@/lib/users-admin.functions";

export const Route = createFileRoute("/admin/users")({ component: UsersManager });

type Row = {
  id: string; email: string; display_name: string | null;
  created_at: string; is_admin: boolean; roles: string[];
};

function UsersManager() {
  const { user, isAdmin, loading, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listAppUsers);
  const create = useServerFn(createAppUser);
  const update = useServerFn(updateAppUser);
  const setAdmin = useServerFn(setUserAdmin);
  const del = useServerFn(deleteAppUser);

  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => list().then((d) => setRows(d as Row[])).catch((e) => toast.error(e.message)).finally(() => setBusy(false));

  useEffect(() => {
    if (loading || !rolesLoaded) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
    if (!isAdmin) { setBusy(false); return; }
    reload();
  }, [loading, rolesLoaded, user, isAdmin]);

  const onToggleAdmin = async (r: Row, v: boolean) => {
    try { await setAdmin({ data: { user_id: r.id, is_admin: v } }); toast.success("আপডেট হয়েছে"); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  const onDelete = async (r: Row) => {
    if (!confirm(`${r.email} মুছে ফেলবেন?`)) return;
    try { await del({ data: { user_id: r.id } }); toast.success("মুছে ফেলা হয়েছে"); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  if (loading || busy) return <div className="news-container py-20 text-center text-muted-foreground">লোড হচ্ছে...</div>;

  if (!isAdmin) return (
    <div className="news-container py-16 max-w-lg">
      <div className="bg-card rounded-lg border border-border p-6">
        <ShieldCheck className="w-10 h-10 text-primary mb-3" />
        <h1 className="font-serif text-2xl font-bold mb-2">শুধু অ্যাডমিন</h1>
        <p className="text-sm text-muted-foreground">এই পৃষ্ঠা শুধুমাত্র অ্যাডমিনদের জন্য।</p>
      </div>
    </div>
  );

  return (
    <div className="news-container py-8">
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/admin"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <h1 className="font-serif text-3xl font-bold text-headline">ব্যবহারকারী ব্যবস্থাপনা</h1>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4 mr-1" /> নতুন ব্যবহারকারী</Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {rows.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.display_name || "(নাম নেই)"}</div>
                <div className="text-xs text-muted-foreground truncate">{r.email}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={r.is_admin} onCheckedChange={(v) => onToggleAdmin(r, v)} disabled={r.id === user?.id} />
                <Label className="text-xs">অ্যাডমিন</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(r)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(r)} disabled={r.id === user?.id}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
          {rows.length === 0 && <div className="px-4 py-10 text-center text-muted-foreground">কোনো ব্যবহারকারী নেই</div>}
        </div>
      </div>

      <CreateDialog open={creating} onOpenChange={setCreating} onCreate={async (f) => {
        try { await create({ data: f }); toast.success("তৈরি হয়েছে"); setCreating(false); reload(); }
        catch (e: any) { toast.error(e.message); }
      }} />

      <EditDialog row={editing} onOpenChange={(o) => !o && setEditing(null)} onSave={async (f) => {
        try { await update({ data: f }); toast.success("আপডেট হয়েছে"); setEditing(null); reload(); }
        catch (e: any) { toast.error(e.message); }
      }} />
    </div>
  );
}

function CreateDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (o: boolean) => void; onCreate: (f: { email: string; password: string; display_name: string; is_admin: boolean }) => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [admin, setAdmin] = useState(false);
  useEffect(() => { if (!open) { setEmail(""); setPassword(""); setName(""); setAdmin(false); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>নতুন ব্যবহারকারী</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>নাম</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>ইমেইল</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><Label>পাসওয়ার্ড</Label><Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" /></div>
          <div className="flex items-center gap-2"><Switch checked={admin} onCheckedChange={setAdmin} /><Label>অ্যাডমিন রোল দিন</Label></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
          <Button onClick={() => onCreate({ email, password, display_name: name, is_admin: admin })}>তৈরি করুন</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ row, onOpenChange, onSave }: { row: Row | null; onOpenChange: (o: boolean) => void; onSave: (f: { user_id: string; email?: string; password?: string; display_name?: string }) => void }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  useEffect(() => { if (row) { setEmail(row.email); setName(row.display_name ?? ""); setPassword(""); } }, [row]);
  if (!row) return null;
  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>সম্পাদনা: {row.email}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>নাম</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>ইমেইল</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><Label>নতুন পাসওয়ার্ড (ঐচ্ছিক)</Label><Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="ফাঁকা রাখলে অপরিবর্তিত" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
          <Button onClick={() => onSave({
            user_id: row.id,
            display_name: name !== (row.display_name ?? "") ? name : undefined,
            email: email !== row.email ? email : undefined,
            password: password ? password : undefined,
          })}>সংরক্ষণ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
