import { useMotionPrefs, type MotionIntensity } from "@/hooks/use-motion-prefs";
import { Sparkles } from "lucide-react";
import { useState } from "react";

const OPTIONS: { value: MotionIntensity; label: string }[] = [
  { value: "off", label: "বন্ধ" },
  { value: "subtle", label: "সামান্য" },
  { value: "normal", label: "স্বাভাবিক" },
  { value: "full", label: "সম্পূর্ণ" },
];

export function MotionSettings() {
  const { intensity, setIntensity } = useMotionPrefs();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 rounded-lg border border-border bg-card p-3 shadow-lg w-56">
          <div className="text-xs font-semibold mb-2 text-foreground">অ্যানিমেশন তীব্রতা</div>
          <div className="grid grid-cols-2 gap-1.5">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setIntensity(o.value)}
                className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                  intensity === o.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-secondary"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="motion settings"
        className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90"
      >
        <Sparkles className="w-4 h-4" />
      </button>
    </div>
  );
}
