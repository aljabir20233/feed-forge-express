import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type MotionIntensity = "off" | "subtle" | "normal" | "full";

type Ctx = {
  intensity: MotionIntensity;
  setIntensity: (i: MotionIntensity) => void;
};

const MotionCtx = createContext<Ctx>({ intensity: "normal", setIntensity: () => {} });
const KEY = "bbk:motion-intensity";

export function MotionProvider({ children }: { children: ReactNode }) {
  const [intensity, setIntensityState] = useState<MotionIntensity>("normal");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as MotionIntensity | null;
      if (stored) setIntensityState(stored);
      else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIntensityState("subtle");
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", intensity);
  }, [intensity]);

  const setIntensity = (i: MotionIntensity) => {
    setIntensityState(i);
    try { localStorage.setItem(KEY, i); } catch {}
  };

  return <MotionCtx.Provider value={{ intensity, setIntensity }}>{children}</MotionCtx.Provider>;
}

export const useMotionPrefs = () => useContext(MotionCtx);
