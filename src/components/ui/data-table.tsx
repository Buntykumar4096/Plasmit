"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

export function DataTable<TData>({
  columns,
  data,
  loading,
  className,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  className?: string;
}) {
  // TanStack Table intentionally returns table helpers that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-white p-3 shadow-soft">
        <Skeleton className="h-8 w-full" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="h-[var(--density-control-height-lg)] w-full" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState icon={SearchX} title="No records found" description="Adjust filters or search another term to continue." />;
  }

  return (
    <div className={cn("min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-white shadow-soft", className)}>
      <div className="grid gap-px bg-border md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div className="min-w-0 bg-white p-3" key={row.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
              {row.getVisibleCells().map((cell) => {
                const header = cell.column.columnDef.header;
                const label = typeof header === "string" ? header : cell.column.id;

                return (
                  <div className="min-w-0" key={cell.id}>
                    <div className="mb-0.5 truncate font-semibold text-muted-foreground">{label}</div>
                    <div className="min-w-0 break-words font-medium text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden max-w-full overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="border-b border-border/80 px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]" key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr className="border-b border-border/70 last:border-0 hover:bg-surface-muted/80" key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] align-middle text-foreground" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 bg-white px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] text-xs text-muted-foreground">
        <span>{data.length} static records • Page 1 of 1</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
