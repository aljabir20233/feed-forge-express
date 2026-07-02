// Client-side capture of CSS / stylesheet load failures for the admin debug panel.
export type CssIssue = {
  time: number;
  type: "stylesheet" | "runtime" | "font";
  message: string;
  source?: string;
};

const KEY = "bbk:css-issues";
const MAX = 50;

export function readCssIssues(): CssIssue[] {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "[]") as CssIssue[];
  } catch { return []; }
}

export function pushCssIssue(issue: CssIssue) {
  try {
    const list = readCssIssues();
    list.unshift(issue);
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("bbk:css-issue", { detail: issue }));
    // Also log to console with a stable prefix so Cloudflare / server logs pick it up.
    console.error("[css-issue]", issue.type, issue.message, issue.source ?? "");
  } catch {}
}

export function clearCssIssues() {
  try { sessionStorage.removeItem(KEY); } catch {}
}

let installed = false;
export function installCssErrorLogger() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // Catch <link rel="stylesheet"> and <style> load failures.
  window.addEventListener(
    "error",
    (ev) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;
      if (t.tagName === "LINK") {
        const href = (t as HTMLLinkElement).href;
        if ((t as HTMLLinkElement).rel === "stylesheet") {
          pushCssIssue({ time: Date.now(), type: "stylesheet", message: `Stylesheet failed to load`, source: href });
        }
      } else if (t.tagName === "STYLE") {
        pushCssIssue({ time: Date.now(), type: "runtime", message: "Inline <style> failed", source: t.textContent?.slice(0, 80) });
      }
    },
    true,
  );

  // Verify all stylesheets after load; a 500 on styles.css becomes accessible=false.
  const audit = () => {
    for (const s of Array.from(document.styleSheets)) {
      try {
        // Accessing cssRules throws on failed sheets (also for cross-origin, so filter by href origin).
        const href = s.href;
        if (!href) continue;
        if (new URL(href, location.href).origin !== location.origin) continue;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        s.cssRules;
      } catch (e) {
        pushCssIssue({
          time: Date.now(),
          type: "stylesheet",
          message: `Stylesheet unreadable: ${(e as Error).message}`,
          source: s.href ?? "(inline)",
        });
      }
    }
  };
  if (document.readyState === "complete") audit();
  else window.addEventListener("load", audit, { once: true });
}
