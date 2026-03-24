"use client";

import { useState } from "react";
import { Phone, BarChart2, Settings2, CheckCircle2, XCircle, PhoneCall, PhoneMissed, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ── Call Log ──────────────────────────────────────────────────────────────────
interface CallEntry {
  id: string;
  timestamp: string;
  callerPhone: string;
  callerName?: string;
  duration: string;
  outcome: "deflected" | "transferred" | "voicemail" | "abandoned";
  intent: "refill_request" | "rx_status" | "hours" | "billing" | "transfer" | "other";
  rxNumber?: string;
}

const callLog: CallEntry[] = [
  { id: "cl001", timestamp: "2024-01-24 10:42 AM", callerPhone: "(555) 234-5678", callerName: "M. Thompson", duration: "1:23", outcome: "deflected", intent: "refill_request", rxNumber: "RX-2024-001847" },
  { id: "cl002", timestamp: "2024-01-24 10:31 AM", callerPhone: "(555) 345-6789", callerName: "J. Rivera", duration: "0:48", outcome: "deflected", intent: "rx_status" },
  { id: "cl003", timestamp: "2024-01-24 10:15 AM", callerPhone: "(555) 901-2345", duration: "2:01", outcome: "transferred", intent: "billing" },
  { id: "cl004", timestamp: "2024-01-24 09:58 AM", callerPhone: "(555) 456-7890", callerName: "D. Chen", duration: "0:32", outcome: "deflected", intent: "hours" },
  { id: "cl005", timestamp: "2024-01-24 09:43 AM", callerPhone: "(555) 678-9012", duration: "0:00", outcome: "abandoned", intent: "other" },
  { id: "cl006", timestamp: "2024-01-24 09:22 AM", callerPhone: "(555) 789-0123", callerName: "W. Foster", duration: "1:55", outcome: "deflected", intent: "refill_request", rxNumber: "RX-2024-001860" },
  { id: "cl007", timestamp: "2024-01-24 09:07 AM", callerPhone: "(555) 012-3456", duration: "3:12", outcome: "transferred", intent: "transfer" },
  { id: "cl008", timestamp: "2024-01-24 08:51 AM", callerPhone: "(555) 567-8901", duration: "0:47", outcome: "voicemail", intent: "other" },
  { id: "cl009", timestamp: "2024-01-23 04:38 PM", callerPhone: "(555) 890-1234", callerName: "L. Martinez", duration: "1:10", outcome: "deflected", intent: "rx_status" },
  { id: "cl010", timestamp: "2024-01-23 04:19 PM", callerPhone: "(555) 123-4567", duration: "0:22", outcome: "abandoned", intent: "other" },
];

const outcomeConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  deflected: { label: "Self-Served", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  transferred: { label: "Transferred", className: "bg-blue-100 text-blue-700 border-blue-200", icon: PhoneCall },
  voicemail: { label: "Voicemail", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  abandoned: { label: "Abandoned", className: "bg-red-100 text-red-700 border-red-200", icon: PhoneMissed },
};

const intentLabel: Record<string, string> = {
  refill_request: "Refill Request",
  rx_status: "Rx Status Check",
  hours: "Store Hours",
  billing: "Billing / Insurance",
  transfer: "Transfer to Staff",
  other: "Other",
};

function CallLogTab() {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Date/Time</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Caller</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Intent</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Duration</TableHead>
              <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Outcome</TableHead>
              <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Rx #</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callLog.map(call => {
              const oc = outcomeConfig[call.outcome];
              const Icon = oc.icon;
              return (
                <TableRow key={call.id} className="border-gray-100">
                  <TableCell className="pl-5 text-xs text-gray-600 whitespace-nowrap">{call.timestamp}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">{call.callerName || "Unknown"}</p>
                    <p className="text-xs text-gray-400 font-mono">{call.callerPhone}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-700">
                    {intentLabel[call.intent]}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-600">{call.duration}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs border gap-1 ${oc.className}`}>
                      <Icon className="w-3 h-3" />{oc.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-xs text-gray-500">
                    {call.rxNumber || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Deflection Dashboard ──────────────────────────────────────────────────────
function DeflectionTab() {
  const total = callLog.length;
  const deflected = callLog.filter(c => c.outcome === "deflected").length;
  const transferred = callLog.filter(c => c.outcome === "transferred").length;
  const deflectionRate = Math.round((deflected / total) * 100);

  const intentCounts = callLog.reduce((acc, c) => {
    acc[c.intent] = (acc[c.intent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: total.toString(), sub: "Last 48 hours", color: "text-gray-700", bg: "bg-gray-50" },
          { label: "Self-Served (IVR)", value: `${deflectionRate}%`, sub: `${deflected} of ${total} calls`, color: "text-green-600", bg: "bg-green-50" },
          { label: "Transferred to Staff", value: transferred.toString(), sub: "Needed human assist", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg Handle Time", value: "1:22", sub: "For transferred calls", color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <Card key={s.label} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                <BarChart2 className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-900">Call Intents</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {Object.entries(intentCounts).sort((a, b) => b[1] - a[1]).map(([intent, count]) => (
              <div key={intent}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{intentLabel[intent]}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#7C3AED] h-1.5 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-900">Outcome Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {Object.entries(outcomeConfig).map(([key, cfg]) => {
              const count = callLog.filter(c => c.outcome === key).length;
              const Icon = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <Badge className={`text-xs border gap-1 ${cfg.className}`}>
                    <Icon className="w-3 h-3" />{cfg.label}
                  </Badge>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${
                      key === "deflected" ? "bg-green-500" :
                      key === "transferred" ? "bg-blue-500" :
                      key === "voicemail" ? "bg-amber-500" : "bg-red-400"
                    }`} style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── IVR Configuration ─────────────────────────────────────────────────────────
function ConfigurationTab() {
  const [saved, setSaved] = useState(false);
  const [greetingName, setGreetingName] = useState("Riverside Pharmacy");
  const [hoursMsg, setHoursMsg] = useState("We are open Monday through Friday 9 AM to 6 PM, and Saturday 10 AM to 4 PM.");
  const [refillEnabled, setRefillEnabled] = useState(true);
  const [statusEnabled, setStatusEnabled] = useState(true);

  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-gray-900">IVR Greeting</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Pharmacy Name (in greeting)</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
              value={greetingName}
              onChange={e => setGreetingName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Hours Message</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED] resize-none"
              rows={3}
              value={hoursMsg}
              onChange={e => setHoursMsg(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-gray-900">Self-Service Options</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          {[
            { label: "Refill Request (Press 1)", desc: "Patients can request refills by entering Rx number", enabled: refillEnabled, toggle: () => setRefillEnabled(v => !v) },
            { label: "Rx Status Check (Press 2)", desc: "Patients can check if prescription is ready", enabled: statusEnabled, toggle: () => setStatusEnabled(v => !v) },
          ].map(opt => (
            <div key={opt.label} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200">
              <button
                onClick={opt.toggle}
                className={`w-10 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${opt.enabled ? "bg-[#7C3AED]" : "bg-gray-200"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${opt.enabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
        onClick={() => setSaved(true)}
      >
        Save Configuration
      </Button>
      {saved && <p className="text-sm text-green-600">Configuration saved successfully.</p>}
    </div>
  );
}

export default function IVRPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Phone className="w-6 h-6 text-[#7C3AED]" />IVR / Phone
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Call logs, deflection analytics, and IVR configuration</p>
      </div>

      <Tabs defaultValue="log">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="log" className="gap-2"><Phone className="w-3.5 h-3.5" />Call Log</TabsTrigger>
          <TabsTrigger value="deflection" className="gap-2"><BarChart2 className="w-3.5 h-3.5" />Deflection</TabsTrigger>
          <TabsTrigger value="config" className="gap-2"><Settings2 className="w-3.5 h-3.5" />Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4"><CallLogTab /></TabsContent>
        <TabsContent value="deflection" className="mt-4"><DeflectionTab /></TabsContent>
        <TabsContent value="config" className="mt-4"><ConfigurationTab /></TabsContent>
      </Tabs>
    </div>
  );
}
