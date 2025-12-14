"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import { Input } from "./ui/input";
import { useThemeMode } from "./theme-provider";
import { AddAppDialog } from "./add-app-dialog";

interface TopBarProps {
  onSearch: (value: string) => void;
  onAdd: Parameters<typeof AddAppDialog>[0]["onAdd"];
}

export const TopBar = ({ onSearch, onAdd }: TopBarProps) => {
  const { label, mounted: themeMounted } = useThemeMode();
  const [clock, setClock] = useState<Date | null>(null);

  useEffect(() => {
    setClock(new Date());
    const timer = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const timeString = clock
    ? clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateString = clock
    ? clock.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
    : "--";
  const modeLabel = themeMounted ? label : "--";

  return (
    <div className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner shadow-black/20">
          <CalendarClock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{timeString}</p>
          <p className="text-sm text-white/70">{dateString} · Mode: {modeLabel}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <Input className="pl-9" placeholder="Search apps..." onChange={(e) => onSearch(e.target.value)} />
        </div>
        <AddAppDialog onAdd={onAdd} />
      </div>
    </div>
  );
};
