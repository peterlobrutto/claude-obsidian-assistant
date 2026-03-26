"use client";

import { useState } from "react";
import { Package, Filter, CheckCircle, RotateCcw, CreditCard, Banknote, X, Check } from "lucide-react";
import { isPostMVP } from "@/lib/deployment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { mockWillCallItems } from "@/lib/mock-data";
import type { WillCallItem } from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-green-100 text-green-700 border-green-200" },
  expiring_soon: { label: "Expiring Soon", className: "bg-orange-100 text-orange-700 border-orange-200" },
  return_to_stock: { label: "Return to Stock", className: "bg-red-100 text-red-700 border-red-200" },
};

// summaryStats is derived dynamically inside the component (US-16.4)

// ── Payment Modal (Fix 10/11) ─────────────────────────────────────────────────
type PaymentMethod = "terminal" | "cash" | null;
type TerminalStep = "idle" | "waiting" | "approved" | "declined";

function PaymentModal({ item, onComplete, onCancel }: {
  item: WillCallItem;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [terminalStep, setTerminalStep] = useState<TerminalStep>("idle");
  const [cashTendered, setCashTendered] = useState<string>("");

  const changeDue = cashTendered ? Math.max(0, parseFloat(cashTendered) - item.copay) : 0;
  const cashValid = parseFloat(cashTendered) >= item.copay;

  const runTerminal = async () => {
    setTerminalStep("waiting");
    await new Promise(r => setTimeout(r, 2500));
    setTerminalStep("approved");
  };

  if (method === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Verify Pickup — Payment</h3>
          <p className="text-sm text-gray-500 mb-1">{item.patientName}</p>
          <p className="text-sm text-gray-700 mb-4">{item.drug}</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-5 flex justify-between items-center">
            <span className="text-sm text-gray-600">Copay Due</span>
            <span className="text-2xl font-bold text-gray-900">${item.copay.toFixed(2)}</span>
          </div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod("terminal")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#7C3AED] bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <CreditCard className="w-6 h-6 text-[#7C3AED]" />
              <span className="text-sm font-semibold text-[#7C3AED]">Card / Tap</span>
              <span className="text-xs text-gray-500">Stripe Terminal</span>
            </button>
            <button
              onClick={() => setMethod("cash")}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Banknote className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Cash</span>
              <span className="text-xs text-gray-500">Calculate change</span>
            </button>
          </div>
          <Button variant="outline" className="w-full mt-3" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (method === "terminal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Card Payment — ${item.copay.toFixed(2)}</h3>
          {terminalStep === "idle" && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-5">Ready to process payment via Stripe Terminal</p>
              <Button className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white mb-2" onClick={runTerminal}>
                Present Card / Tap
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMethod(null)}>Back</Button>
            </>
          )}
          {terminalStep === "waiting" && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CreditCard className="w-10 h-10 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Waiting for tap or insert...</p>
              <p className="text-xs text-gray-500">Please present card to terminal</p>
            </>
          )}
          {terminalStep === "approved" && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-green-700 mb-1">Payment Approved</p>
              <p className="text-xs text-gray-500 mb-5">${item.copay.toFixed(2)} charged successfully</p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={onComplete}>
                Confirm Pickup
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Cash payment
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Cash Payment</h3>
        <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between">
          <span className="text-sm text-gray-600">Copay Due</span>
          <span className="text-xl font-bold text-gray-900">${item.copay.toFixed(2)}</span>
        </div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Cash Tendered
        </label>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
          <input
            type="number"
            step="0.01"
            min={item.copay}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-lg font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
            value={cashTendered}
            onChange={e => setCashTendered(e.target.value)}
          />
        </div>
        {cashTendered && (
          <div className={`rounded-lg p-3 mb-4 flex justify-between items-center ${cashValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <span className={`text-sm font-medium ${cashValid ? "text-green-700" : "text-red-700"}`}>
              {cashValid ? "Change Due" : "Insufficient — short by"}
            </span>
            <span className={`text-xl font-bold ${cashValid ? "text-green-700" : "text-red-700"}`}>
              ${cashValid ? changeDue.toFixed(2) : (item.copay - parseFloat(cashTendered)).toFixed(2)}
            </span>
          </div>
        )}
        {/* Quick bills */}
        <div className="flex gap-2 mb-4">
          {[1, 5, 10, 20, 50, 100].filter(b => b >= item.copay / 2).slice(0, 4).map(b => (
            <button
              key={b}
              onClick={() => setCashTendered(b.toString())}
              className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors font-medium"
            >
              ${b}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!cashValid}
            onClick={onComplete}
          >
            Confirm Cash Payment
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setMethod(null)}>Back</Button>
        </div>
      </div>
    </div>
  );
}

export default function WillCallPage() {
  const [items, setItems] = useState<WillCallItem[]>(mockWillCallItems);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [paymentTarget, setPaymentTarget] = useState<WillCallItem | null>(null);

  // US-16.4: derive counts dynamically from live items array
  const readyCount = items.filter(i => i.status === "ready").length;
  const expiringSoonCount = items.filter(i => i.status === "expiring_soon").length;
  const rtsCount = items.filter(i => i.status === "return_to_stock").length;
  const summaryStats = [
    { label: "Ready for Pickup", count: readyCount, color: "text-green-600", bg: "bg-green-50" },
    ...(isPostMVP ? [
      { label: "Expiring Soon", count: expiringSoonCount, color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Return to Stock", count: rtsCount, color: "text-red-600", bg: "bg-red-50" },
    ] : []),
    { label: "Total in Will-Call", count: items.length, color: "text-gray-700", bg: "bg-gray-50" },
  ];

  const filtered = items.filter(item =>
    statusFilter === "all" ? true : item.status === statusFilter
  );

  const startPickup = (item: WillCallItem) => {
    if (item.copay > 0) {
      setPaymentTarget(item);
    } else {
      completePickup(item.id);
    }
  };

  const completePickup = (id: string) => {
    setPaymentTarget(null);
    setConfirmedIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      setConfirmedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 1500);
  };

  const returnToStock = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-5">
      {paymentTarget && (
        <PaymentModal
          item={paymentTarget}
          onComplete={() => completePickup(paymentTarget!.id)}
          onCancel={() => setPaymentTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Will-Call Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prescriptions ready for patient pickup</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              {isPostMVP && <SelectItem value="expiring_soon">Expiring Soon</SelectItem>}
              {isPostMVP && <SelectItem value="return_to_stock">Return to Stock</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`grid gap-4 ${isPostMVP ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
        {summaryStats.map(stat => (
          <Card key={stat.label} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-2`}>
                <Package className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-5">
          <p className="text-sm text-gray-500">{filtered.length} item{filtered.length !== 1 ? "s" : ""} shown</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-t border-gray-100">
                <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Rx #</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Date Filled</TableHead>
                {isPostMVP && <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Days</TableHead>}
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Copay</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPostMVP ? 8 : 7} className="text-center py-12 text-gray-400">
                    No items in will-call queue
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow
                    key={item.id}
                    className={`border-gray-100 transition-colors ${
                      isPostMVP && item.status === "return_to_stock" ? "bg-red-50/30" :
                      isPostMVP && item.status === "expiring_soon" ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <TableCell className="pl-5 font-medium text-gray-900">
                      {item.patientName}
                      <span className={`sm:hidden block mt-0.5 text-xs font-medium ${
                        isPostMVP && item.status === "return_to_stock" ? "text-red-600" :
                        isPostMVP && item.status === "expiring_soon" ? "text-orange-600" :
                        "text-green-600"
                      }`}>
                        {isPostMVP ? statusConfig[item.status].label : statusConfig.ready.label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm text-gray-700">{item.rxNumber}</TableCell>
                    <TableCell className="text-sm text-gray-700">{item.drug}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {new Date(item.dateFilled + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    {isPostMVP && (
                      <TableCell className="hidden sm:table-cell">
                        <span className={`text-sm font-medium ${
                          item.daysInQueue >= 14 ? "text-red-600" :
                          item.daysInQueue >= 8 ? "text-orange-600" :
                          "text-gray-600"
                        }`}>
                          {item.daysInQueue === 0 ? "Today" : `${item.daysInQueue}d`}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="hidden sm:table-cell text-sm font-medium text-gray-900">${item.copay.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {isPostMVP || item.status === "ready" ? (
                        <Badge className={`text-xs border ${statusConfig[item.status].className}`}>
                          {statusConfig[item.status].label}
                        </Badge>
                      ) : (
                        <Badge className={`text-xs border ${statusConfig.ready.className}`}>
                          Ready
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1.5">
                        {item.status !== "return_to_stock" && (
                          <Button
                            size="sm"
                            className={`gap-1.5 text-xs h-7 ${
                              confirmedIds.has(item.id) ? "bg-green-600 hover:bg-green-700" : "bg-[#7C3AED] hover:bg-[#6d28d9]"
                            } text-white`}
                            onClick={() => !confirmedIds.has(item.id) && startPickup(item)}
                            disabled={confirmedIds.has(item.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{confirmedIds.has(item.id) ? "Confirmed!" : "Verify Pickup"}</span>
                            <span className="sm:hidden">{confirmedIds.has(item.id) ? "✓" : "Pickup"}</span>
                          </Button>
                        )}
                        {isPostMVP && (item.status === "return_to_stock" || item.status === "expiring_soon") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => returnToStock(item.id)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Return to Stock</span>
                            <span className="sm:hidden">RTS</span>
                          </Button>
                        )}
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
  );
}
