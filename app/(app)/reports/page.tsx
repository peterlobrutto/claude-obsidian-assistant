"use client";

import { useState } from "react";
import {
  BarChart3,
  DollarSign,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { isPostMVP } from "@/lib/deployment";

const reportCards = [
  // ── MVP tiles (Epics 8, 9, 11, 12) ───────────────────────────────────────────
  {
    id: "controlled",
    title: "Controlled Substance Log",
    description: "DEA-required dispensing log for Schedule II–V drugs",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "DEA Required",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    postMVPOnly: false,
  },
  {
    id: "rejection_rate",
    title: "Claims Rejection Rate",
    description: "Rejection trends by payer and rejection code",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    badge: "6 rejections this week",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    postMVPOnly: false,
  },
  {
    id: "pdmp",
    title: "PDMP Compliance Dashboard",
    description: "Submission success rates, failure reasons, and daily volume trends",
    icon: ShieldCheck,
    color: "text-teal-600",
    bg: "bg-teal-50",
    badge: "US-9.4",
    badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
    postMVPOnly: false,
  },
  {
    id: "ai_accuracy",
    title: "AI Extraction Accuracy",
    description: "Per-field OCR confidence scores and pharmacist correction rates",
    icon: Bot,
    color: "text-violet-600",
    bg: "bg-violet-50",
    badge: "US-11.4",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    postMVPOnly: false,
  },
  // ── Post-MVP tiles (Epic 19) ──────────────────────────────────────────────────
  {
    id: "rx_volume",
    title: "Prescription Volume",
    description: "Daily, weekly, and monthly fill counts by drug type",
    icon: BarChart3,
    color: "text-[#7C3AED]",
    bg: "bg-purple-50",
    badge: "Updated daily",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    postMVPOnly: true,
  },
  {
    id: "revenue",
    title: "Revenue by Payer",
    description: "Collections breakdown by insurance and cash pay",
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
    badge: "Real-time",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    postMVPOnly: true,
  },
  {
    id: "reconciliation",
    title: "End-of-Day Reconciliation",
    description: "Cash drawer, copay collections, and claim totals",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "Run daily",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    postMVPOnly: true,
  },
  {
    id: "inventory",
    title: "Inventory Summary",
    description: "Stock levels, expiration alerts, and reorder points",
    icon: Package,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    badge: "3 low stock alerts",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    postMVPOnly: true,
  },
];

const rxVolumeData = [
  { day: "Mon", count: 38 },
  { day: "Tue", count: 52 },
  { day: "Wed", count: 45 },
  { day: "Thu", count: 47 },
  { day: "Fri", count: 61 },
  { day: "Sat", count: 29 },
  { day: "Sun", count: 12 },
];

const revenueData = [
  { payer: "Blue Cross Blue Shield", billed: 4820, paid: 4338, count: 18 },
  { payer: "Aetna", billed: 3100, paid: 2790, count: 12 },
  { payer: "Medicare Part D", billed: 5250, paid: 4725, count: 21 },
  { payer: "Humana Medicare", billed: 2800, paid: 2520, count: 11 },
  { payer: "Cigna", billed: 1900, paid: 1710, count: 8 },
  { payer: "Medicaid", billed: 980, paid: 882, count: 6 },
  { payer: "Cash Pay", billed: 540, paid: 540, count: 9 },
];

const rejectionData = [
  { code: "75", reason: "Prior Auth Required", payer: "Aetna", count: 3 },
  { code: "88", reason: "Non-Formulary", payer: "UnitedHealth", count: 2 },
  { code: "04", reason: "Days Supply Exceeded", payer: "Cigna", count: 1 },
  { code: "14", reason: "Refill Too Soon", payer: "Aetna", count: 1 },
];

const controlledData = [
  { date: "2024-01-24", patient: "Thomas Jackson", drug: "Adderall XR 20 mg", qty: "30", schedule: "II", prescriber: "Dr. David Park", dea: "BP9876541" },
  { date: "2024-01-24", patient: "William Foster", drug: "Hydrocodone/APAP 5/325", qty: "30", schedule: "III", prescriber: "Dr. Sarah Mitchell", dea: "BM1234563" },
  { date: "2024-01-23", patient: "Barbara Kim", drug: "Tramadol 50 mg", qty: "60", schedule: "IV", prescriber: "Dr. Robert Harris", dea: "BH5544332" },
  { date: "2024-01-22", patient: "Patricia O'Brien", drug: "Alprazolam 0.5 mg", qty: "30", schedule: "IV", prescriber: "Dr. David Park", dea: "BP9876541" },
];

const eodData = {
  date: "2024-01-24",
  rxFilled: 47,
  claimsSubmitted: 34,
  claimsPaid: 28,
  claimsRejected: 6,
  totalBilled: 18390,
  totalPaid: 16551,
  copayCash: 285.50,
  copayCard: 1820.75,
  copayFSA: 178.50,
};

const inventoryData = [
  { drug: "Metformin 500 mg", ndc: "00093-1174-01", onHand: 450, reorder: 200, status: "OK" },
  { drug: "Lisinopril 10 mg", ndc: "00071-0156-23", onHand: 85, reorder: 150, status: "Low" },
  { drug: "Atorvastatin 40 mg", ndc: "00185-0060-01", onHand: 220, reorder: 100, status: "OK" },
  { drug: "Levothyroxine 50 mcg", ndc: "00555-0766-02", onHand: 30, reorder: 100, status: "Critical" },
  { drug: "Sertraline 50 mg", ndc: "00228-2765-96", onHand: 310, reorder: 150, status: "OK" },
  { drug: "Albuterol Inhaler", ndc: "68180-0347-06", onHand: 12, reorder: 25, status: "Low" },
  { drug: "Insulin Glargine", ndc: "00169-4060-12", onHand: 45, reorder: 30, status: "OK" },
];

function ReportModal({ report, open, onClose }: { report: typeof reportCards[0] | null; open: boolean; onClose: () => void }) {
  if (!report) return null;

  const maxCount = Math.max(...rxVolumeData.map(d => d.count));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold text-gray-900">{report.title}</DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                CSV
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                PDF
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{report.description}</p>
        </DialogHeader>

        <div className="mt-4">
          {report.id === "rx_volume" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Week total: <strong className="text-gray-900">284 Rxs</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600">Avg/day: <strong className="text-gray-900">40.6</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600">vs last week: <strong className="text-green-600">+8.4%</strong></span>
                </div>
              </div>
              <div className="flex items-end gap-3 h-48 bg-gray-50 rounded-xl p-4 border border-gray-100">
                {rxVolumeData.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-gray-700">{d.count}</span>
                    <div className="w-full flex items-end justify-center">
                      <div
                        className="w-full rounded-t-md bg-[#7C3AED] transition-all"
                        style={{ height: `${(d.count / maxCount) * 140}px` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.id === "revenue" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total Billed", value: "$19,390", trend: "+5.2%" },
                  { label: "Total Collected", value: "$17,505", trend: "+4.8%" },
                  { label: "Collection Rate", value: "90.3%", trend: "-0.4%" },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">{m.label}</p>
                    <p className="text-xl font-bold text-gray-900">{m.value}</p>
                    <p className={`text-xs ${m.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{m.trend} vs last month</p>
                  </div>
                ))}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border border-gray-200 rounded-lg">
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Payer</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Rxs</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Billed</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Paid</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map(r => (
                    <tr key={r.payer} className="border-b border-gray-100 last:border-0">
                      <td className="p-3 text-gray-800">{r.payer}</td>
                      <td className="p-3 text-right text-gray-600">{r.count}</td>
                      <td className="p-3 text-right text-gray-700">${r.billed.toLocaleString()}</td>
                      <td className="p-3 text-right text-green-700 font-medium">${r.paid.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <span className={`text-xs font-semibold ${r.paid/r.billed >= 0.9 ? 'text-green-600' : 'text-amber-600'}`}>
                          {((r.paid / r.billed) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.id === "rejection_rate" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">17.6%</p>
                  <p className="text-sm text-red-600">Overall Rejection Rate</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-amber-700">6</p>
                  <p className="text-sm text-amber-600">Rejections This Week</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Code</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Reason</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Payer</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectionData.map(r => (
                    <tr key={r.code} className="border-b border-gray-100 last:border-0">
                      <td className="p-3 font-mono font-bold text-red-600">#{r.code}</td>
                      <td className="p-3 text-gray-800">{r.reason}</td>
                      <td className="p-3 text-gray-600">{r.payer}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.id === "controlled" && (
            <div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                DEA-required log of all Schedule II–V controlled substance dispensing. Retain for 2 years minimum.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Patient</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Drug</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Qty</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Schedule</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Prescriber</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">DEA #</th>
                  </tr>
                </thead>
                <tbody>
                  {controlledData.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="p-3 text-gray-700">{r.date}</td>
                      <td className="p-3 font-medium text-gray-900">{r.patient}</td>
                      <td className="p-3 text-gray-800">{r.drug}</td>
                      <td className="p-3 text-gray-600">{r.qty}</td>
                      <td className="p-3"><Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Sch {r.schedule}</Badge></td>
                      <td className="p-3 text-gray-700">{r.prescriber}</td>
                      <td className="p-3 font-mono text-xs text-gray-600">{r.dea}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.id === "reconciliation" && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">End of Day Summary — {eodData.date}</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Rxs Filled", value: eodData.rxFilled },
                    { label: "Claims Submitted", value: eodData.claimsSubmitted },
                    { label: "Claims Paid", value: eodData.claimsPaid },
                  ].map(m => (
                    <div key={m.label} className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                      <p className="text-xs text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Claims Revenue</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Total Billed</span><span className="font-medium">${eodData.totalBilled.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Total Paid</span><span className="font-medium text-green-700">${eodData.totalPaid.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Rejected</span><span className="font-medium text-red-600">{eodData.claimsRejected} claims</span></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Copay Collections</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Cash</span><span className="font-medium">${eodData.copayCash.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">Credit/Debit</span><span className="font-medium">${eodData.copayCard.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">FSA/HSA</span><span className="font-medium">${eodData.copayFSA.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2"><span className="font-semibold text-gray-900">Total Collected</span><span className="font-bold text-gray-900">${(eodData.copayCash + eodData.copayCard + eodData.copayFSA).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {report.id === "inventory" && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "In Stock", count: 4, color: "text-green-700", bg: "bg-green-50 border-green-100" },
                  { label: "Low Stock", count: 2, color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
                  { label: "Critical", count: 1, color: "text-red-700", bg: "bg-red-50 border-red-100" },
                ].map(s => (
                  <div key={s.label} className={`border rounded-lg p-3 text-center ${s.bg}`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className={`text-sm ${s.color}`}>{s.label}</p>
                  </div>
                ))}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Drug</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">NDC</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">On Hand</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">Reorder At</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map(item => (
                    <tr key={item.ndc} className="border-b border-gray-100 last:border-0">
                      <td className="p-3 font-medium text-gray-900">{item.drug}</td>
                      <td className="p-3 font-mono text-xs text-gray-500">{item.ndc}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">{item.onHand}</td>
                      <td className="p-3 text-right text-gray-600">{item.reorder}</td>
                      <td className="p-3 text-center">
                        <Badge className={
                          item.status === "OK" ? "bg-green-100 text-green-700 border-green-200 text-xs" :
                          item.status === "Low" ? "bg-amber-100 text-amber-700 border-amber-200 text-xs" :
                          "bg-red-100 text-red-700 border-red-200 text-xs"
                        }>{item.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* US-9.4: PDMP Compliance Dashboard */}
          {report.id === "pdmp" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Submissions Today", value: "12", color: "text-teal-700", bg: "bg-teal-50 border-teal-100" },
                  { label: "This Week", value: "58", color: "text-teal-700", bg: "bg-teal-50 border-teal-100" },
                  { label: "This Month", value: "203", color: "text-teal-700", bg: "bg-teal-50 border-teal-100" },
                  { label: "Success Rate", value: "97.5%", color: "text-green-700", bg: "bg-green-50 border-green-100" },
                ].map(s => (
                  <div key={s.label} className={`border rounded-lg p-3 text-center ${s.bg}`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className={`text-xs mt-0.5 ${s.color}`}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Daily Submission Volume — Past 7 Days</p>
                <div className="flex items-end gap-2 h-28 bg-gray-50 rounded-lg p-3">
                  {[{ day: "Mon", v: 8 }, { day: "Tue", v: 11 }, { day: "Wed", v: 9 }, { day: "Thu", v: 7 }, { day: "Fri", v: 13 }, { day: "Sat", v: 6 }, { day: "Sun", v: 4 }].map(({ day, v }) => (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-teal-500 rounded-t" style={{ height: `${(v / 13) * 72}px` }} />
                      <span className="text-xs text-gray-500">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Failure Reasons</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Reason</th>
                      <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">Count</th>
                      <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">% of Failures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { reason: "Patient ID mismatch", count: 3, pct: "60%" },
                      { reason: "Submission timeout", count: 2, pct: "40%" },
                    ].map(r => (
                      <tr key={r.reason} className="border-b border-gray-100 last:border-0">
                        <td className="p-3 text-gray-800">{r.reason}</td>
                        <td className="p-3 text-right font-semibold text-red-600">{r.count}</td>
                        <td className="p-3 text-right text-gray-500">{r.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* US-11.4: AI Extraction Accuracy */}
          {report.id === "ai_accuracy" && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-violet-50 border-violet-100 text-center">
                <p className="text-4xl font-bold text-violet-700">94.2%</p>
                <p className="text-sm text-violet-600 mt-1">Average AI Confidence Score — All Fax OCR Jobs</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Per-Field Accuracy</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase">Field</th>
                      <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">Avg Confidence</th>
                      <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase">Correction Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: "Patient Name", conf: "98.1%", corr: "1.2%" },
                      { field: "Drug Name", conf: "96.3%", corr: "2.8%" },
                      { field: "Dosage", conf: "91.4%", corr: "6.1%" },
                      { field: "Qty", conf: "93.7%", corr: "4.5%" },
                      { field: "Refills", conf: "89.2%", corr: "8.3%" },
                      { field: "Prescriber NPI", conf: "99.1%", corr: "0.7%" },
                    ].map(r => (
                      <tr key={r.field} className="border-b border-gray-100 last:border-0">
                        <td className="p-3 font-medium text-gray-900">{r.field}</td>
                        <td className="p-3 text-right">
                          <Badge className={`text-xs border ${parseFloat(r.conf) >= 95 ? "bg-green-100 text-green-700 border-green-200" : parseFloat(r.conf) >= 90 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-red-100 text-red-700 border-red-200"}`}>{r.conf}</Badge>
                        </td>
                        <td className="p-3 text-right text-gray-600">{r.corr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<typeof reportCards[0] | null>(null);
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-01-24");

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate and export operational reports</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Label className="text-sm text-gray-600 whitespace-nowrap">Date Range:</Label>
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-9 w-36 text-sm"
          />
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-9 w-36 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.filter(r => isPostMVP || !r.postMVPOnly).map(report => {
          const Icon = report.icon;
          return (
            <Card
              key={report.id}
              className="border border-gray-200 shadow-sm hover:border-[#7C3AED] hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedReport(report)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${report.bg}`}>
                    <Icon className={`w-5 h-5 ${report.color}`} />
                  </div>
                  <Badge className={`text-xs border ${report.badgeColor}`}>{report.badge}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#7C3AED] transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{report.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white text-xs h-7"
                    onClick={() => setSelectedReport(report)}
                  >
                    View Report
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-gray-500">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ReportModal
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
