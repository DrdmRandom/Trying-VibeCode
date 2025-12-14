"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge, type BadgeProps } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { AddAppDialog } from "./add-app-dialog";
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
  onEdit: (item: AppItem) => void;
  onDelete: (id: string) => void;
};

export const AppTile = ({ app, enablePing = true, onEdit, onDelete }: AppTileProps) => {
  const [status, setStatus] = useState<Status>(enablePing ? "checking" : "unknown");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    <motion.div whileHover={{ y: -4 }} className="min-h-[300px] w-[260px] shrink-0">
      <Card className="group relative flex min-h-[300px] w-[260px] shrink-0 flex-col overflow-hidden border-white/10 bg-white/5">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
        <CardContent className="relative z-10 flex h-full min-w-0 flex-col gap-4 p-5">
          <div className="relative z-10 flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="w-11 h-11 aspect-square shrink-0 rounded-xl bg-white/10 grid place-items-center">
                {IconComponent ? (
                  <IconComponent className="w-6 h-6" />
                ) : (
                  <Image src={app.icon ?? ""} alt={app.name} fill sizes="44px" className="object-contain p-2" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="whitespace-normal break-words text-lg font-semibold leading-tight text-white">{app.name}</h3>
                {app.description && <p className="min-w-0 whitespace-normal break-words text-sm text-white/70">{app.description}</p>}
              </div>
            </div>
            <div className="relative z-10 flex shrink-0 items-start gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 opacity-0 transition hover:bg-white/10 group-hover:opacity-100 focus:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icons.MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setConfirmOpen(true)}
                    className="text-rose-200 focus:text-rose-200"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Badge variant={statusStyles[status].variant}>{statusStyles[status].label}</Badge>
            </div>
          </div>

          <div className="flex min-w-0 items-start justify-between gap-3 text-sm text-white/70">
            <span className="rounded-lg bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">{app.mode === "domain" ? "Domain" : "IP:Port"}</span>
            <span className="flex-1 text-right text-white/80 whitespace-normal break-all">
              {app.mode === "domain" ? app.domain : `${app.ip}:${app.port}`}
            </span>
          </div>

          {app.tags && app.tags.length > 0 && (
            <div className="flex min-w-0 flex-wrap gap-2">
              {app.tags.map((tag) => (
                <Badge key={tag} variant="default" className="bg-white/10 text-white/80 whitespace-normal break-all">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button asChild className="mt-auto w-full justify-center bg-white/20 text-white shadow-soft transition group-hover:bg-white/30">
            <a href={openUrl} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
        </CardContent>
      </Card>
      <AddAppDialog
        mode="edit"
        initialApp={app}
        onSubmit={(updated) => onEdit(updated)}
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={null}
      />
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this app?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {app.name} from your dashboard. You can add it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(app.id);
                setConfirmOpen(false);
              }}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
