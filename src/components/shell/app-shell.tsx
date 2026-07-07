"use client";

import * as React from "react";

import { useUiPreference } from "@/components/providers/ui-preference-provider";
import { AppFooter } from "@/components/shell/app-footer";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { TopHeader } from "@/components/shell/top-header";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { preference, setPreference } = useUiPreference();
  const [collapsed, setCollapsed] = React.useState(false);
  const sidebarCollapsed = preference.sidebar === "collapsed" || (preference.sidebar === "auto" && collapsed);
  const handleCollapsedChange = React.useCallback(
    (nextCollapsed: boolean) => {
      if (preference.sidebar === "auto") {
        setCollapsed(nextCollapsed);
        return;
      }
      setPreference({ ...preference, sidebar: nextCollapsed ? "collapsed" : "expanded" });
    },
    [preference, setPreference],
  );

  return (
    <div className="min-h-dvh max-w-full overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-dvh min-w-0 max-w-full overflow-x-hidden">
        <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={handleCollapsedChange} />
        <div
          className={cn(
            "flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden transition-[margin] duration-200 ease-out",
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[264px]",
          )}
        >
          <TopHeader />
          <main className="min-w-0 max-w-full flex-1 overflow-x-hidden px-3 pb-6 md:px-6 md:pb-8">{children}</main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
