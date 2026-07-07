import type { Role, StatusTone } from "@/types";

export type RapidResponseLevel = "Routine" | "RN Review" | "MDT Review" | "MER Call";
export type RapidZone = "Safe" | "Yellow" | "Red" | "Purple";
export type RapidQueueStatus = "New" | "In review" | "Acknowledged" | "Escalated" | "Closed";
export type AdultObservationRiskLevel = "critical" | "highRisk" | "warning" | "normal" | "empty";
export type AdultObservationVitalType =
  | "respiratoryRate"
  | "oxygenSaturation"
  | "oxygenFlowRate"
  | "deliveryMethod"
  | "bloodPressure"
  | "pulseRate"
  | "temperature"
  | "consciousnessSedation"
  | "painScore"
  | "intervention";

export type AdultObservationDataRow = {
  vitalType: AdultObservationVitalType;
  label: string;
  unit?: string;
  values: Partial<Record<string, string | number>>;
};

export type RapidObservationMetric = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  zone: RapidZone;
  trend: "Improving" | "Stable" | "Worsening";
  note: string;
};

export type RapidObservationSet = {
  id: string;
  observationDate?: string;
  recordedAt: string;
  recordedBy: string;
  shift?: "Morning" | "Evening" | "Night" | "Emergency";
  respiratoryRate: string;
  spo2: string;
  oxygenFlow: string;
  deliveryMethod?: "Room air" | "Nasal cannula" | "Simple mask" | "Venturi mask" | "NRBM" | "CPAP" | "Ventilator";
  bloodPressure: string;
  pulse: string;
  temperature: string;
  consciousness: string;
  painScore: string;
  urineOutput: string;
  dominantZone: RapidZone;
  responseLevel: RapidResponseLevel;
  reviewStatus?: "Pending doctor review" | "Reviewed" | "Escalated" | "Closed";
  reviewedBy?: string;
  reviewedAt?: string;
  doctorAction?: string;
  note: string;
};

export type RapidReviewPatient = {
  id: string;
  patientName: string;
  uhid: string;
  visitNo: string;
  ageGender: string;
  ward: string;
  bed: string;
  source: "IPD" | "Emergency" | "OPD";
  consultant: string;
  owner: string;
  lastObservationAt: string;
  waitMinutes: number;
  responseLevel: RapidResponseLevel;
  queueStatus: RapidQueueStatus;
  trigger: string;
  urineOutput: string;
  reviewDue: string;
  observationHistory: RapidObservationSet[];
  metrics: RapidObservationMetric[];
  recommendedActions: string[];
};

export type RapidResponseRule = {
  level: RapidResponseLevel;
  title: string;
  owner: string;
  targetTime: string;
  tone: StatusTone;
  criteria: string[];
  actions: string[];
};

export type RapidObservationRow = {
  metric: string;
  safe: string;
  yellow: string;
  red: string;
  purple: string;
  doctorNote: string;
};

type AdultObservationRange = {
  min?: number;
  max?: number;
};

type AdultObservationRiskRanges = Partial<Record<Exclude<AdultObservationRiskLevel, "empty">, AdultObservationRange[]>>;

export const adultObservationHours = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, "0")}:00`);

export const adultObservationChartRows: Array<{ vitalType: AdultObservationVitalType; label: string; unit?: string }> = [
  { vitalType: "respiratoryRate", label: "Respiratory Rate", unit: "/min" },
  { vitalType: "oxygenSaturation", label: "O2 Saturation", unit: "%" },
  { vitalType: "oxygenFlowRate", label: "O2 Flow Rate", unit: "L/min" },
  { vitalType: "deliveryMethod", label: "Delivery Method" },
  { vitalType: "bloodPressure", label: "Blood Pressure", unit: "mmHg" },
  { vitalType: "pulseRate", label: "Pulse Rate", unit: "/min" },
  { vitalType: "temperature", label: "Temperature", unit: "deg C" },
  { vitalType: "consciousnessSedation", label: "Consciousness / Sedation" },
  { vitalType: "painScore", label: "Pain Score" },
  { vitalType: "intervention", label: "Intervention" },
];

export const adultObservationRiskPalette: Record<AdultObservationRiskLevel, { label: string; background: string; border: string; text: string }> = {
  critical: { label: "Critical", background: "#d8c7f2", border: "#cbd5e1", text: "#32145f" },
  highRisk: { label: "High Risk", background: "#f5c6c6", border: "#cbd5e1", text: "#7f1d1d" },
  warning: { label: "Warning", background: "#fff4b8", border: "#cbd5e1", text: "#713f12" },
  normal: { label: "Normal", background: "#ffffff", border: "#cbd5e1", text: "#111827" },
  empty: { label: "Not Recorded", background: "#f3f4f6", border: "#cbd5e1", text: "#64748b" },
};

export const adultObservationRiskConfig: Record<string, AdultObservationRiskRanges> = {
  respiratoryRate: {
    critical: [{ min: 36 }, { max: 5 }],
    highRisk: [{ min: 26, max: 35 }, { min: 6, max: 10 }],
    warning: [{ min: 21, max: 25 }, { min: 11, max: 15 }],
    normal: [{ min: 16, max: 20 }],
  },
  oxygenSaturation: {
    critical: [{ max: 89 }],
    highRisk: [{ min: 90, max: 94 }],
    warning: [{ min: 95, max: 97 }],
    normal: [{ min: 98 }],
  },
  oxygenFlowRate: {
    critical: [{ min: 8 }],
    highRisk: [{ min: 6, max: 7 }],
    warning: [{ min: 1, max: 5 }],
    normal: [{ min: 0, max: 0 }],
  },
  pulseRate: {
    critical: [{ min: 140 }, { max: 40 }],
    highRisk: [{ min: 120, max: 139 }, { min: 41, max: 50 }],
    warning: [{ min: 100, max: 119 }, { min: 51, max: 59 }],
    normal: [{ min: 60, max: 99 }],
  },
  temperature: {
    critical: [{ min: 39.1 }, { max: 35 }],
    highRisk: [{ min: 38.1, max: 39 }],
    warning: [{ min: 37.6, max: 38 }, { min: 35.1, max: 36 }],
    normal: [{ min: 36.1, max: 37.5 }],
  },
  bloodPressure: {
    critical: [{ min: 220 }, { max: 70 }],
    highRisk: [{ min: 180, max: 219 }, { min: 71, max: 80 }],
    warning: [{ min: 160, max: 179 }, { min: 81, max: 90 }],
    normal: [{ min: 91, max: 159 }],
  },
  painScore: {
    highRisk: [{ min: 8, max: 10 }],
    warning: [{ min: 4, max: 7 }],
    normal: [{ min: 0, max: 3 }],
  },
  consciousnessSedation: {
    critical: [{ min: 3, max: 3 }],
    highRisk: [{ min: 2, max: 2 }],
    warning: [{ min: 1, max: 1 }],
    normal: [{ min: 0, max: 0 }],
  },
};

export function getRiskLevel(vitalType: AdultObservationVitalType, value: string | number | null | undefined): AdultObservationRiskLevel {
  const hasValue = value !== null && value !== undefined && String(value).trim() !== "" && String(value).trim() !== "--";
  if (!hasValue) return "empty";

  const ranges = adultObservationRiskConfig[vitalType];
  if (!ranges) return "normal";

  const numericValue = parseObservationNumber(vitalType, value);
  if (numericValue === null) return "empty";

  const order: Array<Exclude<AdultObservationRiskLevel, "empty">> = ["critical", "highRisk", "warning", "normal"];
  return order.find((level) => ranges[level]?.some((range) => valueInRange(numericValue, range))) ?? "normal";
}

function valueInRange(value: number, range: AdultObservationRange) {
  const aboveMin = range.min === undefined || value >= range.min;
  const belowMax = range.max === undefined || value <= range.max;
  return aboveMin && belowMax;
}

function parseObservationNumber(vitalType: AdultObservationVitalType, value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = value.trim();
  if (vitalType === "bloodPressure") {
    const systolic = Number.parseFloat(text.split("/")[0] ?? "");
    return Number.isFinite(systolic) ? systolic : null;
  }
  if (vitalType === "oxygenFlowRate" && text.toLowerCase() === "air") return 0;
  const match = text.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

type HourlyObservationSeed = {
  hour: number;
  recordedBy?: string;
  respiratoryRate: string;
  spo2: string;
  oxygenFlow: string;
  deliveryMethod?: RapidObservationSet["deliveryMethod"];
  bloodPressure: string;
  pulse: string;
  temperature: string;
  consciousness: string;
  painScore: string;
  urineOutput: string;
  dominantZone: RapidZone;
  responseLevel: RapidResponseLevel;
  note: string;
  reviewStatus?: RapidObservationSet["reviewStatus"];
  doctorAction?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

function createHourlyObservationHistory(prefix: string, seeds: HourlyObservationSeed[]): RapidObservationSet[] {
  return seeds.map((seed) => {
    const hour = seed.hour.toString().padStart(2, "0");
    return {
      id: `${prefix}-${hour}`,
      observationDate: "2026-05-24",
      recordedAt: `Today ${hour}:00`,
      recordedBy: seed.recordedBy ?? "Ward Nurse",
      shift: observationShift(seed.hour),
      respiratoryRate: seed.respiratoryRate,
      spo2: seed.spo2,
      oxygenFlow: seed.oxygenFlow,
      deliveryMethod: seed.deliveryMethod,
      bloodPressure: seed.bloodPressure,
      pulse: seed.pulse,
      temperature: seed.temperature,
      consciousness: seed.consciousness,
      painScore: seed.painScore,
      urineOutput: seed.urineOutput,
      dominantZone: seed.dominantZone,
      responseLevel: seed.responseLevel,
      reviewStatus: seed.reviewStatus,
      reviewedBy: seed.reviewedBy,
      reviewedAt: seed.reviewedAt,
      doctorAction: seed.doctorAction,
      note: seed.note,
    };
  });
}

function observationShift(hour: number): NonNullable<RapidObservationSet["shift"]> {
  if (hour >= 6 && hour < 14) return "Morning";
  if (hour >= 14 && hour < 22) return "Evening";
  return "Night";
}

export const rapidRoleAccess: Partial<Record<Role, { summary: string; actions: string[]; readOnly?: boolean }>> = {
  "Super Admin": {
    summary: "Full rapid review access across clinical queues, rules, and audit-ready actions.",
    actions: ["Review", "Escalate", "Close", "Print"],
  },
  "Hospital Admin": {
    summary: "Can monitor queues, support escalation, and print clinical review lists.",
    actions: ["Review", "Escalate", "Print"],
  },
  Doctor: {
    summary: "Doctor can review abnormal observations, start MDT review, and sign clinical action.",
    actions: ["Review", "Escalate to MDT", "Call MER", "Print"],
  },
  Nurse: {
    summary: "Nurse can record RN review, increase observation frequency, and escalate when criteria are met.",
    actions: ["RN review", "Escalate", "Record observation"],
  },
  Management: {
    summary: "Read-only operational view for patient safety queue monitoring.",
    actions: ["View", "Print"],
    readOnly: true,
  },
};

export const rapidAllowedRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"];

export const rapidReviewPatients: RapidReviewPatient[] = [
  {
    id: "rr-002",
    patientName: "Unknown Emergency",
    uhid: "TMP-ER-0098",
    visitNo: "ER-240524-014",
    ageGender: "35 / Unknown",
    ward: "ICU",
    bed: "ICU-01",
    source: "Emergency",
    consultant: "Emergency Team",
    owner: "Dr. Aman Verma",
    lastObservationAt: "Today 23:00",
    waitMinutes: 5,
    responseLevel: "MER Call",
    queueStatus: "New",
    trigger: "Purple zone observation with threatened circulation and reduced consciousness.",
    urineOutput: "20 ml/hr for 4 hrs",
    reviewDue: "Now",
    observationHistory: createHourlyObservationHistory("obs-er", [
      { hour: 0, recordedBy: "ER Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "122/78", pulse: "84", temperature: "36.8", consciousness: "0", painScore: "2", urineOutput: "60 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Stable overnight observation." },
      { hour: 1, recordedBy: "ER Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "120/78", pulse: "86", temperature: "36.8", consciousness: "0", painScore: "2", urineOutput: "58 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "No acute concern." },
      { hour: 2, recordedBy: "ER Nurse", respiratoryRate: "19", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "120/76", pulse: "88", temperature: "36.9", consciousness: "0", painScore: "2", urineOutput: "56 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Routine hourly vitals." },
      { hour: 3, recordedBy: "ER Nurse", respiratoryRate: "18", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "118/76", pulse: "88", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "55 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Observation stable." },
      { hour: 4, recordedBy: "ER Nurse", respiratoryRate: "19", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "118/74", pulse: "90", temperature: "37.1", consciousness: "0", painScore: "3", urineOutput: "52 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Mild fever watch started." },
      { hour: 5, recordedBy: "ER Nurse", respiratoryRate: "20", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "116/74", pulse: "92", temperature: "37.2", consciousness: "0", painScore: "3", urineOutput: "50 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Stable but trending warmer." },
      { hour: 6, recordedBy: "ER Nurse", respiratoryRate: "20", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "116/72", pulse: "94", temperature: "37.4", consciousness: "0", painScore: "4", urineOutput: "48 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Morning review requested." },
      { hour: 7, recordedBy: "ER Nurse", respiratoryRate: "21", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "114/72", pulse: "98", temperature: "37.6", consciousness: "0", painScore: "4", urineOutput: "45 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Yellow respiratory rate, nurse review." },
      { hour: 8, recordedBy: "ER Nurse", respiratoryRate: "22", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "112/70", pulse: "102", temperature: "37.8", consciousness: "0", painScore: "5", urineOutput: "42 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain and respiratory rate increasing." },
      { hour: 9, recordedBy: "ER Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "110/70", pulse: "106", temperature: "38.0", consciousness: "0", painScore: "5", urineOutput: "40 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Oxygen started by nurse." },
      { hour: 10, recordedBy: "ER Nurse", respiratoryRate: "24", spo2: "94%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "108/68", pulse: "110", temperature: "38.1", consciousness: "1", painScore: "6", urineOutput: "36 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Drowsiness reported, repeat observations." },
      { hour: 11, recordedBy: "ER Nurse", respiratoryRate: "25", spo2: "94%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "106/68", pulse: "114", temperature: "38.2", consciousness: "1", painScore: "6", urineOutput: "34 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Escalation watch due to persistent yellow zone." },
      { hour: 12, recordedBy: "ER Nurse", respiratoryRate: "26", spo2: "93%", oxygenFlow: "3 L/min", deliveryMethod: "Simple mask", bloodPressure: "104/66", pulse: "118", temperature: "38.3", consciousness: "1", painScore: "6", urineOutput: "32 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "MDT criteria emerging." },
      { hour: 13, recordedBy: "Shift Coordinator", respiratoryRate: "28", spo2: "92%", oxygenFlow: "4 L/min", deliveryMethod: "Simple mask", bloodPressure: "100/64", pulse: "122", temperature: "38.5", consciousness: "2", painScore: "Unable", urineOutput: "30 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "MDT review requested." },
      { hour: 14, recordedBy: "Shift Coordinator", respiratoryRate: "30", spo2: "91%", oxygenFlow: "6 L/min", deliveryMethod: "Simple mask", bloodPressure: "94/60", pulse: "126", temperature: "38.7", consciousness: "2", painScore: "Unable", urineOutput: "28 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Circulation trending down." },
      { hour: 15, recordedBy: "ER Nurse", respiratoryRate: "32", spo2: "90%", oxygenFlow: "6 L/min", deliveryMethod: "Simple mask", bloodPressure: "90/58", pulse: "128", temperature: "38.8", consciousness: "2", painScore: "Unable", urineOutput: "25 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Escalation unattended, senior review requested." },
      { hour: 16, recordedBy: "ER Nurse", respiratoryRate: "35", spo2: "89%", oxygenFlow: "8 L/min", deliveryMethod: "NRBM", bloodPressure: "86/54", pulse: "134", temperature: "38.9", consciousness: "3", painScore: "Unable", urineOutput: "22 ml/hr", dominantZone: "Purple", responseLevel: "MER Call", note: "Purple zone observation, emergency call." },
      { hour: 17, recordedBy: "ER Nurse", respiratoryRate: "36", spo2: "88%", oxygenFlow: "10 L/min", deliveryMethod: "NRBM", bloodPressure: "84/50", pulse: "138", temperature: "39.1", consciousness: "3", painScore: "Unable", urineOutput: "20 ml/hr", dominantZone: "Purple", responseLevel: "MER Call", note: "Critical deterioration with reduced consciousness." },
      { hour: 18, recordedBy: "Emergency Team", respiratoryRate: "34", spo2: "89%", oxygenFlow: "10 L/min", deliveryMethod: "NRBM", bloodPressure: "86/52", pulse: "136", temperature: "39.0", consciousness: "3", painScore: "Unable", urineOutput: "18 ml/hr", dominantZone: "Purple", responseLevel: "MER Call", note: "Emergency team at bedside, airway support ongoing." },
      { hour: 19, recordedBy: "Emergency Team", respiratoryRate: "32", spo2: "90%", oxygenFlow: "10 L/min", deliveryMethod: "NRBM", bloodPressure: "88/54", pulse: "132", temperature: "38.8", consciousness: "2", painScore: "Unable", urineOutput: "20 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Partial response after intervention." },
      { hour: 20, recordedBy: "Emergency Team", respiratoryRate: "30", spo2: "91%", oxygenFlow: "8 L/min", deliveryMethod: "NRBM", bloodPressure: "90/58", pulse: "128", temperature: "38.6", consciousness: "2", painScore: "Unable", urineOutput: "22 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Continue high dependency monitoring." },
      { hour: 21, recordedBy: "ICU Nurse", respiratoryRate: "29", spo2: "91%", oxygenFlow: "8 L/min", deliveryMethod: "NRBM", bloodPressure: "92/60", pulse: "126", temperature: "38.5", consciousness: "2", painScore: "Unable", urineOutput: "24 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "ICU transfer being prepared." },
      { hour: 22, recordedBy: "ICU Nurse", respiratoryRate: "28", spo2: "92%", oxygenFlow: "6 L/min", deliveryMethod: "Simple mask", bloodPressure: "94/62", pulse: "124", temperature: "38.3", consciousness: "2", painScore: "Unable", urineOutput: "25 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Still high risk after initial treatment." },
      { hour: 23, recordedBy: "ICU Nurse", respiratoryRate: "27", spo2: "92%", oxygenFlow: "6 L/min", deliveryMethod: "Simple mask", bloodPressure: "96/64", pulse: "122", temperature: "38.2", consciousness: "2", painScore: "Unable", urineOutput: "26 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Ongoing critical care review required." },
    ]),
    metrics: [
      { id: "rr", label: "Respiratory rate", value: "7", unit: "/min", zone: "Red", trend: "Worsening", note: "Below adult observation chart MDT threshold." },
      { id: "spo2", label: "O2 saturation", value: "88", unit: "%", zone: "Purple", trend: "Worsening", note: "Needs urgent airway and oxygen review." },
      { id: "bp", label: "Blood pressure", value: "84/50", unit: "mmHg", zone: "Purple", trend: "Worsening", note: "Shock-risk blood pressure range." },
      { id: "pulse", label: "Pulse rate", value: "132", unit: "/min", zone: "Red", trend: "Worsening", note: "Tachycardia with low BP." },
      { id: "temp", label: "Temperature", value: "38.9", unit: "deg C", zone: "Yellow", trend: "Stable", note: "Fever marker." },
      { id: "loc", label: "Consciousness", value: "3", unit: "sedation", zone: "Purple", trend: "Worsening", note: "Difficult to rouse or unresponsive." },
    ],
    recommendedActions: ["Place emergency call with location", "Initiate life support as required", "Notify senior doctor", "Increase observations after intervention"],
  },
  {
    id: "rr-003",
    patientName: "Meera Joshi",
    uhid: "PLH-240118",
    visitNo: "IPD-240524-032",
    ageGender: "42 / Female",
    ward: "Renal Ward",
    bed: "RW-112",
    source: "IPD",
    consultant: "Dr. Nisha Rao",
    owner: "Dr. Mohan Ahluvia",
    lastObservationAt: "Today 23:00",
    waitMinutes: 18,
    responseLevel: "MDT Review",
    queueStatus: "In review",
    trigger: "Red zone pulse and urine output below 30 ml/hr for 4 hours.",
    urineOutput: "25 ml/hr for 4 hrs",
    reviewDue: "12 min",
    observationHistory: createHourlyObservationHistory("obs-mj", [
      { hour: 0, recordedBy: "Renal Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "132/80", pulse: "86", temperature: "36.8", consciousness: "0", painScore: "2", urineOutput: "48 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Renal ward overnight baseline." },
      { hour: 1, recordedBy: "Renal Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "132/80", pulse: "88", temperature: "36.9", consciousness: "0", painScore: "2", urineOutput: "47 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Fluid balance stable." },
      { hour: 2, recordedBy: "Renal Nurse", respiratoryRate: "19", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "134/82", pulse: "88", temperature: "36.9", consciousness: "0", painScore: "3", urineOutput: "46 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Routine observation." },
      { hour: 3, recordedBy: "Renal Nurse", respiratoryRate: "19", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "134/82", pulse: "90", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "44 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "No acute symptom." },
      { hour: 4, recordedBy: "Renal Nurse", respiratoryRate: "19", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "136/82", pulse: "90", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "44 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Renal chart continued." },
      { hour: 5, recordedBy: "Renal Nurse", respiratoryRate: "20", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "136/84", pulse: "92", temperature: "37.1", consciousness: "0", painScore: "3", urineOutput: "42 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Early pain trend noted." },
      { hour: 6, recordedBy: "Renal Nurse", respiratoryRate: "20", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "138/84", pulse: "94", temperature: "37.2", consciousness: "0", painScore: "4", urineOutput: "42 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Baseline renal ward observation." },
      { hour: 7, recordedBy: "Renal Nurse", respiratoryRate: "20", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "140/84", pulse: "96", temperature: "37.2", consciousness: "0", painScore: "4", urineOutput: "40 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Monitor pain and urine output." },
      { hour: 8, recordedBy: "Renal Nurse", respiratoryRate: "21", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "142/86", pulse: "100", temperature: "37.3", consciousness: "0", painScore: "4", urineOutput: "38 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Yellow respiratory rate." },
      { hour: 9, recordedBy: "Renal Nurse", respiratoryRate: "22", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "144/86", pulse: "104", temperature: "37.4", consciousness: "0", painScore: "5", urineOutput: "36 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain and pulse rising." },
      { hour: 10, recordedBy: "Renal Nurse", respiratoryRate: "22", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "146/88", pulse: "108", temperature: "37.5", consciousness: "0", painScore: "5", urineOutput: "34 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "RN review completed, analgesia requested." },
      { hour: 11, recordedBy: "Renal Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "148/88", pulse: "112", temperature: "37.5", consciousness: "0", painScore: "5", urineOutput: "32 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Urine output nearing escalation threshold." },
      { hour: 12, recordedBy: "Renal Nurse", respiratoryRate: "24", spo2: "94%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "150/90", pulse: "116", temperature: "37.6", consciousness: "0", painScore: "6", urineOutput: "30 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Oxygen and fluid balance review requested." },
      { hour: 13, recordedBy: "Shift Coordinator", respiratoryRate: "25", spo2: "94%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "152/90", pulse: "120", temperature: "37.7", consciousness: "0", painScore: "6", urineOutput: "29 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "MDT criteria met by pulse and urine output." },
      { hour: 14, recordedBy: "Shift Coordinator", respiratoryRate: "25", spo2: "93%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "154/90", pulse: "122", temperature: "37.7", consciousness: "0", painScore: "6", urineOutput: "28 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Red pulse and low urine output." },
      { hour: 15, recordedBy: "Renal Nurse", respiratoryRate: "26", spo2: "93%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "156/92", pulse: "124", temperature: "37.8", consciousness: "0", painScore: "7", urineOutput: "27 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "MDT review remains due." },
      { hour: 16, recordedBy: "Renal Nurse", respiratoryRate: "26", spo2: "93%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "160/92", pulse: "126", temperature: "37.8", consciousness: "0", painScore: "7", urineOutput: "25 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Renal team notified." },
      { hour: 17, recordedBy: "Renal Nurse", respiratoryRate: "25", spo2: "94%", oxygenFlow: "2 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "158/90", pulse: "124", temperature: "37.7", consciousness: "0", painScore: "7", urineOutput: "26 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Analgesia given, repeat observation planned." },
      { hour: 18, recordedBy: "Renal Nurse", respiratoryRate: "24", spo2: "94%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "156/88", pulse: "122", temperature: "37.6", consciousness: "0", painScore: "6", urineOutput: "28 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Pulse remains in MDT range." },
      { hour: 19, recordedBy: "Renal Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "154/88", pulse: "120", temperature: "37.5", consciousness: "0", painScore: "6", urineOutput: "30 ml/hr", dominantZone: "Red", responseLevel: "MDT Review", note: "Urine output improving but pulse remains high." },
      { hour: 20, recordedBy: "Renal Nurse", respiratoryRate: "22", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "150/86", pulse: "118", temperature: "37.4", consciousness: "0", painScore: "5", urineOutput: "32 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Review response after fluid plan." },
      { hour: 21, recordedBy: "Renal Nurse", respiratoryRate: "22", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "148/84", pulse: "116", temperature: "37.3", consciousness: "0", painScore: "5", urineOutput: "34 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Continue renal monitoring." },
      { hour: 22, recordedBy: "Renal Nurse", respiratoryRate: "21", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "146/84", pulse: "114", temperature: "37.2", consciousness: "0", painScore: "5", urineOutput: "35 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain improving slowly." },
      { hour: 23, recordedBy: "Renal Nurse", respiratoryRate: "21", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "144/82", pulse: "112", temperature: "37.2", consciousness: "0", painScore: "4", urineOutput: "36 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Handover for next renal review." },
    ]),
    metrics: [
      { id: "rr", label: "Respiratory rate", value: "26", unit: "/min", zone: "Yellow", trend: "Stable", note: "RN review range." },
      { id: "spo2", label: "O2 saturation", value: "93", unit: "%", zone: "Yellow", trend: "Stable", note: "Borderline saturation." },
      { id: "bp", label: "Blood pressure", value: "160/92", unit: "mmHg", zone: "Yellow", trend: "Stable", note: "Review medication and fluid status." },
      { id: "pulse", label: "Pulse rate", value: "126", unit: "/min", zone: "Red", trend: "Worsening", note: "MDT review range." },
      { id: "temp", label: "Temperature", value: "37.8", unit: "deg C", zone: "Safe", trend: "Stable", note: "No fever escalation." },
      { id: "pain", label: "Pain score", value: "7", unit: "/10", zone: "Yellow", trend: "Worsening", note: "Needs analgesia review." },
    ],
    recommendedActions: ["MDT review within 30 minutes", "Review fluid balance and renal chart", "Repeat observations after intervention", "Escalate to MER if unattended"],
  },
  {
    id: "rr-001",
    patientName: "Arjun Kapoor",
    uhid: "PLH-240076",
    visitNo: "IPD-240524-021",
    ageGender: "58 / Male",
    ward: "Ortho Ward",
    bed: "OW-204",
    source: "IPD",
    consultant: "Dr. Aman Verma",
    owner: "Nurse Station OW",
    lastObservationAt: "Today 23:00",
    waitMinutes: 32,
    responseLevel: "RN Review",
    queueStatus: "Acknowledged",
    trigger: "Yellow zone respiratory rate, O2 saturation, and pain score.",
    urineOutput: "70 ml/hr",
    reviewDue: "25 min",
    observationHistory: createHourlyObservationHistory("obs-ak", [
      { hour: 0, recordedBy: "Ward Nurse", respiratoryRate: "17", spo2: "99%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "124/78", pulse: "78", temperature: "36.7", consciousness: "0", painScore: "2", urineOutput: "80 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Post-op overnight stable." },
      { hour: 1, recordedBy: "Ward Nurse", respiratoryRate: "17", spo2: "99%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "124/78", pulse: "80", temperature: "36.7", consciousness: "0", painScore: "2", urineOutput: "78 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Routine hourly charting." },
      { hour: 2, recordedBy: "Ward Nurse", respiratoryRate: "18", spo2: "99%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/78", pulse: "80", temperature: "36.8", consciousness: "0", painScore: "2", urineOutput: "78 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "No new complaint." },
      { hour: 3, recordedBy: "Ward Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/80", pulse: "82", temperature: "36.8", consciousness: "0", painScore: "3", urineOutput: "76 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Pain controlled." },
      { hour: 4, recordedBy: "Ward Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/80", pulse: "82", temperature: "36.8", consciousness: "0", painScore: "3", urineOutput: "75 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Observation stable." },
      { hour: 5, recordedBy: "Ward Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/80", pulse: "84", temperature: "36.9", consciousness: "0", painScore: "3", urineOutput: "75 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Post-op ward baseline." },
      { hour: 6, recordedBy: "Ward Nurse", respiratoryRate: "18", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/80", pulse: "86", temperature: "36.9", consciousness: "0", painScore: "3", urineOutput: "74 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Morning round baseline." },
      { hour: 7, recordedBy: "Ward Nurse", respiratoryRate: "19", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/80", pulse: "88", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "74 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "No oxygen requirement." },
      { hour: 8, recordedBy: "Ward Nurse", respiratoryRate: "19", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/78", pulse: "88", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "73 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Stable pre-mobilization." },
      { hour: 9, recordedBy: "Ward Nurse", respiratoryRate: "20", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/78", pulse: "90", temperature: "37.0", consciousness: "0", painScore: "3", urineOutput: "72 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Physio review planned." },
      { hour: 10, recordedBy: "Ward Nurse", respiratoryRate: "21", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "130/80", pulse: "92", temperature: "37.1", consciousness: "0", painScore: "4", urineOutput: "72 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Mild tachypnea after mobilization." },
      { hour: 11, recordedBy: "Ward Nurse", respiratoryRate: "21", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "130/80", pulse: "94", temperature: "37.1", consciousness: "0", painScore: "4", urineOutput: "72 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "RN review, encourage breathing exercises." },
      { hour: 12, recordedBy: "Ward Nurse", respiratoryRate: "22", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "130/80", pulse: "94", temperature: "37.2", consciousness: "0", painScore: "4", urineOutput: "71 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain increased after activity." },
      { hour: 13, recordedBy: "Ward Nurse", respiratoryRate: "22", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "130/80", pulse: "96", temperature: "37.2", consciousness: "0", painScore: "5", urineOutput: "70 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Analgesia reviewed." },
      { hour: 14, recordedBy: "Ward Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "130/80", pulse: "96", temperature: "37.3", consciousness: "0", painScore: "5", urineOutput: "70 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain increasing, oxygen still room air." },
      { hour: 15, recordedBy: "Ward Nurse", respiratoryRate: "24", spo2: "94%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/78", pulse: "98", temperature: "37.4", consciousness: "0", painScore: "6", urineOutput: "70 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain and respiratory rate need repeat review." },
      { hour: 16, recordedBy: "Ward Nurse", respiratoryRate: "24", spo2: "94%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "128/78", pulse: "100", temperature: "37.5", consciousness: "0", painScore: "6", urineOutput: "69 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Low-flow oxygen started after nurse review." },
      { hour: 17, recordedBy: "Ward Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "1 L/min", deliveryMethod: "Nasal cannula", bloodPressure: "128/78", pulse: "100", temperature: "37.4", consciousness: "0", painScore: "6", urineOutput: "70 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Symptoms stable, repeat in one hour." },
      { hour: 18, recordedBy: "Ward Nurse", respiratoryRate: "23", spo2: "95%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "128/78", pulse: "98", temperature: "37.3", consciousness: "0", painScore: "5", urineOutput: "70 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Trial back on room air." },
      { hour: 19, recordedBy: "Ward Nurse", respiratoryRate: "22", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/76", pulse: "96", temperature: "37.2", consciousness: "0", painScore: "5", urineOutput: "71 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Improving after analgesia." },
      { hour: 20, recordedBy: "Ward Nurse", respiratoryRate: "22", spo2: "96%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/76", pulse: "94", temperature: "37.2", consciousness: "0", painScore: "4", urineOutput: "72 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Continue observation frequency." },
      { hour: 21, recordedBy: "Ward Nurse", respiratoryRate: "21", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "126/76", pulse: "92", temperature: "37.1", consciousness: "0", painScore: "4", urineOutput: "72 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pain settling." },
      { hour: 22, recordedBy: "Ward Nurse", respiratoryRate: "21", spo2: "97%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "124/76", pulse: "90", temperature: "37.0", consciousness: "0", painScore: "4", urineOutput: "73 ml/hr", dominantZone: "Yellow", responseLevel: "RN Review", note: "Stable handover note." },
      { hour: 23, recordedBy: "Ward Nurse", respiratoryRate: "20", spo2: "98%", oxygenFlow: "Air", deliveryMethod: "Room air", bloodPressure: "124/76", pulse: "88", temperature: "36.9", consciousness: "0", painScore: "3", urineOutput: "74 ml/hr", dominantZone: "Safe", responseLevel: "Routine", note: "Returned to routine range after intervention." },
    ]),
    metrics: [
      { id: "rr", label: "Respiratory rate", value: "24", unit: "/min", zone: "Yellow", trend: "Stable", note: "Nurse review and repeat vitals." },
      { id: "spo2", label: "O2 saturation", value: "94", unit: "%", zone: "Yellow", trend: "Stable", note: "Review O2 requirements." },
      { id: "bp", label: "Blood pressure", value: "128/78", unit: "mmHg", zone: "Safe", trend: "Stable", note: "Within safe range." },
      { id: "pulse", label: "Pulse rate", value: "98", unit: "/min", zone: "Safe", trend: "Stable", note: "No pulse escalation." },
      { id: "temp", label: "Temperature", value: "37.4", unit: "deg C", zone: "Safe", trend: "Stable", note: "Monitor." },
      { id: "pain", label: "Pain score", value: "6", unit: "/10", zone: "Yellow", trend: "Worsening", note: "Analgesia review required." },
    ],
    recommendedActions: ["Registered nurse review", "Manage pain and anxiety", "Review oxygen requirement", "Increase observation frequency"],
  },
  {
    id: "rr-004",
    patientName: "Aisha Khan",
    uhid: "PLH-240221",
    visitNo: "OPD-240524-088",
    ageGender: "9 / Female",
    ward: "Pediatrics",
    bed: "P-07",
    source: "OPD",
    consultant: "Dr. Neha Malik",
    owner: "Pediatric Desk",
    lastObservationAt: "Today 15:55",
    waitMinutes: 0,
    responseLevel: "Routine",
    queueStatus: "Closed",
    trigger: "Stable observation set after nebulization review.",
    urineOutput: "Not applicable",
    reviewDue: "Routine",
    observationHistory: [
      { id: "obs-ah-1", recordedAt: "Today 14:15", recordedBy: "Pediatric Nurse", respiratoryRate: "26", spo2: "94%", oxygenFlow: "Air", bloodPressure: "104/68", pulse: "104", temperature: "37.1", consciousness: "0", painScore: "2", urineOutput: "Not applicable", dominantZone: "Yellow", responseLevel: "RN Review", note: "Pre-nebulization respiratory observation." },
      { id: "obs-ah-2", recordedAt: "Today 14:45", recordedBy: "Pediatric Nurse", respiratoryRate: "23", spo2: "96%", oxygenFlow: "Air", bloodPressure: "104/68", pulse: "96", temperature: "37.0", consciousness: "0", painScore: "1", urineOutput: "Not applicable", dominantZone: "Safe", responseLevel: "Routine", note: "Improving after nebulization." },
      { id: "obs-ah-3", recordedAt: "Today 15:25", recordedBy: "Pediatric Nurse", respiratoryRate: "21", spo2: "97%", oxygenFlow: "Air", bloodPressure: "104/68", pulse: "90", temperature: "36.9", consciousness: "0", painScore: "1", urineOutput: "Not applicable", dominantZone: "Safe", responseLevel: "Routine", note: "Observation stable." },
      { id: "obs-ah-4", recordedAt: "Today 15:55", recordedBy: "Pediatric Nurse", respiratoryRate: "20", spo2: "98%", oxygenFlow: "Air", bloodPressure: "104/68", pulse: "88", temperature: "36.9", consciousness: "0", painScore: "1", urineOutput: "Not applicable", dominantZone: "Safe", responseLevel: "Routine", note: "Ready for doctor review." },
    ],
    metrics: [
      { id: "rr", label: "Respiratory rate", value: "20", unit: "/min", zone: "Safe", trend: "Improving", note: "Stable." },
      { id: "spo2", label: "O2 saturation", value: "98", unit: "%", zone: "Safe", trend: "Improving", note: "Room air." },
      { id: "bp", label: "Blood pressure", value: "104/68", unit: "mmHg", zone: "Safe", trend: "Stable", note: "Stable." },
      { id: "pulse", label: "Pulse rate", value: "88", unit: "/min", zone: "Safe", trend: "Stable", note: "Stable." },
      { id: "temp", label: "Temperature", value: "36.9", unit: "deg C", zone: "Safe", trend: "Stable", note: "Afebrile." },
      { id: "pain", label: "Pain score", value: "1", unit: "/10", zone: "Safe", trend: "Improving", note: "Comfortable." },
    ],
    recommendedActions: ["Continue routine care", "Repeat observation as ordered", "Discharge only after doctor review"],
  },
];

export const rapidResponseRules: RapidResponseRule[] = [
  {
    level: "MER Call",
    title: "Medical Emergency Response call",
    owner: "Emergency response team",
    targetTime: "Immediately",
    tone: "critical",
    criteria: [
      "Respiratory or cardiac arrest.",
      "Threatened airway, significant bleeding, or unexpected seizure.",
      "Any observation in purple zone.",
      "Staff are seriously worried about the patient.",
    ],
    actions: [
      "Place emergency call and specify exact location.",
      "Start basic or advanced life support as required.",
      "Notify the senior doctor responsible for the patient.",
      "Increase observations after intervention until stable.",
    ],
  },
  {
    level: "MDT Review",
    title: "Multi disciplinary team review",
    owner: "Consultant team",
    targetTime: "Within 30 minutes",
    tone: "danger",
    criteria: [
      "Any red zone observation.",
      "Unrelieved chest pain.",
      "Urine output below 30 ml/hr over 4 hours or no voiding for more than 12 hours.",
      "Review not attended after escalation.",
    ],
    actions: [
      "Doctor or MDT review within 30 minutes.",
      "Repeat observations after treatment decision.",
      "Escalate to MER if patient is not reviewed within the target time.",
      "Record decision, owner, and next observation frequency.",
    ],
  },
  {
    level: "RN Review",
    title: "Registered nurse review",
    owner: "Registered nurse and shift coordinator",
    targetTime: "Prompt bedside review",
    tone: "warning",
    criteria: [
      "Any yellow zone observation.",
      "New or unexplained behaviour change.",
      "Pain, anxiety, or oxygen requirement needs review.",
      "Staff are worried and want clinical input.",
    ],
    actions: [
      "Registered nurse review and notify shift coordinator.",
      "Manage pain, anxiety, and oxygen requirement.",
      "Increase observation frequency until values return to baseline.",
      "Escalate to MDT if yellow zone persists or worsens.",
    ],
  },
];

export const rapidObservationRows: RapidObservationRow[] = [
  {
    metric: "Respiratory rate",
    safe: "12-20 /min",
    yellow: "21-24 or 9-11",
    red: "6-8 or 25-35",
    purple: "<=5 or >=36",
    doctorNote: "Confirm airway, oxygen delivery, and work of breathing.",
  },
  {
    metric: "O2 saturation",
    safe: ">=95%",
    yellow: "93-94%",
    red: "90-92%",
    purple: "<90%",
    doctorNote: "Escalate faster when saturation is falling despite oxygen.",
  },
  {
    metric: "Blood pressure",
    safe: "90-180 systolic",
    yellow: "181-199 or 80-89",
    red: "70-79 or >=200",
    purple: "<70 systolic",
    doctorNote: "Review bleeding, sepsis, medication, and fluid status.",
  },
  {
    metric: "Pulse rate",
    safe: "50-110 /min",
    yellow: "111-120 or 40-49",
    red: "121-140 or 30-39",
    purple: "<30 or >140",
    doctorNote: "Correlate with BP, temperature, pain, and rhythm.",
  },
  {
    metric: "Temperature",
    safe: "36.1-37.9 deg C",
    yellow: "35.1-36.0 or 38.0-38.9",
    red: "<=35.0 or >=39.0",
    purple: "Severe instability",
    doctorNote: "Review sepsis risk and warming or cooling plan.",
  },
  {
    metric: "Consciousness / sedation",
    safe: "Alert or score 0",
    yellow: "Drowsy or score 1",
    red: "Very drowsy or score 2",
    purple: "Difficult to rouse or score 3",
    doctorNote: "Protect airway and review sedatives, glucose, and neuro status.",
  },
];

export const consciousnessScores = [
  { score: "0", meaning: "Awake and alert", action: "Continue ordered observations" },
  { score: "1", meaning: "Occasionally drowsy, easy to rouse", action: "RN review and repeat observations" },
  { score: "2", meaning: "Frequently drowsy, easy to rouse", action: "MDT review and medication review" },
  { score: "3", meaning: "Difficult to rouse or unresponsive", action: "MER call and airway support" },
];

export function rapidLevelTone(level: RapidResponseLevel): StatusTone {
  if (level === "MER Call") return "critical";
  if (level === "MDT Review") return "danger";
  if (level === "RN Review") return "warning";
  return "success";
}

export function rapidZoneTone(zone: RapidZone): StatusTone {
  if (zone === "Purple") return "critical";
  if (zone === "Red") return "danger";
  if (zone === "Yellow") return "warning";
  return "success";
}

export function rapidStatusTone(status: RapidQueueStatus): StatusTone {
  if (status === "New") return "critical";
  if (status === "In review") return "warning";
  if (status === "Escalated") return "danger";
  if (status === "Closed") return "success";
  return "info";
}

export function rapidPriorityRank(level: RapidResponseLevel) {
  if (level === "MER Call") return 4;
  if (level === "MDT Review") return 3;
  if (level === "RN Review") return 2;
  return 1;
}
