"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "dark" | "warm" | "day";

type ThemeContextValue = {
  mode: ThemeMode;
  label: string;
};

const ThemeContext = createContext<ThemeContextValue>({ mode: "dark", label: "Dark" });

function getThemeForDate(date: Date): ThemeMode {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const toMin = (h: number, m: number) => h * 60 + m;
  if (minutes >= toMin(18, 30) || minutes <= toMin(5, 30)) return "dark";
  if ((minutes >= toMin(5, 31) && minutes <= toMin(7, 0)) || (minutes >= toMin(16, 31) && minutes <= toMin(18, 29))) return "warm";
  return "day";
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeForDate(new Date()));

  useEffect(() => {
    const update = () => setMode(getThemeForDate(new Date()));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-dark", "theme-warm", "theme-day");
    body.classList.add(`theme-${mode}`);
  }, [mode]);

  const label = useMemo(() => {
    if (mode === "dark") return "Dark";
    if (mode === "warm") return "Warm";
    return "Day";
  }, [mode]);

  return <ThemeContext.Provider value={{ mode, label }}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => useContext(ThemeContext);
