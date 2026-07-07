"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/providers/role-provider";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { NavigationChildItem } from "@/types";

export function AppSidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useRole();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const visibleItems = navigationItems.filter((item) => item.allowedRoles.includes(role));
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));
  const currentRoute = pathname;

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 border-r border-border bg-white text-sidebar-foreground shadow-sm transition-all lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[264px]",
      )}
    >
      <div className={cn("flex h-20 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-start")}>
        {collapsed ? (
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <Image
              src="/plasmit-sidebar-logo.webp"
              alt="Plasmit Healthcare IT Vector"
              width={110}
              height={44}
              priority
              className="h-9 w-[90px] max-w-none -translate-x-1 object-contain object-left"
            />
          </div>
        ) : (
          <Image
            src="/plasmit-sidebar-logo.webp"
            alt="Plasmit Healthcare IT Vector"
            width={220}
            height={89}
            priority
            className="h-auto w-[220px] object-contain"
          />
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => (
          <div className="mb-4" key={group}>
            {!collapsed ? <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/55">{group}</div> : null}
            <div className="space-y-1">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const childActive = item.children?.some((child) => isNavigationTreeActive(child, currentRoute)) ?? false;
                  const active = pathname === item.route || childActive || (item.route !== "/dashboard" && pathname.startsWith(`${item.route}/`));
                  const expanded = openItems[item.id] ?? active;
                  const neuroIcu = item.id === "neuro-icu";

                  if (hasChildren && !collapsed) {
                    return (
                      <div key={item.id}>
                        <button
                          className={cn(
                            "group flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
                            active && "bg-sidebar-active text-sidebar-active-foreground shadow-sm hover:bg-sidebar-active hover:text-sidebar-active-foreground",
                            neuroIcu && !active && "hover:bg-primary-soft hover:text-primary",
                          )}
                          onClick={() => {
                            if (item.id === "notes" || item.id === "diagnostic-hub") router.push(item.route);
                            setOpenItems((current) => ({ ...current, [item.id]: !expanded }));
                          }}
                          type="button"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 transition", expanded && "rotate-180")} />
                        </button>
                        {expanded ? (
                          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                            {item.children?.map((child) => (
                              <SidebarChildItem currentRoute={currentRoute} item={child} key={child.id} neuroIcu={neuroIcu} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  return (
                    <Link
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
                        active && "bg-sidebar-active text-sidebar-active-foreground shadow-sm hover:bg-sidebar-active hover:text-sidebar-active-foreground",
                        neuroIcu && !active && "hover:bg-primary-soft hover:text-primary",
                        collapsed && "justify-center",
                      )}
                      href={item.route}
                      key={item.id}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                      {!collapsed && item.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2.5">
        <Button
          className={cn("w-full", collapsed && "px-0")}
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

function SidebarChildItem({
  currentRoute,
  item,
  neuroIcu,
}: {
  currentRoute: string;
  item: NavigationChildItem;
  neuroIcu: boolean;
}) {
  const active = isNavigationTreeActive(item, currentRoute);
  const exactActive = currentRoute === routePathname(item.route);
  const [open, setOpen] = useState(active);

  if (item.children?.length) {
    return (
      <div>
        <div
          className={cn(
            "flex min-h-8 w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
            active && "text-primary",
            neuroIcu && "hover:bg-primary-soft hover:text-primary",
            neuroIcu && active && "text-primary",
          )}
        >
          <Link className="min-w-0 flex-1 truncate" href={item.route}>
            {item.label}
          </Link>
          <button
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}
            className="rounded p-1 outline-none hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-ring/25"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            <ChevronDown className={cn("h-3 w-3 shrink-0 transition", open && "rotate-180")} />
          </button>
        </div>
        {open ? (
          <div className="ml-2 space-y-0.5 border-l border-border pl-2">
            {item.children.map((child) => (
              <SidebarChildItem currentRoute={currentRoute} item={child} key={child.id} neuroIcu={neuroIcu} />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      className={cn(
        "flex min-h-8 items-center rounded-md px-2 py-1.5 text-xs font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
        exactActive && "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
        neuroIcu && "hover:bg-primary-soft hover:text-primary",
        neuroIcu && exactActive && "bg-primary-soft text-primary shadow-[inset_2px_0_0_hsl(var(--primary))]",
      )}
      href={item.route}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
    </Link>
  );
}

function isNavigationTreeActive(item: NavigationChildItem, currentRoute: string): boolean {
  return currentRoute === routePathname(item.route) || Boolean(item.children?.some((child) => isNavigationTreeActive(child, currentRoute)));
}

function routePathname(route: string) {
  return route.split("?")[0];
}
