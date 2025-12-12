import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  const styles: Record<typeof variant, string> = {
    default: "bg-white/15 text-white border border-white/15",
    success: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
    warning: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
    destructive: "bg-rose-500/20 text-rose-100 border border-rose-400/40",
  };
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", styles[variant], className)} {...props} />;
};
