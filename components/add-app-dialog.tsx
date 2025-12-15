"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AppItem } from "../lib/types";
import { cn } from "../lib/utils";

const iconOptions = [
  "Server",
  "Clapperboard",
  "Folder",
  "Fish",
  "Radio",
  "Cpu",
  "Network",
  "HardDrive",
  "Satellite",
  "Camera",
  "Flame",
  "Brain",
  "Database",
  "Terminal",
  "Globe",
];

const appSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().optional(),
    mode: z.enum(["domain", "ipport"]),
    domain: z.string().optional(),
    ip: z.string().optional(),
    port: z.any().optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "domain") {
      if (!data.domain || data.domain.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["domain"], message: "Domain is required" });
      } else if (!/^https?:\/\/.+/.test(data.domain.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["domain"], message: "Domain must include http/https" });
      }
      return;
    }

    if (!data.ip || data.ip.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ip"], message: "IP or hostname is required" });
    } else if (!/^[\w.-]+$/.test(data.ip.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ip"], message: "Use a valid IP or hostname" });
    }

    const portNumber =
      typeof data.port === "number"
        ? data.port
        : typeof data.port === "string" && data.port.trim().length > 0
        ? Number(data.port)
        : undefined;

    if (portNumber === undefined || Number.isNaN(portNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["port"], message: "Port is required" });
    } else if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["port"], message: "Port must be 1-65535" });
    }
  });

type AddAppDialogProps = {
  mode?: "add" | "edit";
  initialApp?: AppItem;
  onSubmit: (item: AppItem) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

export const AddAppDialog = ({ mode: dialogMode = "add", initialApp, onSubmit, open, onOpenChange, trigger }: AddAppDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<"domain" | "ipport">(initialApp?.mode ?? "domain");
  const [form, setForm] = useState({
    name: "",
    icon: iconOptions[0],
    domain: "https://",
    ip: "",
    port: "",
    description: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (!dialogOpen) {
      setErrors({});
      setSuccessMessage(null);
      setSubmitError(null);
      return;
    }
    if (initialApp && dialogMode === "edit") {
      setMode(initialApp.mode);
      setForm({
        name: initialApp.name ?? "",
        icon: initialApp.icon ?? iconOptions[0],
        domain: initialApp.domain ?? "https://",
        ip: initialApp.ip ?? "",
        port: initialApp.port ? String(initialApp.port) : "",
        description: initialApp.description ?? "",
        tags: initialApp.tags?.join(", ") ?? "",
      });
    } else {
      setMode("domain");
      setForm({ name: "", icon: iconOptions[0], domain: "https://", ip: "", port: "", description: "", tags: "" });
    }
  }, [dialogOpen, initialApp, dialogMode]);

  const tagList = useMemo(() =>
    form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  [form.tags]);

  const handleSubmit = () => {
    setSubmitError(null);
    setSuccessMessage(null);
    const parsed = appSchema.safeParse({ ...form, mode });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        map[key ?? "form"] = issue.message;
      });
      setErrors(map);
      const hasVisibleErrors =
        mode === "domain"
          ? Boolean(map.name || map.domain)
          : Boolean(map.name || map.ip || map.port);
      setSubmitError(hasVisibleErrors ? "Please correct the highlighted fields." : null);
      return;
    }

    const data = parsed.data;
    const normalizedPort =
      typeof data.port === "number"
        ? data.port
        : typeof data.port === "string" && data.port.trim().length > 0
        ? Number(data.port)
        : undefined;
    const newItem: AppItem = {
      id: dialogMode === "edit" && initialApp ? initialApp.id : crypto.randomUUID(),
      name: data.name.trim(),
      icon: data.icon || undefined,
      mode,
      domain: mode === "domain" ? data.domain?.trim() : undefined,
      ip: mode === "ipport" ? data.ip?.trim() : undefined,
      port: mode === "ipport" ? normalizedPort : undefined,
      description: data.description?.trim() || undefined,
      tags: tagList,
      createdAt: dialogMode === "edit" && initialApp ? initialApp.createdAt : Date.now(),
    };
    try {
      onSubmit(newItem);
      setErrors({});
      setSuccessMessage(dialogMode === "edit" ? "Changes saved successfully." : "App added successfully.");
    } catch (err) {
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger === undefined ? (
        <DialogTrigger asChild>
          <Button className="h-10 gap-2 px-4 whitespace-nowrap" size="default">
            <Plus className="h-4 w-4" /> Add App
          </Button>
        </DialogTrigger>
      ) : trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogMode === "edit" ? "Edit App" : "Add a new app"}</DialogTitle>
          <DialogDescription>
            {dialogMode === "edit" ? "Update the details for this launcher tile." : "Fill in the details to add a launcher tile."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Jellyfin" />
            {errors.name && <p className="text-sm text-rose-200">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForm((s) => ({ ...s, icon: opt }))}
                  className={cn(
                    "rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:border-white/40",
                    form.icon === opt && "bg-white/15 border-white/40 text-white"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or paste an image URL"
              value={form.icon}
              onChange={(e) => setForm((s) => ({ ...s, icon: e.target.value }))}
              className="mt-2"
            />
          </div>

          <div className="space-y-1">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(
                [
                  { value: "domain", label: "Domain (https://)" },
                  { value: "ipport", label: "IP + Port" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setMode(opt.value);
                    if (opt.value === "domain") {
                      setForm((s) => ({ ...s, ip: "", port: "" }));
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.ip;
                        delete next.port;
                        return next;
                      });
                      setSubmitError(null);
                    } else {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.domain;
                        return next;
                      });
                      setSubmitError(null);
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/40",
                    mode === opt.value && "bg-white/15 border-white/40 text-white"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "domain" ? (
            <div className="space-y-1">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="https://jf.example.com"
                value={form.domain}
                onChange={(e) => setForm((s) => ({ ...s, domain: e.target.value }))}
              />
              {errors.domain && <p className="text-sm text-rose-200">{errors.domain}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ip">IP / Hostname</Label>
                <Input id="ip" placeholder="192.168.1.10" value={form.ip} onChange={(e) => setForm((s) => ({ ...s, ip: e.target.value }))} />
                {errors.ip && <p className="text-sm text-rose-200">{errors.ip}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="port">Port</Label>
                <Input id="port" placeholder="8080" value={form.port} onChange={(e) => setForm((s) => ({ ...s, port: e.target.value }))} />
                {errors.port && <p className="text-sm text-rose-200">{errors.port}</p>}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional short blurb"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tags">Tags / Category</Label>
            <Input id="tags" placeholder="media, automation" value={form.tags} onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))} />
          </div>

          {successMessage && <p className="text-sm text-emerald-300">{successMessage}</p>}
          {submitError && <p className="text-sm text-rose-200">{submitError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>{dialogMode === "edit" ? "Save Changes" : "Add"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
