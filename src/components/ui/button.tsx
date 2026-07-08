import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans text-sm font-semibold outline-none transition-all duration-150 ease-[ease] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_8px_18px_hsl(var(--primary)/0.18)] hover:bg-[#495cf0] hover:shadow-[0_9px_20px_hsl(var(--primary)/0.24)] active:bg-[#4050df]",
        secondary: "border border-border bg-white text-slate-700 shadow-sm hover:bg-surface-muted active:bg-slate-100",
        outline: "border border-border bg-white text-slate-700 shadow-sm hover:bg-surface-muted active:bg-slate-100",
        ghost: "bg-transparent text-slate-700 hover:bg-surface-muted active:bg-slate-100",
        danger: "bg-danger text-danger-foreground shadow-sm hover:bg-red-600",
        success: "bg-success text-success-foreground shadow-sm hover:bg-green-600",
      },
      size: {
        sm: "h-[var(--density-control-height-sm)] px-4",
        md: "h-[var(--density-control-height)] px-4",
        lg: "h-[var(--density-control-height-lg)] px-5",
        icon: "h-[var(--density-control-height)] w-[var(--density-control-height)] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, loading = false, loadingText, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;
    return (
      <Comp
        aria-busy={loading || undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        data-loading={loading || undefined}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {loading && loadingText ? loadingText : children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
