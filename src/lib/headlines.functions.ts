import { createServerFn } from "@tanstack/react-start";

export type Headline = { title: string; link: string; source: string; pubDate: string };

const FEEDS = [
  "https://news.google.com/rss/search?q=bangladesh+bank+OR+%E0%A6%AC%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%82%E0%A6%95+OR+%E0%A6%AC%E0%A7%80%E0%A6%AE%E0%A6%BE&hl=bn&gl=BD&ceid=BD:bn",
];

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function parseRSS(xml: string): Headline[] {
  const items: Headline[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) && items.length < 30) {
    const block = m[1];
    const get = (tag: string) => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`).exec(block);
      return r ? decodeEntities(r[1].trim()) : "";
    };
    const title = get("title");
    const link = get("link");
    const pubDate = get("pubDate");
    const source = (/<source[^>]*>([^<]+)<\/source>/.exec(block)?.[1] ?? "").trim();
    if (title && link) items.push({ title, link, source: source || "Google News", pubDate });
  }
  return items;
}

export const fetchHeadlines = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const res = await fetch(FEEDS[0], { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return { items: [] as Headline[] };
    const xml = await res.text();
    return { items: parseRSS(xml).slice(0, 12) };
  } catch {
    return { items: [] as Headline[] };
  }
});
