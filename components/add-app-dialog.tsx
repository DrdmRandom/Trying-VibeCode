"use client";

import { useEffect, useMemo, useState } from "react";
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
    port: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().min(1).max(65535)).optional(),
    description: z.string().optional(),
    tags: z.string().optional(),
  })
  .refine((data) => (data.mode === "domain" ? !!data.domain : !!data.ip && !!data.port), {
    message: "Provide required fields for the selected type",
  })
  .refine((data) => (data.mode === "domain" && data.domain ? /^https?:\/\/.+/.test(data.domain) : true), {
    message: "Domain must include http/https",
    path: ["domain"],
  })
  .refine((data) => (data.mode === "ipport" && data.ip ? /^[\w.-]+$/.test(data.ip) : true), {
    message: "Use a valid IP or hostname",
    path: ["ip"],
  });

type AddAppDialogProps = {
  onAdd: (item: AppItem) => void;
};

export const AddAppDialog = ({ onAdd }: AddAppDialogProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"domain" | "ipport">("domain");
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

  useEffect(() => {
    if (!open) {
      setForm({ name: "", icon: iconOptions[0], domain: "https://", ip: "", port: "", description: "", tags: "" });
      setErrors({});
      setMode("domain");
    }
  }, [open]);

  const tagList = useMemo(() =>
    form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  [form.tags]);

  const handleSubmit = () => {
    const parsed = appSchema.safeParse({ ...form, mode });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        map[key ?? "form"] = issue.message;
      });
      setErrors(map);
      return;
    }

    const data = parsed.data;
    const newItem: AppItem = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      icon: data.icon || undefined,
      mode,
      domain: mode === "domain" ? data.domain?.trim() : undefined,
      ip: mode === "ipport" ? data.ip?.trim() : undefined,
      port: mode === "ipport" ? data.port : undefined,
      description: data.description?.trim() || undefined,
      tags: tagList,
      createdAt: Date.now(),
    };
    onAdd(newItem);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Plus className="h-4 w-4" /> Add App
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new app</DialogTitle>
          <DialogDescription>Fill in the details to add a launcher tile.</DialogDescription>
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
                  onClick={() => setMode(opt.value)}
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

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
