import { useEffect, useRef } from "react";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";
type Options = { variant?: RevealVariant; delay?: number; threshold?: number };

export function useReveal<T extends HTMLElement = HTMLDivElement>(opts: Options = {}) {
  const { variant = "up", delay = 0, threshold = 0.12 } = opts;
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.classList.add("reveal", `reveal-${variant}`);
    if (delay) el.style.transitionDelay = `${delay}ms`;
    if (reduced) {
      el.classList.add("reveal-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [variant, delay, threshold]);
  return ref;
}
