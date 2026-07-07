"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  FileText,
  HeartPulse,
  ListChecks,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  ShieldAlert,
  Stethoscope,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";
import {
  adultObservationChartRows,
  adultObservationHours,
  adultObservationRiskPalette,
  consciousnessScores,
  getRiskLevel,
  rapidAllowedRoles,
  rapidLevelTone,
  rapidPriorityRank,
  rapidResponseRules,
  rapidReviewPatients,
  rapidRoleAccess,
  rapidStatusTone,
  rapidZoneTone,
  type AdultObservationDataRow,
  type AdultObservationRiskLevel,
  type AdultObservationVitalType,
  type RapidQueueStatus,
  type RapidObservationSet,
  type RapidResponseLevel,
  type RapidReviewPatient,
  type RapidZone,
} from "./rapid-review-data";
import { RapidReviewGraphTab } from "./rapid-review-graph";

type ReviewUpdate = {
  status: RapidQueueStatus;
  decision: string;
  note: string;
  owner: string;
  nextObservation: string;
  updatedAt: string;
};

type DialogState = {
  patient: RapidReviewPatient;
  intent: "review" | "escalate" | "observe";
};

type ObservationDraft = {
  patientId: string;
  observationDate: string;
  observationTime: string;
  recordedBy: string;
  shift: "Morning" | "Evening" | "Night" | "Emergency";
  respiratoryRate: string;
  spo2: string;
  oxygenFlow: string;
  deliveryMethod: NonNullable<RapidObservationSet["deliveryMethod"]>;
  systolic: string;
  diastolic: string;
  pulse: string;
  temperature: string;
  consciousness: string;
  painScore: string;
  urineOutput: string;
  note: string;
};

type ObservationReviewUpdate = {
  reviewStatus: NonNullable<RapidObservationSet["reviewStatus"]>;
  reviewedBy: string;
  reviewedAt: string;
  doctorAction: string;
  note: string;
};

type ObservationReviewDialogState = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
} | null;

type ObservationLogRow = {
  patient: RapidReviewPatient;
  observation: RapidObservationSet;
};

type PatientTimelineSummary = {
  latest?: RapidObservationSet;
  firstWarning?: RapidObservationSet;
  firstHighRisk?: RapidObservationSet;
  peak?: RapidObservationSet;
  reviewedCount: number;
  pendingCount: number;
};

const DATE_LOG_PAGE_SIZE = 20;

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-4">{children}</div>;
}

function effectiveStatus(patient: RapidReviewPatient, updates: Record<string, ReviewUpdate>) {
  return updates[patient.id]?.status ?? patient.queueStatus;
}

function optionValue(value: string) {
  return value;
}

export function RapidReviewPage() {
  const { role } = useRole();
  const roleProfile = rapidRoleAccess[role];
  const allowed = rapidAllowedRoles.includes(role);
  const readOnly = Boolean(roleProfile?.readOnly);
  const [search, setSearch] = React.useState("");
  const [response, setResponse] = React.useState("All response");
  const [ward, setWard] = React.useState("All wards");
  const [sortBy, setSortBy] = React.useState("Clinical priority");
  const [selectedPatientId, setSelectedPatientId] = React.useState(rapidReviewPatients[0]?.id ?? "");
  const [activeTab, setActiveTab] = React.useState("queue");
  const [dialogState, setDialogState] = React.useState<DialogState | null>(null);
  const [observationReviewDialog, setObservationReviewDialog] = React.useState<ObservationReviewDialogState>(null);
  const [updates, setUpdates] = React.useState<Record<string, ReviewUpdate>>({});
  const [addedObservations, setAddedObservations] = React.useState<Record<string, RapidObservationSet[]>>({});
  const [observationReviews, setObservationReviews] = React.useState<Record<string, ObservationReviewUpdate>>({});

  const patients = React.useMemo<RapidReviewPatient[]>(
    () => rapidReviewPatients.map((patient) => ({ ...patient, observationHistory: [...patient.observationHistory, ...(addedObservations[patient.id] ?? [])] })),
    [addedObservations],
  );

  const wards = React.useMemo(() => ["All wards", ...Array.from(new Set(patients.map((patient) => patient.ward)))], [patients]);

  const rows = React.useMemo(() => {
    const filtered = patients.filter((patient) => {
      const text = `${patient.patientName} ${patient.uhid} ${patient.visitNo} ${patient.ward} ${patient.bed} ${patient.source} ${patient.consultant} ${patient.owner} ${patient.responseLevel} ${patient.trigger}`;
      return includes(text, search) && (response === "All response" || patient.responseLevel === response) && (ward === "All wards" || patient.ward === ward);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "Oldest wait") return b.waitMinutes - a.waitMinutes;
      if (sortBy === "Newest wait") return a.waitMinutes - b.waitMinutes;
      if (sortBy === "Patient name") return a.patientName.localeCompare(b.patientName);
      if (sortBy === "Ward") return `${a.ward} ${a.bed}`.localeCompare(`${b.ward} ${b.bed}`);
      return rapidPriorityRank(b.responseLevel) - rapidPriorityRank(a.responseLevel) || b.waitMinutes - a.waitMinutes;
    });
  }, [patients, response, search, sortBy, ward]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const merCount = patients.filter((patient) => patient.responseLevel === "MER Call").length;
  const mdtCount = patients.filter((patient) => patient.responseLevel === "MDT Review").length;
  const rnCount = patients.filter((patient) => patient.responseLevel === "RN Review").length;
  const openCount = patients.filter((patient) => effectiveStatus(patient, updates) !== "Closed").length;
  const pendingObservationCount = React.useMemo(
    () => patients.flatMap((patient) => patient.observationHistory).filter((observation) => observationReviewStatus(observation, observationReviews) === "Pending doctor review").length,
    [observationReviews, patients],
  );

  const handleSaveReview = React.useCallback((patient: RapidReviewPatient, update: ReviewUpdate) => {
    setUpdates((current) => ({ ...current, [patient.id]: update }));
    toast.success(`${update.decision} recorded for ${patient.patientName}`);
    setDialogState(null);
  }, []);

  const handleAddObservation = React.useCallback((patient: RapidReviewPatient, observation: RapidObservationSet) => {
    setAddedObservations((current) => ({ ...current, [patient.id]: [...(current[patient.id] ?? []), observation] }));
    setSelectedPatientId(patient.id);
    setActiveTab("doctor");
    toast.success(`Observation added for ${patient.patientName}`);
  }, []);

  const handleOpenDoctorReview = React.useCallback((patient: RapidReviewPatient) => {
    setSelectedPatientId(patient.id);
    setActiveTab("doctor");
    toast.info(`${patient.patientName} loaded in Doctor Review`);
  }, []);

  const handleSaveObservationReview = React.useCallback((observation: RapidObservationSet, update: ObservationReviewUpdate) => {
    setObservationReviews((current) => ({ ...current, [observation.id]: update }));
    toast.success(`${update.reviewStatus} by ${update.reviewedBy}`);
    setObservationReviewDialog(null);
  }, []);

  const columns = React.useMemo<ColumnDef<RapidReviewPatient>[]>(() => [
    {
      header: "Patient",
      cell: ({ row }) => (
        <div className="min-w-[190px]">
          <div className="font-medium text-foreground">{row.original.patientName}</div>
          <div className="text-xs text-muted-foreground">{row.original.uhid} - {row.original.visitNo}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge tone="muted">{row.original.ageGender}</Badge>
            <Badge tone="info">{row.original.source}</Badge>
          </div>
        </div>
      ),
    },
    {
      header: "Location",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.bed}</div>
          <div className="text-xs text-muted-foreground">{row.original.ward}</div>
        </div>
      ),
    },
    {
      header: "Trigger",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <StatusPill tone={rapidLevelTone(row.original.responseLevel)}>{row.original.responseLevel}</StatusPill>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">{row.original.trigger}</div>
        </div>
      ),
    },
    {
      header: "Time",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.reviewDue}</div>
          <div className="text-xs text-muted-foreground">{row.original.waitMinutes} min waiting</div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const status = effectiveStatus(row.original, updates);
        return <StatusPill tone={rapidStatusTone(status)}>{status}</StatusPill>;
      },
    },
    {
      header: "Owner",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{updates[row.original.id]?.owner ?? row.original.owner}</div>
          <div className="text-xs text-muted-foreground">{row.original.lastObservationAt}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex min-w-[174px] flex-wrap gap-1">
          <Button size="sm" onClick={() => handleOpenDoctorReview(row.original)}>
            <ClipboardCheck className="h-4 w-4" />
            Review
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDialogState({ patient: row.original, intent: "escalate" })} disabled={row.original.responseLevel === "Routine" && readOnly}>
            <Zap className="h-4 w-4" />
            Escalate
          </Button>
        </div>
      ),
    },
  ], [handleOpenDoctorReview, readOnly, updates]);

  if (!allowed || !roleProfile) {
    return (
      <div className="py-6">
        <EmptyState
          icon={LockKeyhole}
          title="Rapid Review access required"
          description="This doctor quick review module is available for clinical and management roles only."
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => toast.success("Rapid review queue refreshed")}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={() => setActiveTab("entry")} disabled={readOnly}>
          <Plus className="h-4 w-4" />
          Add observation
        </Button>
        <Button onClick={() => rows[0] && handleOpenDoctorReview(rows[0])} disabled={!rows.length}>
          <Stethoscope className="h-4 w-4" />
          Start review
        </Button>
      </div>

      <SummaryGrid>
        <StatCard label="MER calls" value={merCount} change="Immediate" context="Purple zone" tone="critical" icon={ShieldAlert} />
        <StatCard label="MDT review" value={mdtCount} change="30 min" context="Red zone or urine risk" tone="danger" icon={HeartPulse} />
        <StatCard label="RN review" value={rnCount} change="Prompt" context="Yellow zone" tone="warning" icon={BellRing} />
        <StatCard label="Doctor pending" value={pendingObservationCount} change="Review" context={`${openCount} active queue`} tone="info" icon={Eye} />
      </SummaryGrid>

      <AlertBanner icon={UserRound} tone={readOnly ? "warning" : "info"} title={`Current role: ${role}`}>
        {roleProfile.summary} Available actions: {roleProfile.actions.join(", ")}.
      </AlertBanner>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="entry">Nurse Entry</TabsTrigger>
          <TabsTrigger value="doctor">Doctor Review</TabsTrigger>
          <TabsTrigger value="log">Date Wise Log</TabsTrigger>
          <TabsTrigger value="chart">Patient Timeline</TabsTrigger>
          <TabsTrigger value="rules">Response Rules</TabsTrigger>
          <TabsTrigger value="review-graph">Review Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, ward, bed, trigger, consultant...">
            <NativeSelect label="Response level" value={response} onChange={setResponse} options={["All response", "MER Call", "MDT Review", "RN Review", "Routine"]} />
            <NativeSelect label="Ward" value={ward} onChange={setWard} options={wards} />
            <NativeSelect label="Sort" value={sortBy} onChange={setSortBy} options={["Clinical priority", "Oldest wait", "Newest wait", "Patient name", "Ward"]} />
          </FilterBar>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DataTable data={rows} columns={columns} />
            <QueueCommandPanel
              rows={rows}
              updates={updates}
              readOnly={readOnly}
              onReview={(patient, intent) => {
                if (intent === "review") {
                  handleOpenDoctorReview(patient);
                  return;
                }
                setDialogState({ patient, intent });
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <NurseObservationEntryTab
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectedPatient={setSelectedPatientId}
            readOnly={readOnly}
            onAddObservation={handleAddObservation}
          />
        </TabsContent>

        <TabsContent value="doctor" className="space-y-4">
          <DoctorReviewTab
            patients={patients}
            reviews={observationReviews}
            selectedPatientId={selectedPatientId}
            onSelectedPatient={setSelectedPatientId}
            onReview={(patient, observation) => setObservationReviewDialog({ patient, observation })}
          />
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          <DateWiseLogTab
            patients={patients}
            reviews={observationReviews}
            onReview={(patient, observation) => setObservationReviewDialog({ patient, observation })}
          />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <ObservationChartTab
            selectedPatient={selectedPatient}
            selectedPatientId={selectedPatientId}
            onSelectedPatient={setSelectedPatientId}
            reviews={observationReviews}
            onReview={(patient) => setDialogState({ patient, intent: "observe" })}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <ResponseRulesTab role={role} />
        </TabsContent>

        <TabsContent value="review-graph" className="space-y-4">
          <RapidReviewGraphTab patients={patients} />
        </TabsContent>
      </Tabs>

      <ReviewActionDialog
        key={dialogState ? `${dialogState.patient.id}-${dialogState.intent}` : "closed"}
        state={dialogState}
        readOnly={readOnly}
        role={role}
        onOpenChange={(open) => !open && setDialogState(null)}
        onConfirm={handleSaveReview}
      />
      <ObservationReviewDialog
        key={observationReviewDialog ? observationReviewDialog.observation.id : "observation-review-closed"}
        state={observationReviewDialog}
        role={role}
        readOnly={readOnly}
        onOpenChange={(open) => !open && setObservationReviewDialog(null)}
        onConfirm={handleSaveObservationReview}
      />
    </>
  );
}

function NurseObservationEntryTab({
  patients,
  selectedPatientId,
  onSelectedPatient,
  readOnly,
  onAddObservation,
}: {
  patients: RapidReviewPatient[];
  selectedPatientId: string;
  onSelectedPatient: (value: string) => void;
  readOnly: boolean;
  onAddObservation: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [draft, setDraft] = React.useState<ObservationDraft>(() => createObservationDraft(selectedPatientId));
  const selectedPatient = patients.find((patient) => patient.id === draft.patientId) ?? patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const preview = buildObservationPreview(draft);

  function updateDraft<Key extends keyof ObservationDraft>(key: Key, value: ObservationDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handlePatientChange(patientId: string) {
    updateDraft("patientId", patientId);
    onSelectedPatient(patientId);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nurse Observation Entry</CardTitle>
            <CardDescription>Respiratory rate, saturation, oxygen flow, blood pressure, pulse, temperature, consciousness, pain, and urine output are entered here.</CardDescription>
          </div>
          <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Patient">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.patientId} onChange={(event) => handlePatientChange(event.target.value)} disabled={readOnly}>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientName} - {patient.uhid} - {patient.bed}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Date">
              <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="date" value={draft.observationDate} onChange={(event) => updateDraft("observationDate", event.target.value)} disabled={readOnly} />
            </FormField>
            <FormField label="Time">
              <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" type="time" value={draft.observationTime} onChange={(event) => updateDraft("observationTime", event.target.value)} disabled={readOnly} />
            </FormField>
            <FormField label="Shift">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.shift} onChange={(event) => updateDraft("shift", event.target.value as ObservationDraft["shift"])} disabled={readOnly}>
                {["Morning", "Evening", "Night", "Emergency"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Recorded by">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.recordedBy} onChange={(event) => updateDraft("recordedBy", event.target.value)} disabled={readOnly}>
                {["Ward Nurse", "Shift Coordinator", "ER Nurse", "Renal Nurse", "Pediatric Nurse"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Respiratory rate">
              <VitalInput value={draft.respiratoryRate} onChange={(value) => updateDraft("respiratoryRate", value)} disabled={readOnly} suffix="/min" />
            </FormField>
            <FormField label="O2 saturation">
              <VitalInput value={draft.spo2} onChange={(value) => updateDraft("spo2", value)} disabled={readOnly} suffix="%" />
            </FormField>
            <FormField label="O2 flow rate">
              <VitalInput value={draft.oxygenFlow} onChange={(value) => updateDraft("oxygenFlow", value)} disabled={readOnly} suffix="L/min" />
            </FormField>
            <FormField label="Delivery method">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.deliveryMethod} onChange={(event) => updateDraft("deliveryMethod", event.target.value as ObservationDraft["deliveryMethod"])} disabled={readOnly}>
                {["Room air", "Nasal cannula", "Simple mask", "Venturi mask", "NRBM", "CPAP", "Ventilator"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Blood pressure">
              <div className="grid grid-cols-2 gap-2">
                <VitalInput value={draft.systolic} onChange={(value) => updateDraft("systolic", value)} disabled={readOnly} suffix="Sys" />
                <VitalInput value={draft.diastolic} onChange={(value) => updateDraft("diastolic", value)} disabled={readOnly} suffix="Dia" />
              </div>
            </FormField>
            <FormField label="Pulse rate">
              <VitalInput value={draft.pulse} onChange={(value) => updateDraft("pulse", value)} disabled={readOnly} suffix="/min" />
            </FormField>
            <FormField label="Temperature">
              <VitalInput value={draft.temperature} onChange={(value) => updateDraft("temperature", value)} disabled={readOnly} suffix="deg C" step="0.1" />
            </FormField>
            <FormField label="Consciousness / sedation">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.consciousness} onChange={(event) => updateDraft("consciousness", event.target.value)} disabled={readOnly}>
                {["0", "1", "2", "3"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
            <FormField label="Pain score">
              <VitalInput value={draft.painScore} onChange={(value) => updateDraft("painScore", value)} disabled={readOnly} suffix="/10" />
            </FormField>
            <FormField label="Urine output">
              <VitalInput value={draft.urineOutput} onChange={(value) => updateDraft("urineOutput", value)} disabled={readOnly} suffix="ml/hr" />
            </FormField>
          </div>

          <FormField label="Bedside note">
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={draft.note}
              onChange={(event) => updateDraft("note", event.target.value)}
              disabled={readOnly}
            />
          </FormField>

          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-muted p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={rapidZoneTone(preview.dominantZone)}>{preview.dominantZone} zone</Badge>
                <StatusPill tone={rapidLevelTone(preview.responseLevel)}>{preview.responseLevel}</StatusPill>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">System preview updates from the vitals before save. Doctor can review it from Doctor Review or Date Wise Log.</div>
            </div>
            <Button
              disabled={readOnly || !selectedPatient}
              onClick={() => {
                if (!selectedPatient) return;
                const observation = buildObservationFromDraft(draft);
                onAddObservation(selectedPatient, observation);
                setDraft(createObservationDraft(selectedPatient.id));
              }}
            >
              <Save className="h-4 w-4" />
              Save observation
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Selected Patient</CardTitle>
              <CardDescription>Add entry goes into the selected patient date-wise observation log.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <DetailRow label="Patient" value={selectedPatient?.patientName ?? "Not selected"} />
            <DetailRow label="UHID" value={selectedPatient?.uhid ?? "-"} />
            <DetailRow label="Location" value={selectedPatient ? `${selectedPatient.bed}, ${selectedPatient.ward}` : "-"} />
            <DetailRow label="Consultant" value={selectedPatient?.consultant ?? "-"} />
          </CardContent>
        </Card>
        {selectedPatient ? (
          <MultiObservationTable
            patient={selectedPatient}
            title="Latest Patient Entries"
            description="Saved readings for this patient."
            compact
          />
        ) : null}
      </div>
    </div>
  );
}

function DoctorReviewTab({
  patients,
  reviews,
  selectedPatientId,
  onSelectedPatient,
  onReview,
}: {
  patients: RapidReviewPatient[];
  reviews: Record<string, ObservationReviewUpdate>;
  selectedPatientId: string;
  onSelectedPatient: (patientId: string) => void;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [statusFilter, setStatusFilter] = React.useState("Pending doctor review");
  const [dateFilter, setDateFilter] = React.useState("All dates");
  const [quickNote, setQuickNote] = React.useState("");

  function handleChartPatientChange(patientId: string) {
    onSelectedPatient(patientId);
  }

  const rows = flattenObservationRows(patients)
    .filter((row) => patientFilter === "All patients" || row.patient.id === patientFilter)
    .filter((row) => statusFilter === "All status" || observationReviewStatus(row.observation, reviews) === statusFilter)
    .filter((row) => dateFilter === "All dates" || observationDateValue(row.observation) === dateFilter);

  const dateOptions = ["All dates", ...uniqueObservationDates(patients)];
  const pending = flattenObservationRows(patients).filter((row) => observationReviewStatus(row.observation, reviews) === "Pending doctor review").length;
  const chartPatient = patients.find((patient) => patient.id === selectedPatientId) ?? rows[0]?.patient ?? patients[0];
  const patientRows = chartPatient ? rows.filter((row) => row.patient.id === chartPatient.id) : rows;
  const nextObservation = patientRows[0]?.observation ?? chartPatient?.observationHistory.at(-1);
  const chartEntryCount = chartPatient?.observationHistory.length ?? 0;
  const latestObservation = chartPatient?.observationHistory.at(-1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Doctor Review Command Center</CardTitle>
            <CardDescription>Select patient, review date/status, then use the full 24-hour chart for clinical review.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{rows.length} readings</Badge>
            <Badge tone="warning">{pending} pending</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_minmax(220px,1fr)_160px_190px_auto]">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Chart patient</span>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              value={chartPatient?.id ?? ""}
              onChange={(event) => handleChartPatientChange(event.target.value)}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid} - {patient.bed}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Worklist patient</span>
            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20" value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)}>
              <option value="All patients">All patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid}</option>
              ))}
            </select>
          </label>
          <NativeSelect label="Date" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
          <NativeSelect label="Review status" value={statusFilter} onChange={setStatusFilter} options={["All status", "Pending doctor review", "Reviewed", "Escalated", "Closed"]} />
          <div className="flex items-end">
            <Button className="w-full" disabled={!nextObservation} onClick={() => nextObservation && chartPatient && onReview(chartPatient, nextObservation)}>
              <ClipboardCheck className="h-4 w-4" />
              Review latest
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdultObservationChartCard
        patient={chartPatient}
        reviews={reviews}
        onCellClick={(row, hour, value, level) => {
          const observationAtHour = chartPatient?.observationHistory.find((observation) => observationHourKey(observation) === hour);
          if (chartPatient && observationAtHour && value !== undefined) {
            onReview(chartPatient, observationAtHour);
            return;
          }
          toast.info(`${row.label} at ${hour}: ${value ?? "--"} (${adultObservationRiskPalette[level].label})`);
        }}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,440px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <WorkflowStep icon={Plus} title="Nurse enters" description="Hourly vitals and intervention." />
            <WorkflowStep icon={ListChecks} title="System triage" description="Risk zone is calculated." />
            <WorkflowStep icon={Eye} title="Doctor reviews" description={`${pending} pending readings.`} />
          </div>
        {chartPatient ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{chartPatient.patientName}</CardTitle>
                <CardDescription>{chartPatient.uhid} - {chartPatient.bed}, {chartPatient.ward}</CardDescription>
              </div>
              <StatusPill tone={rapidLevelTone(chartPatient.responseLevel)}>{chartPatient.responseLevel}</StatusPill>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <DetailRow label="Consultant" value={chartPatient.consultant} />
                <DetailRow label="Due" value={chartPatient.reviewDue} />
                <DetailRow label="Last obs" value={latestObservation ? observationTimeLabel(latestObservation) : chartPatient.lastObservationAt} />
                <DetailRow label="24 hr entries" value={`${chartEntryCount} records`} />
                <DetailRow label="Urine" value={chartPatient.urineOutput} />
                <DetailRow label="Owner" value={chartPatient.owner} />
              </div>
              <div className="rounded-md border border-border bg-surface-muted p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Suggested review focus</div>
                <div className="mt-2 space-y-2">
                  {chartPatient.recommendedActions.slice(0, 4).map((action) => (
                    <div className="flex gap-2 text-sm text-foreground" key={action}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <FormField label="Quick doctor note">
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  value={quickNote}
                  onChange={(event) => setQuickNote(event.target.value)}
                  placeholder="Add quick note before opening detailed review..."
                />
              </FormField>
              <div className="flex flex-wrap gap-2">
                <Button disabled={!nextObservation} onClick={() => nextObservation && onReview(chartPatient, nextObservation)}>
                  <ClipboardCheck className="h-4 w-4" />
                  Review selected
                </Button>
                <Button variant="outline" onClick={() => toast.success("Quick doctor note saved in static review workspace")}>
                  <Save className="h-4 w-4" />
                  Save note
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        </div>

        <DoctorReviewWorklist rows={rows} reviews={reviews} onSelectPatient={handleChartPatientChange} onReview={onReview} />
      </div>
    </div>
  );
}

function AdultObservationChartCard({
  patient,
  reviews,
  onCellClick,
}: {
  patient?: RapidReviewPatient;
  reviews: Record<string, ObservationReviewUpdate>;
  onCellClick: (row: AdultObservationDataRow, hour: string, value: string | number | undefined, level: AdultObservationRiskLevel) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (!patient) {
    return <EmptyState icon={CalendarDays} title="No patient selected" description="Select a patient from the doctor review panel to load the adult observation chart." />;
  }

  const chartRows = buildAdultObservationData(patient, reviews);

  return (
    <>
      {expanded ? <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" /> : null}
    <Card className={cn("min-w-0 overflow-hidden", expanded && "fixed inset-3 z-50 flex flex-col bg-background shadow-2xl")}>
      <CardHeader className="items-start">
        <div>
          <CardTitle>Adult Observation Chart - 24 Hours</CardTitle>
          <CardDescription>Hourly vitals monitoring with risk-based color zones for {patient.patientName}.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="muted">{patient.observationHistory.length} entries</Badge>
          <StatusPill tone={rapidLevelTone(patient.responseLevel)}>{patient.responseLevel}</StatusPill>
          <Button size="sm" variant="outline" onClick={() => setExpanded((current) => !current)}>
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {expanded ? "Exit full screen" : "Full screen"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3 p-3", expanded && "flex min-h-0 flex-1 flex-col")}>
        <AdultObservationLegend />
        <div className="rounded-lg border" style={{ borderColor: adultObservationRiskPalette.empty.border }}>
          <div className={cn("overflow-auto", expanded ? "h-[calc(100vh-174px)]" : "max-h-[calc(100vh-260px)] min-h-[560px]")}>
            <table className="w-full min-w-[1760px] border-collapse text-xs">
              <thead>
                <tr>
                  <th
                    className="sticky left-0 top-0 z-30 min-w-[190px] border-b border-r bg-surface-muted px-3 py-2 text-left text-[11px] font-semibold uppercase text-muted-foreground"
                    style={{ borderColor: adultObservationRiskPalette.empty.border }}
                  >
                    Vital
                  </th>
                  {adultObservationHours.map((hour) => (
                    <th
                      className="sticky top-0 z-20 min-w-[64px] border-b border-r bg-surface-muted px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground"
                      style={{ borderColor: adultObservationRiskPalette.empty.border }}
                      key={hour}
                    >
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartRows.map((row) => (
                  <tr key={row.vitalType}>
                    <th
                      className="sticky left-0 z-10 border-b border-r bg-background px-3 py-2 text-left align-middle font-semibold text-foreground"
                      style={{ borderColor: adultObservationRiskPalette.empty.border }}
                    >
                      <div>{row.label}</div>
                      {row.unit ? <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">{row.unit}</div> : null}
                    </th>
                    {adultObservationHours.map((hour) => {
                      const value = row.values[hour];
                      const level = getRiskLevel(row.vitalType, value);
                      return (
                        <AdultObservationCell
                          key={`${row.vitalType}-${hour}`}
                          row={row}
                          hour={hour}
                          value={value}
                          level={level}
                          onClick={() => onCellClick(row, hour, value, level)}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

function AdultObservationLegend() {
  const levels: AdultObservationRiskLevel[] = ["critical", "highRisk", "warning", "normal", "empty"];
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <span
          className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium"
          key={level}
          style={adultObservationLegendStyle(level)}
        >
          <span className="h-2.5 w-2.5 rounded-full border" style={adultObservationSwatchStyle(level)} />
          {adultObservationRiskPalette[level].label}
        </span>
      ))}
    </div>
  );
}

function AdultObservationCell({
  row,
  hour,
  value,
  level,
  onClick,
}: {
  row: AdultObservationDataRow;
  hour: string;
  value: string | number | undefined;
  level: AdultObservationRiskLevel;
  onClick: () => void;
}) {
  const displayValue = value ?? "--";
  const tooltip = `${row.label} | ${hour} | ${displayValue} | ${adultObservationRiskPalette[level].label}`;
  return (
    <td
      aria-label={tooltip}
      className="h-11 cursor-pointer border-b border-r px-1.5 py-1 text-center align-middle text-[11px] font-medium transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-ring/20"
      onClick={onClick}
      style={adultObservationCellStyle(level)}
      tabIndex={0}
      title={tooltip}
    >
      <span className="block break-words leading-tight">{displayValue}</span>
    </td>
  );
}

function DoctorReviewWorklist({
  rows,
  reviews,
  onSelectPatient,
  onReview,
}: {
  rows: Array<{ patient: RapidReviewPatient; observation: RapidObservationSet }>;
  reviews: Record<string, ObservationReviewUpdate>;
  onSelectPatient: (patientId: string) => void;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  if (!rows.length) {
    return <EmptyState icon={FileText} title="No observation records" description="Change filters to see doctor review worklist." />;
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Review Worklist</CardTitle>
          <CardDescription>Click a record to load its 24-hour chart on the left.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="max-h-[420px] space-y-2 overflow-y-auto">
        {rows.map(({ patient, observation }) => {
          const reviewStatus = observationReviewStatus(observation, reviews);
          const review = observationReviewDetails(observation, reviews);
          return (
            <div
              className="w-full cursor-pointer rounded-md border border-border bg-background p-3 text-left transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20"
              key={observation.id}
              onClick={() => onSelectPatient(patient.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectPatient(patient.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-foreground">{patient.patientName}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{formatDateLabel(observationDateValue(observation))} - {observationTimeLabel(observation)} - {patient.bed}</div>
                </div>
                <StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
              </div>
              <div className="mt-2 text-xs leading-5 text-muted-foreground">{review.doctorAction}</div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onReview(patient, observation);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Review
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DateWiseLogTab({
  patients,
  reviews,
  onReview,
}: {
  patients: RapidReviewPatient[];
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [dateMode, setDateMode] = React.useState("All dates");
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [patientFilter, setPatientFilter] = React.useState("All patients");
  const [wardFilter, setWardFilter] = React.useState("All wards");
  const [sourceFilter, setSourceFilter] = React.useState("All sources");
  const [responseFilter, setResponseFilter] = React.useState("All response");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [shiftFilter, setShiftFilter] = React.useState("All shifts");
  const [enteredByFilter, setEnteredByFilter] = React.useState("All staff");
  const [reviewedByFilter, setReviewedByFilter] = React.useState("All reviewers");
  const [sortBy, setSortBy] = React.useState("Newest first");
  const [page, setPage] = React.useState(1);

  const allRows = flattenObservationRows(patients);
  const dateOptions = uniqueObservationDates(patients);
  const wardOptions = ["All wards", ...uniqueValues(patients.map((patient) => patient.ward))];
  const sourceOptions = ["All sources", ...uniqueValues(patients.map((patient) => patient.source))];
  const shiftOptions = ["All shifts", ...uniqueValues(allRows.map((row) => row.observation.shift ?? "Shift not set"))];
  const enteredByOptions = ["All staff", ...uniqueValues(allRows.map((row) => row.observation.recordedBy))];
  const reviewedByOptions = ["All reviewers", ...uniqueValues(allRows.map((row) => observationReviewDetails(row.observation, reviews).reviewedBy))];
  const dateCounts = observationDateCounts(allRows);
  const latestDataDate = latestAvailableDate(dateOptions);

  const rows = allRows
    .filter((row) => {
      const review = observationReviewDetails(row.observation, reviews);
      const text = observationLogSearchText(row, review);
      return includes(text, search);
    })
    .filter((row) => patientFilter === "All patients" || row.patient.id === patientFilter)
    .filter((row) => observationMatchesDateFilter(row.observation, dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate))
    .filter((row) => wardFilter === "All wards" || row.patient.ward === wardFilter)
    .filter((row) => sourceFilter === "All sources" || row.patient.source === sourceFilter)
    .filter((row) => responseFilter === "All response" || row.observation.responseLevel === responseFilter)
    .filter((row) => statusFilter === "All status" || observationReviewStatus(row.observation, reviews) === statusFilter)
    .filter((row) => shiftFilter === "All shifts" || (row.observation.shift ?? "Shift not set") === shiftFilter)
    .filter((row) => enteredByFilter === "All staff" || row.observation.recordedBy === enteredByFilter)
    .filter((row) => reviewedByFilter === "All reviewers" || observationReviewDetails(row.observation, reviews).reviewedBy === reviewedByFilter)
    .sort((a, b) => compareObservationLogRows(a, b, reviews, sortBy));

  const selectedPatientCount = new Set(rows.map((row) => row.patient.id)).size;
  const pendingCount = rows.filter((row) => observationReviewStatus(row.observation, reviews) === "Pending doctor review").length;
  const criticalCount = rows.filter((row) => row.observation.dominantZone === "Purple" || row.observation.responseLevel === "MER Call").length;
  const totalPages = Math.max(1, Math.ceil(rows.length / DATE_LOG_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = rows.length ? (currentPage - 1) * DATE_LOG_PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * DATE_LOG_PAGE_SIZE, rows.length);
  const paginatedRows = rows.slice((currentPage - 1) * DATE_LOG_PAGE_SIZE, currentPage * DATE_LOG_PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setDateMode("All dates");
    setSelectedDates([]);
    setSingleDate("");
    setDateFrom("");
    setDateTo("");
    setPatientFilter("All patients");
    setWardFilter("All wards");
    setSourceFilter("All sources");
    setResponseFilter("All response");
    setStatusFilter("All status");
    setShiftFilter("All shifts");
    setEnteredByFilter("All staff");
    setReviewedByFilter("All reviewers");
    setSortBy("Newest first");
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Filtered records" value={rows.length} change={dateFilterSummary(dateMode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)} context="Observation log rows" tone="info" icon={FileText} />
        <StatCard label="Patients" value={selectedPatientCount} change={patientFilter === "All patients" ? "All selected" : "Focused"} context="Matched patient records" tone="success" icon={UserRound} />
        <StatCard label="Pending reviews" value={pendingCount} change="Action needed" context="Doctor review status" tone="warning" icon={Clock3} />
        <StatCard label="Critical / MER" value={criticalCount} change="Priority" context="Purple zone or MER call" tone="critical" icon={ShieldAlert} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Date Wise Log Filters</CardTitle>
            <CardDescription>Filter one patient across multiple dates, or audit multiple patients by ward, staff, response, and review status.</CardDescription>
          </div>
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCcw className="h-4 w-4" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar search={search} onSearch={updateSearch} placeholder="Search patient, UHID, bed, recorded by, doctor, note, action...">
            <label className="flex min-w-[230px] items-center gap-2 text-xs text-muted-foreground">
              <span className="sr-only">Patient</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                value={patientFilter}
                onChange={(event) => {
                  setPatientFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="All patients">All patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.uhid} - {patient.bed}</option>
                ))}
              </select>
            </label>
            <NativeSelect
              label="Sort"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
              options={["Newest first", "Oldest first", "Clinical priority", "Patient name", "Review status", "Entered by"]}
            />
          </FilterBar>

          <DateSmartFilter
            dates={dateOptions}
            dateCounts={dateCounts}
            latestDataDate={latestDataDate}
            mode={dateMode}
            onMode={updateDateMode}
            selectedDates={selectedDates}
            onSelectedDates={(value) => {
              setSelectedDates(value);
              setPage(1);
            }}
            singleDate={singleDate}
            onSingleDate={(value) => {
              setSingleDate(value);
              setPage(1);
            }}
            dateFrom={dateFrom}
            onDateFrom={(value) => {
              setDateFrom(value);
              setPage(1);
            }}
            dateTo={dateTo}
            onDateTo={(value) => {
              setDateTo(value);
              setPage(1);
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <NativeSelect label="Ward" value={wardFilter} onChange={(value) => { setWardFilter(value); setPage(1); }} options={wardOptions} />
            <NativeSelect label="Source" value={sourceFilter} onChange={(value) => { setSourceFilter(value); setPage(1); }} options={sourceOptions} />
            <NativeSelect label="Response" value={responseFilter} onChange={(value) => { setResponseFilter(value); setPage(1); }} options={["All response", "MER Call", "MDT Review", "RN Review", "Routine"]} />
            <NativeSelect label="Review status" value={statusFilter} onChange={(value) => { setStatusFilter(value); setPage(1); }} options={["All status", "Pending doctor review", "Reviewed", "Escalated", "Closed"]} />
            <NativeSelect label="Shift" value={shiftFilter} onChange={(value) => { setShiftFilter(value); setPage(1); }} options={shiftOptions} />
            <NativeSelect label="Entered by" value={enteredByFilter} onChange={(value) => { setEnteredByFilter(value); setPage(1); }} options={enteredByOptions} />
            <NativeSelect label="Reviewed by" value={reviewedByFilter} onChange={(value) => { setReviewedByFilter(value); setPage(1); }} options={reviewedByOptions} />
          </div>
        </CardContent>
      </Card>

      <ObservationLogTable
        rows={paginatedRows}
        reviews={reviews}
        onReview={onReview}
        totalRows={rows.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageEnd={pageEnd}
        onPageChange={setPage}
      />
    </div>
  );
}

function DateSmartFilter({
  dates,
  dateCounts,
  latestDataDate,
  mode,
  onMode,
  selectedDates,
  onSelectedDates,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
}: {
  dates: string[];
  dateCounts: Record<string, number>;
  latestDataDate: string;
  mode: string;
  onMode: (mode: string) => void;
  selectedDates: string[];
  onSelectedDates: (dates: string[]) => void;
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
}) {
  if (!dates.length) {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">
        No observation dates available.
      </div>
    );
  }

  const allSelected = mode === "All dates" || selectedDates.length === 0 || selectedDates.length === dates.length;
  const dateModeGroups = [
    { label: "Quick", modes: ["All dates", "Latest record date", "Today", "Yesterday"] },
    { label: "Rolling", modes: ["Last 24 hours", "Last 48 hours", "Last 7 days", "Last 30 days"] },
    { label: "Calendar", modes: ["This week", "Last week", "This month", "Last month"] },
    { label: "Manual", modes: ["Single date", "Specific dates", "Custom range"] },
  ];
  const invalidRange = mode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);

  function toggleDate(date: string) {
    if (selectedDates.includes(date)) {
      onSelectedDates(selectedDates.filter((value) => value !== date));
      return;
    }
    onSelectedDates([...selectedDates, date]);
  }

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">
            {dateFilterSummary(mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)}
          </div>
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          {dateModeGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">{group.label}</div>
              <div className="flex flex-wrap gap-2">
                {group.modes.map((dateMode) => (
                  <Button
                    key={dateMode}
                    size="sm"
                    variant={mode === dateMode ? "default" : "outline"}
                    onClick={() => onMode(dateMode)}
                  >
                    {dateMode}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {mode === "Single date" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Select date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={singleDate}
              onChange={(event) => onSingleDate(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => onSingleDate(latestDataDate || todayDateValue())}>
            Latest record date
          </Button>
        </div>
      ) : null}

      {mode === "Custom range" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">From date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFrom(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">To date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateTo}
              onChange={(event) => onDateTo(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => {
            onDateFrom("");
            onDateTo("");
          }}>
            <RefreshCcw className="h-4 w-4" />
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          From date cannot be after To date. Please correct the range.
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-xs text-muted-foreground">Available dates</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={allSelected ? "default" : "outline"} onClick={() => {
            onMode("All dates");
            onSelectedDates([]);
          }}>
            Show all
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            onMode("Specific dates");
            onSelectedDates(dates);
          }}>
            Select all dates
          </Button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {dates.map((date) => {
          const selected = mode !== "Specific dates"
            ? observationMatchesDateValue(date, mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate)
            : selectedDates.length === 0 || selectedDates.includes(date);
          return (
            <button
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-surface",
              )}
              key={date}
              onClick={() => {
                onMode("Specific dates");
                toggleDate(date);
              }}
              type="button"
            >
              {formatDateLabel(date)}
              <span className="ml-1 opacity-75">({dateCounts[date] ?? 0})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ObservationLogTable({
  rows,
  reviews,
  onReview,
  totalRows,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  onPageChange,
}: {
  rows: ObservationLogRow[];
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient, observation: RapidObservationSet) => void;
  totalRows: number;
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  onPageChange: (page: number) => void;
}) {
  if (!totalRows) {
    return <EmptyState icon={FileText} title="No observation records" description="Change date, patient, or review filters to see observation history." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] border-collapse text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left">Date / time</th>
              <th className="border-b border-border px-3 py-2 text-left">Patient</th>
              <th className="border-b border-border px-3 py-2 text-left">Entered by</th>
              <th className="border-b border-border px-3 py-2 text-left">Vitals</th>
              <th className="border-b border-border px-3 py-2 text-left">O2 / urine</th>
              <th className="border-b border-border px-3 py-2 text-left">Severity</th>
              <th className="border-b border-border px-3 py-2 text-left">Review</th>
              <th className="border-b border-border px-3 py-2 text-left">Reviewed by</th>
              <th className="border-b border-border px-3 py-2 text-left">Doctor action</th>
              <th className="border-b border-border px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ patient, observation }) => {
              const review = observationReviewDetails(observation, reviews);
              const reviewStatus = observationReviewStatus(observation, reviews);
              return (
                <tr key={observation.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60">
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="font-medium">{formatDateLabel(observationDateValue(observation))}</div>
                    <div className="text-xs text-muted-foreground">{observationTimeLabel(observation)} - {observation.shift ?? "Shift not set"}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{patient.patientName}</div>
                    <div className="text-xs text-muted-foreground">{patient.uhid} - {patient.bed}, {patient.ward}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{observation.recordedBy}</div>
                    <div className="text-xs text-muted-foreground">{observation.deliveryMethod ?? "Method not set"}</div>
                  </td>
                  <td className="min-w-[230px] px-3 py-2 text-xs leading-5">
                    RR {observation.respiratoryRate} | SpO2 {observation.spo2} | BP {observation.bloodPressure} | Pulse {observation.pulse} | Temp {observation.temperature}
                  </td>
                  <td className="px-3 py-2 text-xs leading-5">
                    O2 {observation.oxygenFlow}<br />Urine {observation.urineOutput}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1">
                      <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                      <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                    </div>
                  </td>
                  <td className="px-3 py-2"><StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill></td>
                  <td className="px-3 py-2">
                    <div>{review.reviewedBy}</div>
                    <div className="text-xs text-muted-foreground">{review.reviewedAt}</div>
                  </td>
                  <td className="min-w-[220px] px-3 py-2 text-xs text-muted-foreground">{review.doctorAction}</td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant={reviewStatus === "Pending doctor review" ? "default" : "outline"} onClick={() => onReview(patient, observation)}>
                      <Eye className="h-4 w-4" />
                      Review
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-3 py-3 text-xs text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div>
          Showing {pageStart}-{pageEnd} of {totalRows} observation records. Page {currentPage} of {totalPages}.
        </div>
        <ObservationLogPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}

function ObservationLogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = paginationPages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </Button>
      {pages.map((pageNumber) => (
        <Button
          key={pageNumber}
          size="sm"
          variant={pageNumber === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </Button>
    </div>
  );
}

function WorkflowStep({ icon: Icon, title, description }: { icon: typeof Plus; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function VitalInput({ value, onChange, disabled, suffix, step = "1" }: { value: string; onChange: (value: string) => void; disabled?: boolean; suffix: string; step?: string }) {
  return (
    <div className="relative">
      <input
        className="h-9 w-full rounded-md border border-input bg-background px-3 pr-14 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        type="number"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{suffix}</span>
    </div>
  );
}

function QueueCommandPanel({
  rows,
  updates,
  readOnly,
  onReview,
}: {
  rows: RapidReviewPatient[];
  updates: Record<string, ReviewUpdate>;
  readOnly: boolean;
  onReview: (patient: RapidReviewPatient, intent: DialogState["intent"]) => void;
}) {
  const top = rows[0];

  if (!top) {
    return (
      <Card>
        <CardContent className="p-4">
          <EmptyState icon={Activity} title="No rapid review patients" description="Change filters to bring patients back into the queue." />
        </CardContent>
      </Card>
    );
  }

  const status = effectiveStatus(top, updates);
  const highestMetric = top.metrics.find((metric) => metric.zone === "Purple") ?? top.metrics.find((metric) => metric.zone === "Red") ?? top.metrics[0];

  return (
    <Card className="self-start">
      <CardHeader>
        <div>
          <CardTitle>Next Best Action</CardTitle>
          <CardDescription>Designed to reduce clicks during doctor review.</CardDescription>
        </div>
        <StatusPill tone={rapidLevelTone(top.responseLevel)}>{top.responseLevel}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-surface-muted p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">{top.patientName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{top.uhid} - {top.bed}, {top.ward}</div>
            </div>
            <StatusPill tone={rapidStatusTone(status)}>{status}</StatusPill>
          </div>
          <div className="mt-3 text-xs leading-5 text-muted-foreground">{top.trigger}</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <CompactMetric label={highestMetric.label} value={`${highestMetric.value}${highestMetric.unit ? ` ${highestMetric.unit}` : ""}`} zone={highestMetric.zone} />
          <CompactMetric label="Urine output" value={top.urineOutput} zone={top.responseLevel === "MDT Review" ? "Red" : "Safe"} />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">Recommended actions</div>
          {top.recommendedActions.slice(0, 4).map((action) => (
            <div key={action} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span>{action}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" onClick={() => onReview(top, "review")} disabled={readOnly}>
            <ClipboardCheck className="h-4 w-4" />
            Open review
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => onReview(top, "escalate")} disabled={readOnly}>
            <Zap className="h-4 w-4" />
            Escalate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactMetric({ label, value, zone }: { label: string; value: string; zone: RapidZone }) {
  return (
    <div className={cn("rounded-md border p-3", zonePanelClass(zone))}>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs">{zone} zone</div>
    </div>
  );
}

function ObservationChartTab({
  selectedPatient,
  selectedPatientId,
  onSelectedPatient,
  reviews,
  onReview,
  readOnly,
}: {
  selectedPatient: RapidReviewPatient;
  selectedPatientId: string;
  onSelectedPatient: (value: string) => void;
  reviews: Record<string, ObservationReviewUpdate>;
  onReview: (patient: RapidReviewPatient) => void;
  readOnly: boolean;
}) {
  const timeline = patientTimelineObservations(selectedPatient);
  const summary = patientTimelineSummary(selectedPatient, reviews);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              value={selectedPatientId}
              onChange={(event) => onSelectedPatient(event.target.value)}
              aria-label="Select patient for observation chart"
            >
              {rapidReviewPatients.map((patient) => (
                <option key={patient.id} value={optionValue(patient.id)}>
                  {patient.patientName} - {patient.uhid} - {patient.bed}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => onReview(selectedPatient)} disabled={readOnly}>
            <ClipboardCheck className="h-4 w-4" />
            Record timeline note
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TimelineSummaryTile label="Latest response" value={summary.latest?.responseLevel ?? "-"} change={summary.latest ? observationTimeLabel(summary.latest) : "-"} context="Current clinical state" tone={summary.latest ? rapidLevelTone(summary.latest.responseLevel) : "info"} icon={Activity} />
        <TimelineSummaryTile label="First warning" value={summary.firstWarning ? observationTimeLabel(summary.firstWarning) : "-"} change={summary.firstWarning?.responseLevel ?? "None"} context="First non-routine trigger" tone={summary.firstWarning ? rapidLevelTone(summary.firstWarning.responseLevel) : "success"} icon={BellRing} />
        <TimelineSummaryTile label="Peak risk" value={summary.peak ? summary.peak.responseLevel : "-"} change={summary.peak ? observationTimeLabel(summary.peak) : "-"} context={summary.peak?.dominantZone ?? "No high risk"} tone={summary.peak ? rapidLevelTone(summary.peak.responseLevel) : "info"} icon={ShieldAlert} />
        <TimelineSummaryTile label="Readings" value={timeline.length} change="Timeline" context={`${summary.reviewedCount} reviewed / ${summary.pendingCount} pending`} tone="info" icon={Clock3} />
      </div>

      <TimelineRiskJourney observations={timeline} />

      <AdultObservationChartCard
        patient={selectedPatient}
        reviews={reviews}
        onCellClick={(row, hour, value, level) => {
          toast.info(`${row.label} at ${hour}: ${value ?? "--"} (${adultObservationRiskPalette[level].label})`);
        }}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <PatientTimelineEvents patient={selectedPatient} observations={timeline} reviews={reviews} />

        <div className="space-y-4">
          <TimelineHandoverSummary patient={selectedPatient} summary={summary} />
          <TimelineTurningPoints summary={summary} />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Latest Vitals Snapshot</CardTitle>
                <CardDescription>Current patient condition from the latest observation set.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {selectedPatient.metrics.map((metric) => (
                <MetricTile key={metric.id} metric={metric} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TimelineSummaryTile({
  label,
  value,
  change,
  context,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  change: string;
  context: string;
  tone: StatusTone;
  icon: typeof Activity;
}) {
  return (
    <Card className="min-h-[132px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <StatusPill tone={tone}>{change}</StatusPill>
        <span className="truncate text-xs text-muted-foreground">{context}</span>
      </div>
    </Card>
  );
}

function TimelineRiskJourney({ observations }: { observations: RapidObservationSet[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Risk Journey</CardTitle>
          <CardDescription>Read-only sequence of how the patient moved through response levels over time.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            {observations.map((observation, index) => (
              <div className="flex items-center gap-2" key={observation.id}>
                {index > 0 ? <div className="h-px w-5 bg-border" /> : null}
                <div className={cn("min-w-[92px] rounded-md border px-2 py-2 text-center", zonePanelClass(observation.dominantZone))}>
                  <div className="text-[11px] font-semibold">{observationTimeLabel(observation)}</div>
                  <div className="mt-1 text-[10px]">{observation.responseLevel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientTimelineEvents({
  patient,
  observations,
  reviews,
}: {
  patient: RapidReviewPatient;
  observations: RapidObservationSet[];
  reviews: Record<string, ObservationReviewUpdate>;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{patient.patientName} Timeline</CardTitle>
          <CardDescription>{patient.uhid} - {patient.bed}, {patient.ward}. Chronological clinical story from nurse entries and review outcomes.</CardDescription>
        </div>
        <Badge tone="info">{observations.length} events</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {observations.map((observation, index) => {
          const previous = observations[index - 1];
          const review = observationReviewDetails(observation, reviews);
          const reviewStatus = observationReviewStatus(observation, reviews);
          return (
            <div className="relative grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[96px_minmax(0,1fr)]" key={observation.id}>
              <div className="text-sm">
                <div className="font-semibold text-foreground">{observationTimeLabel(observation)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDateLabel(observationDateValue(observation))}</div>
                <div className="mt-2">
                  <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                </div>
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                      <StatusPill tone={reviewStatusTone(reviewStatus)}>{reviewStatus}</StatusPill>
                      <Badge tone="muted">{timelineChangeLabel(observation, previous)}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-foreground">{observation.note}</div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{observation.recordedBy}</div>
                    <div>{observation.shift ?? "Shift not set"}</div>
                  </div>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                  <TimelineVital label="RR" value={observation.respiratoryRate} />
                  <TimelineVital label="SpO2" value={observation.spo2} />
                  <TimelineVital label="BP" value={observation.bloodPressure} />
                  <TimelineVital label="Pulse" value={observation.pulse} />
                  <TimelineVital label="Temp" value={observation.temperature} />
                  <TimelineVital label="O2" value={`${observation.oxygenFlow}${observation.deliveryMethod ? `, ${observation.deliveryMethod}` : ""}`} />
                  <TimelineVital label="LOC / pain" value={`${observation.consciousness} / ${observation.painScore}`} />
                  <TimelineVital label="Urine" value={observation.urineOutput} />
                </div>
                <div className="rounded-md border border-border bg-surface-muted p-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Review action:</span> {review.doctorAction}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TimelineVital({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted px-2 py-1.5">
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-foreground">{value}</div>
    </div>
  );
}

function TimelineHandoverSummary({
  patient,
  summary,
}: {
  patient: RapidReviewPatient;
  summary: PatientTimelineSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Handover Summary</CardTitle>
          <CardDescription>Latest status and unresolved items for the next clinician.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <DetailRow label="Consultant" value={patient.consultant} />
        <DetailRow label="Owner" value={patient.owner} />
        <DetailRow label="Latest" value={summary.latest ? `${observationTimeLabel(summary.latest)} - ${summary.latest.responseLevel}` : "-"} />
        <DetailRow label="Trigger" value={patient.trigger} />
        <DetailRow label="Urine" value={patient.urineOutput} />
        <DetailRow label="Review due" value={patient.reviewDue} />
        <DetailRow label="Pending" value={`${summary.pendingCount} observation reviews`} />
      </CardContent>
    </Card>
  );
}

function TimelineTurningPoints({ summary }: { summary: PatientTimelineSummary }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Key Turning Points</CardTitle>
          <CardDescription>Moments that explain deterioration or recovery.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <TurningPoint label="First warning" observation={summary.firstWarning} fallback="No warning trigger recorded" />
        <TurningPoint label="First high risk" observation={summary.firstHighRisk} fallback="No MDT/MER threshold crossed" />
        <TurningPoint label="Peak risk" observation={summary.peak} fallback="No peak risk event" />
        <TurningPoint label="Latest state" observation={summary.latest} fallback="No latest observation" />
      </CardContent>
    </Card>
  );
}

function TurningPoint({ label, observation, fallback }: { label: string; observation?: RapidObservationSet; fallback: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {observation ? `${observationTimeLabel(observation)} - ${observation.responseLevel}` : fallback}
          </div>
        </div>
        {observation ? <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge> : null}
      </div>
      {observation ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{observation.note}</div> : null}
    </div>
  );
}

function MultiObservationTable({
  patient,
  title,
  description,
  compact,
}: {
  patient: RapidReviewPatient;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  const rows = [...patient.observationHistory].reverse();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-col gap-1 border-b border-border bg-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {description ? <div className="text-xs text-muted-foreground">{description}</div> : null}
        </div>
        <Badge tone="info">{rows.length} readings</Badge>
      </div>
      <div className={cn("overflow-x-auto", compact && "max-h-64 overflow-y-auto")}>
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead className="bg-background text-xs uppercase text-muted-foreground">
            <tr>
              <th className="border-b border-border px-3 py-2 text-left">Date / time</th>
              <th className="border-b border-border px-3 py-2 text-left">By</th>
              <th className="border-b border-border px-3 py-2 text-left">RR</th>
              <th className="border-b border-border px-3 py-2 text-left">SpO2</th>
              <th className="border-b border-border px-3 py-2 text-left">O2 / method</th>
              <th className="border-b border-border px-3 py-2 text-left">BP</th>
              <th className="border-b border-border px-3 py-2 text-left">Pulse</th>
              <th className="border-b border-border px-3 py-2 text-left">Temp</th>
              <th className="border-b border-border px-3 py-2 text-left">LOC / Pain</th>
              <th className="border-b border-border px-3 py-2 text-left">Urine</th>
              <th className="border-b border-border px-3 py-2 text-left">Zone</th>
              <th className="border-b border-border px-3 py-2 text-left">Response</th>
              <th className="border-b border-border px-3 py-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((observation) => (
              <tr key={observation.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap px-3 py-2 font-medium">
                  <div>{formatDateLabel(observationDateValue(observation))}</div>
                  <div className="text-xs text-muted-foreground">{observationTimeLabel(observation)}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{observation.recordedBy}</td>
                <td className="px-3 py-2">{observation.respiratoryRate}</td>
                <td className="px-3 py-2">{observation.spo2}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <div>{observation.oxygenFlow}</div>
                  <div className="text-xs text-muted-foreground">{observation.deliveryMethod ?? "Method not set"}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{observation.bloodPressure}</td>
                <td className="px-3 py-2">{observation.pulse}</td>
                <td className="px-3 py-2">{observation.temperature}</td>
                <td className="whitespace-nowrap px-3 py-2">{observation.consciousness} / {observation.painScore}</td>
                <td className="whitespace-nowrap px-3 py-2">{observation.urineOutput}</td>
                <td className="px-3 py-2"><Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge></td>
                <td className="px-3 py-2"><StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill></td>
                <td className="min-w-[220px] px-3 py-2 text-muted-foreground">{observation.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricTile({ metric }: { metric: RapidReviewPatient["metrics"][number] }) {
  return (
    <div className={cn("rounded-md border p-3", zonePanelClass(metric.zone))}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-medium opacity-80">{metric.label}</div>
          <div className="mt-1 text-xl font-semibold">{metric.value}{metric.unit ? <span className="ml-1 text-sm font-medium">{metric.unit}</span> : null}</div>
        </div>
        <Badge tone={rapidZoneTone(metric.zone)}>{metric.zone}</Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span>{metric.trend}</span>
        <span className="truncate opacity-80">{metric.note}</span>
      </div>
    </div>
  );
}

function ResponseRulesTab({ role }: { role: Role }) {
  const [search, setSearch] = React.useState("");
  const [level, setLevel] = React.useState("All levels");

  const rules = rapidResponseRules.filter((rule) => {
    const text = `${rule.level} ${rule.title} ${rule.owner} ${rule.criteria.join(" ")} ${rule.actions.join(" ")}`;
    return includes(text, search) && (level === "All levels" || rule.level === level);
  });

  return (
    <>
      <FilterBar search={search} onSearch={setSearch} placeholder="Search response criteria, action, owner...">
        <NativeSelect label="Level" value={level} onChange={setLevel} options={["All levels", "MER Call", "MDT Review", "RN Review"]} />
      </FilterBar>

      <div className="grid gap-4 xl:grid-cols-3">
        {rules.map((rule) => (
          <ResponseRuleCard key={rule.level} rule={rule} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Consciousness and Sedation Guide</CardTitle>
              <CardDescription>Fast reference for reduced consciousness during review.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-3 py-2 text-left">Score</th>
                    <th className="border-b border-border px-3 py-2 text-left">Meaning</th>
                    <th className="border-b border-border px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consciousnessScores.map((item) => (
                    <tr key={item.score} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-semibold">{item.score}</td>
                      <td className="px-3 py-2">{item.meaning}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AlertBanner icon={ShieldAlert} tone="info" title={`Role aware for ${role}`}>
          These rules are shown as decision support. Final clinical judgement, hospital policy, and bedside assessment remain primary.
        </AlertBanner>
      </div>
    </>
  );
}

function ResponseRuleCard({ rule }: { rule: (typeof rapidResponseRules)[number] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{rule.title}</CardTitle>
          <CardDescription>{rule.owner} - Target {rule.targetTime}</CardDescription>
        </div>
        <StatusPill tone={rule.tone}>{rule.level}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Criteria</div>
          <div className="mt-2 space-y-2">
            {rule.criteria.map((item) => (
              <div key={item} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <AlertTriangle className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", toneTextClass(rule.tone))} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Actions</div>
          <div className="mt-2 space-y-2">
            {rule.actions.map((item) => (
              <div key={item} className="flex gap-2 rounded-md border border-border px-3 py-2 text-xs">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ObservationReviewDialog({
  state,
  role,
  readOnly,
  onOpenChange,
  onConfirm,
}: {
  state: ObservationReviewDialogState;
  role: Role;
  readOnly: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (observation: RapidObservationSet, update: ObservationReviewUpdate) => void;
}) {
  const patient = state?.patient ?? null;
  const observation = state?.observation ?? null;
  const [reviewStatus, setReviewStatus] = React.useState<ObservationReviewUpdate["reviewStatus"]>(observation?.responseLevel === "Routine" ? "Reviewed" : "Reviewed");
  const [reviewedBy, setReviewedBy] = React.useState(role === "Doctor" ? "Current Doctor" : role);
  const [reviewedAt, setReviewedAt] = React.useState("24 May 2026, now");
  const [doctorAction, setDoctorAction] = React.useState(observation ? defaultDoctorAction(observation) : "Continue clinical review");
  const [note, setNote] = React.useState(observation?.note ?? "");

  if (!patient || !observation) return null;

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Doctor observation review</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {formatDateLabel(observationDateValue(observation))}, {observationTimeLabel(observation)}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close observation review dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <ObservationValue label="RR" value={observation.respiratoryRate} />
                  <ObservationValue label="SpO2" value={observation.spo2} />
                  <ObservationValue label="O2 flow" value={observation.oxygenFlow} />
                  <ObservationValue label="BP" value={observation.bloodPressure} />
                  <ObservationValue label="Pulse" value={observation.pulse} />
                  <ObservationValue label="Temp" value={observation.temperature} />
                  <ObservationValue label="LOC / Pain" value={`${observation.consciousness} / ${observation.painScore}`} />
                  <ObservationValue label="Urine" value={observation.urineOutput} />
                </div>

                <AlertBanner icon={ShieldAlert} tone={rapidLevelTone(observation.responseLevel)} title={`${observation.dominantZone} zone - ${observation.responseLevel}`}>
                  Recorded by {observation.recordedBy}. Delivery method: {observation.deliveryMethod ?? "Not set"}. Note: {observation.note}
                </AlertBanner>

                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Review status">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value as ObservationReviewUpdate["reviewStatus"])} disabled={readOnly}>
                      {["Reviewed", "Escalated", "Closed", "Pending doctor review"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Reviewed by">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewedBy} onChange={(event) => setReviewedBy(event.target.value)} disabled={readOnly}>
                      {["Current Doctor", "Dr. Aman Verma", "Dr. Nisha Rao", "Emergency Team", "Shift Coordinator", role].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Reviewed at">
                    <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={reviewedAt} onChange={(event) => setReviewedAt(event.target.value)} disabled={readOnly} />
                  </FormField>
                  <FormField label="Doctor action">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={doctorAction} onChange={(event) => setDoctorAction(event.target.value)} disabled={readOnly}>
                      {["Continue routine observation", "Increase observation frequency", "Review oxygen and pain plan", "Start MDT review", "Escalate to MER call", "Review fluid and urine output", "Close after stable repeat"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Doctor note">
                  <textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={note} onChange={(event) => setNote(event.target.value)} disabled={readOnly} />
                </FormField>
              </div>

              <Card className="self-start">
                <CardHeader>
                  <div>
                    <CardTitle>Audit Context</CardTitle>
                    <CardDescription>Who entered and who reviewed.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <DetailRow label="Entered by" value={observation.recordedBy} />
                  <DetailRow label="Date" value={formatDateLabel(observationDateValue(observation))} />
                  <DetailRow label="Time" value={observationTimeLabel(observation)} />
                  <DetailRow label="Shift" value={observation.shift ?? "Not set"} />
                  <DetailRow label="Zone" value={<Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>} />
                  <DetailRow label="Response" value={<StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">{readOnly ? "Read-only role cannot save doctor review." : "This review updates the date-wise observation audit in the UI."}</div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button disabled={readOnly} onClick={() => onConfirm(observation, { reviewStatus, reviewedBy, reviewedAt, doctorAction, note })}>
                <ClipboardCheck className="h-4 w-4" />
                Save doctor review
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ObservationValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ReviewActionDialog({
  state,
  readOnly,
  role,
  onOpenChange,
  onConfirm,
}: {
  state: DialogState | null;
  readOnly: boolean;
  role: Role;
  onOpenChange: (open: boolean) => void;
  onConfirm: (patient: RapidReviewPatient, update: ReviewUpdate) => void;
}) {
  const patient = state?.patient ?? null;
  const intent = state?.intent ?? "review";
  const initialDecision = patient ? defaultDialogDecision(patient, intent) : "Record clinical review";
  const initialStatus: RapidQueueStatus = patient ? defaultDialogStatus(patient, intent) : "Acknowledged";
  const initialNextObservation = patient ? defaultNextObservation(patient.responseLevel) : "Repeat observations every 15 minutes";
  const [decision, setDecision] = React.useState(initialDecision);
  const [status, setStatus] = React.useState<RapidQueueStatus>(initialStatus);
  const [nextObservation, setNextObservation] = React.useState(initialNextObservation);
  const [owner, setOwner] = React.useState(patient?.owner ?? "");
  const [note, setNote] = React.useState(patient?.trigger ?? "");

  if (!patient) return null;

  return (
    <DialogPrimitive.Root open={Boolean(state)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Rapid review action</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-xs text-muted-foreground">
                {patient.patientName} - {patient.uhid} - {patient.bed}, {patient.ward}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close rapid review dialog">
                <X className="h-4 w-4" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <AlertBanner icon={ShieldAlert} tone={rapidLevelTone(patient.responseLevel)} title={patient.responseLevel}>
                  {patient.trigger}
                </AlertBanner>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Decision">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={decision} onChange={(event) => setDecision(event.target.value)} disabled={readOnly}>
                      {["Record clinical review", "Record observation review", "Start MDT review", "Escalate to MDT review", "Place MER call", "Continue routine observation", "Close after stable repeat"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Queue status">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={status} onChange={(event) => setStatus(event.target.value as RapidQueueStatus)} disabled={readOnly}>
                      {["In review", "Acknowledged", "Escalated", "Closed"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Owner">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={owner} onChange={(event) => setOwner(event.target.value)} disabled={readOnly}>
                      {[patient.owner, patient.consultant, "Emergency Team", "Shift Coordinator", role].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Next observations">
                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={nextObservation} onChange={(event) => setNextObservation(event.target.value)} disabled={readOnly}>
                      {["Continuous or every 5 minutes", "Repeat observations every 15 minutes", "Repeat observations every 30 minutes", "Repeat observations every 1 hour", "Routine ward frequency"].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Clinical note">
                  <textarea
                    className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={readOnly}
                  />
                </FormField>

                <div className="rounded-md border border-border">
                  <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Latest observations</div>
                  <div className="grid gap-2 p-3 sm:grid-cols-2">
                    {patient.metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs">
                        <span className="font-medium">{metric.label}</span>
                        <span className="flex items-center gap-2">
                          {metric.value}{metric.unit ? ` ${metric.unit}` : ""}
                          <Badge tone={rapidZoneTone(metric.zone)}>{metric.zone}</Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <MultiObservationTable
                  patient={patient}
                  title="Multi Observation Trend"
                  description="Previous readings are available before saving the review action."
                  compact
                />
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-border bg-surface-muted p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Patient context</div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="font-semibold">{patient.patientName}</div>
                    <div className="text-xs text-muted-foreground">{patient.ageGender}</div>
                    <div className="text-xs text-muted-foreground">{patient.visitNo}</div>
                  </div>
                </div>
                <DetailRow label="Consultant" value={patient.consultant} />
                <DetailRow label="Urine" value={patient.urineOutput} />
                <DetailRow label="Due" value={patient.reviewDue} />
                <div className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Actions
                  </div>
                  <div className="space-y-2">
                    {patient.recommendedActions.map((action) => (
                      <div key={action} className="text-xs leading-5 text-muted-foreground">{action}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {readOnly ? "Read-only role. Switch to Doctor, Nurse, or Admin to save." : "Action will be added to the static review audit trail."}
            </div>
            <div className="flex justify-end gap-2">
              <DialogPrimitive.Close asChild>
                <Button variant="outline">Cancel</Button>
              </DialogPrimitive.Close>
              <Button
                disabled={readOnly}
                onClick={() => onConfirm(patient, { status, decision, note, owner, nextObservation, updatedAt: "Just now" })}
              >
                <ClipboardCheck className="h-4 w-4" />
                Save review
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function defaultDialogDecision(patient: RapidReviewPatient, intent: DialogState["intent"]) {
  if (intent === "escalate") return patient.responseLevel === "MER Call" ? "Place MER call" : "Escalate to MDT review";
  if (intent === "observe") return "Record observation review";
  return "Record clinical review";
}

function defaultDialogStatus(patient: RapidReviewPatient, intent: DialogState["intent"]): RapidQueueStatus {
  if (intent === "escalate") return "Escalated";
  if (patient.responseLevel === "Routine") return "Closed";
  return "Acknowledged";
}

function defaultNextObservation(level: RapidResponseLevel) {
  if (level === "MER Call") return "Continuous or every 5 minutes";
  if (level === "MDT Review") return "Repeat observations every 15 minutes";
  return "Repeat observations every 30 minutes";
}

function createObservationDraft(patientId: string): ObservationDraft {
  return {
    patientId,
    observationDate: "2026-05-24",
    observationTime: "17:30",
    recordedBy: "Ward Nurse",
    shift: "Evening",
    respiratoryRate: "20",
    spo2: "97",
    oxygenFlow: "0",
    deliveryMethod: "Room air",
    systolic: "120",
    diastolic: "80",
    pulse: "86",
    temperature: "37.0",
    consciousness: "0",
    painScore: "2",
    urineOutput: "60",
    note: "Routine bedside observation recorded by nurse.",
  };
}

function buildObservationPreview(draft: ObservationDraft) {
  const dominantZone = maxZone([
    respiratoryRateZone(toNumber(draft.respiratoryRate)),
    spo2Zone(toNumber(draft.spo2)),
    systolicBpZone(toNumber(draft.systolic)),
    pulseZone(toNumber(draft.pulse)),
    temperatureZone(toNumber(draft.temperature)),
    consciousnessZone(toNumber(draft.consciousness)),
    painZone(toNumber(draft.painScore)),
    urineZone(toNumber(draft.urineOutput)),
  ]);

  return {
    dominantZone,
    responseLevel: responseFromZone(dominantZone),
  };
}

function buildObservationFromDraft(draft: ObservationDraft): RapidObservationSet {
  const preview = buildObservationPreview(draft);
  const routine = preview.responseLevel === "Routine";
  return {
    id: `obs-${draft.patientId}-${Date.now()}`,
    observationDate: draft.observationDate,
    recordedAt: `${formatDateLabel(draft.observationDate)}, ${draft.observationTime}`,
    recordedBy: draft.recordedBy,
    shift: draft.shift,
    respiratoryRate: draft.respiratoryRate,
    spo2: `${draft.spo2}%`,
    oxygenFlow: `${draft.oxygenFlow || "0"} L/min`,
    deliveryMethod: draft.deliveryMethod,
    bloodPressure: `${draft.systolic}/${draft.diastolic}`,
    pulse: draft.pulse,
    temperature: `${draft.temperature} deg C`,
    consciousness: draft.consciousness,
    painScore: `${draft.painScore}/10`,
    urineOutput: `${draft.urineOutput || "0"} ml/hr`,
    dominantZone: preview.dominantZone,
    responseLevel: preview.responseLevel,
    reviewStatus: routine ? "Reviewed" : "Pending doctor review",
    reviewedBy: routine ? "Auto screening" : undefined,
    reviewedAt: routine ? "Same time" : undefined,
    doctorAction: routine ? "Continue routine observation" : "Doctor review pending",
    note: draft.note,
  };
}

function toNumber(value: string) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

const zoneRank: Record<RapidZone, number> = { Safe: 1, Yellow: 2, Red: 3, Purple: 4 };

function maxZone(zones: RapidZone[]) {
  return zones.reduce<RapidZone>((highest, zone) => (zoneRank[zone] > zoneRank[highest] ? zone : highest), "Safe");
}

function responseFromZone(zone: RapidZone): RapidResponseLevel {
  if (zone === "Purple") return "MER Call";
  if (zone === "Red") return "MDT Review";
  if (zone === "Yellow") return "RN Review";
  return "Routine";
}

function respiratoryRateZone(value: number): RapidZone {
  if (value <= 5 || value >= 36) return "Purple";
  if ((value >= 6 && value <= 8) || (value >= 25 && value <= 35)) return "Red";
  if ((value >= 9 && value <= 11) || (value >= 21 && value <= 24)) return "Yellow";
  return "Safe";
}

function spo2Zone(value: number): RapidZone {
  if (value < 90) return "Purple";
  if (value <= 92) return "Red";
  if (value <= 94) return "Yellow";
  return "Safe";
}

function systolicBpZone(value: number): RapidZone {
  if (value < 70) return "Purple";
  if ((value >= 70 && value <= 79) || value >= 200) return "Red";
  if ((value >= 80 && value <= 89) || (value >= 181 && value <= 199)) return "Yellow";
  return "Safe";
}

function pulseZone(value: number): RapidZone {
  if (value < 30 || value > 140) return "Purple";
  if ((value >= 30 && value <= 39) || (value >= 121 && value <= 140)) return "Red";
  if ((value >= 40 && value <= 49) || (value >= 111 && value <= 120)) return "Yellow";
  return "Safe";
}

function temperatureZone(value: number): RapidZone {
  if (value <= 35 || value >= 39) return "Red";
  if ((value > 35 && value <= 36) || (value >= 38 && value < 39)) return "Yellow";
  return "Safe";
}

function consciousnessZone(value: number): RapidZone {
  if (value >= 3) return "Purple";
  if (value === 2) return "Red";
  if (value === 1) return "Yellow";
  return "Safe";
}

function painZone(value: number): RapidZone {
  if (value >= 7) return "Yellow";
  return "Safe";
}

function urineZone(value: number): RapidZone {
  if (value > 0 && value < 30) return "Red";
  return "Safe";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function patientTimelineObservations(patient: RapidReviewPatient) {
  return [...patient.observationHistory].sort((a, b) => observationDateTimeSortValue(a).localeCompare(observationDateTimeSortValue(b)));
}

function patientTimelineSummary(patient: RapidReviewPatient, reviews: Record<string, ObservationReviewUpdate>): PatientTimelineSummary {
  const observations = patientTimelineObservations(patient);
  const latest = observations.at(-1);
  const firstWarning = observations.find((observation) => observation.responseLevel !== "Routine" || observation.dominantZone !== "Safe");
  const firstHighRisk = observations.find((observation) => observation.responseLevel === "MDT Review" || observation.responseLevel === "MER Call" || observation.dominantZone === "Red" || observation.dominantZone === "Purple");
  const peak = [...observations].sort((a, b) => observationRiskRank(b) - observationRiskRank(a) || observationDateTimeSortValue(b).localeCompare(observationDateTimeSortValue(a)))[0];
  const pendingCount = observations.filter((observation) => observationReviewStatus(observation, reviews) === "Pending doctor review").length;

  return {
    latest,
    firstWarning,
    firstHighRisk,
    peak,
    reviewedCount: observations.length - pendingCount,
    pendingCount,
  };
}

function timelineChangeLabel(observation: RapidObservationSet, previous?: RapidObservationSet) {
  if (!previous) return "Baseline";
  const currentRank = observationRiskRank(observation);
  const previousRank = observationRiskRank(previous);
  if (currentRank > previousRank) return "Worsening";
  if (currentRank < previousRank) return "Improving";
  return "Stable";
}

function observationRiskRank(observation: RapidObservationSet) {
  return rapidPriorityRank(observation.responseLevel) * 10 + zoneSeverityRank(observation.dominantZone);
}

function zoneSeverityRank(zone: RapidZone) {
  if (zone === "Purple") return 4;
  if (zone === "Red") return 3;
  if (zone === "Yellow") return 2;
  return 1;
}

function paginationPages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

function observationDateCounts(rows: ObservationLogRow[]) {
  return rows.reduce<Record<string, number>>((counts, row) => {
    const date = observationDateValue(row.observation);
    counts[date] = (counts[date] ?? 0) + 1;
    return counts;
  }, {});
}

function observationMatchesDateFilter(
  observation: RapidObservationSet,
  mode: string,
  selectedDates: string[],
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  return observationMatchesDateValue(observationDateValue(observation), mode, selectedDates, singleDate, dateFrom, dateTo, latestDataDate);
}

function observationMatchesDateValue(
  date: string,
  mode: string,
  selectedDates: string[],
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  const today = todayDateValue();
  if (mode === "All dates") return true;
  if (mode === "Latest record date") return Boolean(latestDataDate) && date === latestDataDate;
  if (mode === "Today") return date === todayDateValue();
  if (mode === "Yesterday") return date === addDaysToDateValue(today, -1);
  if (mode === "Last 24 hours") return dateWithinRange(date, addDaysToDateValue(today, -1), today);
  if (mode === "Last 48 hours") return dateWithinRange(date, addDaysToDateValue(today, -2), today);
  if (mode === "Last 7 days") return dateWithinRange(date, addDaysToDateValue(today, -6), today);
  if (mode === "Last 30 days") return dateWithinRange(date, addDaysToDateValue(today, -29), today);
  if (mode === "This week") return dateWithinRange(date, startOfWeekDateValue(today), today);
  if (mode === "Last week") return dateWithinRange(date, addDaysToDateValue(startOfWeekDateValue(today), -7), addDaysToDateValue(startOfWeekDateValue(today), -1));
  if (mode === "This month") return dateWithinRange(date, startOfMonthDateValue(today), today);
  if (mode === "Last month") return dateWithinRange(date, startOfPreviousMonthDateValue(today), endOfPreviousMonthDateValue(today));
  if (mode === "Single date") return singleDate ? date === singleDate : true;
  if (mode === "Specific dates") return selectedDates.length === 0 || selectedDates.includes(date);
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return false;
    const afterFrom = !dateFrom || date >= dateFrom;
    const beforeTo = !dateTo || date <= dateTo;
    return afterFrom && beforeTo;
  }
  return true;
}

function dateFilterSummary(mode: string, selectedDates: string[], singleDate: string, dateFrom: string, dateTo: string, latestDataDate: string) {
  if (mode === "Latest record date") return latestDataDate ? formatDateLabel(latestDataDate) : "Latest record date";
  if (mode === "Single date") return singleDate ? formatDateLabel(singleDate) : "Single date";
  if (mode === "Specific dates") return selectedDates.length ? `${selectedDates.length} specific dates` : "All specific dates";
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return "Invalid date range";
    if (dateFrom && dateTo) return `${formatDateLabel(dateFrom)} to ${formatDateLabel(dateTo)}`;
    if (dateFrom) return `From ${formatDateLabel(dateFrom)}`;
    if (dateTo) return `Until ${formatDateLabel(dateTo)}`;
    return "Custom range";
  }
  return mode;
}

function latestAvailableDate(dates: string[]) {
  return dates.slice().sort((a, b) => b.localeCompare(a))[0] ?? "";
}

function dateWithinRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function todayDateValue() {
  return dateToValue(new Date());
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateToValue(date);
}

function startOfWeekDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + mondayOffset);
  return dateToValue(date);
}

function startOfMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(1);
  return dateToValue(date);
}

function startOfPreviousMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMonth(date.getMonth() - 1, 1);
  return dateToValue(date);
}

function endOfPreviousMonthDateValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(0);
  return dateToValue(date);
}

function dateToValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function observationLogSearchText(row: ObservationLogRow, review: ReturnType<typeof observationReviewDetails>) {
  return [
    row.patient.patientName,
    row.patient.uhid,
    row.patient.visitNo,
    row.patient.bed,
    row.patient.ward,
    row.patient.source,
    row.patient.consultant,
    row.observation.recordedBy,
    row.observation.shift ?? "",
    row.observation.note,
    row.observation.responseLevel,
    row.observation.dominantZone,
    review.reviewedBy,
    review.reviewedAt,
    review.doctorAction,
    review.note,
  ].join(" ");
}

function compareObservationLogRows(
  a: ObservationLogRow,
  b: ObservationLogRow,
  reviews: Record<string, ObservationReviewUpdate>,
  sortBy: string,
) {
  if (sortBy === "Oldest first") return observationDateTimeSortValue(a.observation).localeCompare(observationDateTimeSortValue(b.observation));
  if (sortBy === "Clinical priority") {
    return rapidPriorityRank(b.observation.responseLevel) - rapidPriorityRank(a.observation.responseLevel)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Patient name") {
    return a.patient.patientName.localeCompare(b.patient.patientName)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Review status") {
    return observationReviewStatus(a.observation, reviews).localeCompare(observationReviewStatus(b.observation, reviews))
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  if (sortBy === "Entered by") {
    return a.observation.recordedBy.localeCompare(b.observation.recordedBy)
      || observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
  }
  return observationDateTimeSortValue(b.observation).localeCompare(observationDateTimeSortValue(a.observation));
}

function observationDateTimeSortValue(observation: RapidObservationSet) {
  return `${observationDateValue(observation)} ${observationTimeLabel(observation)}`;
}

function flattenObservationRows(patients: RapidReviewPatient[]): ObservationLogRow[] {
  return patients
    .flatMap((patient) => patient.observationHistory.map((observation) => ({ patient, observation })))
    .sort((a, b) => `${observationDateValue(b.observation)} ${observationTimeLabel(b.observation)}`.localeCompare(`${observationDateValue(a.observation)} ${observationTimeLabel(a.observation)}`));
}

function uniqueObservationDates(patients: RapidReviewPatient[]) {
  return Array.from(new Set(flattenObservationRows(patients).map((row) => observationDateValue(row.observation))));
}

function observationDateValue(observation: RapidObservationSet) {
  return observation.observationDate ?? "2026-05-24";
}

function observationTimeLabel(observation: RapidObservationSet) {
  const match = observation.recordedAt.match(/(\d{1,2}:\d{2})/);
  return match?.[1] ?? observation.recordedAt.replace("Today ", "");
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(match[2]) - 1;
  return `${Number(match[3])} ${monthNames[monthIndex] ?? match[2]} ${match[1]}`;
}

function observationReviewStatus(observation: RapidObservationSet, reviews: Record<string, ObservationReviewUpdate>) {
  return reviews[observation.id]?.reviewStatus ?? observation.reviewStatus ?? (observation.responseLevel === "Routine" ? "Reviewed" : "Pending doctor review");
}

function observationReviewDetails(observation: RapidObservationSet, reviews: Record<string, ObservationReviewUpdate>) {
  const update = reviews[observation.id];
  return {
    reviewStatus: observationReviewStatus(observation, reviews),
    reviewedBy: update?.reviewedBy ?? observation.reviewedBy ?? (observation.responseLevel === "Routine" ? "Auto screening" : "Pending"),
    reviewedAt: update?.reviewedAt ?? observation.reviewedAt ?? (observation.responseLevel === "Routine" ? "Same time" : "Not reviewed"),
    doctorAction: update?.doctorAction ?? observation.doctorAction ?? defaultDoctorAction(observation),
    note: update?.note ?? observation.note,
  };
}

function defaultDoctorAction(observation: RapidObservationSet) {
  if (observation.responseLevel === "MER Call") return "Escalate to MER call";
  if (observation.responseLevel === "MDT Review") return "Start MDT review";
  if (observation.responseLevel === "RN Review") return "Increase observation frequency";
  return "Continue routine observation";
}

function buildAdultObservationData(patient: RapidReviewPatient, reviews: Record<string, ObservationReviewUpdate>): AdultObservationDataRow[] {
  const chartRows: AdultObservationDataRow[] = adultObservationChartRows.map((row) => ({ ...row, values: {} }));
  const rowMap = new Map<AdultObservationVitalType, AdultObservationDataRow>(chartRows.map((row) => [row.vitalType, row]));

  patient.observationHistory.forEach((observation) => {
    const hour = observationHourKey(observation);
    setAdultObservationValue(rowMap, "respiratoryRate", hour, observation.respiratoryRate);
    setAdultObservationValue(rowMap, "oxygenSaturation", hour, observation.spo2);
    setAdultObservationValue(rowMap, "oxygenFlowRate", hour, oxygenFlowChartValue(observation));
    setAdultObservationValue(rowMap, "deliveryMethod", hour, deliveryMethodChartValue(observation));
    setAdultObservationValue(rowMap, "bloodPressure", hour, observation.bloodPressure);
    setAdultObservationValue(rowMap, "pulseRate", hour, observation.pulse);
    setAdultObservationValue(rowMap, "temperature", hour, observation.temperature);
    setAdultObservationValue(rowMap, "consciousnessSedation", hour, observation.consciousness);
    setAdultObservationValue(rowMap, "painScore", hour, observation.painScore);
    setAdultObservationValue(rowMap, "intervention", hour, observationReviewDetails(observation, reviews).doctorAction);
  });

  return chartRows;
}

function setAdultObservationValue(
  rowMap: Map<AdultObservationVitalType, AdultObservationDataRow>,
  vitalType: AdultObservationVitalType,
  hour: string,
  value: string | number | undefined,
) {
  const row = rowMap.get(vitalType);
  if (row) row.values[hour] = value;
}

function observationHourKey(observation: RapidObservationSet) {
  const hour = Number.parseInt(observationTimeLabel(observation).split(":")[0] ?? "", 10);
  return Number.isFinite(hour) ? `${hour.toString().padStart(2, "0")}:00` : "00:00";
}

function oxygenFlowChartValue(observation: RapidObservationSet) {
  const oxygenFlow = observation.oxygenFlow.trim();
  const lower = oxygenFlow.toLowerCase();
  if (lower === "air" || lower.includes("room air")) return 0;
  const match = oxygenFlow.match(/\d+(\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : oxygenFlow;
}

function deliveryMethodChartValue(observation: RapidObservationSet) {
  if (observation.deliveryMethod) return observation.deliveryMethod;
  const lower = observation.oxygenFlow.toLowerCase();
  if (lower.includes("nrbm")) return "NRBM";
  if (lower.includes("nasal")) return "Nasal cannula";
  if (lower.includes("mask")) return "Simple mask";
  if (lower === "air" || lower.includes("room air")) return "Room air";
  return "--";
}

function adultObservationLegendStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
    color: palette.text,
  };
}

function adultObservationSwatchStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
  };
}

function adultObservationCellStyle(level: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[level];
  return {
    backgroundColor: palette.background,
    borderColor: palette.border,
    color: palette.text,
  };
}

function reviewStatusTone(status: ObservationReviewUpdate["reviewStatus"]): StatusTone {
  if (status === "Pending doctor review") return "warning";
  if (status === "Escalated") return "danger";
  if (status === "Closed") return "success";
  return "info";
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function zonePanelClass(zone: RapidZone) {
  if (zone === "Purple") return "border-critical/30 bg-critical/10 text-critical";
  if (zone === "Red") return "border-danger/30 bg-danger/10 text-danger";
  if (zone === "Yellow") return "border-warning/30 bg-warning/10 text-warning";
  return "border-success/25 bg-success/10 text-success";
}

function toneTextClass(tone: StatusTone) {
  if (tone === "critical") return "text-critical";
  if (tone === "danger") return "text-danger";
  if (tone === "warning") return "text-warning";
  if (tone === "success") return "text-success";
  return "text-info";
}
