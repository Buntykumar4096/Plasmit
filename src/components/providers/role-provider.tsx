"use client";

import * as React from "react";

import { roles } from "@/data/navigation";
import type { Role } from "@/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

const DEFAULT_ROLE: Role = "Hospital Admin";
const ROLE_STORAGE_KEY = "plasmit-role";
const ROLE_CHANGE_EVENT = "plasmit-role-change";

function readRole(): Role {
  if (typeof window === "undefined") {
    return DEFAULT_ROLE;
  }

  const saved = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return saved && roles.includes(saved as Role) ? (saved as Role) : DEFAULT_ROLE;
}

function subscribeRole(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ROLE_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ROLE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ROLE_CHANGE_EVENT, onStoreChange);
  };
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const role = React.useSyncExternalStore(subscribeRole, readRole, () => DEFAULT_ROLE);

  const setRole = React.useCallback((nextRole: Role) => {
    window.localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
    window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
  }, []);

  const value = React.useMemo(
    () => ({ role, setRole, roles }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}
