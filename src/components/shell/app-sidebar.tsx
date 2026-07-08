"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/providers/role-provider";
import { getNavigationItemsForRole } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { NavigationChildItem } from "@/types";

function routeIsActive(route: string, pathname: string, currentRoute: string): boolean {
  if (route.includes("?")) {
    return currentRoute === route;
  }

  return pathname === route
    || (route !== "/" && pathname.startsWith(`${route}/`));
}

function childIsActive(child: NavigationChildItem, pathname: string, currentRoute: string): boolean {
  if (child.children?.length) {
    return routeIsActive(child.route, pathname, currentRoute) || child.children.some((nested) => childIsActive(nested, pathname, currentRoute));
  }

  return routeIsActive(child.route, pathname, currentRoute);
}

export function AppSidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.toString();
  const currentRoute = currentSearch ? `${pathname}?${currentSearch}` : pathname;
  const { role } = useRole();
  const visibleItems = getNavigationItemsForRole(role);
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  function renderChild(child: NavigationChildItem, depth = 0) {
    const hasNestedChildren = Boolean(child.children?.length);
    const active = childIsActive(child, pathname, currentRoute);

    if (hasNestedChildren) {
      return (
        <details open={active || undefined} key={child.id}>
          <summary
            className={cn(
              "group flex min-h-9 w-full cursor-pointer list-none items-center rounded-xl px-3 py-2 text-xs font-semibold outline-none transition duration-150 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden",
              depth > 0 && "text-[11px]",
              active && "bg-primary/10 text-primary ring-1 ring-primary/15",
            )}
          >
            <span className="min-w-0 flex-1 truncate text-left">{child.label}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 transition group-open:rotate-180" />
          </summary>
          <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-2">
            {child.children?.map((nested) => renderChild(nested, depth + 1))}
          </div>
        </details>
      );
    }

    return (
      <Link
        className={cn(
          "flex min-h-9 items-center rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 outline-none transition duration-150 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
          active && "bg-primary text-white shadow-[0_8px_18px_hsl(var(--primary)/0.18)] hover:bg-primary hover:text-white",
        )}
        href={child.route}
        key={child.id}
      >
        <span className="min-w-0 flex-1 truncate">{child.label}</span>
        {child.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 border-r border-border bg-white text-slate-900 shadow-[1px_0_2px_hsl(var(--shadow-color)/0.06)] transition-all duration-150 lg:sticky lg:top-0 lg:z-50 lg:flex lg:flex-col",
        collapsed ? "w-[76px]" : "w-[286px]",
      )}
    >
      <div className={cn("border-b border-border bg-white", collapsed ? "p-3" : "px-3 py-4")}>
        <div className={cn("flex items-center bg-white", collapsed ? "h-14 justify-center overflow-hidden" : "h-[96px] justify-start")}>
          <Image
            alt="Plasmit Healthcare IT Vector"
            className={cn("object-contain", collapsed ? "h-14 w-14 object-left" : "h-full w-full object-left")}
            height={352}
            priority
            src="/plasmit-sidebar-logo.webp"
            width={792}
          />
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div className="mb-5" key={group}>
            {!collapsed ? <div className="px-3 pb-2 text-[10px] font-bold uppercase text-muted-foreground">{group}</div> : null}
            <div className="space-y-1.5">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const childActive = item.children?.some((child) => childIsActive(child, pathname, currentRoute)) ?? false;
                  const active = pathname === item.route || childActive || (item.route !== "/dashboard" && pathname.startsWith(`${item.route}/`));

                  if (hasChildren && !collapsed) {
                    return (
                      <details open={active || undefined} key={item.id}>
                        <summary
                          className={cn(
                            "group flex min-h-11 w-full cursor-pointer list-none items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 outline-none transition duration-150 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden",
                            active && "bg-primary text-white shadow-[0_8px_18px_hsl(var(--primary)/0.18)] hover:bg-primary hover:text-white",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                        </summary>
                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-2">
                          {item.children?.map((child) => renderChild(child))}
                        </div>
                      </details>
                    );
                  }

                  return (
                    <Link
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 outline-none transition duration-150 hover:bg-primary/5 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
                        active && "bg-primary text-white shadow-[0_8px_18px_hsl(var(--primary)/0.18)] hover:bg-primary hover:text-white",
                        collapsed && "justify-center",
                      )}
                      href={item.route}
                      key={item.id}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                      {!collapsed && item.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
                      {!collapsed && hasChildren ? <ChevronDown className="h-4 w-4 shrink-0" /> : null}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          className={cn("w-full border-border bg-white text-slate-600 hover:bg-primary/5 hover:text-primary", collapsed && "px-0")}
          onClick={() => onCollapsedChange(!collapsed)}
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? "Collapse" : null}
        </Button>
      </div>
    </aside>
  );
}
