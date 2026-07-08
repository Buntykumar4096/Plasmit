import type { NavigationChildItem, Role } from "@/types";

export type NursingRoleKey = "HEAD_NURSE" | "UNIT_NURSE" | "WARD_NURSE";

export type NursingRolePermission = {
  role: Extract<Role, "Head Nurse" | "Unit Nurse" | "Ward Nurse">;
  defaultRoute: string;
  routes: string[];
  patientTabs: string[];
  navigation: NavigationChildItem[];
};

function navChild(id: string, label: string, route: string, children?: NavigationChildItem[]): NavigationChildItem {
  return { id, label, route, status: "ready", children };
}

export const nursingRolePermissions: Record<NursingRoleKey, NursingRolePermission> = {
  HEAD_NURSE: {
    role: "Head Nurse",
    defaultRoute: "/icu-command-center/nursing/station",
    routes: [
      "/icu-command-center/nursing/station",
      "/icu-command-center/patients/admissions",
      "/icu-command-center/patients/smart-bed-view",
      "/icu-command-center/patients/discharges",
      "/icu-command-center/notifications-tasks",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/critical-care/escalation-center",
      "/icu-command-center/analytics/clinical",
      "/icu-command-center/analytics/operational",
      "/icu-command-center/administration/audit-logs",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "results", "events"],
    navigation: [
      navChild("head-nurse-nursing", "Nursing Command", "/icu-command-center/nursing/station", [
        navChild("head-nurse-overview", "Nursing Dashboard", "/icu-command-center/nursing/station"),
        navChild("head-nurse-admissions", "New Admission Queue", "/icu-command-center/patients/admissions"),
        navChild("head-nurse-units", "Unit & Staff Availability", "/icu-command-center/patients/smart-bed-view"),
        navChild("head-nurse-handover-review", "Handover Verification", "/icu-command-center/nursing/shift-handover?view=summary"),
      ]),
      navChild("head-nurse-control", "Control & Audit", "/icu-command-center/notifications-tasks", [
        navChild("head-nurse-pending", "Pending Critical Items", "/icu-command-center/notifications-tasks"),
        navChild("head-nurse-escalation", "Escalation Oversight", "/icu-command-center/critical-care/escalation-center"),
        navChild("head-nurse-discharges", "Final Review / Closure", "/icu-command-center/patients/discharges"),
      ]),
      navChild("head-nurse-reports", "Reports", "/icu-command-center/analytics/clinical", [
        navChild("head-nurse-quality", "Quality Audit", "/icu-command-center/analytics/clinical"),
        navChild("head-nurse-operations", "Nursing Reports", "/icu-command-center/analytics/operational"),
        navChild("head-nurse-audit", "Audit Logs", "/icu-command-center/administration/audit-logs"),
      ]),
    ],
  },
  UNIT_NURSE: {
    role: "Unit Nurse",
    defaultRoute: "/icu-command-center/nursing/assigned-patients",
    routes: [
      "/icu-command-center/nursing/station",
      "/icu-command-center/nursing/assigned-patients",
      "/icu-command-center/patients/smart-bed-view",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/critical-care/clinical-alerts",
      "/icu-command-center/critical-care/escalation-center",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "monitoring", "orders", "results", "events"],
    navigation: [
      navChild("unit-nurse-assigned", "Assigned Patients", "/icu-command-center/nursing/assigned-patients"),
    ],
  },
  WARD_NURSE: {
    role: "Ward Nurse",
    defaultRoute: "/icu-command-center/clinical-workspace/patient-overview",
    routes: [
      "/icu-command-center/clinical-workspace/patient-overview",
      "/icu-command-center/nursing/nurse-entry",
      "/icu-command-center/nursing/medication-administration",
      "/icu-command-center/nursing/early-warning-score",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/nursing/tasks-assessments",
      "/icu-command-center/patients/*",
    ],
    patientTabs: ["overview", "monitoring", "orders", "events", "collaborate"],
    navigation: [
      navChild("ward-nurse-patients", "My Patients", "/icu-command-center/clinical-workspace/patient-overview", [
        navChild("ward-nurse-assigned", "My Assigned Patients", "/icu-command-center/clinical-workspace/patient-overview"),
      ]),
      navChild("ward-nurse-documentation", "Bedside Documentation", "/icu-command-center/nursing/nurse-entry?patientId=icu-001", [
        navChild("ward-nurse-entry", "Nurse Entry", "/icu-command-center/nursing/nurse-entry?patientId=icu-001"),
        navChild("ward-nurse-ews", "Early Warning Score", "/icu-command-center/nursing/early-warning-score?patientId=icu-001"),
        navChild("ward-nurse-io", "Intake / Output Update", "/icu-command-center/patients/icu-001?tab=monitoring&subtab=intake-output"),
        navChild("ward-nurse-events", "Patient Event Update", "/icu-command-center/patients/icu-001?tab=events"),
      ]),
      navChild("ward-nurse-work", "Nursing Work", "/icu-command-center/nursing/medication-administration?patientId=icu-001", [
        navChild("ward-nurse-medication", "Medicine Administration", "/icu-command-center/nursing/medication-administration?patientId=icu-001"),
        navChild("ward-nurse-orders", "Doctor Orders Execution", "/icu-command-center/nursing/tasks-assessments?taskTab=dashboard&patientId=icu-001"),
        navChild("ward-nurse-notes", "Nursing Notes", "/icu-command-center/nursing/tasks-assessments?taskTab=assessments&patientId=icu-001"),
        navChild("ward-nurse-pending-work", "Pending Work Summary", "/icu-command-center/nursing/tasks-assessments?taskTab=dashboard&patientId=icu-001"),
      ]),
      navChild("ward-nurse-handover", "Handover", "/icu-command-center/nursing/shift-handover?patientId=icu-001", [
        navChild("ward-nurse-submit-handover", "Submit Shift Handover", "/icu-command-center/nursing/shift-handover?patientId=icu-001"),
        navChild("ward-nurse-raise-issue", "Raise Issue to Unit Nurse", "/icu-command-center/patients/icu-001?tab=collaborate"),
      ]),
    ],
  },
};

export const nursingPersonaRoles = Object.values(nursingRolePermissions).map((permission) => permission.role);

export function getNursingRolePermission(role: Role): NursingRolePermission | undefined {
  return Object.values(nursingRolePermissions).find((permission) => permission.role === role);
}

export function getNursingRoleNavigation(role: Role): NavigationChildItem[] | undefined {
  return getNursingRolePermission(role)?.navigation;
}

export function getDefaultNursingIcuRoute(role: Role): string {
  return getNursingRolePermission(role)?.defaultRoute ?? "/icu-command-center";
}

export function isNursingPersonaRole(role: Role): boolean {
  return Boolean(getNursingRolePermission(role));
}

export function canAccessNursingIcuRoute(role: Role, pathname: string, tab?: string | null): boolean {
  const permission = getNursingRolePermission(role);
  if (!permission || !pathname.startsWith("/icu-command-center")) {
    return true;
  }

  const normalizedPath = pathname.replace(/\/$/, "");
  const routeAllowed = permission.routes.some((route) => {
    if (route === "/icu-command-center/patients/*") {
      return /^\/icu-command-center\/patients\/icu-[^/]+$/.test(normalizedPath);
    }
    if (route.endsWith("/*")) {
      return normalizedPath.startsWith(route.slice(0, -2));
    }
    return normalizedPath === route.replace(/\/$/, "");
  });

  if (!routeAllowed) {
    return false;
  }

  if (/^\/icu-command-center\/patients\/icu-[^/]+$/.test(normalizedPath)) {
    return permission.patientTabs.includes(tab || "overview");
  }

  return true;
}
