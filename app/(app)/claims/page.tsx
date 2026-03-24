"use client";

import { useState } from "react";
import { CreditCard, RefreshCw, TrendingUp, XCircle, Clock, CheckCircle2, RotateCcw, GitMerge, FileText, ShieldCheck, BarChart2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { mockClaims } from "@/lib/mock-data";
import type { Claim } from "@/lib/mock-data";
import { isPostMVP } from "@/lib/deployment";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  paid: { label: "Paid", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
  reversed: { label: "Reversed", className: "bg-gray-100 text-gray-600 border-gray-200", icon: RotateCcw },
};

const rejectionCodeMap: Record<string, string> = {
  "75": "Prior Authorization Required",
  "88": "Non-Formulary / Step Therapy Required",
  "04": "Days Supply Limitation Exceeded",
  "14": "Refill Too Soon",
  "07": "Product Not on Formulary",
  "25": "Missing or Invalid Prescriber ID",
  "70": "Product/Service Not Covered",
};

// ── PA Narrative Modal (Fix 27) ───────────────────────────────────────────────
function PANarrativeModal({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const [approved, setApproved] = useState(false);
  const narrative = `PRIOR AUTHORIZATION NARRATIVE — DRAFT

Patient: ${claim.patientName}
Drug: ${claim.drug}
Payer: ${claim.payer}
Rejection Code: 75 — Prior Authorization Required

CLINICAL JUSTIFICATION:
The prescribing provider has determined that ${claim.drug} is medically necessary for this patient based on the following clinical criteria:

1. Diagnosis: The patient has a documented diagnosis requiring this therapy.
2. Previous treatments: Patient has failed or is contraindicated to first-line alternatives.
3. Clinical response: Based on prescriber's clinical judgment, ${claim.drug} is the most appropriate therapy.

SUPPORTING DOCUMENTATION:
• Prescriber attestation letter on file
• Patient clinical notes from most recent visit
• Prior therapy failure documentation

This authorization request is submitted on behalf of ${claim.patientName} by Riverside Pharmacy.

[AI-generated draft — pharmacist review required]`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Prior Authorization Narrative</h3>
            <p className="text-xs text-gray-500">{claim.drug} — {claim.payer}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">AI Draft</Badge>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {!approved ? (
            <textarea
              className="w-full h-64 font-mono text-xs text-gray-800 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              defaultValue={narrative}
              readOnly
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900">PA narrative approved and submitted</p>
              <p className="text-xs text-gray-500 mt-1">Submitted to {claim.payer} on {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-2">
          {!approved ? (
            <>
              <Button className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white" onClick={() => setApproved(true)}>
                <ShieldCheck className="w-4 h-4 mr-1" />Pharmacist Approve & Submit
              </Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            </>
          ) : (
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AI Resolution Modal (Fix 28) ──────────────────────────────────────────────
function AIResolutionModal({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const [approved, setApproved] = useState(false);
  const resolution = claim.rejectionCode === "04"
    ? `RECOMMENDED ACTION: Resubmit with corrected Days Supply\n\nThe claim was rejected because the days supply (30 days) exceeds the payer's limitation for ${claim.drug}.\n\nAI Suggestion:\n• Resubmit with Days Supply = 15 (matches payer formulary limit)\n• Split fill if clinically appropriate\n• Attach prescriber override letter if 30-day supply is medically necessary\n\nPredicted approval probability: 84%`
    : `RECOMMENDED ACTION: Resubmit with override\n\nThe claim for ${claim.drug} was rejected with code ${claim.rejectionCode}.\n\nAI Suggestion:\n• Review formulary alternatives and discuss with prescriber\n• Submit step therapy exception with documentation\n• Contact payer PA line: (800) 555-${claim.payer.length}000\n\nPredicted approval probability: 71%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">AI Resolution Recommendation</h3>
            <p className="text-xs text-gray-500">{claim.rxNumber}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">AI Suggested</Badge>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {!approved ? (
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{resolution}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Resolution approved and queued</p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-2">
          {!approved ? (
            <>
              <Button className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white" onClick={() => setApproved(true)}>
                <ShieldCheck className="w-4 h-4 mr-1" />Pharmacist Approve Resolution
              </Button>
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            </>
          ) : (
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manual Review Modal (US-12.2b) ────────────────────────────────────────────
// Codes #04 and #14 require pharmacist judgment — not AI automation
function ManualReviewModal({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const [notes, setNotes] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const details = claim.rejectionCode === "04"
    ? "Days supply of 90 exceeds plan limit of 30. Pharmacist must determine whether to split the fill or obtain a prescriber override."
    : "Refill was submitted 7 days early. Payer requires the patient to be within the refill window before resubmission is allowed.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Manual Review Required</h3>
            <p className="text-xs text-gray-500">{claim.drug} — Code #{claim.rejectionCode}</p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pharmacist Review</Badge>
        </div>
        <div className="p-5 space-y-4">
          {!reviewed ? (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{details}</div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Pharmacist Notes</label>
                <textarea
                  className="w-full h-24 text-sm border border-gray-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                  placeholder="Add clinical notes or override rationale…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
                  onClick={() => setReviewed(true)}
                >
                  <ClipboardList className="w-4 h-4 mr-1" />Mark Reviewed
                </Button>
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
              <p className="text-sm font-semibold text-gray-900">Marked as Pending Override</p>
              <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Analytics Tab (Fix 29) ────────────────────────────────────────────────────
function ClaimsAnalytics({ claims }: { claims: Claim[] }) {
  const byRejectionCode = Object.entries(
    claims.filter(c => c.rejectionCode).reduce((acc, c) => {
      const code = c.rejectionCode!;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  const totalBilled = claims.reduce((s, c) => s + c.amountBilled, 0);
  const totalPaid = claims.reduce((s, c) => s + c.amountPaid, 0);
  const totalRejected = claims.filter(c => c.status === "rejected").reduce((s, c) => s + c.amountBilled, 0);

  const payerBreakdown = Object.entries(
    claims.reduce((acc, c) => {
      acc[c.payer] = (acc[c.payer] || { paid: 0, rejected: 0, total: 0 });
      acc[c.payer].total += 1;
      if (c.status === "rejected") acc[c.payer].rejected += 1;
      else if (c.status === "paid") acc[c.payer].paid += 1;
      return acc;
    }, {} as Record<string, { paid: number; rejected: number; total: number }>)
  ).slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Collection Rate", value: totalBilled > 0 ? `${((totalPaid / totalBilled) * 100).toFixed(1)}%` : "—", sub: `$${totalPaid.toFixed(0)} of $${totalBilled.toFixed(0)}`, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejection Rate", value: `${((claims.filter(c => c.status === "rejected").length / claims.length) * 100).toFixed(1)}%`, sub: `${claims.filter(c => c.status === "rejected").length} claims`, color: "text-red-600", bg: "bg-red-50" },
          { label: "Revenue At Risk", value: `$${totalRejected.toFixed(0)}`, sub: "Rejected claims total", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg Paid", value: claims.filter(c => c.amountPaid > 0).length > 0 ? `$${(claims.filter(c => c.amountPaid > 0).reduce((s, c) => s + c.amountPaid, 0) / claims.filter(c => c.amountPaid > 0).length).toFixed(2)}` : "—", sub: "per paid claim", color: "text-blue-600", bg: "bg-blue-50" },
        ].map(s => (
          <Card key={s.label} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                <BarChart2 className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-900">Top Rejection Codes</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {byRejectionCode.length === 0 ? (
              <p className="text-sm text-gray-400">No rejections</p>
            ) : (
              <div className="space-y-2">
                {byRejectionCode.map(([code, count]) => (
                  <div key={code} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-red-600 font-bold w-8">#{code}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-700">{rejectionCodeMap[code] || "Unknown"}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${(count / byRejectionCode[0][1]) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-900">Payer Performance</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {payerBreakdown.map(([payer, stats]) => (
                <div key={payer} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1">{payer}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-green-600 text-xs">{stats.paid}✓</span>
                    <span className="text-red-600 text-xs">{stats.rejected}✗</span>
                    <span className="text-gray-400 text-xs">{stats.total} total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [resubmitting, setResubmitting] = useState<Set<string>>(new Set());
  const [reversing, setReversing] = useState<Set<string>>(new Set());
  const [secondarySubmitting, setSecondarySubmitting] = useState<Set<string>>(new Set());
  const [paNarrativeTarget, setPaNarrativeTarget] = useState<Claim | null>(null);
  const [aiResolutionTarget, setAIResolutionTarget] = useState<Claim | null>(null);
  const [manualReviewTarget, setManualReviewTarget] = useState<Claim | null>(null);

  // Codes that require pharmacist judgment — not AI automation (US-12.2b)
  const manualReviewCodes = ["04", "14"];

  const stats = {
    submitted: claims.filter(c => c.submittedDate === "2024-01-24").length,
    paid: claims.filter(c => c.status === "paid").length,
    rejected: claims.filter(c => c.status === "rejected").length,
    pending: claims.filter(c => c.status === "pending").length,
  };

  const totalBilled = claims.reduce((sum, c) => sum + c.amountBilled, 0);
  const totalPaid = claims.reduce((sum, c) => sum + c.amountPaid, 0);

  const handleResubmit = async (claimId: string) => {
    setResubmitting(prev => new Set([...prev, claimId]));
    await new Promise(r => setTimeout(r, 1500));
    setClaims(prev => prev.map(c =>
      c.id === claimId ? { ...c, status: "pending" as const, rejectionCode: undefined, rejectionReason: undefined } : c
    ));
    setResubmitting(prev => { const n = new Set(prev); n.delete(claimId); return n; });
  };

  const handleReverse = async (claimId: string) => {
    setReversing(prev => new Set([...prev, claimId]));
    await new Promise(r => setTimeout(r, 1200));
    setClaims(prev => prev.map(c =>
      c.id === claimId ? { ...c, status: "reversed" as const } : c
    ));
    setReversing(prev => { const n = new Set(prev); n.delete(claimId); return n; });
  };

  const handleSubmitSecondary = async (claimId: string) => {
    setSecondarySubmitting(prev => new Set([...prev, claimId]));
    await new Promise(r => setTimeout(r, 1500));
    setClaims(prev => prev.map(c =>
      c.id === claimId ? { ...c, hasSecondary: false } : c
    ));
    setSecondarySubmitting(prev => { const n = new Set(prev); n.delete(claimId); return n; });
  };

  return (
    <div className="space-y-5">
      {paNarrativeTarget && <PANarrativeModal claim={paNarrativeTarget} onClose={() => setPaNarrativeTarget(null)} />}
      {aiResolutionTarget && <AIResolutionModal claim={aiResolutionTarget} onClose={() => setAIResolutionTarget(null)} />}
      {manualReviewTarget && <ManualReviewModal claim={manualReviewTarget} onClose={() => setManualReviewTarget(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">Adjudication status and resubmission management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Submitted Today", value: stats.submitted, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Paid", value: stats.paid, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* US-17.2: Financial metrics — Post-MVP only (Epic 17) */}
      {isPostMVP && <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Financial Summary</p>
        <div className="grid grid-cols-2 gap-4">
          <Card className="border border-slate-200 shadow-none bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <CreditCard className="w-6 h-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount Billed</p>
                <p className="text-2xl font-bold text-gray-900">${totalBilled.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-none bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Collection rate: {((totalPaid / totalBilled) * 100).toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>}

      <Tabs defaultValue="claims">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="claims">All Claims</TabsTrigger>
          {isPostMVP && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="claims" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Patient</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Payer</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Billed</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Paid</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Submitted</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">Rejection</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map(claim => {
                    const config = statusConfig[claim.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={claim.id} className={`border-gray-100 ${claim.status === "rejected" ? "bg-red-50/20" : ""}`}>
                        <TableCell className="pl-5">
                          <p className="text-sm font-medium text-gray-900">{claim.patientName}</p>
                          <p className="text-xs text-gray-400 font-mono">{claim.rxNumber}</p>
                          <p className="text-xs text-gray-500 sm:hidden mt-0.5">{claim.drug}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-gray-700">{claim.drug}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-600">{claim.payer}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm font-medium text-gray-900">${claim.amountBilled.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm font-medium text-green-700">
                          {claim.amountPaid > 0 ? `$${claim.amountPaid.toFixed(2)}` : <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                          {new Date(claim.submittedDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs border gap-1 ${config.className}`}>
                            <StatusIcon className="w-3 h-3" />{config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {claim.rejectionCode ? (
                            <div>
                              <span className="font-mono text-xs text-red-600 font-bold">#{claim.rejectionCode}</span>
                              <p className="text-xs text-gray-500 max-w-[160px] leading-tight">
                                {rejectionCodeMap[claim.rejectionCode] || claim.rejectionReason}
                              </p>
                            </div>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {/* Fix 8: Reverse Claim on paid */}
                            {claim.status === "paid" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-gray-600 border-gray-200 hover:bg-gray-50"
                                onClick={() => handleReverse(claim.id)}
                                disabled={reversing.has(claim.id)}
                              >
                                <RotateCcw className={`w-3.5 h-3.5 ${reversing.has(claim.id) ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">{reversing.has(claim.id) ? "Reversing..." : "Reverse"}</span>
                              </Button>
                            )}
                            {/* Fix 9: Submit Secondary for dual-coverage paid claims */}
                            {claim.status === "paid" && claim.hasSecondary && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleSubmitSecondary(claim.id)}
                                disabled={secondarySubmitting.has(claim.id)}
                              >
                                <GitMerge className={`w-3.5 h-3.5 ${secondarySubmitting.has(claim.id) ? "animate-pulse" : ""}`} />
                                <span className="hidden sm:inline">{secondarySubmitting.has(claim.id) ? "Submitting..." : "Submit Secondary"}</span>
                              </Button>
                            )}
                            {/* US-12.2c: PA (code 75) uses AI Resolve to draft the letter, not a field fix */}
                            {claim.status === "rejected" && claim.rejectionCode === "75" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => setPaNarrativeTarget(claim)}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">AI Resolve</span>
                              </Button>
                            )}
                            {/* US-12.2b: codes #04 and #14 require pharmacist judgment */}
                            {claim.status === "rejected" && claim.rejectionCode && manualReviewCodes.includes(claim.rejectionCode) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => setManualReviewTarget(claim)}
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Manual Review</span>
                              </Button>
                            )}
                            {/* AI resolution for other rejection codes */}
                            {claim.status === "rejected" && claim.rejectionCode && claim.rejectionCode !== "75" && !manualReviewCodes.includes(claim.rejectionCode) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => setAIResolutionTarget(claim)}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">AI Resolve</span>
                              </Button>
                            )}
                            {claim.status === "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-7 text-[#7C3AED] border-purple-200 hover:bg-purple-50"
                                onClick={() => handleResubmit(claim.id)}
                                disabled={resubmitting.has(claim.id)}
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${resubmitting.has(claim.id) ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">{resubmitting.has(claim.id) ? "Sending..." : "Resubmit"}</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isPostMVP && (
          <TabsContent value="analytics" className="mt-4">
            <ClaimsAnalytics claims={claims} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
