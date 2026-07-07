"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  Bed,
  Bell,
  ChevronDown,
  CircleAlert,
  CircleUserRound,
  ClipboardList,
  FileText,
  Hospital,
  Info,
  MessageSquare,
  Monitor,
  Paperclip,
  PhoneOff,
  RefreshCw,
  Save,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Stethoscope,
  Syringe,
  User,
  UserPlus,
  UserRound,
  Video,
  X,
  Users,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total ICU Beds", value: "126", helper: "98 occupied / 28 available", icon: Bed, tone: "bg-sky-100 text-sky-600" },
  { label: "Occupancy %", value: "77.8%", helper: "Across 5 hospitals", icon: Hospital, tone: "bg-emerald-100 text-emerald-600" },
  { label: "Critical Patients", value: "23", helper: "Critical severity count", icon: Activity, tone: "bg-rose-100 text-rose-600" },
  { label: "Escalated Cases", value: "7", helper: "Pending reviews", icon: AlertTriangle, tone: "bg-orange-100 text-orange-600" },
  { label: "Active Consultations", value: "5", helper: "Ongoing calls", icon: Users, tone: "bg-violet-100 text-violet-600" },
];

const patients = [
  { name: "John Doe", mrn: "MRN12345", uhid: "UHID-44321", age: "58", gender: "Male", hospital: "City Hospital", icu: "Medical ICU", bed: "ICU-01", severity: "Critical", status: "Critical", updated: "2 min ago", devices: { ventilator: "Online", monitor: "Online", pump: "Online" } },
  { name: "Mike Smith", mrn: "MRN12346", uhid: "UHID-44322", age: "63", gender: "Male", hospital: "Metro Hospital", icu: "Surgical ICU", bed: "ICU-02", severity: "Severe", status: "Stable", updated: "1 min ago", devices: { ventilator: "Online", monitor: "Online", pump: "Offline" } },
  { name: "David Brown", mrn: "MRN12347", uhid: "UHID-44323", age: "45", gender: "Male", hospital: "Sunrise Hospital", icu: "Emergency ICU", bed: "ICU-03", severity: "Critical", status: "Escalated", updated: "3 min ago", devices: { ventilator: "Online", monitor: "Offline", pump: "Online" } },
  { name: "Robert Wilson", mrn: "MRN12348", uhid: "UHID-44324", age: "71", gender: "Male", hospital: "City Hospital", icu: "Medical ICU", bed: "ICU-04", severity: "Mild", status: "Stable", updated: "2 min ago", devices: { ventilator: "Standby", monitor: "Online", pump: "Online" } },
  { name: "William Taylor", mrn: "MRN12349", uhid: "UHID-44325", age: "67", gender: "Male", hospital: "Metro Hospital", icu: "Surgical ICU", bed: "ICU-05", severity: "Moderate", status: "Watch", updated: "1 min ago", devices: { ventilator: "Online", monitor: "Online", pump: "Online" } },
];

const vitals = [
  { time: "10:30", hr: 164, spo2: 138, rr: 116 },
  { time: "10:35", hr: 168, spo2: 142, rr: 118 },
  { time: "10:40", hr: 166, spo2: 140, rr: 121 },
  { time: "10:45", hr: 172, spo2: 143, rr: 117 },
  { time: "10:50", hr: 165, spo2: 139, rr: 119 },
  { time: "10:55", hr: 160, spo2: 141, rr: 122 },
  { time: "11:00", hr: 169, spo2: 144, rr: 120 },
  { time: "11:05", hr: 171, spo2: 146, rr: 123 },
  { time: "11:10", hr: 166, spo2: 142, rr: 118 },
  { time: "11:15", hr: 170, spo2: 141, rr: 121 },
  { time: "11:20", hr: 168, spo2: 145, rr: 119 },
  { time: "11:25", hr: 172, spo2: 148, rr: 122 },
  { time: "11:30", hr: 167, spo2: 143, rr: 120 },
  { time: "11:35", hr: 164, spo2: 145, rr: 117 },
  { time: "11:40", hr: 170, spo2: 149, rr: 121 },
  { time: "11:45", hr: 168, spo2: 146, rr: 123 },
];

const alerts = [
  { title: "Low SpO2", patient: "John Doe (ICU-01)", time: "11:52 AM", severity: "Critical", acknowledgedBy: "Dr. Sharma", tone: "critical" },
  { title: "Hypotension", patient: "Mike Smith (ICU-02)", time: "11:50 AM", severity: "Critical", acknowledgedBy: "Pending", tone: "critical" },
  { title: "Tachycardia", patient: "David Brown (ICU-03)", time: "11:48 AM", severity: "High", acknowledgedBy: "Nurse Lead", tone: "warning" },
  { title: "Ventilator Alarm", patient: "Robert Wilson (ICU-04)", time: "11:46 AM", severity: "Medium", acknowledgedBy: "Pending", tone: "info" },
  { title: "Fever", patient: "William Taylor (ICU-05)", time: "11:44 AM", severity: "Medium", acknowledgedBy: "Dr. Mehta", tone: "warning" },
];

const escalatedRows = [
  { priority: "Critical", patient: "John Doe", mrn: "MRN12345", hospital: "City Hospital", icu: "Medical ICU", bed: "ICU-01", trigger: "Low SpO2", escalationTime: "11:42 AM", since: "10 min", specialist: "Dr. Sharma", status: "Pending Review" },
  { priority: "High", patient: "Mike Smith", mrn: "MRN12346", hospital: "Metro Hospital", icu: "Surgical ICU", bed: "ICU-02", trigger: "Sepsis Alert", escalationTime: "11:37 AM", since: "15 min", specialist: "Dr. Rao", status: "Accepted" },
  { priority: "Medium", patient: "David Brown", mrn: "MRN12347", hospital: "Sunrise Hospital", icu: "Emergency ICU", bed: "ICU-03", trigger: "High BP", escalationTime: "11:32 AM", since: "20 min", specialist: "Dr. Kapoor", status: "In Progress" },
  { priority: "High", patient: "William Taylor", mrn: "MRN12349", hospital: "Metro Hospital", icu: "Surgical ICU", bed: "ICU-05", trigger: "Arrhythmia", escalationTime: "11:27 AM", since: "25 min", specialist: "Unassigned", status: "Pending Review" },
  { priority: "Medium", patient: "Robert Wilson", mrn: "MRN12348", hospital: "City Hospital", icu: "Medical ICU", bed: "ICU-04", trigger: "Low Urine Output", escalationTime: "11:22 AM", since: "30 min", specialist: "Dr. Sharma", status: "Closed" },
];

const caseTabs = ["Overview", "Vitals", "Labs", "Imaging", "Notes", "History"];

function scoreTone(value: string) {
  if (value === "Critical" || value === "Severe" || value === "High") return "danger";
  if (value === "Moderate" || value === "Medium") return "warning";
  return "success";
}

function statusTone(value: string) {
  if (value === "Critical" || value === "Escalated") return "danger";
  if (value === "Watch") return "warning";
  return "success";
}

function AlertIcon({ tone }: { tone: string }) {
  if (tone === "warning") return <CircleAlert className="h-5 w-5 text-orange-500" />;
  if (tone === "info") return <CircleAlert className="h-5 w-5 text-blue-500" />;
  return <CircleAlert className="h-5 w-5 text-red-600" />;
}

export function RemoteIntensivistCommandCenterPage() {
  const [selectedHospital, setSelectedHospital] = React.useState("All Hospitals");
  const [selectedIcu, setSelectedIcu] = React.useState("All ICUs");
  const [trendRange, setTrendRange] = React.useState("Last 1 Hour");
  const [search, setSearch] = React.useState("");
  const [selectedPatient, setSelectedPatient] = React.useState(patients[0]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const [showAllAlerts, setShowAllAlerts] = React.useState(false);
  const [refreshText, setRefreshText] = React.useState("Refresh");
  const hospitals = ["All Hospitals", ...Array.from(new Set(patients.map((patient) => patient.hospital)))];
  const icus = ["All ICUs", ...Array.from(new Set(patients.map((patient) => patient.icu)))];
  const filteredPatients = patients.filter((patient) => {
    const hospitalMatch = selectedHospital === "All Hospitals" || patient.hospital === selectedHospital;
    const icuMatch = selectedIcu === "All ICUs" || patient.icu === selectedIcu;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || [patient.name, patient.mrn, patient.uhid, patient.bed, patient.hospital, patient.icu, patient.status].some((value) => value.toLowerCase().includes(query));
    return hospitalMatch && icuMatch && searchMatch;
  });
  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 3);

  function cycleHospital() {
    const currentIndex = hospitals.indexOf(selectedHospital);
    const next = hospitals[(currentIndex + 1) % hospitals.length];
    setSelectedHospital(next);
  }

  function cycleIcu() {
    const currentIndex = icus.indexOf(selectedIcu);
    const next = icus[(currentIndex + 1) % icus.length];
    setSelectedIcu(next);
  }

  function refreshNow() {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setRefreshText(`Refreshed ${time}`);
  }

  return (
    <div className="pt-4">
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <div className="min-h-[calc(100vh-132px)] bg-[#f7f9fd]">
          <section className="min-w-0">
            <header className="flex flex-col gap-3 border-b border-border bg-white px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
              <h1 className="text-base font-bold text-foreground">Tele-ICU Command Center</h1>
              <div className="flex flex-wrap items-center gap-3">
                <select className="h-9 min-w-[160px] rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm outline-none" value={selectedHospital} onChange={(event) => setSelectedHospital(event.target.value)}>
                  {hospitals.map((hospital) => <option key={hospital}>{hospital}</option>)}
                </select>
                <select className="h-9 min-w-[150px] rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground shadow-sm outline-none" value={selectedIcu} onChange={(event) => setSelectedIcu(event.target.value)}>
                  {icus.map((icu) => <option key={icu}>{icu}</option>)}
                </select>
                <button className="relative rounded-md border border-border bg-white p-2 shadow-sm" aria-label="Notifications" onClick={() => setShowNotifications((value) => !value)} type="button">
                  <Bell className="h-4 w-4 text-[#475467]" />
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">8</span>
                </button>
                <button className="flex h-9 items-center gap-3 rounded-md border border-border bg-white px-3 shadow-sm" onClick={() => setShowProfile((value) => !value)} type="button">
                  <CircleUserRound className="h-6 w-6 text-[#3b82f6]" />
                  <span className="text-left text-xs">
                    <span className="block font-bold text-foreground">Dr. Sharma</span>
                    <span className="text-muted-foreground">Remote Intensivist</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </header>

            <main className="space-y-4 p-4">
              {(showNotifications || showProfile) ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {showNotifications ? (
                    <div className="rounded-lg border border-border bg-white p-3 text-xs shadow-sm">
                      <div className="mb-2 font-bold text-foreground">Notifications</div>
                      {["Critical Alerts", "New Consultation Requests", "Escalated Cases"].map((item) => <div className="border-t border-border py-2 first:border-t-0" key={item}>{item}</div>)}
                    </div>
                  ) : null}
                  {showProfile ? (
                    <div className="rounded-lg border border-border bg-white p-3 text-xs shadow-sm">
                      <div className="font-bold text-foreground">Dr. Sharma</div>
                      <div className="mt-1 text-muted-foreground">Remote Intensivist</div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs text-[#0f7bff]" onClick={refreshNow}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {refreshText}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5">
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-border bg-white p-2.5 shadow-sm sm:p-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${item.tone}`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold leading-tight text-[#344054] sm:text-xs">{item.label}</div>
                          <div className="mt-1 text-xl font-bold leading-none text-[#101828] sm:text-2xl">{item.value}</div>
                          <div className="mt-1 text-[10px] font-medium leading-tight text-muted-foreground sm:mt-2 sm:text-xs">{item.helper}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
                <section className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-foreground">ICU Patients Live Monitoring</h2>
                    <div className="grid w-full gap-2 md:w-auto md:grid-cols-[150px_150px_260px]">
                      <button className="flex h-9 items-center justify-between rounded-md border border-border bg-white px-3 text-xs font-semibold text-[#344054]" onClick={cycleHospital} type="button">
                        {selectedHospital}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-9 items-center justify-between rounded-md border border-border bg-white px-3 text-xs font-semibold text-[#344054]" onClick={cycleIcu} type="button">
                        {selectedIcu}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-white px-3">
                        <input className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search Patient, MRN, Bed" value={search} onChange={(event) => setSearch(event.target.value)} />
                        <button aria-label="Search patients" type="button"><Search className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead className="text-[11px] uppercase text-[#475467]">
                        <tr className="border-b border-border bg-surface-muted">
                          {["Patient", "MRN / UHID", "Age / Gender", "Hospital", "ICU / Bed", "Severity", "Status", "Updated", "Quick Actions"].map((head) => (
                            <th key={head} className="px-3 py-3 font-bold">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.map((patient) => (
                          <tr key={patient.mrn} className={cn("cursor-pointer border-b border-border/80 last:border-0 hover:bg-surface-muted", selectedPatient.mrn === patient.mrn && "bg-primary-soft")} onClick={() => setSelectedPatient(patient)}>
                            <td className="px-3 py-3 font-semibold text-[#101828]">{patient.name}</td>
                            <td className="px-3 py-3 font-medium">{patient.mrn}<div className="text-muted-foreground">{patient.uhid}</div></td>
                            <td className="px-3 py-3">{patient.age} / {patient.gender}</td>
                            <td className="px-3 py-3">{patient.hospital}</td>
                            <td className="px-3 py-3 font-medium">{patient.icu}<div className="text-muted-foreground">{patient.bed}</div></td>
                            <td className="px-3 py-3"><Badge tone={scoreTone(patient.severity)}>{patient.severity}</Badge></td>
                            <td className="px-3 py-3"><Badge tone={statusTone(patient.status)}>{patient.status}</Badge></td>
                            <td className="px-3 py-3 text-muted-foreground">{patient.updated}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1">
                                {["Open Chart", "Start Consultation", "Escalate Case"].map((action) => (
                                  <button className="rounded border border-border bg-white px-2 py-1 font-bold text-primary hover:bg-primary-soft" key={action} onClick={(event) => event.stopPropagation()} type="button">{action}</button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0f7bff]" onClick={() => { setSelectedHospital("All Hospitals"); setSelectedIcu("All ICUs"); setSearch(""); }} type="button">
                    View All Patients ({filteredPatients.length})
                    <span aria-hidden="true">-&gt;</span>
                  </button>
                </section>

                <div className="space-y-4">
                <section className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-base font-bold text-foreground">Real Time Vitals <span className="font-semibold text-muted-foreground">({selectedPatient.name} - {selectedPatient.bed})</span></h2>
                    <select className="h-9 w-full rounded-md border border-border bg-white px-3 text-xs font-bold outline-none sm:w-auto" value={trendRange} onChange={(event) => setTrendRange(event.target.value)}>
                      {["Last 1 Hour", "Last 6 Hours", "Last 24 Hours"].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                    <div><div className="text-[11px] font-bold">HR</div><div className="mt-1 text-xl font-bold text-red-600">95</div><div className="text-[11px]">bpm</div></div>
                    <div><div className="text-[11px] font-bold">BP</div><div className="mt-1 text-xl font-bold">130/85</div><div className="text-[11px]">mmHg</div></div>
                    <div><div className="text-[11px] font-bold">SpO2</div><div className="mt-1 text-xl font-bold text-emerald-600">96%</div><div className="text-[11px]">oxygen</div></div>
                    <div><div className="text-[11px] font-bold">RR</div><div className="mt-1 text-xl font-bold text-blue-600">20</div><div className="text-[11px]">/min</div></div>
                    <div><div className="text-[11px] font-bold">Temp</div><div className="mt-1 text-xl font-bold">99 F</div><div className="text-[11px]">(37.2 C)</div></div>
                  </div>
                  <div className="mt-3 h-[170px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitals} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name="HR" />
                        <Line type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} dot={false} name="SpO2" />
                        <Line type="monotone" dataKey="rr" stroke="#2563eb" strokeWidth={2} dot={false} name="RR" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex justify-center gap-5 text-xs font-medium">
                    <span className="text-red-600">HR</span>
                    <span className="text-emerald-600">SpO2</span>
                    <span className="text-blue-600">RR</span>
                  </div>
                </section>

                <section className="min-w-0 rounded-lg border border-border bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-base font-bold text-foreground">Alerts</h2>
                    <button className="text-xs font-bold text-[#0f7bff]" onClick={() => setShowAllAlerts((value) => !value)} type="button">{showAllAlerts ? "Show Less" : "View All"}</button>
                  </div>
                  <div className="divide-y divide-border">
                    {visibleAlerts.map((alert) => (
                      <button key={alert.title} className="flex w-full gap-3 py-4 text-left" type="button">
                        <AlertIcon tone={alert.tone} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#101828]">{alert.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{alert.patient}</div>
                          <div className="mt-1 text-[11px] font-semibold text-muted-foreground">Severity: {alert.severity} / Ack: {alert.acknowledgedBy}</div>
                        </div>
                        <div className="shrink-0 text-[11px] font-medium text-muted-foreground">{alert.time}</div>
                      </button>
                    ))}
                  </div>
                </section>
                </div>
              </div>

            </main>
          </section>
        </div>
      </div>
    </div>
  );
}

export function TeleIcuRemoteConsultationsPage() {
  return (
    <div className="space-y-3 pt-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.95fr)_minmax(300px,0.9fr)_minmax(280px,0.95fr)]">
        <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <h1 className="text-base font-bold text-foreground">Patient Information</h1>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <UserRound className="h-7 w-7" />
            </div>
            <div className="space-y-1 text-sm font-semibold leading-5 text-foreground">
              <div className="font-bold">John Doe</div>
              <div>MRN 12345 / UHID-44321</div>
              <div>58 Y / Male</div>
              <div>City Hospital / Medical ICU</div>
              <div>ICU-01 / Bed 1</div>
            </div>
          </div>

          <InfoGrid className="mt-5" rows={[
            ["Admission Date", "14 Jun 2026"],
            ["Length of Stay", "5 days"],
            ["Ventilator Status", "Invasive ventilation"],
            ["Location", "City Hospital, Medical ICU"],
          ]} />

          <div className="mt-8 border-t border-border pt-4">
            <h2 className="text-base font-bold text-foreground">Clinical Summary</h2>
            <div className="mt-5 space-y-5">
              <ClinicalSummaryItem icon={<Stethoscope className="h-4 w-4" />} iconClassName="bg-teal-50 text-teal-600" label="Primary Diagnosis" value="Severe Pneumonia" />
              <ClinicalSummaryItem icon={<ShieldAlert className="h-4 w-4" />} iconClassName="bg-red-50 text-red-600" label="Secondary Diagnosis" value="Sepsis, Severe ARDS" />
              <ClinicalSummaryItem icon={<User className="h-4 w-4" />} iconClassName="bg-emerald-50 text-emerald-600" label="Allergies" value="No Known Allergies" />
              <ClinicalSummaryItem icon={<Syringe className="h-4 w-4" />} iconClassName="bg-violet-50 text-violet-600" label="Current Medications" value="Piperacillin, Paracetamol, Steroids" />
              <ClinicalSummaryItem icon={<ClipboardList className="h-4 w-4" />} iconClassName="bg-slate-50 text-slate-500" label="Procedures Performed" value="Intubation, central line insertion" />
              <ClinicalSummaryItem icon={<Info className="h-4 w-4" />} iconClassName="bg-blue-50 text-blue-600" label="Latest Note" value="Patient intubated. On ventilator support." />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Consultation Request</h2>
          <div className="mt-3 space-y-4">
            <FormField label="Specialty" required>
              <select className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Pulmonology">
                <option>Pulmonology</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Nephrology</option>
                <option>Infectious Disease</option>
                <option>Critical Care</option>
              </select>
            </FormField>

            <FormField label="Priority" required>
              <select className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Urgent">
                <option>Routine</option>
                <option>Urgent</option>
                <option>Critical</option>
              </select>
            </FormField>

            <FormField label="Reason for Consultation" required>
              <textarea className="min-h-[118px] w-full resize-none rounded-md border border-border bg-white px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Worsening oxygenation despite maximal ventilator support." />
            </FormField>

            <FormField label="Clinical Question">
              <textarea className="min-h-[92px] w-full resize-none rounded-md border border-border bg-white px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Should we initiate prone ventilation protocol and adjust steroid dosing?" />
            </FormField>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-foreground">Attached Documents</h3>
            <div className="mt-3 space-y-2">
              {["Lab Report - ABG.pdf", "Imaging Report - Chest X-Ray.pdf", "Clinical Summary.pdf"].map((file) => (
                <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground" key={file}>
                  <Paperclip className="h-4 w-4 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate">{file}</span>
                  <button className="rounded p-1 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground" aria-label="Remove attached document" type="button">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Video Consultation</h2>
            <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
              <Button className="h-10 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" onClick={() => alert("Starting video consultation")} type="button"><Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Start Call</Button>
              <Button className="h-10 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" variant="outline" onClick={() => alert("Joining call")} type="button"><UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Join Call</Button>
              <Button className="h-10 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" variant="outline" onClick={() => alert("Ending call")} type="button"><PhoneOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />End Call</Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1.5 text-xs sm:gap-2">
              <FeatureTile icon={<MessageSquare className="h-4 w-4" />} title="Chat" value="Care team" />
              <FeatureTile icon={<Monitor className="h-4 w-4" />} title="Screen Sharing" value="Clinical view" />
              <FeatureTile icon={<Share2 className="h-4 w-4" />} title="File Sharing" value="Documents" />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground">Recommendations</h2>
            <div className="mt-3 space-y-4">
              <FormField label="Assessment">
                <input className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Severe ARDS" />
              </FormField>
              <FormField label="Recommendation">
                <input className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Prone ventilation, steroids" />
              </FormField>
              <FormField label="Plan">
                <textarea className="min-h-[91px] w-full resize-none rounded-md border border-border bg-white px-3 py-3 text-sm font-medium leading-5 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Monitor ABG, adjust ventilator settings." />
              </FormField>
              <FormField label="Follow-up Instructions">
                <input className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Review ABG in 2 hours" />
              </FormField>
              <FormField label="Consultation Outcome">
                <select className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Under review">
                  <option>Under review</option>
                  <option>Accepted by ICU team</option>
                  <option>Further review required</option>
                  <option>Closed</option>
                </select>
              </FormField>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <Button className="h-11 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" onClick={() => alert("Recommendation submitted")} type="button"><Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Submit</Button>
                <Button className="h-11 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" variant="outline" onClick={() => alert("Draft saved")} type="button"><Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Save Draft</Button>
                <Button className="h-11 min-w-0 rounded-md px-1 text-[11px] font-bold sm:px-3 sm:text-sm" variant="outline" onClick={() => alert("Consultation closed")} type="button"><X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Close</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ClinicalSummaryItem({ icon, iconClassName, label, value }: { icon: React.ReactNode; iconClassName: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", iconClassName)}>
        {icon}
      </div>
      <div className="min-w-0 text-sm leading-5">
        <div className="font-bold text-foreground">{label}</div>
        <div className="font-semibold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

function FormField({ children, label, required }: { children: React.ReactNode; label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export function TeleIcuEscalatedCasesPage() {
  const [selectedPatient, setSelectedPatient] = React.useState(escalatedRows[0]);
  const [activeTab, setActiveTab] = React.useState(caseTabs[0]);

  return (
    <div className="space-y-4 pt-4">
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-lg font-bold text-foreground">Escalated Cases</h1>
          <div className="text-xs font-semibold text-muted-foreground">Critical patients requiring urgent specialist intervention</div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)_minmax(140px,0.8fr)_minmax(210px,1.15fr)]">
          <select className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="All Hospitals">
            <option>All Hospitals</option>
            <option>City Hospital</option>
            <option>Metro Hospital</option>
            <option>Sunrise Hospital</option>
          </select>
          <select className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="All Priorities">
            <option>All Priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
          </select>
          <select className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="All ICUs">
            <option>All ICUs</option>
            <option>ICU-01</option>
            <option>ICU-02</option>
            <option>ICU-03</option>
          </select>
          <select className="h-11 rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue="Today">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Custom Range</option>
          </select>
          <div className="flex h-11 items-center gap-2 rounded-md border border-border bg-white px-3">
            <input className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground" placeholder="Search Patient, MRN" />
            <Search className="h-4 w-4 text-slate-700" />
          </div>
        </div>

        <div className="mt-5 grid overflow-hidden rounded-lg border border-border 2xl:grid-cols-[minmax(0,1fr)_minmax(430px,0.9fr)]">
          <div className="min-w-0 overflow-x-auto border-b border-border 2xl:border-b-0 2xl:border-r">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-white text-xs font-bold text-foreground">
                <tr className="border-b border-border bg-surface-muted">
                  {["Priority", "Patient / MRN", "Hospital", "ICU / Bed", "Trigger Reason", "Escalation Time", "Waiting", "Assigned Specialist", "Status"].map((head) => (
                    <th className="px-4 py-3" key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escalatedRows.map((row) => (
                  <tr className={cn("cursor-pointer border-b border-border last:border-b-0 transition hover:bg-surface-muted", selectedPatient.patient === row.patient && "bg-primary-soft/50")} key={row.patient} onClick={() => setSelectedPatient(row)}>
                    <td className={cn("px-4 py-4 text-xs font-bold", priorityTextClass(row.priority))}>{row.priority}</td>
                    <td className="px-4 py-4 font-bold text-foreground">{row.patient}<div className="text-xs font-semibold text-muted-foreground">{row.mrn}</div></td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.hospital}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.icu}<div className="text-xs text-muted-foreground">{row.bed}</div></td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.trigger}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.escalationTime}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.since}</td>
                    <td className="px-4 py-4 font-semibold text-foreground">{row.specialist}</td>
                    <td className="px-4 py-4 font-semibold text-foreground"><Badge tone={row.status === "Closed" ? "success" : row.status === "In Progress" ? "warning" : "danger"}>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="flex items-center gap-2 px-4 py-7 text-sm font-bold text-[#0f7bff]" type="button">
              View All Escalated Cases
              <span aria-hidden="true">-&gt;</span>
            </button>
          </div>

          <aside className="min-w-0 bg-white p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-lg font-bold text-foreground">Case Details</h2>
              <span className="text-sm font-bold text-slate-700">({selectedPatient.patient})</span>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto border-b border-border">
              {caseTabs.map((tab) => (
                <button className={cn("shrink-0 border-b-2 border-transparent px-2 pb-3 text-sm font-semibold text-slate-600 transition hover:text-primary", activeTab === tab && "border-primary text-primary")} key={tab} onClick={() => setActiveTab(tab)} type="button">
                  {tab}
                </button>
              ))}
            </div>

            <div className="rounded-b-lg border border-t-0 border-border p-4">
              {activeTab === "Overview" ? (
                <div className="space-y-4">
                  <InfoGrid rows={[
                    ["Diagnosis", "Severe Pneumonia, Sepsis"],
                    ["Clinical Summary", "ARDS with persistent hypoxemia"],
                    ["Current Condition", "On ventilator support. Hypoxemia persists."],
                    ["Escalation Reason", selectedPatient.trigger],
                  ]} />
                </div>
              ) : activeTab === "Vitals" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <VitalBlock label="HR" value="95" unit="bpm" tone="text-red-600" />
                    <VitalBlock label="BP" value="130/85" unit="mmHg" />
                    <VitalBlock label="SpO2" value="90%" unit="" tone="text-emerald-600" />
                    <VitalBlock label="RR" value="22" unit="/min" tone="text-blue-700" />
                    <VitalBlock label="Temp" value="99 F" unit="(37.2 C)" />
                  </div>
                  <div className="h-[130px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitals} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="spo2" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="rr" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : activeTab === "Labs" ? (
                <InfoGrid rows={[
                  ["Biochemistry", "CRP 126, Lactate 3.1"],
                  ["CBC", "WBC 18.4, Hb 10.8, Platelets 165k"],
                  ["LFT / KFT", "Bilirubin 1.2, Creatinine 1.5"],
                  ["Electrolytes / ABG", "Na 136, K 4.1, pH 7.31, PaO2 58"],
                  ["Microbiology", "Blood culture pending"],
                ]} />
              ) : activeTab === "Imaging" ? (
                <InfoGrid rows={[
                  ["X-Ray", "Bilateral infiltrates"],
                  ["CT", "Diffuse ground-glass opacities"],
                  ["MRI", "Not indicated"],
                  ["Ultrasound", "No pleural collection"],
                  ["Findings / Impression", "Severe ARDS pattern"],
                ]} />
              ) : activeTab === "Notes" ? (
                <InfoGrid rows={[
                  ["Doctor Notes", "Prone ventilation discussed."],
                  ["Nursing Notes", "High FiO2 requirement continues."],
                  ["Consultation Notes", "Pulmonology review requested."],
                ]} />
              ) : activeTab === "History" ? (
                <InfoGrid rows={[
                  ["Previous Consultations", "Critical care review yesterday"],
                  ["Escalation History", "Two SpO2 escalations in 24 hours"],
                  ["Treatment History", "Antibiotics, steroids, ventilator optimization"],
                ]} />
              ) : (
                null
              )}
            </div>

            <div className="mt-3 rounded-lg border border-border p-4">
              <h3 className="text-sm font-bold text-foreground">Latest Vitals</h3>
              <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                <VitalBlock label="HR" value="95" unit="bpm" tone="text-red-600" />
                <VitalBlock label="BP" value="130/85" unit="mmHg" />
                <VitalBlock label="SpO2" value="90%" unit="" tone="text-emerald-600" />
                <VitalBlock label="RR" value="22" unit="/min" tone="text-blue-700" />
                <VitalBlock label="Temp" value="99 F" unit="(37.2 C)" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Button className="h-10 rounded-md bg-emerald-600 text-sm font-bold text-white shadow-none hover:bg-emerald-700" onClick={() => alert(`Accepted ${selectedPatient.patient}`)} type="button">Accept Case</Button>
              <Button className="h-10 rounded-md bg-blue-700 text-sm font-bold text-white shadow-none hover:bg-blue-800" onClick={() => alert(`Assigning specialist for ${selectedPatient.patient}`)} type="button">Assign Specialist</Button>
              <Button className="h-10 rounded-md bg-blue-600 text-sm font-bold text-white shadow-none hover:bg-blue-700" onClick={() => alert(`Starting consultation for ${selectedPatient.patient}`)} type="button">Start Consultation</Button>
              <Button className="h-10 rounded-md bg-violet-700 text-sm font-bold text-white shadow-none hover:bg-violet-800" onClick={() => alert(`Transfer started for ${selectedPatient.patient}`)} type="button">Transfer</Button>
              <Button className="h-10 rounded-md border border-border bg-white text-sm font-bold text-foreground shadow-none hover:bg-surface-muted" onClick={() => alert(`Requesting more information for ${selectedPatient.patient}`)} type="button">Request Info</Button>
              <Button className="h-10 rounded-md border border-border bg-white text-sm font-bold text-foreground shadow-none hover:bg-surface-muted" onClick={() => alert(`Closed ${selectedPatient.patient}`)} type="button">Close Case</Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function priorityTextClass(priority: string) {
  if (priority === "Critical") return "text-red-700";
  if (priority === "High") return "text-red-500";
  return "text-amber-500";
}

function VitalBlock({ label, tone, unit, value }: { label: string; tone?: string; unit: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold leading-none text-foreground", tone)}>{value}</div>
      {unit ? <div className="mt-1 text-xs font-semibold text-foreground">{unit}</div> : null}
    </div>
  );
}

function InfoGrid({ className, rows }: { className?: string; rows: Array<[string, string]> }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {rows.map(([label, value]) => (
        <div className="rounded-md border border-border bg-surface-muted p-2 text-sm sm:p-3" key={label}>
          <div className="text-[10px] font-bold uppercase leading-tight text-muted-foreground sm:text-xs">{label}</div>
          <div className="mt-1 text-xs font-semibold leading-tight text-foreground sm:text-sm">{value}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-muted p-2 sm:p-3">
      <div className="flex items-center gap-1 text-[11px] font-bold leading-tight text-foreground sm:gap-2 sm:text-sm">
        {icon}
        <span className="min-w-0">{title}</span>
      </div>
      <div className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground sm:text-sm">{value}</div>
    </div>
  );
}
