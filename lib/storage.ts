"use client";

import { AppItem } from "./types";

const STORAGE_KEY = "homelab_apps";

const seedApps: AppItem[] = [
  {
    id: crypto.randomUUID(),
    name: "Jellyfin",
    icon: "Clapperboard",
    mode: "domain",
    domain: "https://media.example.com",
    description: "Stream movies and shows",
    tags: ["media"],
    createdAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Seafile",
    icon: "Folder",
    mode: "domain",
    domain: "https://files.example.com",
    description: "Private file sync",
    tags: ["storage"],
    createdAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "AI Fish Detection System",
    icon: "Fish",
    mode: "ipport",
    ip: "192.168.1.150",
    port: 8080,
    description: "Camera AI monitor",
    tags: ["ai", "vision"],
    createdAt: Date.now(),
  },
];

function safeParse(): AppItem[] | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AppItem[];
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error("Failed to parse storage", e);
    return null;
  }
}

export function loadApps(): AppItem[] {
  if (typeof window === "undefined") return [];
  const stored = safeParse();
  if (!stored) {
    saveApps(seedApps);
    return seedApps;
  }
  return stored;
}

export function saveApps(apps: AppItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}
