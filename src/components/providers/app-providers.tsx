"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { RoleProvider } from "@/components/providers/role-provider";
import { UiPreferenceProvider } from "@/components/providers/ui-preference-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme-preference"
    >
      <UiPreferenceProvider>
        <RoleProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </RoleProvider>
      </UiPreferenceProvider>
    </ThemeProvider>
  );
}
