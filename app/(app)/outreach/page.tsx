"use client";

import { useState } from "react";
import {
  MessageSquare, Users, TrendingUp, Phone, ChevronUp, ChevronDown,
  Send, Check, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ── Refills Due (Fix 23) ───────────────────────────────────────────────────────
interface RefillDueItem {
  id: string;
  patientName: string;
  drug: string;
  strength: string;
  daysUntilDue: number;
  lastFilled: string;
  prescriber: string;
  channel: string;
  tcpaConsent: boolean;
  contacted: boolean;
}

const initialRefillsDue: RefillDueItem[] = [
  { id: "rd001", patientName: "Carla Mendes", drug: "Metformin", strength: "500mg", daysUntilDue: 6, lastFilled: "2024-01-18", prescriber: "Dr. Jennifer Adams", channel: "SMS", tcpaConsent: true, contacted: false },
  { id: "rd002", patientName: "James Okafor", drug: "Amlodipine", strength: "5mg", daysUntilDue: 3, lastFilled: "2024-01-21", prescriber: "Dr. Sarah Mitchell", channel: "SMS", tcpaConsent: true, contacted: false },
  { id: "rd003", patientName: "Barbara Kim", drug: "Lisinopril", strength: "10mg", daysUntilDue: 7, lastFilled: "2024-01-17", prescriber: "Dr. Sarah Mitchell", channel: "Phone", tcpaConsent: false, contacted: false },
  { id: "rd004", patientName: "James Rivera", drug: "Sertraline", strength: "50mg", daysUntilDue: 12, lastFilled: "2024-01-12", prescriber: "Dr. David Park", channel: "SMS", tcpaConsent: true, contacted: false },
  { id: "rd005", patientName: "Susan Patel", drug: "Omeprazole", strength: "20mg", daysUntilDue: 20, lastFilled: "2024-01-04", prescriber: "Dr. Sarah Mitchell", channel: "SMS", tcpaConsent: true, contacted: false },
  { id: "rd006", patientName: "Margaret Thompson", drug: "Metformin", strength: "500mg", daysUntilDue: 4, lastFilled: "2024-01-20", prescriber: "Dr. Jennifer Adams", channel: "SMS", tcpaConsent: true, contacted: false },
  { id: "rd007", patientName: "Robert Washington", drug: "Lisinopril", strength: "10mg", daysUntilDue: 9, lastFilled: "2024-01-15", prescriber: "Dr. Sarah Mitchell", channel: "Email", tcpaConsent: true, contacted: false },
  { id: "rd008", patientName: "Dorothy Chen", drug: "Levothyroxine", strength: "50mcg", daysUntilDue: 15, lastFilled: "2024-01-09", prescriber: "Dr. Jennifer Adams", channel: "Phone", tcpaConsent: false, contacted: false },
];

type SortField = "daysUntilDue" | "patientName" | "drug";
type SortDir = "asc" | "desc";

function RefillsDueTab() {
  const [items, setItems] = useState<RefillDueItem[]>(initialRefillsDue);
  const [sortField, setSortField] = useState<SortField>("daysUntilDue");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = [...items].sort((a, b) => {
    const v = sortDir === "asc" ? 1 : -1;
    if (sortField === "daysUntilDue") return (a.daysUntilDue - b.daysUntilDue) * v;
    if (sortField === "patientName") return a.patientName.localeCompare(b.patientName) * v;
    return a.drug.localeCompare(b.drug) * v;
  });

  const contact = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, contacted: true } : i));
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col opacity-50">
      {sortField === field ? (
        sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      ) : <ChevronUp className="w-3 h-3 opacity-30" />}
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{items.filter(i => !i.contacted).length} patients due for refill</span>
        <span>&bull;</span>
        <span>{items.filter(i => i.daysUntilDue <= 7).length} within 7 days</span>
        <span>&bull;</span>
        <span>{items.filter(i => i.tcpaConsent && !i.contacted).length} eligible for auto-outreach</span>
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead
                  className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("patientName")}
                >
                  Patient <SortIcon field="patientName" />
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-700 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("drug")}
                >
                  Drug <SortIcon field="drug" />
                </TableHead>
                <TableHead
                  className="font-semibold text-gray-700 text-xs uppercase tracking-wide cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("daysUntilDue")}
                >
                  Days Due <SortIcon field="daysUntilDue" />
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Last Filled</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">TCPA</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Channel</TableHead>
                <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(item => (
                <TableRow key={item.id} className={`border-gray-100 ${item.contacted ? "opacity-50" : ""}`}>
                  <TableCell className="pl-5 font-medium text-gray-900 text-sm">{item.patientName}</TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-900">{item.drug}</p>
                    <p className="text-xs text-gray-400">{item.strength}</p>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${item.daysUntilDue <= 5 ? "text-red-600" : item.daysUntilDue <= 10 ? "text-amber-600" : "text-gray-700"}`}>
                      {item.daysUntilDue}d
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">{item.lastFilled}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {item.tcpaConsent
                      ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Yes</Badge>
                      : <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">No</Badge>
                    }
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={`text-xs border ${
                      item.channel === "SMS" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      item.channel === "Phone" ? "bg-purple-100 text-purple-700 border-purple-200" :
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}>{item.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.contacted ? (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Sent</span>
                    ) : item.tcpaConsent ? (
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" onClick={() => contact(item.id)}>
                        <Send className="w-3 h-3" />Send Reminder
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">No consent</span>
                    )}
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

// ── Non-Responsive Patients ────────────────────────────────────────────────────
interface NonResponsivePatient {
  id: string;
  patientName: string;
  drug: string;
  strength: string;
  lastContacted: string;
  attempts: number;
  reactivated?: boolean;
}

const initialNonResponsive: NonResponsivePatient[] = [
  { id: "nr001", patientName: "Frank Delgado", drug: "Metoprolol", strength: "25mg", lastContacted: "2024-01-17", attempts: 3 },
  { id: "nr002", patientName: "Linda Wu", drug: "Atorvastatin", strength: "40mg", lastContacted: "2024-01-15", attempts: 2 },
  { id: "nr003", patientName: "George Martinez", drug: "Omeprazole", strength: "20mg", lastContacted: "2024-01-12", attempts: 4 },
  { id: "nr004", patientName: "Nancy Collins", drug: "Amlodipine", strength: "5mg", lastContacted: "2024-01-10", attempts: 3 },
  { id: "nr005", patientName: "Kevin Park", drug: "Sertraline", strength: "100mg", lastContacted: "2024-01-08", attempts: 2 },
];

// ── Outreach Dashboard ─────────────────────────────────────────────────────────
function OutreachContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "refills" ? "refills" : "dashboard";
  const [nonResponsive, setNonResponsive] = useState<NonResponsivePatient[]>(initialNonResponsive);
  const [nrExpanded, setNrExpanded] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Outreach</h1>
        <p className="text-sm text-gray-500 mt-0.5">Patient engagement, refill reminders, and outreach analytics</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="dashboard" className="gap-2"><TrendingUp className="w-3.5 h-3.5" />Dashboard</TabsTrigger>
          <TabsTrigger value="refills" className="gap-2"><MessageSquare className="w-3.5 h-3.5" />Refills Due</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "SMS Sent This Week", value: "147", change: "+18% vs last week", color: "text-blue-600", bg: "bg-blue-50", icon: MessageSquare },
              { label: "Response Rate", value: "42%", change: "62 patient responses", color: "text-green-600", bg: "bg-green-50", icon: TrendingUp },
              { label: "Refills Triggered", value: "38", change: "from auto-outreach", color: "text-purple-600", bg: "bg-purple-50", icon: Users },
              { label: "Calls Made", value: "24", change: "IVR + staff calls", color: "text-amber-600", bg: "bg-amber-50", icon: Phone },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-600">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.change}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-gray-900">Outreach Channel Mix</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {[
                  { channel: "SMS / Text", count: 147, pct: 72, color: "bg-blue-500" },
                  { channel: "IVR / Automated Call", count: 31, pct: 15, color: "bg-purple-500" },
                  { channel: "Email", count: 22, pct: 11, color: "bg-green-500" },
                  { channel: "Staff Outbound Call", count: 4, pct: 2, color: "bg-amber-500" },
                ].map(c => (
                  <div key={c.channel}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">{c.channel}</span>
                      <span className="text-gray-500">{c.count} ({c.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${c.color} h-2 rounded-full`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-semibold text-gray-900">Upcoming Refill Reminders</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="space-y-2">
                  {initialRefillsDue.filter(i => i.daysUntilDue <= 7).map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.patientName}</p>
                        <p className="text-xs text-gray-500">{item.drug} {item.strength}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${item.daysUntilDue <= 3 ? "text-red-600" : "text-amber-600"}`}>
                          {item.daysUntilDue}d
                        </span>
                        {!item.tcpaConsent && (
                          <p className="text-xs text-gray-400">No consent</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="refills" className="mt-4 space-y-5">
          {/* Campaign Stats */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-gray-900">Campaign Stats — Last Send</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Messages Sent", value: "28", color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
                  { label: "Confirmed", value: "54%", color: "text-green-700", bg: "bg-green-50 border-green-100" },
                  { label: "Declined", value: "11%", color: "text-red-700", bg: "bg-red-50 border-red-100" },
                  { label: "No Response", value: "35%", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
                ].map(s => (
                  <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className={`text-xs mt-0.5 ${s.color}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Refill Queue */}
          <RefillsDueTab />

          {/* Non-Responsive Patients */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setNrExpanded(v => !v)}
            >
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Non-Responsive Patients
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({nonResponsive.filter(p => !p.reactivated).length} patients)
                </span>
              </span>
              {nrExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {nrExpanded && (
              <div className="bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Patient</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Drug</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Last Contacted</th>
                      <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Attempts</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonResponsive.map(p => (
                      <tr key={p.id} className={`border-b border-gray-50 last:border-0 ${p.reactivated ? "opacity-50" : ""}`}>
                        <td className="px-5 py-3 font-medium text-gray-900">{p.patientName}</td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                          <span>{p.drug}</span>
                          <span className="text-gray-400 text-xs ml-1">{p.strength}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.lastContacted}</td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{p.attempts}x</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {p.reactivated ? (
                            <span className="text-xs text-green-600 flex items-center justify-end gap-1">
                              <Check className="w-3 h-3" />Re-activated
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs gap-1"
                              onClick={() => setNonResponsive(prev => prev.map(x => x.id === p.id ? { ...x, reactivated: true } : x))}
                            >
                              <RefreshCw className="w-3 h-3" />Re-activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense>
      <OutreachContent />
    </Suspense>
  );
}
