"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useRole } from "@/components/providers/role-provider";
import { icuCommandSwitcherRoles } from "@/data/navigation";
import { getNursingRolePermission } from "@/data/icu-nursing-role-permissions";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const roleLandingRoutes: Partial<Record<Role, string>> = {
  "Doctor ICU": "/icu-command-center/critical-care/clinical-alerts",
  "ICU Bed Coordinator": "/icu-command-center/patients/search",
  "Diagnostics Team": "/icu-command-center/diagnostics/hub",
  "Tele ICU Doctor": "/icu-command-center/tele-icu/remote-command-center",
  "Biomedical Engineer": "/icu-command-center/critical-care/device-monitoring",
  "ICU Pharmacist": "/icu-command-center/notifications-tasks",
  "Quality Audit": "/icu-command-center/executive-dashboard",
};

function roleLandingRoute(role: Role) {
  return getNursingRolePermission(role)?.defaultRoute ?? roleLandingRoutes[role] ?? "/dashboard";
}

export function RoleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, roles } = useRole();
  const selectableRoles = pathname.startsWith("/icu-command-center") ? icuCommandSwitcherRoles : roles;

  return (
    <Select.Root value={role} onValueChange={(value) => {
      const nextRole = value as typeof role;
      setRole(nextRole);
      router.push(roleLandingRoute(nextRole));
    }}>
      <Select.Trigger
        className={cn(
          "flex h-11 w-36 min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition duration-150 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:ring-4 focus:ring-sky-100 md:w-44",
          className,
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-[80] max-h-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
          <Select.Viewport className="p-1">
            {selectableRoles.map((item) => (
              <Select.Item
                className="cursor-pointer rounded-lg px-2 py-2 text-sm text-slate-700 outline-none hover:bg-sky-50 focus:bg-sky-50 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                key={item}
                value={item}
              >
                <Select.ItemText>{item}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
