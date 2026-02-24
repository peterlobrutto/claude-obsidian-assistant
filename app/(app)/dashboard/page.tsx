"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  Package,
  CreditCard,
  Plus,
  Users,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockActivity } from "@/lib/mock-data";

const statsCards = [
  {
    title: "Today's Rx Count",
    value: "47",
    change: "+12% vs yesterday",
    icon: FileText,
    color: "text-[#7C3AED]",
    bg: "bg-purple-50",
  },
  {
    title: "Pending Verification",
    value: "12",
    change: "Requires pharmacist review",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Will-Call Ready",
    value: "23",
    change: "3 expiring soon",
    icon: Package,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    title: "Claims Pending",
    value: "8",
    change: "4 rejections to address",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const activityIconMap = {
  rx_received: { icon: FileText, color: "text-purple-600 bg-purple-50" },
  rx_filled: { icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  claim_submitted: { icon: CreditCard, color: "text-blue-600 bg-blue-50" },
  patient_added: { icon: Users, color: "text-indigo-600 bg-indigo-50" },
  rx_picked_up: { icon: Package, color: "text-teal-600 bg-teal-50" },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. Chen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thursday, January 25, 2024 &bull; Riverside Pharmacy</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <Activity className="w-3.5 h-3.5" />
          <span className="font-medium">All systems operational</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.change}</p>
                  </div>
                  <div className={`${card.bg} p-2.5 rounded-xl`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <Button asChild className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2">
            <Link href="/prescriptions/new">
              <Plus className="w-4 h-4" />
              New Rx
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/patients">
              <Users className="w-4 h-4" />
              Patient Search
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/prescriptions">
              <RotateCcw className="w-4 h-4" />
              Refill Queue
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/claims">
              <AlertCircle className="w-4 h-4" />
              Review Rejections
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="col-span-2 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
              <Link href="/prescriptions" className="text-sm text-[#7C3AED] hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {mockActivity.map((item) => {
                const config = activityIconMap[item.type];
                const Icon = config.icon;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg ${config.color.split(" ")[1]}`}>
                      <Icon className={`w-3.5 h-3.5 ${config.color.split(" ")[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{item.description}</p>
                      <p className="text-xs text-gray-500">{item.patientName}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{item.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rx Pipeline */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-gray-900">Rx Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {[
                { stage: "Pending Verification", count: 12, color: "bg-amber-500" },
                { stage: "Fill / Count", count: 8, color: "bg-blue-500" },
                { stage: "Final Check", count: 5, color: "bg-indigo-500" },
                { stage: "Ready for Pickup", count: 23, color: "bg-green-500" },
              ].map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{stage.stage}</span>
                    <span className="font-semibold text-gray-900">{stage.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`${stage.color} h-1.5 rounded-full`}
                      style={{ width: `${Math.min((stage.count / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Today&apos;s Performance</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Avg Fill Time", value: "14 min" },
                  { label: "Claim Rate", value: "94%" },
                  { label: "Revenue", value: "$3,840" },
                  { label: "Copay Collect.", value: "98%" },
                ].map((metric) => (
                  <div key={metric.label} className="text-center">
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DUR Alerts Banner */}
      <Card className="border border-amber-200 bg-amber-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">2 DUR Alerts Require Attention</p>
                <p className="text-xs text-amber-700">Drug interaction warnings on prescriptions for Patricia O&apos;Brien and Margaret Thompson</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link href="/prescriptions">Review Now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
