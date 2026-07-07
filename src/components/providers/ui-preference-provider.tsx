"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  defaultPreference,
  themePresets,
  uiPreferenceStorageKey,
} from "@/config/theme";
import type { UiPreference } from "@/types";

type UiPreferenceContextValue = {
  preference: UiPreference;
  setPreference: (preference: UiPreference) => void;
  resetPreference: () => void;
  applyPrimaryColor: (preference: UiPreference) => void;
};

const UiPreferenceContext = React.createContext<UiPreferenceContextValue | null>(null);
const preferenceChangeEvent = "plasmit-ui-preference-change";
let cachedPreferenceRaw: string | null | undefined;
let cachedPreferenceValue: UiPreference = defaultPreference;

function readPreference(): UiPreference {
  if (typeof window === "undefined") return defaultPreference;
  const raw = window.localStorage.getItem(uiPreferenceStorageKey);
  if (raw === cachedPreferenceRaw) return cachedPreferenceValue;
  cachedPreferenceRaw = raw;
  if (!raw) {
    cachedPreferenceValue = defaultPreference;
    return cachedPreferenceValue;
  }
  try {
    const parsed = JSON.parse(raw) as UiPreference;
    cachedPreferenceValue = parsed.version === 1 ? { ...defaultPreference, ...parsed } : defaultPreference;
    return cachedPreferenceValue;
  } catch {
    cachedPreferenceValue = defaultPreference;
    return defaultPreference;
  }
}

function subscribePreference(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferenceChangeEvent, callback);
  };
}

function applyPrimaryVariables(preference: UiPreference) {
  const root = document.documentElement;
  const hsl = themePresets[0].hsl;
  const foreground = themePresets[0].foreground;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--primary-foreground", foreground);
  root.style.setProperty("--primary-soft", themePresets[0].soft);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--sidebar-active", hsl);
  root.style.setProperty("--sidebar-active-foreground", foreground);
  root.dataset.density = preference.density;
}

export function UiPreferenceProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  const preference = React.useSyncExternalStore(subscribePreference, readPreference, () => defaultPreference);

  React.useEffect(() => {
    setTheme(preference.mode);
    applyPrimaryVariables(preference);
  }, [preference, setTheme]);

  const setPreference = React.useCallback(
    (nextPreference: UiPreference) => {
      const normalizedPreference = { ...nextPreference, version: 1 as const };
      cachedPreferenceValue = normalizedPreference;
      cachedPreferenceRaw = JSON.stringify(normalizedPreference);
      window.localStorage.setItem(uiPreferenceStorageKey, cachedPreferenceRaw);
      setTheme(normalizedPreference.mode);
      applyPrimaryVariables(normalizedPreference);
      window.dispatchEvent(new Event(preferenceChangeEvent));
    },
    [setTheme],
  );

  const resetPreference = React.useCallback(() => {
    setPreference(defaultPreference);
  }, [setPreference]);

  const value = React.useMemo(
    () => ({
      preference,
      setPreference,
      resetPreference,
      applyPrimaryColor: applyPrimaryVariables,
    }),
    [preference, resetPreference, setPreference],
  );

  return <UiPreferenceContext.Provider value={value}>{children}</UiPreferenceContext.Provider>;
}

export function useUiPreference() {
  const context = React.useContext(UiPreferenceContext);
  if (!context) {
    throw new Error("useUiPreference must be used inside UiPreferenceProvider");
  }
  return context;
}
