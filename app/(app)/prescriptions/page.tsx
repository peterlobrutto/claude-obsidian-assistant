"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, AlertTriangle, ChevronRight, X, Check, AlertCircle, Inbox, FileText,
  RotateCcw, MessageSquare, ShieldAlert, Tag, Send, Printer,
  ClipboardList, Siren, ArrowLeftRight,
} from "lucide-react";
import { getStandardHoldDays } from "@/lib/settings-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockPrescriptions, mockTransferLog, sessionPrescriptions } from "@/lib/mock-data";
import type { Prescription, DURAlert, TransferLogEntry } from "@/lib/mock-data";

// ── Severity label (Fix 6: MEDIUM → MODERATE) ────────────────────────────────
const severityLabel: Record<string, string> = {
  high: "HIGH", medium: "MODERATE", low: "LOW",
};

// ── Status colours ─────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-700 border-gray-200",
  filling: "bg-blue-100 text-blue-700 border-blue-200",
  dur_hold: "bg-red-100 text-red-700 border-red-200",
  claims_hold: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  dispensed: "bg-gray-100 text-gray-500 border-gray-200",
  transferred_out: "bg-gray-100 text-gray-500 border-gray-300",
};

// Fix 2: add Dispensed tab; Epic 24: add Transferred Out tab
const tabConfig = [
  { key: "new",             label: "New",              nextStatus: "filling", nextLabel: "Start Fill" },
  { key: "filling",         label: "Filling",           nextStatus: "ready",   nextLabel: "Mark Ready" },
  { key: "dur_hold",        label: "DUR Hold",          nextStatus: "filling", nextLabel: "Clear Hold — Return to Filling" },
  { key: "claims_hold",     label: "Claims Hold",       nextStatus: "filling", nextLabel: "Clear Hold — Return to Filling" },
  { key: "ready",           label: "Ready",             nextStatus: null,      nextLabel: null },
  { key: "dispensed",       label: "Dispensed",         nextStatus: null,      nextLabel: null },
  { key: "transferred_out", label: "Transferred Out",   nextStatus: null,      nextLabel: null },
];

const severityColors: Record<string, string> = {
  high: "border-red-300 bg-red-50",
  medium: "border-amber-300 bg-amber-50",
  low: "border-blue-300 bg-blue-50",
};

const severityBadge: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const csBadgeStyle: Record<string, string> = {
  CII: "bg-red-100 text-red-700 border-red-300",
  CIII: "bg-orange-100 text-orange-700 border-orange-300",
  CIV: "bg-amber-100 text-amber-700 border-amber-300",
  CV: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

// ── Intake queue types ─────────────────────────────────────────────────────────
type IntakeSource = "eRx" | "Fax" | "Manual" | "Transfer In";

interface IntakeItem {
  id: string;
  patientName: string;
  drug: string;
  strength: string;
  prescriberName: string;
  receivedAt: string;
  source: IntakeSource;
  csSchedule?: string;
}

const initialIntakeItems: IntakeItem[] = [
  { id: "in001", patientName: "Eleanor Vasquez", drug: "Lisinopril", strength: "10 mg", prescriberName: "Dr. Sarah Mitchell", receivedAt: "2 min ago", source: "eRx" },
  { id: "in002", patientName: "Harold Simmons", drug: "Hydrocodone/APAP", strength: "5/325 mg", prescriberName: "Dr. Robert Harris", receivedAt: "11 min ago", source: "Fax", csSchedule: "CII" },
  { id: "in003", patientName: "Carol Nguyen", drug: "Amoxicillin", strength: "500 mg", prescriberName: "Dr. David Park", receivedAt: "18 min ago", source: "Manual" },
];

const sourceBadgeStyle: Record<IntakeSource, string> = {
  eRx: "bg-blue-100 text-blue-700 border-blue-200",
  Fax: "bg-amber-100 text-amber-700 border-amber-200",
  Manual: "bg-gray-100 text-gray-600 border-gray-200",
  "Transfer In": "bg-teal-100 text-teal-700 border-teal-200",
};

// ── DUR override reason codes (Fix 7) ─────────────────────────────────────────
const durOverrideCodes = [
  "DC — Drug-Drug Interaction Clinically Insignificant",
  "PG — Patient Agreed to Therapy Change",
  "LP — Lab Values / Patient Parameters Support Use",
  "ND — No Drug Available — Therapy Necessary",
  "OS — Prescriber Notified and Approved Override",
  "TD — Therapeutic Duplication — Intent Confirmed",
  "PA — Patient Allergy Override — Clinical Necessity",
  "OT — Other (see notes)",
];

// ── DUR Override Modal (Fix 7) ────────────────────────────────────────────────
function DUROverrideModal({ alert, onConfirm, onCancel }: {
  alert: DURAlert;
  onConfirm: (code: string, notes: string) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Override DUR Alert</h3>
        <p className="text-sm text-gray-500 mb-4">
          {alert.type.replace("_", " ").toUpperCase()} — {severityLabel[alert.severity]}
        </p>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Override Reason Code <span className="text-red-500">*</span>
        </label>
        <Select value={code} onValueChange={setCode}>
          <SelectTrigger className="w-full mb-3">
            <SelectValue placeholder="Select override reason..." />
          </SelectTrigger>
          <SelectContent>
            {durOverrideCodes.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Clinical Notes
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
          rows={3}
          placeholder="Document clinical rationale..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!code}
            onClick={() => onConfirm(code, notes)}
          >
            Confirm Override
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── DUR Alert card (Fix 6 + Fix 7) ────────────────────────────────────────────
function DURAlertCard({ alert, onAcknowledge, onOverride }: {
  alert: DURAlert;
  onAcknowledge: () => void;
  onOverride: () => void;
}) {
  if (alert.acknowledged) return null;
  return (
    <div className={`border rounded-lg p-4 ${severityColors[alert.severity]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
          alert.severity === "high" ? "text-red-500" :
          alert.severity === "medium" ? "text-amber-500" : "text-blue-500"
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs border ${severityBadge[alert.severity]}`}>
              {severityLabel[alert.severity]} — {alert.type.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-line">{alert.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 ml-7">
        <Button size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white" onClick={onOverride}>
          <X className="w-3.5 h-3.5" />Override with Reason
        </Button>
        <Button size="sm" variant="outline" onClick={onAcknowledge} className="gap-1.5 text-gray-700">
          <Check className="w-3.5 h-3.5" />Reject Rx
        </Button>
        <Button size="sm" variant="outline" onClick={onAcknowledge} className="gap-1.5 text-gray-700">
          Contact Prescriber
        </Button>
      </div>
    </div>
  );
}

// ── Mark Urgent Modal (US-3.5) ────────────────────────────────────────────────
function MarkUrgentModal({ rxName, onConfirm, onCancel }: {
  rxName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Siren className="w-4 h-4 text-red-600" />Mark as Urgent
        </h3>
        <p className="text-sm text-gray-500 mb-4">{rxName}</p>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
          rows={3}
          maxLength={200}
          placeholder="Enter reason for urgent fill..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            Mark Urgent
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── Reject intake modal ────────────────────────────────────────────────────────
function RejectModal({ item, onConfirm, onCancel }: {
  item: IntakeItem;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Reject Intake Item</h3>
        <p className="text-sm text-gray-500 mb-4">{item.patientName} — {item.drug} {item.strength}</p>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Reason Code / Notes
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
          rows={3}
          placeholder="e.g. Duplicate Rx, patient already on therapy, incorrect prescriber..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={reason.trim().length === 0} onClick={() => onConfirm(reason)}>
            Confirm Rejection
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── Fax OCR Review Modal (Fix 24/25) ─────────────────────────────────────────
interface OcrField {
  label: string;
  value: string;
  confidence: number; // 0-100
  verified?: boolean;
}

function FaxOCRModal({ item, onApprove, onCancel }: {
  item: IntakeItem;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const [fields, setFields] = useState<OcrField[]>([
    { label: "Patient Name", value: item.patientName, confidence: 97 },
    { label: "Drug Name", value: item.drug, confidence: 91 },
    { label: "Strength", value: item.strength, confidence: 88 },
    { label: "Prescriber Name", value: item.prescriberName, confidence: 94 },
    { label: "DEA Number", value: "BH5544332", confidence: 62 },
    { label: "Date Written", value: "01/24/2024", confidence: 55 },
    { label: "Qty Dispensed", value: "30", confidence: 73 },
    { label: "Days Supply", value: "5", confidence: 78 },
    { label: "Sig / Instructions", value: "1 tab q4-6h PRN pain", confidence: 48 },
  ]);

  const toggleVerify = (idx: number) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, verified: !f.verified } : f));
  };

  const lowConfidenceFields = fields.filter(f => f.confidence < 80);
  const allVerified = lowConfidenceFields.every(f => f.verified);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Fax OCR Review</h3>
          <p className="text-sm text-gray-500">{item.patientName} — {item.drug} {item.strength} (Fax received {item.receivedAt})</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Simulated fax image */}
          <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Incoming Fax Image</p>
            <div className="bg-white border border-gray-300 rounded-lg p-4 text-xs font-mono text-gray-600 space-y-1.5" style={{ filter: "contrast(1.1)" }}>
              <p className="font-bold text-center text-sm">RIVERSIDE PHARMACY</p>
              <p className="text-center text-gray-400">────────────────────</p>
              <p>Patient: {item.patientName}</p>
              <p>DOB: 07/22/1972</p>
              <p>Drug: {item.drug} {item.strength}</p>
              <p>Qty: 30 tabs    DS: 5 days</p>
              <p className="text-gray-400">Sig: 1 t<span className="bg-yellow-200">a</span>b q4<span className="bg-yellow-200">-</span>6h PRN pain</p>
              <p>Prescriber: {item.prescriberName}</p>
              <p className="text-gray-400">DEA: BH554<span className="bg-yellow-200">4</span>332</p>
              <p className="text-gray-400">Date: 01/2<span className="bg-yellow-200">4</span>/2024</p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-gray-400 italic text-center">[ Prescriber Signature ]</p>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Yellow highlights = low OCR confidence
            </p>
          </div>
          {/* Parsed fields */}
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Parsed Fields — Verify Before Approving</p>
            <div className="space-y-2">
              {fields.map((field, idx) => {
                const isLow = field.confidence < 80;
                return (
                  <div key={field.label} className={`flex items-center gap-3 p-2 rounded-lg ${isLow ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{field.label}</p>
                      <p className="text-sm font-medium text-gray-900">{field.value}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold ${field.confidence >= 80 ? "text-green-600" : field.confidence >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {field.confidence}%
                      </span>
                      {isLow && (
                        <button
                          onClick={() => toggleVerify(idx)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${field.verified ? "bg-green-500 border-green-500 text-white" : "border-gray-300"}`}
                        >
                          {field.verified && <Check className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!allVerified && (
              <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Verify all low-confidence fields before approving
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-100">
          <Button
            className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!allVerified}
            onClick={onApprove}
          >
            <Check className="w-4 h-4 mr-1" />Approve to Queue
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── PDMP Block Modal (Fix 19) ─────────────────────────────────────────────────
function PDMPBlockModal({ rx, onProceed, onCancel }: {
  rx: Prescription;
  onProceed: () => void;
  onCancel: () => void;
}) {
  const [queried, setQueried] = useState(false);
  const [queryResult, setQueryResult] = useState("");

  const runQuery = () => {
    setQueryResult("No active opioid prescriptions found in PDMP for this patient in the past 90 days. One historical fill 6 months ago. Low-risk profile.");
    setQueried(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">PDMP Query Required</h3>
            <p className="text-xs text-red-600 font-medium">CII Controlled Substance — Hard Block</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          <strong>{rx.drug} {rx.strength}</strong> is a Schedule CII controlled substance.
          A PDMP (Prescription Drug Monitoring Program) query is required before dispensing.
        </p>
        {!queried ? (
          <Button className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white mb-3" onClick={runQuery}>
            Run PDMP Query for {rx.patientName}
          </Button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-green-700 mb-1">PDMP Query Result</p>
            <p className="text-sm text-green-800">{queryResult}</p>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!queried}
            onClick={onProceed}
          >
            Proceed to Fill
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── Label Preview Modal (Fix 12/13/14) ────────────────────────────────────────
function LabelPreviewModal({ rx, onClose }: { rx: Prescription; onClose: () => void }) {
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [printed, setPrinted] = useState(false);

  const handlePrint = () => {
    setPrinted(true);
    setShowPrintConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Label Preview</h3>
            <p className="text-xs text-gray-500">{rx.rxNumber}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        {/* WYSIWYG Label */}
        <div className="p-5">
          <div className="border-2 border-gray-900 rounded-lg p-4 font-mono text-xs bg-white space-y-1.5">
            <div className="text-center font-bold text-sm border-b border-gray-300 pb-2 mb-2">
              RIVERSIDE PHARMACY
              <p className="font-normal text-xs">142 Main St, Springfield, IL 62701 | (555) 100-9000</p>
              <p className="font-normal text-xs">DEA: BR1234567 | Ph.Lic: IL-PH-2024-0042</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Rx#:</span> {rx.rxNumber}</div>
              <div><span className="text-gray-500">Date:</span> {rx.filledDate || new Date().toLocaleDateString()}</div>
              <div className="col-span-2"><span className="text-gray-500">Patient:</span> {rx.patientName}</div>
              <div className="col-span-2 font-bold">{rx.drug} {rx.strength}</div>
              <div><span className="text-gray-500">Qty:</span> {rx.qty}</div>
              <div><span className="text-gray-500">Days Supply:</span> {rx.daysSupply}</div>
              <div><span className="text-gray-500">Refills:</span> {rx.refillsRemaining} remaining</div>
              <div><span className="text-gray-500">DAW:</span> {rx.dawCode}</div>
              <div className="col-span-2"><span className="text-gray-500">Prescriber:</span> {rx.prescriberName}</div>
              <div className="col-span-2">
                <span className="text-gray-500">NDC:</span> {rx.ndc}
              </div>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <span className="text-gray-500">Directions:</span>
              <p className="font-sans font-semibold text-gray-900">{rx.sig}</p>
            </div>
            {rx.csSchedule && (
              <div className="border border-red-400 rounded px-2 py-1 text-center text-red-700 font-bold mt-2">
                SCHEDULE {rx.csSchedule} CONTROLLED SUBSTANCE
                <p className="font-normal text-xs">CAUTION: Federal law prohibits transfer of this drug to any person other than patient for whom it was prescribed.</p>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-2 text-gray-500">
              <p>KEEP OUT OF REACH OF CHILDREN</p>
              <p>Pharmacist: Dr. Amanda Chen, Pharm.D.</p>
              <p className="text-center mt-1">|||| |||||||||||| |||||||||||| |||||</p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          {!printed ? (
            <>
              <Button
                className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2"
                onClick={() => setShowPrintConfirm(true)}
              >
                <Printer className="w-4 h-4" />Print Label
              </Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
            </>
          ) : (
            <div className="flex-1 text-center py-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-700">Label sent to printer successfully</p>
            </div>
          )}
        </div>
        {/* Print confirm dialog */}
        {showPrintConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
            <div className="bg-white rounded-xl shadow-xl p-5 mx-4 max-w-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Confirm Print</h4>
              <p className="text-sm text-gray-600 mb-4">Send label for <strong>{rx.rxNumber}</strong> to label printer?</p>
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white" onClick={handlePrint}>Print</Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowPrintConfirm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Predictive Refill Queue ────────────────────────────────────────────────────
interface RefillItem {
  id: string;
  patientName: string;
  drug: string;
  strength: string;
  daysRemaining: number;
  tcpaConsent: boolean;
  reminderSent: boolean;
  reminderSource?: "auto" | "manual";
}

const initialRefillItems: RefillItem[] = [
  { id: "rf001", patientName: "Carla Mendes",  drug: "Metformin",   strength: "500mg", daysRemaining: 6,  tcpaConsent: true,  reminderSent: false },
  { id: "rf002", patientName: "James Okafor",  drug: "Amlodipine",  strength: "5mg",   daysRemaining: 3,  tcpaConsent: true,  reminderSent: false },
  { id: "rf003", patientName: "Kim, Barbara",  drug: "Lisinopril",  strength: "10mg",  daysRemaining: 7,  tcpaConsent: false, reminderSent: false },
  { id: "rf004", patientName: "Rivera, James", drug: "Sertraline",  strength: "50mg",  daysRemaining: 12, tcpaConsent: true,  reminderSent: false },
  { id: "rf005", patientName: "Patel, Susan",  drug: "Omeprazole",  strength: "20mg",  daysRemaining: 20, tcpaConsent: true,  reminderSent: false },
];

function RefillQueueSection() {
  const [items, setItems] = useState<RefillItem[]>(initialRefillItems);

  useEffect(() => {
    const threshold = getStandardHoldDays();
    const triggerAt = threshold - 2;
    setItems(prev => prev.map(rx => {
      if (rx.daysRemaining <= triggerAt && !rx.reminderSent && rx.tcpaConsent) {
        return { ...rx, reminderSent: true, reminderSource: "auto" };
      }
      return rx;
    }));
  }, []);

  const sendManual = (id: string) => {
    setItems(prev => prev.map(rx => rx.id === id ? { ...rx, reminderSent: true, reminderSource: "manual" } : rx));
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Days Remaining</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">TCPA Consent</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Trigger</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} className="border-gray-100">
                <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.patientName}</TableCell>
                <TableCell>
                  <p className="text-sm text-gray-900">{item.drug}</p>
                  <p className="text-xs text-gray-400">{item.strength}</p>
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-semibold ${item.daysRemaining <= 7 ? "text-red-600" : item.daysRemaining <= 14 ? "text-amber-600" : "text-gray-700"}`}>
                    {item.daysRemaining}d
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {item.tcpaConsent
                    ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Consented</Badge>
                    : <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">No Consent</Badge>
                  }
                </TableCell>
                <TableCell>
                  {item.reminderSent ? (
                    <Badge className={item.reminderSource === "auto"
                      ? "bg-purple-100 text-purple-700 border-purple-200 text-xs"
                      : "bg-blue-100 text-blue-700 border-blue-200 text-xs"
                    }>
                      {item.reminderSource === "auto" ? "Auto" : "Manual"}
                    </Badge>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </TableCell>
                <TableCell>
                  {item.reminderSent ? (
                    <span className="text-xs text-gray-400">SMS sent</span>
                  ) : item.tcpaConsent ? (
                    <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" onClick={() => sendManual(item.id)}>
                      <MessageSquare className="w-3 h-3" />Send Reminder
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No TCPA consent</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Transfer Out Modal (Epic 24, US-24.5 – US-24.7) ──────────────────────────
function TransferOutModal({ rx, transferLog, onConfirm, onCancel }: {
  rx: Prescription;
  transferLog: TransferLogEntry[];
  onConfirm: (data: { receivingPharmacy: string; receivingPharmacyAddress: string; receivingPharmacyPhone: string; receivingPharmacyDea: string; receivingPharmacist: string; refillsTransferred: number }) => void;
  onCancel: () => void;
}) {
  const [receivingPharmacy, setReceivingPharmacy]         = useState("");
  const [receivingPharmacyAddress, setReceivingPharmacyAddress] = useState("");
  const [receivingPharmacyPhone, setReceivingPharmacyPhone]     = useState("");
  const [receivingPharmacyDea, setReceivingPharmacyDea]         = useState("");
  const [receivingPharmacist, setReceivingPharmacist]           = useState("");
  const [refillsTransferred, setRefillsTransferred] = useState(rx.refillsRemaining.toString());

  const transferDate = new Date().toLocaleString();
  const isCII = rx.csSchedule === "CII";
  const isScheduleCSIIIV = rx.csSchedule && rx.csSchedule !== "CII";

  // One-transfer blocks (US-24.7)
  // Both checks enforced at API layer server-side
  const receivedAsTransferIn =
    rx.channel === "Transfer In" ||
    !!(rx.transferLog?.some(e => e.type === "transfer_in")) ||
    !!(transferLog.some(e => e.type === "transfer_in" && e.rxId === rx.id));

  const alreadyTransferredOut =
    rx.status === "transferred_out" ||
    !!(rx.transferOut) ||
    !!(rx.transferLog?.some(e => e.type === "transfer_out")) ||
    !!(transferLog.some(e => e.type === "transfer_out" && e.rxId === rx.id));

  const refillsTransferredNum = Number(refillsTransferred);
  const refillsValid = !isNaN(refillsTransferredNum) && refillsTransferredNum >= 0 && refillsTransferredNum <= rx.refillsRemaining;

  const canTransfer =
    !isCII &&
    !receivedAsTransferIn &&
    !alreadyTransferredOut &&
    !!receivingPharmacy.trim() &&
    !!receivingPharmacyAddress.trim() &&
    !!receivingPharmacyPhone.trim() &&
    !!receivingPharmacist.trim() &&
    refillsValid &&
    (!isScheduleCSIIIV || !!receivingPharmacyDea.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            Transfer Out — {rx.rxNumber} | {rx.drug} {rx.strength}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{rx.patientName}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Schedule II hard block (US-24.6) */}
          {/* API enforces HTTP 422 TRANSFER_SCHEDULE_II_PROHIBITED */}
          {isCII && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Schedule II Cannot Be Transferred</p>
                <p className="text-sm text-red-700 mt-0.5">
                  Schedule II controlled substances cannot be transferred. Advise the patient to obtain a new prescription from their prescriber.
                </p>
              </div>
            </div>
          )}

          {/* Already received as Transfer In block (US-24.7) */}
          {!isCII && receivedAsTransferIn && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Cannot Transfer Again</p>
                <p className="text-sm text-red-700 mt-0.5">
                  This prescription was received as a transfer from {rx.transferIn?.origPharmacy || "another pharmacy"}.
                  It cannot be transferred again.
                </p>
              </div>
            </div>
          )}

          {/* Already transferred out block (US-24.7) */}
          {!isCII && !receivedAsTransferIn && alreadyTransferredOut && (
            <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Already Transferred Out</p>
                <p className="text-sm text-red-700 mt-0.5">
                  This prescription was already transferred to {rx.transferOut?.receivingPharmacy || "another pharmacy"}
                  {rx.transferOut?.transferDate ? ` on ${rx.transferOut.transferDate}` : ""}.
                </p>
              </div>
            </div>
          )}

          {/* Form fields — shown even with blocks so pharmacist sees why */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Receiving Pharmacy Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                placeholder="e.g. Walgreens #8812"
                value={receivingPharmacy}
                onChange={e => setReceivingPharmacy(e.target.value)}
                disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Receiving Pharmacy Address <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                placeholder="Street, City, State, ZIP"
                value={receivingPharmacyAddress}
                onChange={e => setReceivingPharmacyAddress(e.target.value)}
                disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                  placeholder="(555) 000-0000"
                  value={receivingPharmacyPhone}
                  onChange={e => setReceivingPharmacyPhone(e.target.value)}
                  disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  DEA Number{isScheduleCSIIIV && <span className="text-red-500"> *</span>}
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                  placeholder={isScheduleCSIIIV ? "Required" : "Optional"}
                  value={receivingPharmacyDea}
                  onChange={e => setReceivingPharmacyDea(e.target.value)}
                  disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Receiving Pharmacist Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                placeholder="First Last, RPh"
                value={receivingPharmacist}
                onChange={e => setReceivingPharmacist(e.target.value)}
                disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Transfer Date / Time
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                  value={transferDate}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Refills Remaining Being Transferred <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
                  type="number"
                  min="0"
                  max={rx.refillsRemaining}
                  value={refillsTransferred}
                  onChange={e => setRefillsTransferred(e.target.value)}
                  disabled={isCII || receivedAsTransferIn || alreadyTransferredOut}
                />
                <p className="text-xs text-gray-400 mt-0.5">Max: {rx.refillsRemaining} remaining</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={!canTransfer}
            onClick={() => onConfirm({ receivingPharmacy, receivingPharmacyAddress, receivingPharmacyPhone, receivingPharmacyDea, receivingPharmacist, refillsTransferred: refillsTransferredNum })}
          >
            Transfer Out
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Campaign Stats (US-13.4) ───────────────────────────────────────────────────
const campaignStats = {
  campaignName: "March Refill Campaign",
  messagesSent: 47,
  confirmed: 31,    // 66%
  declined: 6,      // 13%
  noResponse: 10,   // 21%
};

// ── Non-Responsive Patients (US-13.4) ─────────────────────────────────────────
interface NonResponsiveItem {
  id: string;
  name: string;
  drug: string;
  daysRemaining: number;
  lastContacted: string;
  dismissed?: boolean;
  resent?: boolean;
}

const initialNonResponsiveItems: NonResponsiveItem[] = [
  { id: "nr001", name: "Robert Chen",    drug: "Metformin 500mg",   daysRemaining: 4, lastContacted: "3 days ago" },
  { id: "nr002", name: "Susan Park",     drug: "Atorvastatin 20mg", daysRemaining: 6, lastContacted: "5 days ago" },
  { id: "nr003", name: "Michael Torres", drug: "Lisinopril 10mg",   daysRemaining: 2, lastContacted: "7 days ago" },
];

function NonResponsivePatientsSection() {
  const [items, setItems] = useState<NonResponsiveItem[]>(initialNonResponsiveItems);
  const visible = items.filter(i => !i.dismissed);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Non-Responsive Patients</h2>
        {visible.length > 0 && <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0">{visible.length}</Badge>}
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Days Remaining</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Last Contacted</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-400 py-6">All patients have responded</TableCell>
                </TableRow>
              ) : visible.map(item => (
                <TableRow key={item.id} className="border-gray-100">
                  <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.name}</TableCell>
                  <TableCell className="text-sm text-gray-700">{item.drug}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${item.daysRemaining <= 3 ? "text-red-600" : "text-amber-600"}`}>
                      {item.daysRemaining}d
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-500">{item.lastContacted}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {item.resent ? (
                        <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />Sent</span>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
                          onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, resent: true } : i))}
                        >
                          <Send className="w-3 h-3" />Re-send
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, dismissed: true } : i))}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
  const [rxList, setRxList] = useState<Prescription[]>([...mockPrescriptions, ...sessionPrescriptions]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>(initialIntakeItems);
  const [rejectTarget, setRejectTarget] = useState<IntakeItem | null>(null);
  const [faxOCRTarget, setFaxOCRTarget] = useState<IntakeItem | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<DURAlert | null>(null);
  const [overrideRxId, setOverrideRxId] = useState<string | null>(null);
  const [pdmpTarget, setPdmpTarget] = useState<Prescription | null>(null);
  const [labelTarget, setLabelTarget] = useState<Prescription | null>(null);
  const [urgentTarget, setUrgentTarget] = useState<Prescription | null>(null);
  // Epic 24 — Transfer Out state
  const [transferOutTarget, setTransferOutTarget] = useState<Prescription | null>(null);
  const [transferLog, setTransferLog] = useState<TransferLogEntry[]>([...mockTransferLog]);

  // US-3.3: left-side checkbox filters
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [filterChannels, setFilterChannels] = useState<Set<string>>(new Set());
  const [filterSchedules, setFilterSchedules] = useState<Set<string>>(new Set());
  const [filterTechs, setFilterTechs] = useState<Set<string>>(new Set());
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);

  const toggleFilter = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value); else next.add(value);
      return next;
    });
  };

  const clearFilters = () => {
    setFilterStatuses(new Set());
    setFilterChannels(new Set());
    setFilterSchedules(new Set());
    setFilterTechs(new Set());
    setFilterUrgent(false);
  };

  const hasActiveFilters = filterStatuses.size > 0 || filterChannels.size > 0 || filterSchedules.size > 0 || filterTechs.size > 0 || filterUrgent;

  const acknowledgeAlert = (rxId: string, alertId: string) => {
    setRxList(prev => prev.map(rx =>
      rx.id === rxId ? { ...rx, durAlerts: rx.durAlerts?.map(a => a.id === alertId ? { ...a, acknowledged: true } : a) } : rx
    ));
    if (selectedRx?.id === rxId) {
      setSelectedRx(prev => prev ? { ...prev, durAlerts: prev.durAlerts?.map(a => a.id === alertId ? { ...a, acknowledged: true } : a) } : null);
    }
  };

  const advanceRx = (rx: Prescription, nextStatus: string) => {
    if (nextStatus === "filling" && rx.csSchedule === "CII") {
      setPdmpTarget(rx);
      return;
    }
    setRxList(prev => prev.map(r => r.id === rx.id ? { ...r, status: nextStatus as Prescription["status"] } : r));
    setSheetOpen(false);
  };

  const doAdvance = (rx: Prescription, nextStatus: string) => {
    setRxList(prev => prev.map(r => r.id === rx.id ? { ...r, status: nextStatus as Prescription["status"] } : r));
    setSheetOpen(false);
    setPdmpTarget(null);
  };

  const openDetail = (rx: Prescription) => {
    setSelectedRx(rxList.find(r => r.id === rx.id) || rx);
    setSheetOpen(true);
  };

  const approveIntake = (item: IntakeItem) => {
    if (item.source === "Fax") {
      setFaxOCRTarget(item);
      return;
    }
    doApproveIntake(item);
  };

  const doApproveIntake = (item: IntakeItem) => {
    const newRx: Prescription = {
      id: `rx-intake-${item.id}`,
      rxNumber: `RX-2024-${String(Date.now()).slice(-6)}`,
      patientId: item.id,
      patientName: item.patientName,
      drug: item.drug,
      ndc: "00000-0000-00",
      strength: item.strength,
      qty: 30,
      daysSupply: 30,
      refillsAllowed: item.csSchedule === "CII" ? 0 : 1,
      refillsRemaining: item.csSchedule === "CII" ? 0 : 1,
      sig: "As directed",
      dawCode: "0",
      prescriberId: "dr001",
      prescriberName: item.prescriberName,
      writtenDate: new Date().toISOString().slice(0, 10),
      status: "new",
      copay: 0,
      csSchedule: item.csSchedule as Prescription["csSchedule"],
    };
    setRxList(prev => [newRx, ...prev]);
    setIntakeItems(prev => prev.filter(i => i.id !== item.id));
    setFaxOCRTarget(null);
  };

  const markUrgent = (rx: Prescription, reason: string) => {
    setRxList(prev => prev.map(r => r.id === rx.id ? { ...r, isUrgent: true, urgentReason: reason } : r));
    setUrgentTarget(null);
  };

  const removeUrgent = (rxId: string, e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setRxList(prev => prev.map(r => r.id === rxId ? { ...r, isUrgent: false, urgentReason: undefined } : r));
  };

  // Epic 24 — Transfer Out handler
  const doTransferOut = (rx: Prescription, data: {
    receivingPharmacy: string; receivingPharmacyAddress: string;
    receivingPharmacyPhone: string; receivingPharmacyDea: string;
    receivingPharmacist: string; refillsTransferred: number;
  }) => {
    const now = new Date().toLocaleString();
    const isoNow = new Date().toISOString();
    const entry: TransferLogEntry = {
      type: "transfer_out",
      rxId: rx.id,
      receivingPharmacy: data.receivingPharmacy,
      receivingPharmacist: data.receivingPharmacist,
      timestamp: isoNow,
      refillsTransferred: data.refillsTransferred,
    };
    setTransferLog(prev => [...prev, entry]);
    mockTransferLog.push(entry);
    setRxList(prev => prev.map(r => r.id === rx.id ? {
      ...r,
      status: "transferred_out",
      refillsRemaining: 0,
      transferOut: {
        receivingPharmacy: data.receivingPharmacy,
        receivingPharmacyAddress: data.receivingPharmacyAddress,
        receivingPharmacyPhone: data.receivingPharmacyPhone,
        receivingPharmacyDea: data.receivingPharmacyDea || undefined,
        receivingPharmacist: data.receivingPharmacist,
        transferDate: now,
        refillsTransferred: data.refillsTransferred,
      },
      transferLog: [...(r.transferLog || []), entry],
    } : r));
    setTransferOutTarget(null);
    setSheetOpen(false);
  };

  // Channel label → data value mapping
  const channelDataMap: Record<string, string> = {
    "E-Prescribe": "eRx", "Phone-In": "Phone", "Fax": "Fax", "Walk-In": "Walk-In", "Transfer In": "Transfer In",
  };

  const applyFilters = (rxs: Prescription[]) => {
    return rxs.filter(rx => {
      if (filterStatuses.size > 0) {
        if (!filterStatuses.has(rx.status)) return false;
      }
      if (filterChannels.size > 0) {
        const rxChannel = rx.channel || "eRx";
        if (![...filterChannels].some(ch => channelDataMap[ch] === rxChannel)) return false;
      }
      if (filterSchedules.size > 0) {
        let ok = false;
        if (filterSchedules.has("Non-Controlled") && !rx.csSchedule) ok = true;
        if (filterSchedules.has("Schedule III-V") && rx.csSchedule && rx.csSchedule !== "CII") ok = true;
        if (filterSchedules.has("Schedule II / CII") && rx.csSchedule === "CII") ok = true;
        if (!ok) return false;
      }
      if (filterTechs.size > 0) {
        const tech = rx.assignedTech || "Unassigned";
        if (!filterTechs.has(tech)) return false;
      }
      if (filterUrgent && !rx.isUrgent) return false;
      return true;
    }).sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return 0;
    });
  };

  const currentRx = selectedRx ? rxList.find(r => r.id === selectedRx.id) || selectedRx : null;

  return (
    <div className="space-y-5">
      {/* Modals */}
      {rejectTarget && (
        <RejectModal item={rejectTarget} onConfirm={() => { setIntakeItems(prev => prev.filter(i => i.id !== rejectTarget!.id)); setRejectTarget(null); }} onCancel={() => setRejectTarget(null)} />
      )}
      {faxOCRTarget && (
        <FaxOCRModal item={faxOCRTarget} onApprove={() => doApproveIntake(faxOCRTarget!)} onCancel={() => setFaxOCRTarget(null)} />
      )}
      {overrideTarget && overrideRxId && (
        <DUROverrideModal alert={overrideTarget} onConfirm={(code, notes) => { acknowledgeAlert(overrideRxId, overrideTarget.id); setOverrideTarget(null); setOverrideRxId(null); }} onCancel={() => { setOverrideTarget(null); setOverrideRxId(null); }} />
      )}
      {pdmpTarget && (
        <PDMPBlockModal rx={pdmpTarget} onProceed={() => doAdvance(pdmpTarget, "filling")} onCancel={() => setPdmpTarget(null)} />
      )}
      {labelTarget && (
        <LabelPreviewModal rx={labelTarget} onClose={() => setLabelTarget(null)} />
      )}
      {urgentTarget && (
        <MarkUrgentModal rxName={`${urgentTarget.rxNumber} — ${urgentTarget.drug}`} onConfirm={(reason) => markUrgent(urgentTarget, reason)} onCancel={() => setUrgentTarget(null)} />
      )}
      {transferOutTarget && (
        <TransferOutModal
          rx={transferOutTarget}
          transferLog={transferLog}
          onConfirm={(data) => doTransferOut(transferOutTarget, data)}
          onCancel={() => setTransferOutTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the prescription workflow from intake to pickup</p>
        </div>
        <Button asChild className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2">
          <Link href="/prescriptions/new"><Plus className="w-4 h-4" />New Rx</Link>
        </Button>
      </div>

      {/* ── Intake Queue ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Intake Queue</h2>
          {intakeItems.length > 0 && <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0">{intakeItems.length}</Badge>}
        </div>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Prescriber</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Channel</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Received</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakeItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">No items in intake queue</TableCell>
                  </TableRow>
                ) : (
                  intakeItems.map(item => (
                    <TableRow key={item.id} className="border-gray-100">
                      <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.patientName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{item.drug}</p>
                            <p className="text-xs text-gray-400">{item.strength}</p>
                          </div>
                          {item.csSchedule && (
                            <Badge className={`text-xs border ${csBadgeStyle[item.csSchedule] || "bg-red-100 text-red-700 border-red-300"}`}>
                              {item.csSchedule}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">{item.prescriberName}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${sourceBadgeStyle[item.source]}`}>
                          {item.source === "Fax" ? "Fax — Needs Review" : item.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-gray-500">{item.receivedAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white text-xs h-7 px-2.5" onClick={() => approveIntake(item)}>
                            <Check className="w-3 h-3 mr-1" />
                            {item.source === "Fax" ? "Review & Approve" : "Approve → Fill Queue"}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2.5" onClick={() => setRejectTarget(item)}>
                            <X className="w-3 h-3 mr-1" />Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Fill Pipeline ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Fill Pipeline</h2>
          {hasActiveFilters && <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0">Filtered</Badge>}
        </div>

        <div className="flex gap-4 items-start">
          {/* US-3.3: Left-side filter panel */}
          <aside className="w-52 shrink-0 hidden md:block">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-4 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                {[
                  { key: "new", label: "New" },
                  { key: "filling", label: "Filling" },
                  { key: "dur_hold", label: "DUR Hold" },
                  { key: "claims_hold", label: "Claims Hold" },
                  { key: "ready", label: "Ready" },
                  { key: "dispensed", label: "Dispensed" },
                  { key: "transferred_out", label: "Transferred Out" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-gray-700 mb-1.5 cursor-pointer">
                    <input type="checkbox" checked={filterStatuses.has(key)} onChange={() => toggleFilter(setFilterStatuses, key)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[#7C3AED]" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Channel</p>
                {["E-Prescribe", "Phone-In", "Fax", "Walk-In", "Transfer In"].map(ch => (
                  <label key={ch} className="flex items-center gap-2 text-gray-700 mb-1.5 cursor-pointer">
                    <input type="checkbox" checked={filterChannels.has(ch)} onChange={() => toggleFilter(setFilterChannels, ch)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[#7C3AED]" />
                    {ch}
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Drug Type</p>
                {["Non-Controlled", "Schedule III-V", "Schedule II / CII"].map(sched => (
                  <label key={sched} className="flex items-center gap-2 text-gray-700 mb-1.5 cursor-pointer">
                    <input type="checkbox" checked={filterSchedules.has(sched)} onChange={() => toggleFilter(setFilterSchedules, sched)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[#7C3AED]" />
                    {sched}
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tech Assignment</p>
                {["Unassigned", ...Array.from(new Set(rxList.flatMap(r => r.assignedTech ? [r.assignedTech] : [])))].map(tech => (
                  <label key={tech} className="flex items-center gap-2 text-gray-700 mb-1.5 cursor-pointer">
                    <input type="checkbox" checked={filterTechs.has(tech)} onChange={() => toggleFilter(setFilterTechs, tech)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[#7C3AED]" />
                    {tech}
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Urgency</p>
                <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filterUrgent} onChange={() => setFilterUrgent(v => !v)} className="w-3.5 h-3.5 rounded border-gray-300 accent-[#7C3AED]" />
                  Show Urgent Only
                </label>
              </div>
              {hasActiveFilters && (
                <>
                  <div className="border-t border-gray-100" />
                  <button onClick={clearFilters} className="text-xs text-[#7C3AED] hover:underline">Clear all filters</button>
                </>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="new">
          <div className="overflow-x-auto">
            <TabsList className="bg-gray-100 w-max">
              {tabConfig.map(tab => {
                const count = rxList.filter(r => r.status === tab.key).length;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-2 whitespace-nowrap">
                    {tab.label}
                    {count > 0 && <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0 ml-1">{count}</Badge>}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {tabConfig.map(tab => {
            const rawRxs = rxList.filter(r => r.status === tab.key);
            const rxs = applyFilters(rawRxs);
            return (
              <TabsContent key={tab.key} value={tab.key} className="mt-4">
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="hidden sm:table-cell pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Rx #</TableHead>
                          <TableHead className="pl-5 sm:pl-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Channel</TableHead>
                          <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Ins. Status</TableHead>
                          <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Tech</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Alerts</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rxs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                              {rawRxs.length > 0 ? "No prescriptions match current filters" : "No prescriptions in this stage"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          rxs.map(rx => {
                            const activeAlerts = rx.durAlerts?.filter(a => !a.acknowledged) ?? [];
                            return (
                              <TableRow
                                key={rx.id}
                                className={`cursor-pointer hover:bg-purple-50/50 border-gray-100 ${rx.isUrgent ? "bg-red-50/30" : ""}`}
                                onClick={() => openDetail(rx)}
                              >
                                <TableCell className="hidden sm:table-cell pl-5 font-mono text-sm text-gray-700">{rx.rxNumber}</TableCell>
                                <TableCell className="pl-5 sm:pl-4 text-sm font-medium text-gray-900">
                                  <div className="flex items-center gap-1.5">
                                    {rx.isUrgent && <Siren className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                                    {rx.patientName}
                                  </div>
                                  <span className="text-xs text-gray-400 sm:hidden block mt-0.5 font-mono">{rx.rxNumber}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <div>
                                      <p className="text-sm text-gray-900">{rx.drug}</p>
                                      <p className="text-xs text-gray-400">{rx.strength} &bull; Qty: {rx.qty}</p>
                                    </div>
                                    {rx.csSchedule && (
                                      <Badge className={`text-xs border ${csBadgeStyle[rx.csSchedule]}`}>{rx.csSchedule}</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <Badge className={`text-xs border ${sourceBadgeStyle[rx.channel as IntakeSource || "eRx"]}`}>
                                    {rx.channel || "eRx"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                                  {rx.insuranceStatus ? (
                                    <Badge className={`text-xs border ${
                                      rx.insuranceStatus === "Covered" ? "bg-green-100 text-green-700 border-green-200" :
                                      rx.insuranceStatus === "Prior Auth" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                      rx.insuranceStatus === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                                      "bg-gray-100 text-gray-600 border-gray-200"
                                    }`}>{rx.insuranceStatus}</Badge>
                                  ) : <span className="text-xs text-gray-400">—</span>}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                                  {rx.assignedTech || <span className="text-xs text-gray-400">—</span>}
                                </TableCell>
                                <TableCell>
                                  {activeAlerts.length > 0 ? (
                                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                                      <AlertTriangle className="w-3 h-3" />{activeAlerts.length} DUR
                                    </Badge>
                                  ) : <span className="text-xs text-gray-400">Clear</span>}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge className={`text-xs border ${statusColors[rx.status]}`}>{tab.label}</Badge>
                                </TableCell>
                                <TableCell onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center gap-1.5">
                                    {/* Epic 24 — Transfer Out button: show for new/filling/ready non-CII only */}
                                    {(rx.status === "new" || rx.status === "filling" || rx.status === "ready") &&
                                      rx.csSchedule !== "CII" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs text-teal-700 border-teal-200 hover:bg-teal-50 gap-1"
                                        onClick={e => { e.stopPropagation(); setTransferOutTarget(rx); }}
                                      >
                                        <ArrowLeftRight className="w-3 h-3" />
                                        <span className="hidden sm:inline">Transfer Out</span>
                                      </Button>
                                    )}
                                    {/* Transferred Out badge (terminal — no refill affordance) */}
                                    {rx.status === "transferred_out" && (
                                      <span className="text-xs text-gray-400 italic">Transferred</span>
                                    )}
                                    {rx.isUrgent ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                        onClick={e => removeUrgent(rx.id, e)}
                                      >
                                        <Siren className="w-3 h-3" />
                                        <span className="hidden sm:inline">Remove Urgent</span>
                                      </Button>
                                    ) : rx.status !== "transferred_out" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs text-gray-500 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 gap-1"
                                        onClick={e => { e.stopPropagation(); setUrgentTarget(rx); }}
                                      >
                                        <Siren className="w-3 h-3" />
                                        <span className="hidden sm:inline">Mark Urgent</span>
                                      </Button>
                                    ) : null}
                                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                    {rawRxs.length > 0 && (
                      <div className="px-5 py-2 border-t border-gray-100 text-xs text-gray-400">
                        Showing {rxs.length} of {rawRxs.length} prescription{rawRxs.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
            </Tabs>
          </div>
        </div>
      </div>

      {/* ── Campaign Stats (US-13.4) ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{campaignStats.campaignName}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Messages Sent", value: String(campaignStats.messagesSent), color: "text-gray-800", bg: "bg-gray-50 border-gray-200" },
            { label: "Confirmed", value: `${Math.round(campaignStats.confirmed / campaignStats.messagesSent * 100)}%`, color: "text-green-700", bg: "bg-green-50 border-green-100" },
            { label: "Declined", value: `${Math.round(campaignStats.declined / campaignStats.messagesSent * 100)}%`, color: "text-red-700", bg: "bg-red-50 border-red-100" },
            { label: "No Response", value: `${Math.round(campaignStats.noResponse / campaignStats.messagesSent * 100)}%`, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-0.5 ${s.color}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Predictive Refill Queue ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <RotateCcw className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Predictive Refill Queue</h2>
        </div>
        <RefillQueueSection />
      </div>

      {/* ── Non-Responsive Patients (US-13.4) ── */}
      <NonResponsivePatientsSection />

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          {currentRx && (() => {
            const tab = tabConfig.find(t => t.key === currentRx.status);
            const activeAlerts = currentRx.durAlerts?.filter(a => !a.acknowledged) ?? [];
            const isCII = currentRx.csSchedule === "CII";

            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {currentRx.rxNumber}
                    {currentRx.csSchedule && (
                      <Badge className={`text-xs border ${csBadgeStyle[currentRx.csSchedule]}`}>
                        {currentRx.csSchedule}
                      </Badge>
                    )}
                    {currentRx.isUrgent && (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs gap-1">
                        <Siren className="w-3 h-3" />URGENT
                      </Badge>
                    )}
                  </SheetTitle>
                  <SheetDescription>
                    {currentRx.patientName} &bull; {currentRx.drug} {currentRx.strength}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5">
                  {/* Fix 16: DEA verification chip for CS */}
                  {currentRx.csSchedule && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-800">DEA# Verified — {currentRx.csSchedule} Controlled Substance</p>
                        <p className="text-xs text-blue-600">Prescriber DEA: BH5544332 &bull; Dr. Robert Harris</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">Verified</Badge>
                    </div>
                  )}

                  {/* Fix 19: CIII-V advisory */}
                  {currentRx.csSchedule && currentRx.csSchedule !== "CII" && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-amber-700 text-sm">
                        PDMP advisory: This is a Schedule {currentRx.csSchedule} controlled substance. Consider checking the PDMP database before dispensing.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* DUR Alerts */}
                  {activeAlerts.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />DUR Alerts ({activeAlerts.length})
                      </p>
                      <div className="space-y-3">
                        {currentRx.durAlerts?.map(alert => (
                          <DURAlertCard
                            key={alert.id}
                            alert={alert}
                            onAcknowledge={() => acknowledgeAlert(currentRx.id, alert.id)}
                            onOverride={() => { setOverrideTarget(alert); setOverrideRxId(currentRx.id); }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rx Details */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Patient", value: currentRx.patientName },
                      { label: "Prescriber", value: currentRx.prescriberName },
                      { label: "Drug", value: `${currentRx.drug} ${currentRx.strength}` },
                      { label: "NDC", value: currentRx.ndc },
                      { label: "Quantity", value: currentRx.qty.toString() },
                      { label: "Days Supply", value: currentRx.daysSupply.toString() },
                      { label: "Refills Remaining", value: currentRx.refillsRemaining.toString() },
                      { label: "DAW Code", value: currentRx.dawCode },
                      { label: "Written Date", value: currentRx.writtenDate },
                      { label: "Copay", value: `$${currentRx.copay?.toFixed(2)}` },
                    ].map(item => (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Patient Instructions (Sig)</p>
                    <p className="text-sm text-gray-900">{currentRx.sig}</p>
                  </div>

                  {/* Fix 17: CII 0-refill notice */}
                  {isCII && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />Schedule CII — No Refills Permitted by Federal Law
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">Refills: 0 of 0 remaining</p>
                    </div>
                  )}

                  {/* Fix 22: Request Auth when refills exhausted (non-CII) */}
                  {!isCII && currentRx.refillsRemaining === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-800">Refills exhausted</p>
                        <p className="text-xs text-amber-600">Contact prescriber for renewal authorization</p>
                      </div>
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 gap-1">
                        <Send className="w-3 h-3" />Request Auth
                      </Button>
                    </div>
                  )}

                  {/* Epic 24 — Transfer In metadata */}
                  {currentRx.transferIn && (
                    <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                        <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Transfer In — Audit Record</p>
                        <Badge className="bg-teal-600 text-white text-xs">Transfer In</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-teal-600">Originating Pharmacy</p><p className="font-medium text-teal-900">{currentRx.transferIn.origPharmacy}</p></div>
                        <div><p className="text-teal-600">Original Rx #</p><p className="font-medium text-teal-900 font-mono">{currentRx.transferIn.origRxNumber}</p></div>
                        <div><p className="text-teal-600">Transferring Pharmacist</p><p className="font-medium text-teal-900">{currentRx.transferIn.origPharmacistName}</p></div>
                        <div><p className="text-teal-600">Original Rx Date</p><p className="font-medium text-teal-900">{currentRx.transferIn.origRxDate}</p></div>
                        <div><p className="text-teal-600">Last Dispensed</p><p className="font-medium text-teal-900">{currentRx.transferIn.lastDispensedDate}</p></div>
                        <div><p className="text-teal-600">Orig. Refills Auth.</p><p className="font-medium text-teal-900">{currentRx.transferIn.origRefillsAuthorized}</p></div>
                      </div>
                    </div>
                  )}

                  {/* Epic 24 — Transfer Out metadata */}
                  {currentRx.transferOut && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Transferred Out — Audit Record</p>
                        <Badge className="bg-gray-500 text-white text-xs">Transferred Out</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><p className="text-gray-500">Receiving Pharmacy</p><p className="font-medium text-gray-800">{currentRx.transferOut.receivingPharmacy}</p></div>
                        <div><p className="text-gray-500">Receiving Pharmacist</p><p className="font-medium text-gray-800">{currentRx.transferOut.receivingPharmacist}</p></div>
                        <div><p className="text-gray-500">Transfer Date</p><p className="font-medium text-gray-800">{currentRx.transferOut.transferDate}</p></div>
                        <div><p className="text-gray-500">Refills Transferred</p><p className="font-medium text-gray-800">{currentRx.transferOut.refillsTransferred}</p></div>
                      </div>
                      <p className="text-xs text-gray-500 italic">This prescription has been transferred out and cannot be refilled or transferred again.</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {/* Epic 24 — Transfer Out button in sheet (non-CII, active statuses) */}
                    {(currentRx.status === "new" || currentRx.status === "filling" || currentRx.status === "ready") &&
                      currentRx.csSchedule !== "CII" && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-teal-700 border-teal-200 hover:bg-teal-50"
                        onClick={() => { setSheetOpen(false); setTransferOutTarget(currentRx); }}
                      >
                        <ArrowLeftRight className="w-4 h-4" />Transfer Out
                      </Button>
                    )}

                    {/* Fix 5: Mark Urgent */}
                    {!currentRx.isUrgent && currentRx.status !== "dispensed" && currentRx.status !== "transferred_out" && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setSheetOpen(false); setUrgentTarget(currentRx); }}
                      >
                        <Siren className="w-4 h-4" />Mark as Urgent
                      </Button>
                    )}

                    {/* Fix 12/13/14: Generate Label for Ready Rx */}
                    {currentRx.status === "ready" && (
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-[#7C3AED] border-purple-200 hover:bg-purple-50"
                        onClick={() => { setSheetOpen(false); setLabelTarget(currentRx); }}
                      >
                        <ClipboardList className="w-4 h-4" />Generate Label
                      </Button>
                    )}

                    {tab?.nextStatus && tab?.nextLabel && (
                      <>
                        {activeAlerts.length > 0 && (
                          <Alert className="mb-3 border-amber-200 bg-amber-50">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <AlertDescription className="text-amber-700 text-sm">
                              Acknowledge all DUR alerts before advancing this prescription.
                            </AlertDescription>
                          </Alert>
                        )}
                        <Button
                          className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
                          disabled={activeAlerts.length > 0}
                          onClick={() => advanceRx(currentRx, tab.nextStatus!)}
                        >
                          {isCII && tab.nextStatus === "filling" ? "Run PDMP & Start Fill" : tab.nextLabel}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
