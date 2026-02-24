"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, AlertTriangle, ChevronRight, X, Check, AlertCircle } from "lucide-react";
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

const statusColors: Record<string, string> = {
  pending_verification: "bg-amber-100 text-amber-700 border-amber-200",
  fill_count: "bg-blue-100 text-blue-700 border-blue-200",
  final_check: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ready_pickup: "bg-green-100 text-green-700 border-green-200",
  dispensed: "bg-gray-100 text-gray-600 border-gray-200",
};

const tabConfig = [
  { key: "pending_verification", label: "Pending Verification", nextStatus: "fill_count", nextLabel: "Advance to Fill" },
  { key: "fill_count", label: "Fill / Count", nextStatus: "final_check", nextLabel: "Send to Final Check" },
  { key: "final_check", label: "Final Check", nextStatus: "ready_pickup", nextLabel: "Approve — Ready for Pickup" },
  { key: "ready_pickup", label: "Ready for Pickup", nextStatus: null, nextLabel: null },
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

export default function PrescriptionsPage() {
  const [rxList, setRxList] = useState<Prescription[]>(mockPrescriptions);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  return (
    <div className="space-y-5">
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

      <Tabs defaultValue="pending_verification">
        <TabsList className="bg-gray-100">
          {tabConfig.map(tab => {
            const count = rxList.filter(r => r.status === tab.key).length;
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-2">
                {tab.label}
                {count > 0 && (
                  <Badge className="bg-[#7C3AED] text-white text-xs px-1.5 py-0 ml-1">{count}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

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
