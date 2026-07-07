export function AppFooter() {
  return (
    <footer className="mt-8 border-t border-border px-4 py-3 text-xs text-muted-foreground md:px-6" data-print-hidden="true">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-foreground">Plasmit HMS</span>
          <span>v0.1.0</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Secure hospital operations</span>
        </div>
      </div>
    </footer>
  );
}
