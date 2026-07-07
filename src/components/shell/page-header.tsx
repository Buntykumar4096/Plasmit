import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  metrics,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  metrics?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative -mx-3 border-b border-border bg-background px-3 py-4 md:-mx-6 md:px-6 md:py-5", className)}>
      <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-full">
          {eyebrow ? <div className="mb-1 text-xs font-bold text-primary">{eyebrow}</div> : null}
          <h1 className="break-words text-xl font-bold tracking-tight text-foreground md:truncate md:text-2xl">{title}</h1>
          {description ? <p className="mt-1 max-w-full break-words text-xs font-medium leading-5 text-muted-foreground md:mt-1.5 md:text-sm md:leading-6 lg:max-w-3xl">{description}</p> : null}
        </div>
        {actions ? <div className="flex min-w-0 flex-wrap items-center gap-2 [&>*]:min-w-0">{actions}</div> : null}
      </div>
      {metrics ? <div className="mt-3">{metrics}</div> : null}
    </div>
  );
}
