import { Facebook, Twitter, Linkedin, MessageCircle, Link2 } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const enc = encodeURIComponent;
  const links = [
    { icon: Facebook, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, color: "bg-[#1877F2]" },
    { icon: Twitter, label: "Twitter", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, color: "bg-[#1DA1F2]" },
    { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/?text=${enc(title + " " + url)}`, color: "bg-[#25D366]" },
    { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, color: "bg-[#0A66C2]" },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">শেয়ার:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className={`${l.color} text-white w-8 h-8 grid place-items-center rounded-full hover:opacity-90 transition`}
        >
          <l.icon className="w-4 h-4" />
        </a>
      ))}
      <button onClick={copy} aria-label="কপি লিংক" className="bg-secondary text-foreground w-8 h-8 grid place-items-center rounded-full hover:bg-muted transition">
        <Link2 className="w-4 h-4" />
      </button>
      {copied && <span className="text-xs text-primary">কপি হয়েছে!</span>}
    </div>
  );
}
