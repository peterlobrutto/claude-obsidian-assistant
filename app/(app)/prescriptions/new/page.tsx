"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Check, ChevronRight, User, Pill, Stethoscope, ClipboardList,
  ArrowLeftRight, AlertTriangle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockPatients, mockDrugs, mockPrescribers,
  mockTransferLog, sessionPrescriptions,
} from "@/lib/mock-data";
import type { Patient, Drug, Prescriber, Prescription } from "@/lib/mock-data";

// ── Channel options ────────────────────────────────────────────────────────────
const channels = [
  { id: "eRx",         label: "E-Prescribe (eRx)",  desc: "Electronic prescription from prescriber system" },
  { id: "Fax",         label: "Fax",                 desc: "Fax received from prescriber office" },
  { id: "Manual",      label: "Manual Entry",        desc: "Verbal, phone-in, or walk-in Rx" },
  { id: "Transfer In", label: "Transfer In",          desc: "Patient transferring Rx from another pharmacy" },
] as const;

// ── Standard 4-step flow steps ─────────────────────────────────────────────────
const steps = [
  { id: 1, label: "Patient",    icon: User },
  { id: 2, label: "Drug",       icon: Pill },
  { id: 3, label: "Prescriber", icon: Stethoscope },
  { id: 4, label: "Rx Details", icon: ClipboardList },
];

// ── DEA schedule options for Transfer In form ──────────────────────────────────
const deaSchedules = [
  { value: "Non-Controlled", label: "Non-Controlled" },
  { value: "V",  label: "Schedule V" },
  { value: "IV", label: "Schedule IV" },
  { value: "III", label: "Schedule III" },
  { value: "II", label: "Schedule II" },
];

export default function NewPrescriptionPage() {
  const router = useRouter();

  // ── Channel selection (Step 0) ───────────────────────────────────────────────
  const [channel, setChannel] = useState<string | null>(null);

  // ── Standard 4-step flow ─────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch]       = useState("");
  const [selectedPatient, setSelectedPatient]   = useState<Patient | null>(null);
  const [drugSearch, setDrugSearch]             = useState("");
  const [selectedDrug, setSelectedDrug]         = useState<Drug | null>(null);
  const [prescriberSearch, setPrescriberSearch] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState<Prescriber | null>(null);
  const [qty, setQty]             = useState("30");
  const [daysSupply, setDaysSupply] = useState("30");
  const [refills, setRefills]     = useState("0");
  const [sig, setSig]             = useState("");
  const [dawCode, setDawCode]     = useState("0");
  const [submitting, setSubmitting] = useState(false);

  // ── Transfer In form state ───────────────────────────────────────────────────
  // Patient section (reuses same patient search)
  const [tiPatientSearch, setTiPatientSearch]   = useState("");
  const [tiSelectedPatient, setTiSelectedPatient] = useState<Patient | null>(null);
  // Drug information
  const [tiDrugName, setTiDrugName]       = useState("");
  const [tiStrength, setTiStrength]       = useState("");
  const [tiDosageForm, setTiDosageForm]   = useState("");
  const [tiSig, setTiSig]                 = useState("");
  const [tiQty, setTiQty]                 = useState("");
  const [tiDaysSupply, setTiDaysSupply]   = useState("");
  const [tiDeaSchedule, setTiDeaSchedule] = useState("Non-Controlled");
  // Originating pharmacy
  const [tiPharmacyName, setTiPharmacyName]         = useState("");
  const [tiPharmacyPhone, setTiPharmacyPhone]       = useState("");
  const [tiPharmacyAddress, setTiPharmacyAddress]   = useState("");
  const [tiPharmacyNcpdp, setTiPharmacyNcpdp]       = useState("");
  const [tiPharmacyDea, setTiPharmacyDea]           = useState("");
  const [tiPharmacistName, setTiPharmacistName]     = useState("");
  // Original Rx details
  const [tiOrigRxNumber, setTiOrigRxNumber]               = useState("");
  const [tiOrigPrescriberName, setTiOrigPrescriberName]   = useState("");
  const [tiOrigPrescriberNpi, setTiOrigPrescriberNpi]     = useState("");
  const [tiOrigRxDate, setTiOrigRxDate]                   = useState("");
  const [tiLastDispensedDate, setTiLastDispensedDate]     = useState("");
  const [tiOrigRefillsAuthorized, setTiOrigRefillsAuthorized] = useState("");
  const [tiRefillsRemaining, setTiRefillsRemaining]       = useState("");
  const [tiPartialFillsDispensed, setTiPartialFillsDispensed] = useState("");

  // ── Transfer In derived state ─────────────────────────────────────────────────
  const isScheduleII = tiDeaSchedule === "II";
  const isScheduleCSIIIV = ["III", "IV", "V"].includes(tiDeaSchedule);

  // One-transfer duplicate detection (US-24.3)
  // API layer enforces this check server-side on every transfer attempt
  const isDuplicateTransfer = !!(
    tiOrigRxNumber.trim() &&
    tiPharmacyName.trim() &&
    mockTransferLog.some(
      entry =>
        entry.type === "transfer_in" &&
        entry.origRxNumber === tiOrigRxNumber.trim() &&
        entry.origPharmacy === tiPharmacyName.trim()
    )
  );

  // Validate refills remaining ≤ authorized
  const refillsRemainingValid =
    !tiRefillsRemaining || !tiOrigRefillsAuthorized ||
    Number(tiRefillsRemaining) <= Number(tiOrigRefillsAuthorized);

  const tiRequiredFilled =
    !!tiSelectedPatient &&
    !!tiDrugName.trim() &&
    !!tiStrength.trim() &&
    !!tiDosageForm.trim() &&
    !!tiSig.trim() &&
    !!tiQty.trim() &&
    !!tiDaysSupply.trim() &&
    !!tiPharmacyName.trim() &&
    !!tiPharmacyPhone.trim() &&
    !!tiPharmacyAddress.trim() &&
    !!tiPharmacistName.trim() &&
    !!tiOrigRxNumber.trim() &&
    !!tiOrigPrescriberName.trim() &&
    !!tiOrigPrescriberNpi.trim() &&
    !!tiOrigRxDate &&
    !!tiLastDispensedDate &&
    !!tiOrigRefillsAuthorized.trim() &&
    !!tiRefillsRemaining.trim() &&
    refillsRemainingValid &&
    (!isScheduleCSIIIV || !!tiPharmacyDea.trim()) &&
    (!isScheduleCSIIIV || !!tiPartialFillsDispensed.trim());

  const canSave = tiRequiredFilled && !isScheduleII && !isDuplicateTransfer;

  // ── Patient search helpers ─────────────────────────────────────────────────────
  const filteredPatients = patientSearch.length > 1
    ? mockPatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch)
      ).slice(0, 5)
    : [];

  const tiFilteredPatients = tiPatientSearch.length > 1
    ? mockPatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(tiPatientSearch.toLowerCase()) ||
        p.phone.includes(tiPatientSearch)
      ).slice(0, 5)
    : [];

  const filteredDrugs = drugSearch.length > 1
    ? mockDrugs.filter(d =>
        d.name.toLowerCase().includes(drugSearch.toLowerCase()) ||
        d.ndc.includes(drugSearch)
      ).slice(0, 6)
    : [];

  const filteredPrescribers = prescriberSearch.length > 1
    ? mockPrescribers.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(prescriberSearch.toLowerCase()) ||
        p.npi.includes(prescriberSearch)
      )
    : [];

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/prescriptions");
  };

  const handleTransferInSave = () => {
    const scheduleMap: Record<string, Prescription["csSchedule"]> = {
      "III": "CIII", "IV": "CIV", "V": "CV", "II": "CII",
    };
    const csSchedule = scheduleMap[tiDeaSchedule];
    const rxId = `rx-ti-${Date.now()}`;
    const rxNumber = `RX-2026-TI-${String(Date.now()).slice(-6)}`;
    const now = new Date().toISOString();

    const newRx: Prescription = {
      id: rxId,
      rxNumber,
      patientId: tiSelectedPatient!.id,
      patientName: `${tiSelectedPatient!.firstName} ${tiSelectedPatient!.lastName}`,
      drug: tiDrugName.trim(),
      ndc: "00000-0000-00",
      strength: tiStrength.trim(),
      qty: Number(tiQty),
      daysSupply: Number(tiDaysSupply),
      refillsAllowed: Number(tiOrigRefillsAuthorized),
      refillsRemaining: Number(tiRefillsRemaining),
      sig: tiSig.trim(),
      dawCode: "0",
      prescriberId: "dr001",
      prescriberName: tiOrigPrescriberName.trim(),
      writtenDate: tiOrigRxDate,
      status: "new",
      csSchedule,
      channel: "Transfer In",
      copay: 0,
      transferIn: {
        origPharmacy: tiPharmacyName.trim(),
        origRxNumber: tiOrigRxNumber.trim(),
        origPharmacyPhone: tiPharmacyPhone.trim(),
        origPharmacyAddress: tiPharmacyAddress.trim(),
        origPharmacyNcpdp: tiPharmacyNcpdp.trim() || undefined,
        origPharmacyDea: tiPharmacyDea.trim() || undefined,
        origPharmacistName: tiPharmacistName.trim(),
        origPrescriberName: tiOrigPrescriberName.trim(),
        origPrescriberNpi: tiOrigPrescriberNpi.trim(),
        origRxDate: tiOrigRxDate,
        lastDispensedDate: tiLastDispensedDate,
        origRefillsAuthorized: Number(tiOrigRefillsAuthorized),
        refillsRemaining: Number(tiRefillsRemaining),
        partialFillsDispensed: tiPartialFillsDispensed ? Number(tiPartialFillsDispensed) : undefined,
      },
      transferLog: [
        { type: "transfer_in", rxId, origPharmacy: tiPharmacyName.trim(), origRxNumber: tiOrigRxNumber.trim(), timestamp: now },
      ],
    };

    // Add to session prescriptions (module-level mutable array)
    sessionPrescriptions.push(newRx);
    // Add to global transfer log for duplicate detection
    mockTransferLog.push({ type: "transfer_in", rxId, origPharmacy: tiPharmacyName.trim(), origRxNumber: tiOrigRxNumber.trim(), timestamp: now });

    router.push("/prescriptions");
  };

  // ── Step 0: Channel selector ───────────────────────────────────────────────────
  if (!channel) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-sm text-gray-500 mt-0.5">How did this prescription arrive?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-[#7C3AED] hover:bg-purple-50/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-1.5">
                {ch.id === "Transfer In" ? (
                  <ArrowLeftRight className="w-5 h-5 text-teal-600 group-hover:text-[#7C3AED]" />
                ) : ch.id === "eRx" ? (
                  <Pill className="w-5 h-5 text-blue-500 group-hover:text-[#7C3AED]" />
                ) : (
                  <ClipboardList className="w-5 h-5 text-gray-400 group-hover:text-[#7C3AED]" />
                )}
                <span className="font-semibold text-gray-900 group-hover:text-[#7C3AED]">{ch.label}</span>
              </div>
              <p className="text-xs text-gray-500">{ch.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Transfer In form ──────────────────────────────────────────────────────────
  if (channel === "Transfer In") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer In</h1>
            <p className="text-sm text-gray-500 mt-0.5">Record an incoming prescription transfer from another pharmacy</p>
          </div>
          <button onClick={() => setChannel(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline mt-1">
            ← Change channel
          </button>
        </div>

        {/* Schedule II Hard Block (US-24.2) */}
        {isScheduleII && (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
            {/* API layer would enforce HTTP 422 TRANSFER_SCHEDULE_II_PROHIBITED */}
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Schedule II Cannot Be Transferred</p>
              <p className="text-sm text-red-700 mt-0.5">
                Schedule II controlled substances cannot be transferred. The patient must obtain a new prescription from their prescriber.
              </p>
            </div>
          </div>
        )}

        {/* One-Transfer Duplicate Detection (US-24.3) */}
        {isDuplicateTransfer && (
          <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
            {/* API layer enforces this check server-side on every transfer attempt */}
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Transfer Already on File</p>
              <p className="text-sm text-red-700 mt-0.5">
                A transfer for Rx {tiOrigRxNumber} from {tiPharmacyName} is already on file.
                Schedule III–V prescriptions may only be transferred once.
              </p>
            </div>
          </div>
        )}

        {/* Section: Patient */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#7C3AED]" />Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Search Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={tiPatientSearch}
                  onChange={e => setTiPatientSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {tiFilteredPatients.length > 0 && !tiSelectedPatient && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {tiFilteredPatients.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setTiSelectedPatient(p); setTiPatientSearch(`${p.firstName} ${p.lastName}`); }}
                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">DOB: {p.dob} &bull; {p.phone}</p>
                  </button>
                ))}
              </div>
            )}

            {tiSelectedPatient && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-purple-900">{tiSelectedPatient.firstName} {tiSelectedPatient.lastName}</p>
                  <p className="text-sm text-purple-700">DOB: {tiSelectedPatient.dob} &bull; {tiSelectedPatient.insurance.primary.name}</p>
                </div>
                <button onClick={() => { setTiSelectedPatient(null); setTiPatientSearch(""); }} className="text-xs text-purple-500 hover:text-purple-700">Change</button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Drug Information */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#7C3AED]" />Drug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Drug Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. Gabapentin" value={tiDrugName} onChange={e => setTiDrugName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Strength <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. 300 mg" value={tiStrength} onChange={e => setTiStrength(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Dosage Form <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Capsule, Tablet, Solution" value={tiDosageForm} onChange={e => setTiDosageForm(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Directions / Sig <span className="text-red-500">*</span></Label>
              <textarea
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
                rows={2}
                placeholder="e.g. Take 1 capsule three times daily"
                value={tiSig}
                onChange={e => setTiSig(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Quantity <span className="text-red-500">*</span></Label>
                <Input type="number" min="1" placeholder="30" value={tiQty} onChange={e => setTiQty(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Days Supply <span className="text-red-500">*</span></Label>
                <Input type="number" min="1" placeholder="30" value={tiDaysSupply} onChange={e => setTiDaysSupply(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>DEA Schedule <span className="text-red-500">*</span></Label>
                <Select value={tiDeaSchedule} onValueChange={setTiDeaSchedule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deaSchedules.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isScheduleII && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Schedule II cannot be transferred — see block above.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Originating Pharmacy */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#7C3AED]" />Originating Pharmacy
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Pharmacy Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. CVS Pharmacy #4421" value={tiPharmacyName} onChange={e => setTiPharmacyName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <Input placeholder="(555) 000-0000" value={tiPharmacyPhone} onChange={e => setTiPharmacyPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address <span className="text-red-500">*</span></Label>
              <Input placeholder="Street, City, State, ZIP" value={tiPharmacyAddress} onChange={e => setTiPharmacyAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>NCPDP / NPI Number</Label>
                <Input placeholder="Optional" value={tiPharmacyNcpdp} onChange={e => setTiPharmacyNcpdp(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Pharmacy DEA Number
                  {isScheduleCSIIIV && <span className="text-red-500"> *</span>}
                </Label>
                <Input
                  placeholder={isScheduleCSIIIV ? "Required for C-III to C-V" : "Optional"}
                  value={tiPharmacyDea}
                  onChange={e => setTiPharmacyDea(e.target.value)}
                  className={isScheduleCSIIIV && !tiPharmacyDea.trim() ? "border-red-300" : ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Transferring Pharmacist Name <span className="text-red-500">*</span></Label>
              <Input placeholder="First Last, RPh" value={tiPharmacistName} onChange={e => setTiPharmacistName(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Section: Original Rx Details */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#7C3AED]" />Original Rx Details
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Original Rx Number <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. RX-7734219" value={tiOrigRxNumber} onChange={e => setTiOrigRxNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Original Prescriber Name <span className="text-red-500">*</span></Label>
                <Input placeholder="Dr. First Last" value={tiOrigPrescriberName} onChange={e => setTiOrigPrescriberName(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Original Prescriber NPI <span className="text-red-500">*</span></Label>
                <Input placeholder="10-digit NPI" value={tiOrigPrescriberNpi} onChange={e => setTiOrigPrescriberNpi(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Original Rx Date <span className="text-red-500">*</span></Label>
                <Input type="date" value={tiOrigRxDate} onChange={e => setTiOrigRxDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Date Last Dispensed at Originating Pharmacy <span className="text-red-500">*</span></Label>
              <Input type="date" value={tiLastDispensedDate} onChange={e => setTiLastDispensedDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Original Refills Authorized <span className="text-red-500">*</span></Label>
                <Input type="number" min="0" placeholder="0" value={tiOrigRefillsAuthorized} onChange={e => setTiOrigRefillsAuthorized(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Refills Remaining <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tiRefillsRemaining}
                  onChange={e => setTiRefillsRemaining(e.target.value)}
                  className={!refillsRemainingValid ? "border-red-300" : ""}
                />
                {!refillsRemainingValid && (
                  <p className="text-xs text-red-600">Cannot exceed original refills authorized</p>
                )}
              </div>
            </div>
            {isScheduleCSIIIV && (
              <div className="space-y-1.5">
                <Label>
                  Number of Partial Fills Dispensed <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-1">(Required for C-III to C-V)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tiPartialFillsDispensed}
                  onChange={e => setTiPartialFillsDispensed(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex justify-between pb-4">
          <Button variant="outline" onClick={() => setChannel(null)}>← Back</Button>
          <Button
            className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!canSave}
            onClick={handleTransferInSave}
          >
            Save Transfer In → Add to Queue
          </Button>
        </div>
      </div>
    );
  }

  // ── Standard 4-step flow (eRx / Fax / Manual) ─────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Channel: <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{channel}</Badge>
            {" "}&bull; Complete all steps to submit to the verification queue
          </p>
        </div>
        <button onClick={() => setChannel(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline mt-1">
          ← Change channel
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isComplete = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${isCurrent ? "text-[#7C3AED]" : isComplete ? "text-green-600" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isComplete ? "bg-green-600 border-green-600 text-white" :
                  isCurrent ? "bg-[#7C3AED] border-[#7C3AED] text-white" :
                  "border-gray-300 text-gray-400"
                }`}>
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${isCurrent ? "text-[#7C3AED]" : isComplete ? "text-green-600" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Patient */}
      {step === 1 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900">Select Patient</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Search Patient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or phone..."
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredPatients.length > 0 && !selectedPatient && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {filteredPatients.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName}`); }}
                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">DOB: {p.dob} &bull; {p.phone} &bull; {p.insurance.primary.name}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedPatient && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p className="text-sm text-purple-700">DOB: {selectedPatient.dob} &bull; {selectedPatient.insurance.primary.name}</p>
                    {selectedPatient.allergies.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {selectedPatient.allergies.map(a => (
                          <Badge key={a} className="bg-red-100 text-red-700 border-red-200 text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2"
                disabled={!selectedPatient}
                onClick={() => setStep(2)}
              >
                Next: Drug Lookup
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Drug */}
      {step === 2 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900">Drug Lookup</CardTitle>
            <p className="text-sm text-gray-500">Search FDB database by drug name or NDC</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Drug Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by drug name or NDC (e.g. Metformin, Lisinopril)..."
                  value={drugSearch}
                  onChange={e => setDrugSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredDrugs.length > 0 && !selectedDrug && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">FDB Results</p>
                </div>
                {filteredDrugs.map((d, i) => (
                  <button
                    key={d.ndc}
                    onClick={() => { setSelectedDrug(d); setDrugSearch(d.name); }}
                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.name} {d.strength} — {d.form}</p>
                        <p className="text-xs text-gray-500 font-mono">NDC: {d.ndc}</p>
                      </div>
                      <span className="text-xs text-gray-400">{d.manufacturer}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedDrug && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">{selectedDrug.name} {selectedDrug.strength}</p>
                    <p className="text-sm text-purple-700">{selectedDrug.form} &bull; {selectedDrug.manufacturer}</p>
                    <p className="text-xs font-mono text-purple-600 mt-1">NDC: {selectedDrug.ndc}</p>
                  </div>
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2"
                disabled={!selectedDrug}
                onClick={() => setStep(3)}
              >
                Next: Prescriber
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Prescriber */}
      {step === 3 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900">Prescriber Lookup</CardTitle>
            <p className="text-sm text-gray-500">Search by name or NPI number</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Prescriber Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or NPI (e.g. Dr. Mitchell)..."
                  value={prescriberSearch}
                  onChange={e => setPrescriberSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredPrescribers.length > 0 && !selectedPrescriber && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {filteredPrescribers.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPrescriber(p); setPrescriberSearch(`Dr. ${p.firstName} ${p.lastName}`); }}
                    className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <p className="text-sm font-medium text-gray-900">Dr. {p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">{p.specialty} &bull; NPI: {p.npi} &bull; DEA: {p.deaNumber}</p>
                    <p className="text-xs text-gray-400">{p.address}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedPrescriber && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-900">Dr. {selectedPrescriber.firstName} {selectedPrescriber.lastName}</p>
                    <p className="text-sm text-purple-700">{selectedPrescriber.specialty}</p>
                    <p className="text-xs text-purple-600 font-mono mt-1">NPI: {selectedPrescriber.npi} &bull; DEA: {selectedPrescriber.deaNumber}</p>
                    <p className="text-xs text-purple-500">{selectedPrescriber.phone}</p>
                  </div>
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2"
                disabled={!selectedPrescriber}
                onClick={() => setStep(4)}
              >
                Next: Rx Details
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Rx Details */}
      {step === 4 && (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-semibold text-gray-900">Prescription Details</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Drug</p>
                  <p className="font-medium text-gray-900">{selectedDrug?.name} {selectedDrug?.strength}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prescriber</p>
                  <p className="font-medium text-gray-900">Dr. {selectedPrescriber?.lastName}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input value={qty} onChange={e => setQty(e.target.value)} type="number" min="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Days Supply</Label>
                <Input value={daysSupply} onChange={e => setDaysSupply(e.target.value)} type="number" min="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Refills Authorized</Label>
                <Input value={refills} onChange={e => setRefills(e.target.value)} type="number" min="0" max="11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Sig (Patient Instructions)</Label>
              <Input
                placeholder="e.g. Take 1 tablet twice daily with meals"
                value={sig}
                onChange={e => setSig(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>DAW Code</Label>
              <Select value={dawCode} onValueChange={setDawCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 — No product selection indicated</SelectItem>
                  <SelectItem value="1">1 — Substitution not allowed by prescriber</SelectItem>
                  <SelectItem value="2">2 — Substitution allowed — patient requested brand</SelectItem>
                  <SelectItem value="3">3 — Substitution allowed — pharmacist selected brand</SelectItem>
                  <SelectItem value="4">4 — Substitution allowed — generic not in stock</SelectItem>
                  <SelectItem value="5">5 — Substitution allowed — brand dispensed as generic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
                disabled={!sig || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit to Verification Queue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
