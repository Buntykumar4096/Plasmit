import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { StatusTone } from "@/types";

export function StatCard({
  label,
  value,
  change,
  context,
  tone,
  icon: Icon,
  currency,
}: {
  label: string;
  value: number;
  change: string;
  context: string;
  tone: StatusTone;
  icon: LucideIcon;
  currency?: boolean;
}) {
  return (
    <Card className="relative flex min-h-[104px] flex-col items-center justify-center p-3 text-center md:min-h-[132px] md:p-4">
      <div className="absolute left-3 top-3 md:left-4 md:top-4">
        <div className="rounded-[8px] border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="min-w-0 px-8">
        <div className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {currency ? formatCurrency(value) : formatCompactNumber(value)}
        </div>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3 flex min-w-0 flex-col items-center justify-center gap-2 md:mt-4">
        <StatusPill tone={tone}>{change}</StatusPill>
        <span className="max-w-full truncate text-xs text-muted-foreground">{context}</span>
      </div>
    </Card>
  );
}
