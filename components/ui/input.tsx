import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/60 shadow-inner shadow-black/20 focus:border-white/30 focus:outline-none",
        className
      )}
      {...props}
    />
  );
};
