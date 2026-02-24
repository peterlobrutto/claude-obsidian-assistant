"use client";

import { useState } from "react";
import { CreditCard, RefreshCw, TrendingUp, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockClaims } from "@/lib/mock-data";
import type { Claim } from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  paid: { label: "Paid", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
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

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [resubmitting, setResubmitting] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
        <p className="text-sm text-gray-500 mt-0.5">Adjudication status and resubmission management</p>
      </div>

      {/* Stats Row */}
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

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-gray-200 shadow-sm">
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
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-gray-400">
                Collection rate: {((totalPaid / totalBilled) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims Table */}
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
                const config = statusConfig[claim.status];
                const StatusIcon = config.icon;
                return (
                  <TableRow
                    key={claim.id}
                    className={`border-gray-100 ${claim.status === "rejected" ? "bg-red-50/20" : ""}`}
                  >
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
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
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
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
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
                          <span className="sm:hidden">{resubmitting.has(claim.id) ? "..." : "Re-send"}</span>
                        </Button>
                      )}
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
