import { useEffect, useState } from "react";
import { readCssIssues, clearCssIssues, type CssIssue } from "@/lib/css-error-log";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

export function CssDebugPanel() {
  const [issues, setIssues] = useState<CssIssue[]>([]);
  const refresh = () => setIssues(readCssIssues());

  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("bbk:css-issue", on);
    return () => window.removeEventListener("bbk:css-issue", on);
  }, []);

  const sheets = typeof document !== "undefined"
    ? Array.from(document.styleSheets).map((s) => ({ href: s.href ?? "(inline)", disabled: s.disabled }))
    : [];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">CSS ডিবাগ প্যানেল</h3>
          <span className="text-xs text-muted-foreground">({issues.length} issue{issues.length === 1 ? "" : "s"})</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="w-3 h-3 mr-1" /> রিফ্রেশ</Button>
          <Button size="sm" variant="outline" onClick={() => { clearCssIssues(); refresh(); }}><Trash2 className="w-3 h-3 mr-1" /> মুছুন</Button>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="text-xs text-muted-foreground">কোনো CSS সমস্যা ধরা পড়েনি।</div>
      ) : (
        <ul className="space-y-2 mb-4 max-h-60 overflow-auto">
          {issues.map((i, idx) => (
            <li key={idx} className="text-xs border-l-2 border-primary pl-2">
              <div className="font-medium">{i.type} · {new Date(i.time).toLocaleTimeString()}</div>
              <div className="text-muted-foreground break-all">{i.message}</div>
              {i.source && <div className="text-muted-foreground/80 break-all">↳ {i.source}</div>}
            </li>
          ))}
        </ul>
      )}

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">লোডেড স্টাইলশিট ({sheets.length})</summary>
        <ul className="mt-2 space-y-1">
          {sheets.map((s, i) => (
            <li key={i} className="break-all text-muted-foreground">
              {s.disabled ? "🚫 " : "✅ "}{s.href}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
