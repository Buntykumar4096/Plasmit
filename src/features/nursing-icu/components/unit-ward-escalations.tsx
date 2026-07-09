"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import {
  buildClinicalAlertRows,
  buildSupervisionItems,
  ClinicalAlertActionDialog,
  clinicalAlertDefaultForwardTo,
  DashboardCommandMetric,
  dashboardToneSolidClass,
  dashboardToneTextClass,
  IcuCommandPaginationControls,
  icuPatientDetailHref,
  isClosedSupervisionStatus,
  isEscalationFinalClosedStatus,
  nursingStationActionRowFromItem,
  useIcuCommandPagination,
  type ClinicalAlertCellAction,
  type ClinicalAlertRow,
  type DashboardCellTone,
  type SupervisionItem,
} from "../nursing-icu-pages";

type UnitWardEscalationQueueRow = {
  id: string;
  patientId: string;
  patientName: string;
  bedNo: string;
  unit: string;
  raisedBy: string;
  source: string;
  issue: string;
  detail: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  status: string;
  handledBy: string;
  forwardTo: string;
  tone: DashboardCellTone;
  actionRow: ClinicalAlertRow;
};



export function UnitWardEscalations() {
  const { role } = useRole();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Open work");
  const [severityFilter, setSeverityFilter] = React.useState("All severity");
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, string>>({});
  const [activeAction, setActiveAction] = React.useState<ClinicalAlertCellAction | null>(null);
  const [resolvedRows, setResolvedRows] = React.useState<Set<string>>(() => new Set());
  const [acknowledgedRows, setAcknowledgedRows] = React.useState<Set<string>>(() => new Set());
  const loggedInUnitNurse = role === "Unit Nurse" ? "Unit Nurse Priya" : role;
  const clinicalRows = React.useMemo(() => buildClinicalAlertRows(resolvedRows, acknowledgedRows), [acknowledgedRows, resolvedRows]);
  const baseRows = React.useMemo<UnitWardEscalationQueueRow[]>(() => {
    const alertRows = clinicalRows
      .filter((row) => row.status !== "Resolved")
      .map((row) => unitWardEscalationFromClinicalAlert(row, loggedInUnitNurse));
    const supervisionRows = buildSupervisionItems()
      .filter((item) => item.role === "Bedside Nurse" && !isClosedSupervisionStatus(item.status))
      .map((item) => unitWardEscalationFromSupervisionItem(item, loggedInUnitNurse));
    return [...alertRows, ...supervisionRows]
      .filter((row, index, rows) => rows.findIndex((item) => item.patientId === row.patientId && item.source === row.source && item.issue === row.issue) === index)
      .sort((a, b) => unitWardEscalationPriorityScore(b) - unitWardEscalationPriorityScore(a));
  }, [clinicalRows, loggedInUnitNurse]);
  const rows = React.useMemo(() => baseRows
    .map((row) => ({ ...row, status: statusOverrides[row.id] ?? row.status }))
    .filter((row) => {
      const text = `${row.patientName} ${row.bedNo} ${row.raisedBy} ${row.source} ${row.issue} ${row.detail} ${row.forwardTo}`.toLowerCase();
      const statusMatch = statusFilter === "All status" || (statusFilter === "Open work" && !isEscalationFinalClosedStatus(row.status)) || row.status === statusFilter;
      const severityMatch = severityFilter === "All severity" || row.severity === severityFilter;
      return text.includes(query.toLowerCase()) && statusMatch && severityMatch;
    }), [baseRows, query, severityFilter, statusFilter, statusOverrides]);
  const pagination = useIcuCommandPagination(rows);

  function updateQueueStatus(row: UnitWardEscalationQueueRow, status: string) {
    setStatusOverrides((current) => ({ ...current, [row.id]: status }));
    toast.success(`${row.bedNo}: ${status}`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-950">Escalations</h1>
            <p className="mt-1 text-sm text-slate-500">Handled by {loggedInUnitNurse}. Bedside Nurse se aaye saare patient escalations yahin acknowledge, review, forward, resolve aur handover carry-forward honge.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/icu-command-center/nursing/unit-shift-handover"><ClipboardCheck className="h-4 w-4" />Shift Handover</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <DashboardCommandMetric label="Open escalations" value={rows.filter((row) => !isEscalationFinalClosedStatus(row.status)).length} tone="warning" />
        <DashboardCommandMetric label="Critical" value={rows.filter((row) => row.severity === "Critical").length} tone="critical" />
        <DashboardCommandMetric label="Awaiting review" value={rows.filter((row) => row.status === "Open" || row.status === "Pending").length} tone="danger" />
        <DashboardCommandMetric label="Forwarded" value={rows.filter((row) => row.status === "Escalated").length} tone="info" />
        <DashboardCommandMetric label="Resolved" value={rows.filter((row) => row.status === "Resolved" || row.status === "Closed").length} tone="success" />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[minmax(220px,1fr)_190px_180px_auto] lg:items-end">
        <Input className="col-span-2 lg:col-span-1" aria-label="Search ward escalations" placeholder="Search patient, bedside nurse, issue..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <NativeSelect label="Severity" value={severityFilter} onChange={setSeverityFilter} options={["All severity", "Critical", "High", "Medium", "Info"]} />
        <NativeSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["Open work", "Open", "Pending", "Acknowledged", "In progress", "Escalated", "Carry to handover", "Resolved", "Closed", "All status"]} />
        <Button className="h-10 self-end" variant="outline" onClick={() => { setQuery(""); setSeverityFilter("All severity"); setStatusFilter("Open work"); }}>Reset</Button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] table-fixed border-collapse text-sm">
            <colgroup><col className="w-[210px]" /><col className="w-[185px]" /><col className="w-[280px]" /><col className="w-[135px]" /><col className="w-[160px]" /><col className="w-[210px]" /></colgroup>
            <thead className="border-b border-border text-[11px] uppercase text-muted-foreground">
              <tr><th className="px-3 py-3 text-left">Patient</th><th className="px-3 py-3 text-left">Raised By</th><th className="px-3 py-3 text-left">Escalation</th><th className="px-3 py-3 text-center">Severity</th><th className="px-3 py-3 text-left">Unit Action</th><th className="px-3 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pagination.pageRows.map((row) => (
                <tr className="hover:bg-slate-50" key={row.id}>
                  <td className="px-3 py-3 align-middle">
                    <Link className={cn("block truncate font-bold hover:underline", dashboardToneTextClass(row.tone))} href={icuPatientDetailHref(row.patientId, "overview")}>{row.patientName}</Link>
                    <p className="mt-1 truncate text-xs font-bold text-slate-950">{row.bedNo} | {row.unit}</p>
                  </td>
                  <td className="px-3 py-3 align-middle"><p className="font-bold text-slate-900">{row.raisedBy}</p><p className="mt-1 text-xs text-slate-500">To {row.handledBy}</p></td>
                  <td className="px-3 py-3 align-middle"><p className="line-clamp-2 font-bold text-slate-950">{row.issue}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{row.source} | {row.detail}</p></td>
                  <td className="px-2 py-3 text-center align-middle"><span className={cn("inline-flex h-9 min-w-24 items-center justify-center rounded-full px-3 text-xs font-black text-white shadow-[0_2px_5px_rgba(15,23,42,0.16)]", dashboardToneSolidClass(row.tone))}>{row.severity}</span></td>
                  <td className="px-3 py-3 align-middle"><p className="font-semibold text-slate-900">{row.status}</p><p className="mt-1 text-xs text-slate-500">Forward to: {row.forwardTo}</p></td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQueueStatus(row, "Acknowledged")}>Ack</Button>
                      <Button size="sm" variant="outline" onClick={() => setActiveAction({ row: row.actionRow, kind: "action" })}>Review</Button>
                      <Button size="sm" variant="outline" onClick={() => updateQueueStatus(row, "Escalated")}>Forward</Button>
                      <Button size="sm" variant="outline" onClick={() => updateQueueStatus(row, "Carry to handover")}>Handover</Button>
                      <Button size="sm" onClick={() => updateQueueStatus(row, "Resolved")}>Resolve</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length ? <tr><td className="px-3 py-10 text-center text-slate-500" colSpan={6}>No bedside nurse escalation matched.</td></tr> : null}
            </tbody>
          </table>
        </div>
        <IcuCommandPaginationControls {...pagination} />
      </div>

      <ClinicalAlertActionDialog
        action={activeAction}
        onOpenChange={(open) => !open && setActiveAction(null)}
        onComplete={(row, actionLabel) => {
          if (actionLabel === "Resolve / Close") setResolvedRows((current) => new Set([...current, row.id]));
          if (actionLabel === "Acknowledge") setAcknowledgedRows((current) => new Set([...current, row.id]));
          toast.success(`${row.bedNo}: ${actionLabel.toLowerCase()} saved`);
          setActiveAction(null);
        }}
      />
    </div>
  );
}



function unitWardEscalationFromClinicalAlert(row: ClinicalAlertRow, handledBy: string): UnitWardEscalationQueueRow {
  const raisedBy = row.alert.owner === "Bedside Nurse" ? row.patient?.assignedWardNurse ?? "Assigned Bedside Nurse" : row.patient?.assignedWardNurse ?? row.owner;
  return { id: `alert-${row.id}`, patientId: row.alert.patientId, patientName: row.patientName, bedNo: row.bedNo, unit: row.unit, raisedBy, source: row.source, issue: row.trigger, detail: row.scenario, severity: row.severity, status: row.status, handledBy, forwardTo: clinicalAlertDefaultForwardTo(row), tone: row.tone, actionRow: row };
}



function unitWardEscalationFromSupervisionItem(item: SupervisionItem, handledBy: string): UnitWardEscalationQueueRow {
  const actionRow = nursingStationActionRowFromItem(item);
  const severity = item.priority === "Critical" ? "Critical" : item.priority === "High" ? "High" : item.priority === "Medium" ? "Medium" : "Info";
  const tone: DashboardCellTone = severity === "Critical" ? "critical" : severity === "High" ? "danger" : severity === "Medium" ? "warning" : "info";
  return { id: `work-${item.id}`, patientId: item.patientId, patientName: item.patientName, bedNo: item.bedNo, unit: item.unit, raisedBy: item.nurse, source: item.source, issue: item.title, detail: item.detail, severity, status: item.status, handledBy, forwardTo: clinicalAlertDefaultForwardTo(actionRow), tone, actionRow };
}



function unitWardEscalationPriorityScore(row: UnitWardEscalationQueueRow) {
  const severityScore = row.severity === "Critical" ? 400 : row.severity === "High" ? 300 : row.severity === "Medium" ? 200 : 100;
  const statusScore = row.status === "Open" || row.status === "Pending" ? 40 : row.status === "Escalated" ? 30 : row.status === "Acknowledged" ? 20 : 0;
  return severityScore + statusScore;
}


