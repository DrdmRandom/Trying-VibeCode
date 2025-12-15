"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "dark" | "warm" | "day";

type ThemeContextValue = {
  mode: ThemeMode;
  label: string;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({ mode: "dark", label: "--", mounted: false });

function getThemeForDate(date: Date): ThemeMode {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const toMin = (h: number, m: number) => h * 60 + m;
  if (minutes >= toMin(18, 30) || minutes <= toMin(5, 30)) return "dark";
  if ((minutes >= toMin(5, 31) && minutes <= toMin(7, 0)) || (minutes >= toMin(16, 31) && minutes <= toMin(18, 29))) return "warm";
  return "day";
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => setMode(getThemeForDate(new Date()));
    update();
    setMounted(true);
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    body.classList.remove("theme-dark", "theme-warm", "theme-day");
    body.classList.add(`theme-${mode}`);
  }, [mode, mounted]);

  const label = useMemo(() => {
    if (mode === "dark") return "Dark";
    if (mode === "warm") return "Warm";
    return "Day";
  }, [mode]);

  return <ThemeContext.Provider value={{ mode, label, mounted }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeContext);
