import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[var(--density-control-height)] w-full rounded-xl border border-input bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition duration-150 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
