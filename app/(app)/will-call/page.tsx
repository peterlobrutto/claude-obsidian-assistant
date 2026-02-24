"use client";

import { useState } from "react";
import { Package, Filter, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { mockWillCallItems } from "@/lib/mock-data";
import type { WillCallItem } from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-green-100 text-green-700 border-green-200" },
  expiring_soon: { label: "Expiring Soon", className: "bg-orange-100 text-orange-700 border-orange-200" },
  return_to_stock: { label: "Return to Stock", className: "bg-red-100 text-red-700 border-red-200" },
};

const summaryStats = [
  { label: "Ready for Pickup", count: 6, color: "text-green-600", bg: "bg-green-50" },
  { label: "Expiring Soon", count: 2, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Return to Stock", count: 2, color: "text-red-600", bg: "bg-red-50" },
  { label: "Total in Will-Call", count: 10, color: "text-gray-700", bg: "bg-gray-50" },
];

export default function WillCallPage() {
  const [items, setItems] = useState<WillCallItem[]>(mockWillCallItems);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const filtered = items.filter(item =>
    statusFilter === "all" ? true : item.status === statusFilter
  );

  const verifyPickup = (id: string) => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Will-Call Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prescriptions ready for patient pickup</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="return_to_stock">Return to Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Table */}
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
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Days</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Copay</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                    No items in will-call queue
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow
                    key={item.id}
                    className={`border-gray-100 transition-colors ${
                      item.status === "return_to_stock" ? "bg-red-50/30" :
                      item.status === "expiring_soon" ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <TableCell className="pl-5 font-medium text-gray-900">{item.patientName}</TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm text-gray-700">{item.rxNumber}</TableCell>
                    <TableCell className="text-sm text-gray-700">{item.drug}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-gray-600">
                      {new Date(item.dateFilled + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`text-sm font-medium ${
                        item.daysInQueue >= 14 ? "text-red-600" :
                        item.daysInQueue >= 8 ? "text-orange-600" :
                        "text-gray-600"
                      }`}>
                        {item.daysInQueue === 0 ? "Today" : `${item.daysInQueue}d`}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm font-medium text-gray-900">${item.copay.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${statusConfig[item.status].className}`}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1.5">
                        {item.status !== "return_to_stock" && (
                          <Button
                            size="sm"
                            className={`gap-1.5 text-xs h-7 ${
                              confirmedIds.has(item.id)
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-[#7C3AED] hover:bg-[#6d28d9]"
                            } text-white`}
                            onClick={() => verifyPickup(item.id)}
                            disabled={confirmedIds.has(item.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{confirmedIds.has(item.id) ? "Confirmed!" : "Verify Pickup"}</span>
                            <span className="sm:hidden">{confirmedIds.has(item.id) ? "✓" : "Pickup"}</span>
                          </Button>
                        )}
                        {(item.status === "return_to_stock" || item.status === "expiring_soon") && (
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
