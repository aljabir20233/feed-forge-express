import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { MotionIntensity } from "@/hooks/use-motion-prefs";

const OPTIONS: { value: MotionIntensity; label: string; hint: string }[] = [
  { value: "off", label: "বন্ধ", hint: "কোনো অ্যানিমেশন নেই" },
  { value: "subtle", label: "সামান্য", hint: "সংক্ষিপ্ত, নরম" },
  { value: "normal", label: "স্বাভাবিক", hint: "ডিফল্ট" },
  { value: "full", label: "সম্পূর্ণ", hint: "সবচেয়ে সমৃদ্ধ" },
];

export function MotionDefaultSetting() {
  const [current, setCurrent] = useState<MotionIntensity>("normal");
  const [selected, setSelected] = useState<MotionIntensity>("normal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "motion_intensity")
      .maybeSingle()
      .then(({ data }: any) => {
        const v = (data?.value as MotionIntensity) || "normal";
        setCurrent(v);
        setSelected(v);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert({ key: "motion_intensity", value: selected }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    setCurrent(selected);
    toast.success("সাইট-ওয়াইড ডিফল্ট সংরক্ষিত হয়েছে");
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="font-semibold">সাইট-ওয়াইড অ্যানিমেশন ডিফল্ট</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        নতুন দর্শকদের জন্য ডিফল্ট অ্যানিমেশন তীব্রতা। ব্যবহারকারী নিজেদের পছন্দ সেট করলে সেটা এই ডিফল্টকে ওভাররাইড করে।
      </p>
      {loading ? (
        <div className="text-sm text-muted-foreground">লোড হচ্ছে...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSelected(o.value)}
                className={`text-left text-xs px-3 py-2 rounded border transition-colors ${
                  selected === o.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-secondary"
                }`}
              >
                <div className="font-semibold">{o.label}</div>
                <div className="opacity-80">{o.hint}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving || selected === current} size="sm">
              {saving ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
            </Button>
            <span className="text-xs text-muted-foreground">
              বর্তমান: <b>{OPTIONS.find((o) => o.value === current)?.label}</b>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
