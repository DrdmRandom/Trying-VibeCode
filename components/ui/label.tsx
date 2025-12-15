import { cn } from "../../lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, ...props }: LabelProps) => (
  <label className={cn("text-sm font-medium text-white/80", className)} {...props} />
);
