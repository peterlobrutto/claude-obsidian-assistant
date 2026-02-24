"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight, User, Pill, Stethoscope, ClipboardList } from "lucide-react";
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
import { mockPatients, mockDrugs, mockPrescribers } from "@/lib/mock-data";
import type { Patient, Drug, Prescriber } from "@/lib/mock-data";

const steps = [
  { id: 1, label: "Patient", icon: User },
  { id: 2, label: "Drug", icon: Pill },
  { id: 3, label: "Prescriber", icon: Stethoscope },
  { id: 4, label: "Rx Details", icon: ClipboardList },
];

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Step 2
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // Step 3
  const [prescriberSearch, setPrescriberSearch] = useState("");
  const [selectedPrescriber, setSelectedPrescriber] = useState<Prescriber | null>(null);

  // Step 4
  const [qty, setQty] = useState("30");
  const [daysSupply, setDaysSupply] = useState("30");
  const [refills, setRefills] = useState("0");
  const [sig, setSig] = useState("");
  const [dawCode, setDawCode] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const filteredPatients = patientSearch.length > 1
    ? mockPatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch)
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

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/prescriptions");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete all steps to submit to the verification queue</p>
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
