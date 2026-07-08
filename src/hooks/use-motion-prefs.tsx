import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MotionIntensity = "off" | "subtle" | "normal" | "full";
const VALID: MotionIntensity[] = ["off", "subtle", "normal", "full"];

type Ctx = {
  intensity: MotionIntensity;
  setIntensity: (i: MotionIntensity) => void;
  siteDefault: MotionIntensity;
  userOverridden: boolean;
  resetToSiteDefault: () => void;
};

const MotionCtx = createContext<Ctx>({
  intensity: "normal",
  setIntensity: () => {},
  siteDefault: "normal",
  userOverridden: false,
  resetToSiteDefault: () => {},
});
const KEY = "bbk:motion-intensity";

export function MotionProvider({ children }: { children: ReactNode }) {
  const [intensity, setIntensityState] = useState<MotionIntensity>("normal");
  const [siteDefault, setSiteDefault] = useState<MotionIntensity>("normal");
  const [userOverridden, setUserOverridden] = useState(false);

  // Load user override (highest priority)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as MotionIntensity | null;
      if (stored && VALID.includes(stored)) {
        setIntensityState(stored);
        setUserOverridden(true);
      } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIntensityState("subtle");
      }
    } catch {}
  }, []);

  // Load site-wide default from DB
  useEffect(() => {
    (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "motion_intensity")
      .maybeSingle()
      .then(({ data }: any) => {
        const v = data?.value as MotionIntensity | undefined;
        if (v && VALID.includes(v)) {
          setSiteDefault(v);
          try {
            if (!localStorage.getItem(KEY)) setIntensityState(v);
          } catch {}
        }
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", intensity);
  }, [intensity]);

  const setIntensity = (i: MotionIntensity) => {
    setIntensityState(i);
    setUserOverridden(true);
    try { localStorage.setItem(KEY, i); } catch {}
  };

  const resetToSiteDefault = () => {
    try { localStorage.removeItem(KEY); } catch {}
    setUserOverridden(false);
    setIntensityState(siteDefault);
  };

  return (
    <MotionCtx.Provider value={{ intensity, setIntensity, siteDefault, userOverridden, resetToSiteDefault }}>
      {children}
    </MotionCtx.Provider>
  );
}

export const useMotionPrefs = () => useContext(MotionCtx);
