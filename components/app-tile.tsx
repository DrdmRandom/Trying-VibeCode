"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge, type BadgeProps } from "./ui/badge";
import { Button } from "./ui/button";
import { AppItem } from "../lib/types";

type Status = "checking" | "online" | "offline" | "unknown";

const statusStyles: Record<Status, { label: string; variant: BadgeProps["variant"] }> = {
  checking: { label: "Checking", variant: "default" },
  online: { label: "Online", variant: "success" },
  offline: { label: "Offline", variant: "destructive" },
  unknown: { label: "Unknown", variant: "warning" },
};

type AppTileProps = {
  app: AppItem;
  enablePing?: boolean;
};

export const AppTile = ({ app, enablePing = true }: AppTileProps) => {
  const [status, setStatus] = useState<Status>(enablePing ? "checking" : "unknown");

  const targetUrl = useMemo(() => {
    if (app.mode === "domain") return app.domain ?? "";
    const port = app.port ? `:${app.port}` : "";
    return `http://${app.ip}${port}`;
  }, [app]);

  useEffect(() => {
    if (!enablePing || !targetUrl) {
      setStatus("unknown");
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      try {
        const res = await fetch(`/api/ping?url=${encodeURIComponent(targetUrl)}`, { signal: controller.signal });
        const data = await res.json();
        if (data.online) setStatus("online");
        else if (data.error?.includes("cors")) setStatus("unknown");
        else setStatus("offline");
      } catch (e) {
        setStatus("unknown");
      }
    };
    run();
    const interval = setInterval(run, 60_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [enablePing, targetUrl]);

  const IconComponent = useMemo(() => {
    if (!app.icon) return Icons.AppWindow;
    if (/^https?:\/\//.test(app.icon)) return null;
    const maybe = Icons[app.icon as keyof typeof Icons];
    return maybe ?? Icons.AppWindow;
  }, [app.icon]);

  const openUrl = targetUrl || "#";

  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="group flex h-full flex-col justify-between border-white/10 bg-white/5">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-100 shadow-inner shadow-black/20">
                {IconComponent ? (
                  <IconComponent className="h-6 w-6" />
                ) : (
                  <img src={app.icon} alt={app.name} className="h-10 w-10 rounded-xl object-cover" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                {app.description && <p className="text-sm text-white/70">{app.description}</p>}
              </div>
            </div>
            <Badge variant={statusStyles[status].variant}>{statusStyles[status].label}</Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span className="rounded-lg bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">{app.mode === "domain" ? "Domain" : "IP:Port"}</span>
            <span className="truncate text-right text-white/80">
              {app.mode === "domain" ? app.domain : `${app.ip}:${app.port}`}
            </span>
          </div>

          {app.tags && app.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {app.tags.map((tag) => (
                <Badge key={tag} variant="default" className="bg-white/10 text-white/80">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button asChild className="w-full justify-center bg-white/20 text-white shadow-soft transition group-hover:bg-white/30">
            <a href={openUrl} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
