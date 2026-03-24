"use client";

import { useState } from "react";
import { Scan, CheckCircle, AlertTriangle, XCircle, Boxes, X, Clock } from "lucide-react";
import { isMVP } from "@/lib/deployment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Stock data ─────────────────────────────────────────────────────────────────
interface StockItem {
  id: string;
  drugName: string;
  ndc: string;
  qtyOnHand: number;
  reorderPoint: number;
  lastUpdated: string;
}

const initialStock: StockItem[] = [
  { id: "s001", drugName: "Metformin HCl 500mg Tab",       ndc: "00093-1174-01", qtyOnHand: 840,  reorderPoint: 200, lastUpdated: "2024-01-24" },
  { id: "s002", drugName: "Lisinopril 10mg Tab",            ndc: "00071-0156-23", qtyOnHand: 312,  reorderPoint: 150, lastUpdated: "2024-01-23" },
  { id: "s003", drugName: "Atorvastatin 40mg Tab",          ndc: "00185-0060-01", qtyOnHand: 145,  reorderPoint: 150, lastUpdated: "2024-01-24" },
  { id: "s004", drugName: "Amlodipine 5mg Tab",             ndc: "00143-9924-01", qtyOnHand: 290,  reorderPoint: 100, lastUpdated: "2024-01-22" },
  { id: "s005", drugName: "Omeprazole 20mg Cap",            ndc: "16714-0001-01", qtyOnHand: -12,  reorderPoint: 100, lastUpdated: "2024-01-24" },
  { id: "s006", drugName: "Levothyroxine 50mcg Tab",        ndc: "00555-0766-02", qtyOnHand: 90,   reorderPoint: 100, lastUpdated: "2024-01-21" },
  { id: "s007", drugName: "Sertraline HCl 50mg Tab",        ndc: "00228-2765-96", qtyOnHand: 510,  reorderPoint: 200, lastUpdated: "2024-01-23" },
  { id: "s008", drugName: "Albuterol Sulfate 90mcg Inhaler",ndc: "68180-0347-06", qtyOnHand: 24,   reorderPoint: 30,  lastUpdated: "2024-01-24" },
  { id: "s009", drugName: "Insulin Glargine 100U/mL Pen",   ndc: "00169-4060-12", qtyOnHand: 18,   reorderPoint: 10,  lastUpdated: "2024-01-20" },
  { id: "s010", drugName: "Amoxicillin 500mg Cap",          ndc: "00093-4155-78", qtyOnHand: 48,   reorderPoint: 200, lastUpdated: "2024-01-22" },
];

function stockStatus(item: StockItem): "ok" | "low" | "negative" {
  if (item.qtyOnHand < 0) return "negative";
  if (item.qtyOnHand <= item.reorderPoint) return "low";
  return "ok";
}

const statusBadge = {
  ok:       { label: "OK",        className: "bg-green-100 text-green-700 border-green-200" },
  low:      { label: "Low Stock", className: "bg-amber-100 text-amber-700 border-amber-200" },
  negative: { label: "Negative",  className: "bg-red-100 text-red-700 border-red-200" },
};

// ── Reconcile modal ────────────────────────────────────────────────────────────
interface ReconcileModalProps {
  item: StockItem;
  onSave: (id: string, qty: number, notes: string) => void;
  onClose: () => void;
}

function ReconcileModal({ item, onSave, onClose }: ReconcileModalProps) {
  const [qty, setQty] = useState(String(item.qtyOnHand));
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Reconcile Stock</h3>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{item.drugName}</p>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Actual Qty on Hand</Label>
            <Input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
              rows={3}
              placeholder="e.g. Cycle count, breakage, missing units..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button
            className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={qty === ""}
            onClick={() => onSave(item.id, Number(qty), notes)}
          >
            Save Reconciliation
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Simulated scan payload ─────────────────────────────────────────────────────
const SCAN_PAYLOAD = {
  ndc: "00093-4155-78",
  drugName: "Amoxicillin 500mg Cap",
  lotNumber: "LOT2024A-4412",
  expirationDate: "2026-03-31",
};

// ── Stock Levels tab ───────────────────────────────────────────────────────────
function StockLevelsTab() {
  const [stock] = useState<StockItem[]>(initialStock);
  const [orderedIds, setOrderedIds] = useState<Set<string>>(new Set());
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(new Set());
  const [reconcileTarget, setReconcileTarget] = useState<StockItem | null>(null);

  const lowCount      = stock.filter(s => stockStatus(s) === "low").length;
  const negativeCount = stock.filter(s => stockStatus(s) === "negative").length;

  const handleReorder = (id: string) => {
    setOrderedIds(prev => new Set([...prev, id]));
  };

  const handleReconcileSave = (id: string) => {
    setReconciledIds(prev => new Set([...prev, id]));
    setReconcileTarget(null);
  };

  return (
    <div className="space-y-4">
      {reconcileTarget && (
        <ReconcileModal
          item={reconcileTarget}
          onSave={handleReconcileSave}
          onClose={() => setReconcileTarget(null)}
        />
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total SKUs",        value: stock.length, icon: Boxes,         color: "text-[#7C3AED]", bg: "bg-purple-50" },
          { label: "Low Stock Alerts",  value: lowCount,     icon: AlertTriangle,  color: "text-amber-600", bg: "bg-amber-50"  },
          { label: "Negative On Hand",  value: negativeCount,icon: XCircle,        color: "text-red-600",   bg: "bg-red-50"    },
        ].map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="border border-gray-200 shadow-sm overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug Name</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">NDC</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty on Hand</TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Reorder Point</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Last Updated</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide text-center w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stock.map(item => {
                const status = stockStatus(item);
                const cfg = statusBadge[status];
                const ordered = orderedIds.has(item.id);
                const reconciled = reconciledIds.has(item.id);
                return (
                  <TableRow
                    key={item.id}
                    className={`border-gray-100 ${
                      status === "negative" ? "bg-red-50/30" :
                      status === "low"      ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.drugName}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs text-gray-600">{item.ndc}</TableCell>
                    <TableCell className={`font-semibold text-sm ${
                      status === "negative" ? "text-red-600" :
                      status === "low"      ? "text-amber-600" : "text-gray-900"
                    }`}>
                      {item.qtyOnHand.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">{item.reorderPoint.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                      {new Date(item.lastUpdated + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      {reconciled
                        ? <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Reconciled</Badge>
                        : <Badge className={`text-xs border ${cfg.className}`}>{cfg.label}</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-center w-40">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={ordered}
                          onClick={() => handleReorder(item.id)}
                        >
                          {ordered ? "Ordered ✓" : "Reorder"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100"
                          onClick={() => setReconcileTarget(item)}
                        >
                          Reconcile
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Receive Stock tab ──────────────────────────────────────────────────────────
function ReceiveStockTab() {
  const [ndc, setNdc]           = useState("");
  const [drugName, setDrugName] = useState("");
  const [lot, setLot]           = useState("");
  const [expiry, setExpiry]     = useState("");
  const [qty, setQty]           = useState("");
  const [uom, setUom]           = useState("Each");
  const [supplier, setSupplier] = useState("");
  const [success, setSuccess]   = useState<string | null>(null);

  const handleScan = () => {
    setNdc(SCAN_PAYLOAD.ndc);
    setDrugName(SCAN_PAYLOAD.drugName);
    setLot(SCAN_PAYLOAD.lotNumber);
    setExpiry(SCAN_PAYLOAD.expirationDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName || !qty) return;
    setSuccess(`Inventory updated — ${drugName} qty increased by ${qty}.`);
    setNdc(""); setDrugName(""); setLot(""); setExpiry(""); setQty(""); setSupplier("");
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <Card className="border border-gray-200 shadow-sm max-w-2xl">
      <CardContent className="p-6 space-y-5">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NDC + Scan */}
          <div className="space-y-1.5">
            <Label>NDC Code</Label>
            <div className="flex gap-2">
              <Input
                value={ndc}
                onChange={e => setNdc(e.target.value)}
                placeholder="e.g. 00093-4155-78"
                className="font-mono flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 shrink-0 border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50"
                onClick={handleScan}
              >
                <Scan className="w-4 h-4" />
                Scan
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Drug Name</Label>
              <Input
                value={drugName}
                onChange={e => setDrugName(e.target.value)}
                placeholder="Auto-populated from NDC lookup"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lot Number</Label>
              <Input
                value={lot}
                onChange={e => setLot(e.target.value)}
                placeholder="e.g. LOT2024A-4412"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity Received</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit of Measure</Label>
              <Select value={uom} onValueChange={setUom}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Each">Each</SelectItem>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Case">Case</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mckesson">McKesson</SelectItem>
                  <SelectItem value="amerisource">AmerisourceBergen</SelectItem>
                  <SelectItem value="cardinal">Cardinal Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!drugName || !qty}
          >
            Receive Stock
          </Button>
        </form>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
          Connect a USB HID barcode scanner to scan directly into the NDC field. GS1-128 barcodes auto-populate NDC, Lot Number, and Expiration Date.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Adjust tab ─────────────────────────────────────────────────────────────────
function AdjustTab() {
  const [search, setSearch]   = useState("");
  const [matched, setMatched] = useState<StockItem | null>(null);
  const [delta, setDelta]     = useState("");
  const [reason, setReason]   = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = (val: string) => {
    setSearch(val);
    const q = val.toLowerCase();
    const found = initialStock.find(
      s => s.drugName.toLowerCase().includes(q) || s.ndc.includes(q)
    );
    setMatched(q.length >= 3 ? (found ?? null) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matched || !delta || !reason) return;
    const sign = Number(delta) >= 0 ? "+" : "";
    setSuccess(`Adjustment recorded — ${matched.drugName} qty adjusted by ${sign}${delta}.`);
    setSearch(""); setMatched(null); setDelta(""); setReason("");
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <Card className="border border-gray-200 shadow-sm max-w-2xl">
      <CardContent className="p-6 space-y-5">
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Drug Search</Label>
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Type drug name or NDC (min 3 chars)…"
            />
            {matched && (
              <div className="mt-1 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900">
                <span className="font-medium">{matched.drugName}</span>
                <span className="text-purple-500 ml-2 font-mono text-xs">{matched.ndc}</span>
                <span className="ml-3 text-gray-600">Current qty: <strong>{matched.qtyOnHand}</strong></span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Quantity Adjustment</Label>
            <Input
              type="number"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              placeholder="e.g. +50 to add, -10 to remove"
            />
            <p className="text-xs text-gray-400">Positive to add inventory, negative to remove.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Reason <span className="text-red-500">*</span></Label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Cycle count correction, breakage, recalled lot"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
            disabled={!matched || !delta || !reason}
          >
            Submit Adjustment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  if (isMVP) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-6">
        <div className="p-4 rounded-2xl bg-gray-100">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Inventory — Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Full inventory management with stock levels, receiving, and reorder alerts is included in the Post-MVP release.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stock levels, receiving, and adjustments</p>
      </div>

      <Tabs defaultValue="stock">
        <div className="overflow-x-auto">
          <TabsList className="bg-gray-100 w-max">
            <TabsTrigger value="stock"   className="whitespace-nowrap">Stock Levels</TabsTrigger>
            <TabsTrigger value="receive" className="whitespace-nowrap">Receive Stock</TabsTrigger>
            <TabsTrigger value="adjust"  className="whitespace-nowrap">Adjust</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stock"   className="mt-4"><StockLevelsTab /></TabsContent>
        <TabsContent value="receive" className="mt-4"><ReceiveStockTab /></TabsContent>
        <TabsContent value="adjust"  className="mt-4"><AdjustTab /></TabsContent>
      </Tabs>
    </div>
  );
}
