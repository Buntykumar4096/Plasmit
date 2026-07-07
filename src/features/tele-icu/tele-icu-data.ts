export type TeleIcuSite = {
  id: string;
  hospital: string;
  unit: string;
  beds: string;
  highAcuity: number;
  activeDevices: number;
  fhirSync: string;
  cernerFeed: string;
  commandStatus: string;
};

export type TeleIcuConsultation = {
  id: string;
  requestNo: string;
  patient: string;
  location: string;
  requestedBy: string;
  specialist: string;
  reason: string;
  priority: string;
  fhirContext: string;
  status: string;
  eta: string;
};

export type TeleIcuEscalatedCase = {
  id: string;
  caseNo: string;
  patient: string;
  location: string;
  trigger: string;
  score: string;
  currentVitals: string;
  assignedTo: string;
  fhirBundle: string;
  status: string;
};

export const teleIcuSites: TeleIcuSite[] = [
  {
    id: "site-001",
    hospital: "Plasmit Main Hospital",
    unit: "Medical ICU",
    beds: "18 / 24 occupied",
    highAcuity: 7,
    activeDevices: 46,
    fhirSync: "Observation, Device, Encounter synced 2 min ago",
    cernerFeed: "Millennium ADT + vitals feed live",
    commandStatus: "Guarded",
  },
  {
    id: "site-002",
    hospital: "Plasmit North Wing",
    unit: "Surgical ICU",
    beds: "11 / 14 occupied",
    highAcuity: 4,
    activeDevices: 29,
    fhirSync: "MedicationRequest and CarePlan pending review",
    cernerFeed: "Orders feed delayed 6 min",
    commandStatus: "Review",
  },
  {
    id: "site-003",
    hospital: "Plasmit City Care",
    unit: "Emergency ICU",
    beds: "9 / 10 occupied",
    highAcuity: 5,
    activeDevices: 21,
    fhirSync: "Observation stream live",
    cernerFeed: "ADT feed live",
    commandStatus: "Critical",
  },
];

export const teleIcuConsultations: TeleIcuConsultation[] = [
  {
    id: "consult-001",
    requestNo: "TICU-CON-1048",
    patient: "Rahul Verma / MRN-20491",
    location: "Main Hospital MICU-08",
    requestedBy: "Dr. A. Mehta",
    specialist: "Remote Intensivist",
    reason: "Ventilator strategy review",
    priority: "High",
    fhirContext: "Patient, Encounter, Observation, Device, CarePlan",
    status: "Ready to join",
    eta: "Now",
  },
  {
    id: "consult-002",
    requestNo: "TICU-CON-1049",
    patient: "Kavya Shah / MRN-11904",
    location: "North Wing SICU-03",
    requestedBy: "ICU Nurse Lead",
    specialist: "Pulmonology on-call",
    reason: "ABG and sedation review",
    priority: "Routine",
    fhirContext: "Observation, DiagnosticReport, MedicationRequest",
    status: "Waiting specialist",
    eta: "12 min",
  },
  {
    id: "consult-003",
    requestNo: "TICU-CON-1050",
    patient: "Unknown emergency / Temp-ID-778",
    location: "City Care EICU-01",
    requestedBy: "Emergency Desk",
    specialist: "Remote Intensivist",
    reason: "Shock escalation",
    priority: "Critical",
    fhirContext: "Encounter, Observation, ServiceRequest, Provenance",
    status: "In consultation",
    eta: "Live",
  },
];

export const teleIcuEscalatedCases: TeleIcuEscalatedCase[] = [
  {
    id: "case-001",
    caseNo: "TICU-ESC-8841",
    patient: "Rahul Verma / MRN-20491",
    location: "Main Hospital MICU-08",
    trigger: "SpO2 drop with rising FiO2 need",
    score: "NEWS2 8",
    currentVitals: "SpO2 88%, HR 128, BP 92/58",
    assignedTo: "Remote Intensivist",
    fhirBundle: "Observation bundle verified",
    status: "Escalated",
  },
  {
    id: "case-002",
    caseNo: "TICU-ESC-8842",
    patient: "Meena Iyer / MRN-31077",
    location: "North Wing SICU-06",
    trigger: "Vasopressor dose increase",
    score: "SOFA 11",
    currentVitals: "MAP 61, Lactate 3.8, Temp 38.6",
    assignedTo: "Command center COO view",
    fhirBundle: "MedicationAdministration pending",
    status: "Awaiting review",
  },
  {
    id: "case-003",
    caseNo: "TICU-ESC-8843",
    patient: "Unknown emergency / Temp-ID-778",
    location: "City Care EICU-01",
    trigger: "Sepsis pathway breach",
    score: "qSOFA 3",
    currentVitals: "RR 31, SBP 86, GCS 12",
    assignedTo: "Remote Intensivist",
    fhirBundle: "ServiceRequest created",
    status: "In consultation",
  },
];
