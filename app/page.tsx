"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppGrid } from "../components/app-grid";
import { TopBar } from "../components/top-bar";
import { loadApps, saveApps } from "../lib/storage";
import { AppItem } from "../lib/types";

export default function HomePage() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = loadApps();
    setApps(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveApps(apps);
  }, [apps, hydrated]);

  const handleUpsert = (item: AppItem) => {
    setApps((prev) => {
      const exists = prev.some((app) => app.id === item.id);
      if (exists) return prev.map((app) => (app.id === item.id ? item : app));
      return [item, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apps;
    return apps.filter((app) =>
      [app.name, app.description, app.tags?.join(" ")]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [apps, search]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <TopBar onSearch={setSearch} onUpsert={handleUpsert} />

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 text-center">
          <p className="text-lg text-white/80">No apps match your search.</p>
          <p className="text-sm text-white/60">Add a new app to populate your dashboard.</p>
        </motion.div>
      ) : (
        <AppGrid apps={filtered} onEdit={handleUpsert} onDelete={handleDelete} />
      )}
    </main>
  );
}
