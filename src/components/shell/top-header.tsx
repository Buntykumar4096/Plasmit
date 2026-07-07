"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";

import { CommandSearch } from "@/components/shell/command-search";
import { MobileNavigation } from "@/components/shell/mobile-navigation";
import { ProfileMenu } from "@/components/shell/profile-menu";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { hospitalContext } from "@/data/mock";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-1 border-b border-header-border bg-white px-2 shadow-[0_1px_0_rgba(229,227,236,0.7)] sm:gap-2 md:px-4">
      <MobileNavigation />
      <div className="min-w-0 flex-1">
        <Image
          src="/plasmit-sidebar-logo.webp"
          alt="Plasmit Healthcare IT Vector"
          width={150}
          height={61}
          priority
          className="h-8 w-[112px] max-w-[34vw] object-contain object-left lg:hidden"
        />
        <div className="hidden items-center gap-2 text-sm font-bold text-foreground lg:flex">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{hospitalContext.name}</span>
          <span className="hidden text-muted-foreground sm:inline">/ {hospitalContext.branch}</span>
        </div>
        <div className="hidden text-xs text-muted-foreground md:block">{hospitalContext.department} • {hospitalContext.shift}</div>
      </div>
      <CommandSearch />
      <RoleSwitcher className="hidden sm:flex" />
      <ProfileMenu />
    </header>
  );
}
