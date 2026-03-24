"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, AlertTriangle, ChevronRight, X, Check, AlertCircle, Inbox, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockPrescriptions } from "@/lib/mock-data";
import type { Prescription, DURAlert } from "@/lib/mock-data";

// ── Status colours for fill pipeline ──────────────────────────────────────────
const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-700 border-gray-200",
  filling: "bg-blue-100 text-blue-700 border-blue-200",
  dur_hold: "bg-red-100 text-red-700 border-red-200",
  claims_hold: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  dispensed: "bg-gray-100 text-gray-500 border-gray-200",
};

const tabConfig = [
  { key: "new",          label: "New",          nextStatus: "filling",  nextLabel: "Start Fill" },
  { key: "filling",      label: "Filling",       nextStatus: "ready",    nextLabel: "Mark Ready" },
  { key: "dur_hold",     label: "DUR Hold",      nextStatus: "filling",  nextLabel: "Clear Hold — Return to Filling" },
  { key: "claims_hold",  label: "Claims Hold",   nextStatus: "filling",  nextLabel: "Clear Hold — Return to Filling" },
  { key: "ready",        label: "Ready",         nextStatus: null,       nextLabel: null },
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

// ── Intake queue types ─────────────────────────────────────────────────────────
type IntakeSource = "eRx" | "Fax" | "Manual";

interface IntakeItem {
  id: string;
  patientName: string;
  drug: string;
  strength: string;
  prescriberName: string;
  receivedAt: string;
  source: IntakeSource;
}

const initialIntakeItems: IntakeItem[] = [
  {
    id: "in001",
    patientName: "Eleanor Vasquez",
    drug: "Lisinopril",
    strength: "10 mg",
    prescriberName: "Dr. Sarah Mitchell",
    receivedAt: "2 min ago",
    source: "eRx",
  },
  {
    id: "in002",
    patientName: "Harold Simmons",
    drug: "Hydrocodone/APAP",
    strength: "5/325 mg",
    prescriberName: "Dr. Robert Harris",
    receivedAt: "11 min ago",
    source: "Fax",
  },
  {
    id: "in003",
    patientName: "Carol Nguyen",
    drug: "Amoxicillin",
    strength: "500 mg",
    prescriberName: "Dr. David Park",
    receivedAt: "18 min ago",
    source: "Manual",
  },
];

const sourceBadgeStyle: Record<IntakeSource, string> = {
  eRx: "bg-blue-100 text-blue-700 border-blue-200",
  Fax: "bg-amber-100 text-amber-700 border-amber-200",
  Manual: "bg-gray-100 text-gray-600 border-gray-200",
};

function sourceLabel(source: IntakeSource) {
  if (source === "Fax") return "Fax — Needs Review";
  return source;
}

// ── DUR Alert card ─────────────────────────────────────────────────────────────
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
          alert.severity === 'high' ? 'text-red-500' :
          alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs border ${severityBadge[alert.severity]}`}>
              {alert.severity.toUpperCase()} — {alert.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-line">{alert.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 ml-7">
        <Button size="sm" className="gap-1.5 bg-red-600 hover:bg-red-700 text-white" onClick={onOverride}>
          <X className="w-3.5 h-3.5" />
          Override with Reason
        </Button>
        <Button size="sm" variant="outline" onClick={onAcknowledge} className="gap-1.5 text-gray-700">
          <Check className="w-3.5 h-3.5" />
          Reject Rx
        </Button>
        <Button size="sm" variant="outline" onClick={onAcknowledge} className="gap-1.5 text-gray-700">
          Contact Prescriber
        </Button>
      </div>
    </div>
  );
}

// ── Reject modal ───────────────────────────────────────────────────────────────
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
        <p className="text-sm text-gray-500 mb-4">
          {item.patientName} — {item.drug} {item.strength}
        </p>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Reason Code / Notes
        </label>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
          rows={3}
          placeholder="e.g. Duplicate Rx, patient already on therapy, incorrect prescriber..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={reason.trim().length === 0}
            onClick={() => onConfirm(reason)}
          >
            Confirm Rejection
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
  const [rxList, setRxList] = useState<Prescription[]>(mockPrescriptions);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [intakeItems, setIntakeItems] = useState<IntakeItem[]>(initialIntakeItems);
  const [rejectTarget, setRejectTarget] = useState<IntakeItem | null>(null);

  const acknowledgeAlert = (rxId: string, alertId: string) => {
    setRxList(prev => prev.map(rx =>
      rx.id === rxId
        ? { ...rx, durAlerts: rx.durAlerts?.map(a => a.id === alertId ? { ...a, acknowledged: true } : a) }
        : rx
    ));
    if (selectedRx?.id === rxId) {
      setSelectedRx(prev => prev ? {
        ...prev,
        durAlerts: prev.durAlerts?.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
      } : null);
    }
  };

  const advanceRx = (rx: Prescription, nextStatus: string) => {
    setRxList(prev => prev.map(r =>
      r.id === rx.id ? { ...r, status: nextStatus as Prescription['status'] } : r
    ));
    setSheetOpen(false);
  };

  const openDetail = (rx: Prescription) => {
    setSelectedRx(rxList.find(r => r.id === rx.id) || rx);
    setSheetOpen(true);
  };

  const approveIntake = (item: IntakeItem) => {
    // Move to fill queue "New" tab by adding a synthetic prescription entry
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
      refillsAllowed: 1,
      refillsRemaining: 1,
      sig: "As directed",
      dawCode: "0",
      prescriberId: "dr001",
      prescriberName: item.prescriberName,
      writtenDate: new Date().toISOString().slice(0, 10),
      status: "new",
      copay: 0,
    };
    setRxList(prev => [newRx, ...prev]);
    setIntakeItems(prev => prev.filter(i => i.id !== item.id));
  };

  const confirmReject = (reason: string) => {
    if (rejectTarget) {
      setIntakeItems(prev => prev.filter(i => i.id !== rejectTarget.id));
      setRejectTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      {rejectTarget && (
        <RejectModal
          item={rejectTarget}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the prescription workflow from intake to pickup</p>
        </div>
        <Button asChild className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2">
          <Link href="/prescriptions/new">
            <Plus className="w-4 h-4" />
            New Rx
          </Link>
        </Button>
      </div>

      {/* ── Intake Queue ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Inbox className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Intake Queue</h2>
          {intakeItems.length > 0 && (
            <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0">{intakeItems.length}</Badge>
          )}
        </div>
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Prescriber</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Source</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Received</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakeItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                      No items in intake queue
                    </TableCell>
                  </TableRow>
                ) : (
                  intakeItems.map(item => (
                    <TableRow key={item.id} className="border-gray-100">
                      <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.patientName}</TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900">{item.drug}</p>
                        <p className="text-xs text-gray-400">{item.strength}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">{item.prescriberName}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${sourceBadgeStyle[item.source]}`}>
                          {sourceLabel(item.source)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-gray-500">{item.receivedAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            size="sm"
                            className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white text-xs h-7 px-2.5"
                            onClick={() => approveIntake(item)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve → Fill Queue
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2.5"
                            onClick={() => setRejectTarget(item)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
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
        </div>
        <Tabs defaultValue="new">
          <div className="overflow-x-auto">
            <TabsList className="bg-gray-100 w-max">
              {tabConfig.map(tab => {
                const count = rxList.filter(r => r.status === tab.key).length;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-2 whitespace-nowrap">
                    {tab.label}
                    {count > 0 && (
                      <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0 ml-1">{count}</Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {tabConfig.map(tab => {
            const rxs = rxList.filter(r => r.status === tab.key);
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
                          <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Prescriber</TableHead>
                          <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Written</TableHead>
                          <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Alerts</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rxs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                              No prescriptions in this stage
                            </TableCell>
                          </TableRow>
                        ) : (
                          rxs.map(rx => {
                            const activeAlerts = rx.durAlerts?.filter(a => !a.acknowledged) ?? [];
                            return (
                              <TableRow
                                key={rx.id}
                                className="cursor-pointer hover:bg-purple-50/50 border-gray-100"
                                onClick={() => openDetail(rx)}
                              >
                                <TableCell className="hidden sm:table-cell pl-5 font-mono text-sm text-gray-700">{rx.rxNumber}</TableCell>
                                <TableCell className="pl-5 sm:pl-4 text-sm font-medium text-gray-900">
                                  {rx.patientName}
                                  <span className="text-xs text-gray-400 sm:hidden block mt-0.5 font-mono">{rx.rxNumber}</span>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-gray-900">{rx.drug}</p>
                                  <p className="text-xs text-gray-400">{rx.strength} &bull; Qty: {rx.qty}</p>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-gray-600">{rx.prescriberName}</TableCell>
                                <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                                  {new Date(rx.writtenDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </TableCell>
                                <TableCell>
                                  {activeAlerts.length > 0 ? (
                                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      {activeAlerts.length} DUR
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-gray-400">Clear</span>
                                  )}
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge className={`text-xs border ${statusColors[rx.status]}`}>
                                    {tab.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          {selectedRx && (() => {
            const currentRx = rxList.find(r => r.id === selectedRx.id) || selectedRx;
            const tab = tabConfig.find(t => t.key === currentRx.status);
            const activeAlerts = currentRx.durAlerts?.filter(a => !a.acknowledged) ?? [];
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-lg font-bold text-gray-900">
                    {currentRx.rxNumber}
                  </SheetTitle>
                  <SheetDescription>
                    {currentRx.patientName} &bull; {currentRx.drug} {currentRx.strength}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-5">
                  {/* DUR Alerts */}
                  {activeAlerts.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        DUR Alerts ({activeAlerts.length})
                      </p>
                      <div className="space-y-3">
                        {currentRx.durAlerts?.map(alert => (
                          <DURAlertCard
                            key={alert.id}
                            alert={alert}
                            onAcknowledge={() => acknowledgeAlert(currentRx.id, alert.id)}
                            onOverride={() => acknowledgeAlert(currentRx.id, alert.id)}
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

                  {/* Actions */}
                  {tab?.nextStatus && tab?.nextLabel && (
                    <div className="pt-2 border-t border-gray-100">
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
                        {tab.nextLabel}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
