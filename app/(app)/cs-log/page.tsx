"use client";

import { useState } from "react";
import { ShieldAlert, Download, Filter, BarChart2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CSLogEntry {
  id: string;
  timestamp: string;
  rxNumber: string;
  patientName: string;
  drug: string;
  schedule: "CII" | "CIII" | "CIV" | "CV";
  qty: number;
  prescriber: string;
  deaNumber: string;
  dispensedBy: string;
  pdmpQueried: boolean;
  witnessInitials?: string;
}

const csLogData: CSLogEntry[] = [
  { id: "csl001", timestamp: "2024-01-24 09:14 AM", rxNumber: "RX-2024-001862", patientName: "James Rivera", drug: "Hydrocodone/APAP 5/325mg", schedule: "CII", qty: 30, prescriber: "Dr. Robert Harris", deaNumber: "BH5544332", dispensedBy: "A. Chen, Pharm.D.", pdmpQueried: true, witnessInitials: "M.J." },
  { id: "csl002", timestamp: "2024-01-24 08:52 AM", rxNumber: "RX-2024-001855", patientName: "Barbara Kim", drug: "Oxycodone HCl 5mg", schedule: "CII", qty: 20, prescriber: "Dr. Sarah Mitchell", deaNumber: "BM1234563", dispensedBy: "A. Chen, Pharm.D.", pdmpQueried: true },
  { id: "csl003", timestamp: "2024-01-24 08:31 AM", rxNumber: "RX-2024-001851", patientName: "Thomas Jackson", drug: "Adderall XR 20mg", schedule: "CII", qty: 30, prescriber: "Dr. David Park", deaNumber: "BP9876541", dispensedBy: "S. Williams", pdmpQueried: true },
  { id: "csl004", timestamp: "2024-01-23 04:22 PM", rxNumber: "RX-2024-001843", patientName: "Linda Martinez", drug: "Alprazolam 0.5mg", schedule: "CIV", qty: 30, prescriber: "Dr. Jennifer Adams", deaNumber: "BA1122334", dispensedBy: "M. Johnson", pdmpQueried: false },
  { id: "csl005", timestamp: "2024-01-23 03:10 PM", rxNumber: "RX-2024-001839", patientName: "Susan Patel", drug: "Codeine/APAP 30/300mg", schedule: "CIII", qty: 20, prescriber: "Dr. Robert Harris", deaNumber: "BH5544332", dispensedBy: "A. Chen, Pharm.D.", pdmpQueried: true, witnessInitials: "S.W." },
  { id: "csl006", timestamp: "2024-01-23 01:45 PM", rxNumber: "RX-2024-001836", patientName: "Charles Nguyen", drug: "Lorazepam 1mg", schedule: "CIV", qty: 30, prescriber: "Dr. Sarah Mitchell", deaNumber: "BM1234563", dispensedBy: "M. Johnson", pdmpQueried: false },
  { id: "csl007", timestamp: "2024-01-22 11:30 AM", rxNumber: "RX-2024-001828", patientName: "Dorothy Chen", drug: "Hydrocodone/APAP 5/325mg", schedule: "CII", qty: 30, prescriber: "Dr. Robert Harris", deaNumber: "BH5544332", dispensedBy: "A. Chen, Pharm.D.", pdmpQueried: true },
  { id: "csl008", timestamp: "2024-01-22 10:15 AM", rxNumber: "RX-2024-001825", patientName: "Robert Washington", drug: "Diazepam 5mg", schedule: "CIV", qty: 30, prescriber: "Dr. Jennifer Adams", deaNumber: "BA1122334", dispensedBy: "S. Williams", pdmpQueried: false },
];

const schedBadge: Record<string, string> = {
  CII: "bg-red-100 text-red-700 border-red-300",
  CIII: "bg-orange-100 text-orange-700 border-orange-300",
  CIV: "bg-amber-100 text-amber-700 border-amber-300",
  CV: "bg-yellow-100 text-yellow-700 border-yellow-300",
};

export default function CSLogPage() {
  const [filterSchedule, setFilterSchedule] = useState<string>("all");
  const [filterPdmp, setFilterPdmp] = useState<string>("all");

  const filtered = csLogData.filter(e => {
    if (filterSchedule !== "all" && e.schedule !== filterSchedule) return false;
    if (filterPdmp === "queried" && !e.pdmpQueried) return false;
    if (filterPdmp === "not_queried" && e.pdmpQueried) return false;
    return true;
  });

  const handleExport = (format: "csv" | "pdf") => {
    alert(`[Demo] ${format.toUpperCase()} export triggered — would download CS dispensing log`);
  };

  const totalCII = csLogData.filter(e => e.schedule === "CII").length;
  const totalCIII = csLogData.filter(e => e.schedule === "CIII").length;
  const totalCIV = csLogData.filter(e => e.schedule === "CIV").length;
  const pdmpCompliance = Math.round((csLogData.filter(e => e.pdmpQueried).length / csLogData.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            CS Dispensing Log
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Append-only audit trail for controlled substance dispensing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-sm" onClick={() => handleExport("csv")}>
            <Download className="w-4 h-4" />CSV
          </Button>
          <Button variant="outline" className="gap-2 text-sm" onClick={() => handleExport("pdf")}>
            <Download className="w-4 h-4" />PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="log">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="log" className="gap-2"><ClipboardList className="w-3.5 h-3.5" />Dispensing Log</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2"><BarChart2 className="w-3.5 h-3.5" />PDMP Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4 space-y-4">
          {/* Filters (Fix 18) */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterSchedule} onValueChange={setFilterSchedule}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="Schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                <SelectItem value="CII">CII Only</SelectItem>
                <SelectItem value="CIII">CIII Only</SelectItem>
                <SelectItem value="CIV">CIV Only</SelectItem>
                <SelectItem value="CV">CV Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPdmp} onValueChange={setFilterPdmp}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="PDMP Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PDMP</SelectItem>
                <SelectItem value="queried">Queried</SelectItem>
                <SelectItem value="not_queried">Not Queried</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-400">{filtered.length} records</span>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Date/Time</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Rx #</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Sched</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Prescriber</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">DEA#</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Dispensed By</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">PDMP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(entry => (
                    <TableRow key={entry.id} className="border-gray-100">
                      <TableCell className="pl-5 text-xs text-gray-600 whitespace-nowrap">{entry.timestamp}</TableCell>
                      <TableCell className="hidden sm:table-cell font-mono text-xs text-gray-700">{entry.rxNumber}</TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">{entry.patientName}</TableCell>
                      <TableCell className="text-sm text-gray-700">{entry.drug}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${schedBadge[entry.schedule]}`}>{entry.schedule}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-700">{entry.qty}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600">{entry.prescriber}</TableCell>
                      <TableCell className="hidden lg:table-cell font-mono text-xs text-gray-600">{entry.deaNumber}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-gray-600">{entry.dispensedBy}</TableCell>
                      <TableCell>
                        {entry.pdmpQueried ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Queried</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Not Queried</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fix 20: PDMP Compliance Dashboard */}
        <TabsContent value="compliance" className="mt-4 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "PDMP Compliance", value: `${pdmpCompliance}%`, sub: `${csLogData.filter(e => e.pdmpQueried).length} of ${csLogData.length} queried`, color: pdmpCompliance >= 80 ? "text-green-600" : "text-red-600", bg: pdmpCompliance >= 80 ? "bg-green-50" : "bg-red-50" },
              { label: "CII Dispenses", value: totalCII.toString(), sub: "Last 30 days", color: "text-red-600", bg: "bg-red-50" },
              { label: "CIII Dispenses", value: totalCIII.toString(), sub: "Last 30 days", color: "text-orange-600", bg: "bg-orange-50" },
              { label: "CIV Dispenses", value: totalCIV.toString(), sub: "Last 30 days", color: "text-amber-600", bg: "bg-amber-50" },
            ].map(s => (
              <Card key={s.label} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                    <ShieldAlert className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-600">{s.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-gray-900">PDMP Query Compliance by Prescriber</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="space-y-3">
                {[
                  { prescriber: "Dr. Robert Harris", total: 3, queried: 3 },
                  { prescriber: "Dr. Sarah Mitchell", total: 2, queried: 1 },
                  { prescriber: "Dr. Jennifer Adams", total: 2, queried: 0 },
                  { prescriber: "Dr. David Park", total: 1, queried: 1 },
                ].map(p => {
                  const rate = Math.round((p.queried / p.total) * 100);
                  return (
                    <div key={p.prescriber}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{p.prescriber}</span>
                        <span className={`font-semibold ${rate >= 80 ? "text-green-600" : "text-red-600"}`}>{rate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${rate >= 80 ? "bg-green-500" : "bg-red-400"}`} style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Flagged entries */}
          {csLogData.filter(e => !e.pdmpQueried && e.schedule === "CII").length > 0 && (
            <Card className="border border-red-200 bg-red-50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">
                  ⚠ CII Dispenses Without PDMP Query
                </p>
                {csLogData.filter(e => !e.pdmpQueried && e.schedule === "CII").map(e => (
                  <p key={e.id} className="text-xs text-red-700">{e.timestamp} — {e.patientName} — {e.drug}</p>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
