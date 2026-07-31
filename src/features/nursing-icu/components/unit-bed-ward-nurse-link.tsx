"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { ArrowRightLeft, CheckCircle2, Eye, Link2, Unlink, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { NativeSelect } from "@/features/admin/admin-shared";
import { icuPatients, type IcuPatient } from "../nursing-icu-data";
import { ClinicalDetail, DialogHeader, InfoLine } from "../nursing-icu-pages";

export function UnitBedWardNurseLink() {
  const wardNurses = React.useMemo(() => Array.from(new Set([...icuPatients.map((patient) => patient.assignedWardNurse), "Bedside Nurse Rina", "Bedside Nurse Anjali", "Bedside Nurse Arjun", "Bedside Nurse Neha"])), []);
  const initialAssignments = React.useMemo(() => Object.fromEntries(icuPatients.map((patient) => [patient.id, patient.assignedWardNurse])), []);
  const [assignments, setAssignments] = React.useState<Record<string, string>>(initialAssignments);
  const [committedAssignments, setCommittedAssignments] = React.useState<Record<string, string>>(initialAssignments);
  const [editingPatientId, setEditingPatientId] = React.useState<string | null>(null);
  const [detailPatient, setDetailPatient] = React.useState<IcuPatient | null>(null);
  const [reassignPatient, setReassignPatient] = React.useState<IcuPatient | null>(null);
  const [reassignNurse, setReassignNurse] = React.useState("Select new Bedside Nurse");
  const [reassignReason, setReassignReason] = React.useState("");
  const [reassignmentHistory, setReassignmentHistory] = React.useState<Array<{ patientId: string; previousNurse: string; newNurse: string; reason: string; by: string; time: string }>>([]);
  const workload = React.useMemo(() => wardNurses.reduce<Record<string, number>>((result, nurse) => {
    result[nurse] = Object.values(committedAssignments).filter((assigned) => assigned === nurse).length;
    return result;
  }, {}), [committedAssignments, wardNurses]);

  const nurseOptions = ["Select Bedside Nurse", ...wardNurses.map((nurse) => `${nurse} - ${workload[nurse] ? `${workload[nurse]} Patient${workload[nurse] === 1 ? "" : "s"}` : "Available"}`)];

  function updateAssignment(patient: IcuPatient, nurse: string) {
    setAssignments((current) => ({ ...current, [patient.id]: nurse === "Select Bedside Nurse" ? "" : nurse.split(" - ")[0] }));
  }

  function saveAssignment(patient: IcuPatient) {
    if (!assignments[patient.id]) return;
    setCommittedAssignments((current) => ({ ...current, [patient.id]: assignments[patient.id] }));
    setEditingPatientId(null);
    toast.success(`${patient.bedNo} linked to ${assignments[patient.id]}`);
  }

  function unlinkAssignment(patient: IcuPatient) {
    setAssignments((current) => ({ ...current, [patient.id]: "" }));
    setCommittedAssignments((current) => ({ ...current, [patient.id]: "" }));
    setEditingPatientId(null);
    toast.success(`${patient.bedNo} Bedside Nurse link removed`);
  }

  function openLinkEditor(patient: IcuPatient) {
    setAssignments((current) => ({ ...current, [patient.id]: committedAssignments[patient.id] ?? "" }));
    setEditingPatientId(patient.id);
  }

  function confirmReassignment() {
    if (!reassignPatient || reassignNurse === "Select new Bedside Nurse" || !reassignReason.trim()) return;
    const previousNurse = committedAssignments[reassignPatient.id] || "Not assigned";
    setAssignments((current) => ({ ...current, [reassignPatient.id]: reassignNurse }));
    setCommittedAssignments((current) => ({ ...current, [reassignPatient.id]: reassignNurse }));
    setReassignmentHistory((current) => [{ patientId: reassignPatient.id, previousNurse, newNurse: reassignNurse, reason: reassignReason.trim(), by: reassignPatient.assignedUnitNurse, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...current]);
    toast.success(`${reassignPatient.bedNo} reassigned from ${previousNurse} to ${reassignNurse}`);
    setReassignPatient(null);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed border-collapse text-sm">
            <colgroup><col className="w-[18%]" /><col className="w-[15%]" /><col className="w-[17%]" /><col className="w-[22%]" /><col className="w-[10%]" /><col className="w-[18%]" /></colgroup>
            <thead className="border-b border-border text-[11px] uppercase text-muted-foreground">
              <tr><th className="px-3 py-3 text-left">Patient</th><th className="px-3 py-3 text-left">Assigned bed</th><th className="px-3 py-3 text-left">Unit Nurse</th><th className="px-3 py-3 text-left">Responsible Bedside Nurse</th><th className="px-3 py-3 text-left">Link status</th><th className="px-3 py-3 text-center">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {icuPatients.map((patient) => {
                const assignedNurse = assignments[patient.id] ?? "";
                const committedNurse = committedAssignments[patient.id] ?? "";
                const changed = assignedNurse !== committedNurse;
                const confirmed = Boolean(committedNurse) && !changed;
                const selectValue = assignedNurse ? `${assignedNurse} - ${workload[assignedNurse] ? `${workload[assignedNurse]} Patient${workload[assignedNurse] === 1 ? "" : "s"}` : "Available"}` : "Select Bedside Nurse";
                return (
                  <tr className="hover:bg-surface-muted/70" key={patient.id}>
                    <td className="px-3 py-3"><p className="font-bold text-slate-900">{patient.patientName}</p><p className="mt-1 text-xs text-slate-500">{patient.mrn}</p></td>
                    <td className="px-3 py-3"><p className="font-bold text-slate-800">{patient.bedNo}</p><p className="mt-1 text-xs text-slate-500">{patient.unit}</p></td>
                    <td className="px-3 py-3 font-semibold text-slate-700">{patient.assignedUnitNurse}</td>
                    <td className="px-3 py-3">
                      {editingPatientId === patient.id ? (
                        <div className="w-full max-w-[280px]">
                          <NativeSelect label="Responsible Bedside Nurse" value={selectValue} onChange={(value) => updateAssignment(patient, value)} options={nurseOptions} />
                        </div>
                      ) : (
                        <p className="font-semibold text-slate-800">{committedNurse}</p>
                      )}
                    </td>
                    <td className="px-3 py-3"><StatusPill tone={confirmed ? "success" : changed ? "warning" : "danger"}>{confirmed ? "Linked" : changed ? "Unsaved change" : "Not linked"}</StatusPill></td>
                    <td className="px-3 py-3">
                      <div className="flex min-w-[144px] flex-wrap justify-center gap-2">
                        {editingPatientId === patient.id ? (
                          <>
                            <Button
                              aria-label={committedNurse ? "Update Link" : "Link Nurse"}
                              className="h-9 w-9 p-0"
                              disabled={!assignedNurse}
                              size="sm"
                              title={committedNurse ? "Update Link" : "Link Nurse"}
                              onClick={() => saveAssignment(patient)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button aria-label="Cancel" className="h-9 w-9 p-0" size="sm" title="Cancel" variant="outline" onClick={() => {
                              setAssignments((current) => ({ ...current, [patient.id]: committedNurse }));
                              setEditingPatientId(null);
                            }}><X className="h-4 w-4" /></Button>
                          </>
                        ) : (
                          <Button
                            aria-label={committedNurse ? "Change Nurse" : "Link Nurse"}
                            className="h-9 w-9 p-0"
                            size="sm"
                            title={committedNurse ? "Change Nurse" : "Link Nurse"}
                            variant={committedNurse ? "outline" : "default"}
                            onClick={() => openLinkEditor(patient)}
                          >
                            {committedNurse ? <ArrowRightLeft className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button aria-label="View Details" className="h-9 w-9 p-0" size="sm" title="View Details" variant="outline" onClick={() => setDetailPatient(patient)}><Eye className="h-4 w-4" /></Button>
                        {committedNurse ? <Button aria-label="Unlink" className="h-9 w-9 p-0" size="sm" title="Unlink" onClick={() => unlinkAssignment(patient)}><Unlink className="h-4 w-4" /></Button> : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Dialog.Root open={Boolean(detailPatient)} onOpenChange={(open) => !open && setDetailPatient(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-300 bg-white shadow-2xl outline-none">
            <DialogHeader title="Patient-bed-nurse mapping" description={detailPatient ? `${detailPatient.patientName} | ${detailPatient.mrn}` : ""} />
            {detailPatient ? (
              <div className="space-y-2 p-4 text-sm">
                <InfoLine label="Patient" value={detailPatient.patientName} />
                <InfoLine label="Bed" value={detailPatient.bedNo} />
                <InfoLine label="Unit" value={detailPatient.unit} />
                <InfoLine label="Unit Nurse" value={detailPatient.assignedUnitNurse} />
                <InfoLine label="Bedside Nurse" value={committedAssignments[detailPatient.id] || "Not assigned"} />
                <InfoLine label="Current workload" value={committedAssignments[detailPatient.id] ? `${workload[committedAssignments[detailPatient.id]] ?? 0} patient(s)` : "-"} />
              </div>
            ) : null}
            <div className="flex justify-end border-t border-slate-200 p-3"><Dialog.Close asChild><Button variant="outline">Close</Button></Dialog.Close></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={Boolean(reassignPatient)} onOpenChange={(open) => !open && setReassignPatient(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl outline-none">
            <DialogHeader title="Reassign Bedside Nurse" description={reassignPatient ? `${reassignPatient.patientName} | ${reassignPatient.bedNo} | ${reassignPatient.unit}` : ""} />
            {reassignPatient ? (
              <div className="space-y-4 p-4">
                <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                  <ClinicalDetail label="Current Bedside Nurse" value={committedAssignments[reassignPatient.id] || "Not assigned"} />
                  <ClinicalDetail label="Unit Nurse / Changed by" value={reassignPatient.assignedUnitNurse} />
                </div>
                <NativeSelect label="New Bedside Nurse" value={reassignNurse} onChange={setReassignNurse} options={["Select new Bedside Nurse", ...wardNurses.filter((nurse) => nurse !== committedAssignments[reassignPatient.id])]} />
                <label className="block space-y-1 text-sm">
                  <span className="font-medium text-slate-700">Reassignment reason <span className="text-red-600">*</span></span>
                  <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" value={reassignReason} onChange={(event) => setReassignReason(event.target.value)} placeholder="Example: workload balancing, shift change, patient acuity..." />
                </label>
                {reassignNurse && reassignNurse !== "Select new Bedside Nurse" ? <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-slate-700">{committedAssignments[reassignPatient.id]} → {reassignNurse}</p> : null}
                {reassignmentHistory.filter((record) => record.patientId === reassignPatient.id).slice(0, 3).map((record, index) => <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-600" key={`${record.time}-${index}`}><p className="font-semibold text-slate-900">Previous reassignment: {record.previousNurse} → {record.newNurse}</p><p className="mt-1">{record.reason} | {record.by} | {record.time}</p></div>)}
              </div>
            ) : null}
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!reassignNurse || reassignNurse === "Select new Bedside Nurse" || !reassignReason.trim()} onClick={confirmReassignment}>Confirm Reassign</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}


