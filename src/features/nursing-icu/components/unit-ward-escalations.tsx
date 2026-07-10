"use client";

import * as React from "react";
import Link from "next/link";
import { Check, CheckCheck, ClipboardCheck, Forward, SearchCheck } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  buildClinicalAlertRows,
  buildSupervisionItems,
  ClinicalAlertActionDialog,
  clinicalAlertDefaultForwardTo,
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
  const queueRows = React.useMemo(() => baseRows
    .map((row) => ({ ...row, status: statusOverrides[row.id] ?? row.status })), [baseRows, statusOverrides]);
  const escalationCounts = React.useMemo(() => ({
    open: queueRows.filter((row) => !isEscalationFinalClosedStatus(row.status)).length,
    critical: queueRows.filter((row) => row.severity === "Critical").length,
    awaitingReview: queueRows.filter((row) => row.status === "Open" || row.status === "Pending").length,
    forwarded: queueRows.filter((row) => row.status === "Escalated").length,
    resolved: queueRows.filter((row) => row.status === "Resolved" || row.status === "Closed").length,
  }), [queueRows]);
  const rows = React.useMemo(() => queueRows
    .filter((row) => {
      const text = `${row.patientName} ${row.bedNo} ${row.raisedBy} ${row.source} ${row.issue} ${row.detail} ${row.forwardTo}`.toLowerCase();
      const statusMatch = statusFilter === "All status"
        || (statusFilter === "Open work" && !isEscalationFinalClosedStatus(row.status))
        || (statusFilter === "Awaiting review" && (row.status === "Open" || row.status === "Pending"))
        || (statusFilter === "Forwarded" && row.status === "Escalated")
        || row.status === statusFilter;
      const severityMatch = severityFilter === "All severity" || row.severity === severityFilter;
      return text.includes(query.toLowerCase()) && statusMatch && severityMatch;
    }), [query, queueRows, severityFilter, statusFilter]);
  const pagination = useIcuCommandPagination(rows);

  function updateQueueStatus(row: UnitWardEscalationQueueRow, status: string) {
    setStatusOverrides((current) => ({ ...current, [row.id]: status }));
    toast.success(`${row.bedNo}: ${status}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[minmax(220px,1fr)_190px_180px_auto] lg:items-end">
        <Input className="col-span-2 lg:col-span-1" aria-label="Search ward escalations" placeholder="Search patient, bedside nurse, issue..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <label className="flex min-w-[150px] items-center gap-2 text-xs text-muted-foreground">
          <span className="sr-only">Severity</span>
          <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
            <option value="All severity">All severity</option>
            <option value="Critical">Critical ({escalationCounts.critical})</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Info">Info</option>
          </select>
        </label>
        <label className="flex min-w-[150px] items-center gap-2 text-xs text-muted-foreground">
          <span className="sr-only">Status</span>
          <select className="h-9 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="Open work">Open escalations ({escalationCounts.open})</option>
            <option value="Awaiting review">Awaiting review ({escalationCounts.awaitingReview})</option>
            <option value="Forwarded">Forwarded ({escalationCounts.forwarded})</option>
            <option value="Resolved">Resolved ({escalationCounts.resolved})</option>
            <option value="Open">Open</option>
            <option value="Pending">Pending</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="In progress">In progress</option>
            <option value="Escalated">Escalated</option>
            <option value="Carry to handover">Carry to handover</option>
            <option value="Closed">Closed</option>
            <option value="All status">All status</option>
          </select>
        </label>
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
                    <div className="flex flex-nowrap justify-end gap-1">
                      <Button size="icon" className="h-8 w-8" variant="outline" aria-label="Acknowledge" title="Acknowledge" onClick={() => updateQueueStatus(row, "Acknowledged")}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-8 w-8" variant="outline" aria-label="Review escalation" title="Review escalation" onClick={() => setActiveAction({ row: row.actionRow, kind: "action" })}><SearchCheck className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-8 w-8" variant="outline" aria-label="Forward escalation" title="Forward escalation" onClick={() => updateQueueStatus(row, "Escalated")}><Forward className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-8 w-8" variant="outline" aria-label="Carry to handover" title="Carry to handover" onClick={() => updateQueueStatus(row, "Carry to handover")}><ClipboardCheck className="h-4 w-4" /></Button>
                      <Button size="icon" className="h-8 w-8" aria-label="Resolve escalation" title="Resolve escalation" onClick={() => updateQueueStatus(row, "Resolved")}><CheckCheck className="h-4 w-4" /></Button>
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

