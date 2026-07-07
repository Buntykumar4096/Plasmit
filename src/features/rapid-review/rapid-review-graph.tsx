"use client";

import * as React from "react";
import { Activity, BarChart3, HeartPulse, Search, Table2, UsersRound } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import {
  adultObservationHours,
  adultObservationRiskPalette,
  getRiskLevel,
  rapidLevelTone,
  rapidZoneTone,
  type AdultObservationRiskLevel,
  type AdultObservationVitalType,
  type RapidObservationSet,
  type RapidReviewPatient,
} from "./rapid-review-data";

type ReviewGraphMetricId =
  | "respiratoryRate"
  | "oxygenSaturation"
  | "oxygenFlowRate"
  | "bloodPressure"
  | "pulseRate"
  | "temperature"
  | "consciousnessSedation"
  | "painScore";

type ReviewGraphMetric = {
  id: ReviewGraphMetricId;
  vitalType: AdultObservationVitalType;
  label: string;
  shortLabel: string;
  unit: string;
  normalText: string;
  extractor: (observation: RapidObservationSet) => number | null;
  display: (observation: RapidObservationSet) => string;
};

type ReviewGraphPoint = {
  hour: string;
  value: number | null;
};

const reviewGraphLineColor = "#2563eb";

const reviewGraphMetrics: ReviewGraphMetric[] = [
  {
    id: "respiratoryRate",
    vitalType: "respiratoryRate",
    label: "Respiratory Rate",
    shortLabel: "RR",
    unit: "/min",
    normalText: "Normal 16-20 /min",
    extractor: (observation) => parseObservationNumber(observation.respiratoryRate),
    display: (observation) => observation.respiratoryRate,
  },
  {
    id: "oxygenSaturation",
    vitalType: "oxygenSaturation",
    label: "O2 Saturation",
    shortLabel: "SpO2",
    unit: "%",
    normalText: "Normal >= 98%",
    extractor: (observation) => parseObservationNumber(observation.spo2),
    display: (observation) => observation.spo2,
  },
  {
    id: "oxygenFlowRate",
    vitalType: "oxygenFlowRate",
    label: "O2 Flow Rate",
    shortLabel: "O2 Flow",
    unit: "L/min",
    normalText: "Normal 0 L/min",
    extractor: (observation) => oxygenFlowValue(observation.oxygenFlow),
    display: (observation) => observation.oxygenFlow,
  },
  {
    id: "bloodPressure",
    vitalType: "bloodPressure",
    label: "Blood Pressure",
    shortLabel: "BP sys",
    unit: "mmHg",
    normalText: "Systolic normal 91-159",
    extractor: (observation) => systolicValue(observation.bloodPressure),
    display: (observation) => observation.bloodPressure,
  },
  {
    id: "pulseRate",
    vitalType: "pulseRate",
    label: "Pulse Rate",
    shortLabel: "Pulse",
    unit: "/min",
    normalText: "Normal 60-99 /min",
    extractor: (observation) => parseObservationNumber(observation.pulse),
    display: (observation) => observation.pulse,
  },
  {
    id: "temperature",
    vitalType: "temperature",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "deg C",
    normalText: "Normal 36.1-37.5 deg C",
    extractor: (observation) => parseObservationNumber(observation.temperature),
    display: (observation) => observation.temperature,
  },
  {
    id: "consciousnessSedation",
    vitalType: "consciousnessSedation",
    label: "Consciousness / Sedation",
    shortLabel: "LOC",
    unit: "score",
    normalText: "Normal score 0",
    extractor: (observation) => parseObservationNumber(observation.consciousness),
    display: (observation) => observation.consciousness,
  },
  {
    id: "painScore",
    vitalType: "painScore",
    label: "Pain Score",
    shortLabel: "Pain",
    unit: "/10",
    normalText: "Normal 0-3",
    extractor: (observation) => parseObservationNumber(observation.painScore),
    display: (observation) => observation.painScore,
  },
];

export function RapidReviewGraphTab({ patients }: { patients: RapidReviewPatient[] }) {
  const [metricId, setMetricId] = React.useState<ReviewGraphMetricId>("respiratoryRate");
  const [patientId, setPatientId] = React.useState(patients[0]?.id ?? "");
  const [viewMode, setViewMode] = React.useState("Graph + table");
  const [search, setSearch] = React.useState("");
  const [dateMode, setDateMode] = React.useState("All dates");
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

  const metric = reviewGraphMetrics.find((item) => item.id === metricId) ?? reviewGraphMetrics[0];
  const selectedPatient = patients.find((patient) => patient.id === patientId) ?? patients[0];
  const patientDates = selectedPatient ? uniqueObservationDates(selectedPatient.observationHistory) : [];
  const latestDataDate = latestAvailableDate(patientDates);
  const filteredObservations = selectedPatient
    ? selectedPatient.observationHistory.filter((observation) => observationMatchesDateFilter(observation, dateMode, singleDate, dateFrom, dateTo, latestDataDate))
    : [];
  const patientMatches = React.useMemo(() => {
    return patients.filter((patient) => {
      const searchText = `${patient.patientName} ${patient.uhid} ${patient.bed} ${patient.ward} ${patient.consultant}`;
      return searchText.toLowerCase().includes(search.toLowerCase());
    });
  }, [patients, search]);
  const graphData = React.useMemo(() => buildReviewGraphData(filteredObservations, metric), [filteredObservations, metric]);
  const summary = buildReviewGraphSummary(filteredObservations, metric);

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
  }

  if (!patients.length) {
    return <EmptyState icon={BarChart3} title="No patients available" description="No rapid review observations are available for graph review." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Review Graph</CardTitle>
            <CardDescription>Select one patient, click any vital, and review that patient&apos;s 24-hour graph and table separately.</CardDescription>
          </div>
          <Badge tone="info">Patient-wise</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm xl:col-span-2">
              <span className="font-medium text-foreground">Search patient</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Search name, UHID, bed, ward..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient filter</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientName} - {patient.uhid} - {patient.bed}
                  </option>
                ))}
              </select>
            </label>
            <NativeSelect
              label="View"
              value={viewMode}
              onChange={setViewMode}
              options={["Graph + table", "Graph only", "Table only"]}
            />
          </div>

          <ReviewGraphDateFilter
            dateFrom={dateFrom}
            dateMode={dateMode}
            dateTo={dateTo}
            latestDataDate={latestDataDate}
            onDateFrom={setDateFrom}
            onDateMode={updateDateMode}
            onDateTo={setDateTo}
            onSingleDate={setSingleDate}
            singleDate={singleDate}
          />

          {search.trim() ? (
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Matching patients</div>
              <div className="flex flex-wrap gap-2">
                {patientMatches.length ? patientMatches.map((patient) => (
                  <Button
                    key={patient.id}
                    size="sm"
                    variant={patient.id === selectedPatient?.id ? "default" : "outline"}
                    onClick={() => setPatientId(patient.id)}
                  >
                    {patient.patientName} - {patient.bed}
                  </Button>
                )) : <span className="text-sm text-muted-foreground">No patient matched this search.</span>}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {reviewGraphMetrics.map((item) => (
              <button
                className={cn(
                  "rounded-md border p-3 text-left transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20",
                  item.id === metric.id ? "border-primary bg-primary/10" : "border-border bg-background",
                )}
                key={item.id}
                onClick={() => setMetricId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.normalText}</div>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GraphStatCard label="Selected vital" value={metric.shortLabel} context={metric.unit} tone="info" icon={BarChart3} />
        <GraphStatCard label="Total entries" value={summary.totalEntries} context={dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)} tone="success" icon={Table2} />
        <GraphStatCard label="High/Critical" value={summary.highRiskCount + summary.criticalCount} context={`${summary.criticalCount} critical`} tone={summary.criticalCount ? "critical" : summary.highRiskCount ? "danger" : "success"} icon={HeartPulse} />
        <GraphStatCard label="Patient" value={selectedPatient?.patientName ?? "-"} context={selectedPatient ? `${selectedPatient.bed}, ${selectedPatient.ward}` : "Focused"} tone="info" icon={UsersRound} />
      </div>

      {viewMode !== "Table only" && selectedPatient ? (
        <ReviewGraphPanel patient={selectedPatient} data={graphData} metric={metric} dateSummary={dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)} />
      ) : null}

      {viewMode !== "Graph only" && selectedPatient ? (
        <ReviewGraphTable patient={selectedPatient} observations={filteredObservations} metric={metric} dateSummary={dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)} />
      ) : null}
    </div>
  );
}

function ReviewGraphDateFilter({
  dateMode,
  onDateMode,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
  latestDataDate,
}: {
  dateMode: string;
  onDateMode: (mode: string) => void;
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
  latestDataDate: string;
}) {
  const modes = ["All dates", "Latest record date", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Single date", "Custom range"];
  const invalidRange = dateMode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">{dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={dateMode === mode ? "default" : "outline"}
              onClick={() => onDateMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {dateMode === "Single date" ? (
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

      {dateMode === "Custom range" ? (
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
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          From date cannot be after To date.
        </div>
      ) : null}
    </div>
  );
}

function ReviewGraphPanel({
  patient,
  data,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  data: ReviewGraphPoint[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - 24 Hour Graph</CardTitle>
          <CardDescription>{patient.patientName} - {patient.uhid} - {patient.bed}. {dateSummary}.</CardDescription>
        </div>
        <StatusPill tone="info">{metric.unit}</StatusPill>
      </CardHeader>
      <CardContent>
        <div className="h-[360px]">
          <ResponsiveContainer height="100%" initialDimension={{ width: 800, height: 280 }} width="100%">
            <LineChart data={data} margin={{ left: -16, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} width={52} />
              <Tooltip />
              <Legend />
              <Line
                activeDot={{ r: 5 }}
                connectNulls
                dataKey="value"
                dot={{ r: 2 }}
                name={`${patient.patientName} (${metric.shortLabel})`}
                stroke={reviewGraphLineColor}
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewGraphTable({
  patient,
  observations,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  observations: RapidObservationSet[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - 24 Hour Data</CardTitle>
          <CardDescription>{patient.patientName} patient-wise table. Date filter: {dateSummary}.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-border bg-surface-muted px-3 py-2 text-left">Hour</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Value</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Risk</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Response</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Entered by</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {adultObservationHours.map((hour) => {
                const observation = observations.find((item) => observationHourKey(item) === hour);
                const value = observation ? metric.display(observation) : "--";
                const numericValue = observation ? metric.extractor(observation) : null;
                const risk = getRiskLevel(metric.vitalType, numericValue ?? value);
                return (
                  <tr className="border-b border-border last:border-0" key={hour}>
                    <td className="sticky left-0 z-10 border-r border-border bg-background px-3 py-2 font-medium">{hour}</td>
                    <td className="border-r border-border px-3 py-2 font-semibold" style={riskCellStyle(risk)}>{value}</td>
                    <td className="border-r border-border px-3 py-2">
                      <Badge tone={riskBadgeTone(risk)}>{adultObservationRiskPalette[risk].label}</Badge>
                    </td>
                    <td className="border-r border-border px-3 py-2">
                      {observation ? (
                        <div className="flex flex-wrap gap-1">
                          <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                          <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                        </div>
                      ) : <span className="text-muted-foreground">--</span>}
                    </td>
                    <td className="border-r border-border px-3 py-2 text-muted-foreground">{observation?.recordedBy ?? "--"}</td>
                    <td className="min-w-[260px] border-r border-border px-3 py-2 text-muted-foreground">{observation?.note ?? "No value recorded"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function GraphStatCard({
  label,
  value,
  context,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  context: string;
  tone: StatusTone;
  icon: typeof Activity;
}) {
  return (
    <Card className="min-h-[116px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <StatusPill tone={tone}>{context}</StatusPill>
      </div>
    </Card>
  );
}

function buildReviewGraphData(observations: RapidObservationSet[], metric: ReviewGraphMetric): ReviewGraphPoint[] {
  return adultObservationHours.map((hour) => {
    const observation = observations.find((item) => observationHourKey(item) === hour);
    return { hour, value: observation ? metric.extractor(observation) : null };
  });
}

function buildReviewGraphSummary(observations: RapidObservationSet[], metric: ReviewGraphMetric) {
  return observations.reduce(
    (summary, observation) => {
      const value = metric.extractor(observation);
      const risk = getRiskLevel(metric.vitalType, value ?? metric.display(observation));
      summary.totalEntries += 1;
      if (risk === "critical") summary.criticalCount += 1;
      if (risk === "highRisk") summary.highRiskCount += 1;
      return summary;
    },
    { criticalCount: 0, highRiskCount: 0, totalEntries: 0 },
  );
}

function uniqueObservationDates(observations: RapidObservationSet[]) {
  return Array.from(new Set(observations.map((observation) => observationDateValue(observation)))).sort((a, b) => b.localeCompare(a));
}

function observationMatchesDateFilter(
  observation: RapidObservationSet,
  mode: string,
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  const date = observationDateValue(observation);
  const today = todayDateValue();
  if (mode === "All dates") return true;
  if (mode === "Latest record date") return Boolean(latestDataDate) && date === latestDataDate;
  if (mode === "Today") return date === today;
  if (mode === "Yesterday") return date === addDaysToDateValue(today, -1);
  if (mode === "Last 7 days") return date >= addDaysToDateValue(today, -6) && date <= today;
  if (mode === "Last 30 days") return date >= addDaysToDateValue(today, -29) && date <= today;
  if (mode === "Single date") return singleDate ? date === singleDate : true;
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return false;
    return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  }
  return true;
}

function dateFilterSummary(mode: string, singleDate: string, dateFrom: string, dateTo: string, latestDataDate: string) {
  if (mode === "Latest record date") return latestDataDate ? formatDateLabel(latestDataDate) : "Latest record date";
  if (mode === "Single date") return singleDate ? formatDateLabel(singleDate) : "Single date";
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
  return dates[0] ?? "";
}

function observationDateValue(observation: RapidObservationSet) {
  return observation.observationDate ?? "2026-05-24";
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(match[2]) - 1;
  return `${Number(match[3])} ${monthNames[monthIndex] ?? match[2]} ${match[1]}`;
}

function todayDateValue() {
  return dateToValue(new Date());
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateToValue(date);
}

function dateToValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function observationHourKey(observation: RapidObservationSet) {
  const match = observation.recordedAt.match(/(\d{1,2}):\d{2}/);
  const hour = Number.parseInt(match?.[1] ?? "", 10);
  return Number.isFinite(hour) ? `${hour.toString().padStart(2, "0")}:00` : "00:00";
}

function parseObservationNumber(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function systolicValue(value: string) {
  const systolic = Number.parseFloat(value.split("/")[0] ?? "");
  return Number.isFinite(systolic) ? systolic : null;
}

function oxygenFlowValue(value: string) {
  const lower = value.toLowerCase();
  if (lower === "air" || lower.includes("room air")) return 0;
  return parseObservationNumber(value);
}

function riskCellStyle(risk: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[risk];
  return {
    backgroundColor: palette.background,
    color: palette.text,
  };
}

function riskBadgeTone(risk: AdultObservationRiskLevel): StatusTone {
  if (risk === "critical") return "critical";
  if (risk === "highRisk") return "danger";
  if (risk === "warning") return "warning";
  if (risk === "normal") return "success";
  return "muted";
}
