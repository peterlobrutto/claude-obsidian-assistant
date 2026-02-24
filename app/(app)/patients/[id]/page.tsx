"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Pill,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockPatients, mockPrescriptions } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  pending_verification: "bg-amber-100 text-amber-700 border-amber-200",
  fill_count: "bg-blue-100 text-blue-700 border-blue-200",
  final_check: "bg-indigo-100 text-indigo-700 border-indigo-200",
  ready_pickup: "bg-green-100 text-green-700 border-green-200",
  dispensed: "bg-gray-100 text-gray-600 border-gray-200",
  returned: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending_verification: "Pending Verification",
  fill_count: "Fill / Count",
  final_check: "Final Check",
  ready_pickup: "Ready for Pickup",
  dispensed: "Dispensed",
  returned: "Returned",
};

function formatDOB(dob: string) {
  const d = new Date(dob + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function calcAge(dob: string) {
  const b = new Date(dob + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patient = mockPatients.find((p) => p.id === id);
  if (!patient) notFound();

  const patientRxs = mockPrescriptions.filter((rx) => rx.patientId === id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-gray-600">
            <Link href="/patients">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
              <span>DOB: {formatDOB(patient.dob)}</span>
              <span>&bull;</span>
              <span>{calcAge(patient.dob)} years old</span>
              <span>&bull;</span>
              <span>ID: {patient.id.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/prescriptions/new">
              <Plus className="w-4 h-4" />
              New Rx
            </Link>
          </Button>
          <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2">
            <Edit className="w-4 h-4" />
            Edit Patient
          </Button>
        </div>
      </div>

      <Tabs defaultValue="demographics">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="history">Rx History ({patientRxs.length})</TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</CardTitle>
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-gray-500">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-medium text-gray-900">{patient.address}</p>
                    <p className="text-sm text-gray-600">{patient.city}, {patient.state} {patient.zip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">{formatDOB(patient.dob)} ({calcAge(patient.dob)} yrs)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total Rxs on File", value: patientRxs.length.toString() },
                    { label: "Active Rxs", value: patientRxs.filter(r => r.status !== 'dispensed' && r.status !== 'returned').length.toString() },
                    { label: "Last Rx", value: new Date(patient.lastRxDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                    { label: "Insurance Plans", value: patient.insurance.secondary ? "2" : "1" },
                    { label: "Known Allergies", value: patient.allergies.length.toString() },
                    { label: "Conditions", value: patient.conditions.length.toString() },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-2">Primary</Badge>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {patient.insurance.primary.name}
                    </CardTitle>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-gray-500">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { label: "BIN", value: patient.insurance.primary.bin },
                    { label: "PCN", value: patient.insurance.primary.pcn },
                    { label: "Group #", value: patient.insurance.primary.group },
                    { label: "Member ID", value: patient.insurance.primary.memberId },
                    { label: "Relationship", value: patient.insurance.primary.relationshipCode === "01" ? "01 – Cardholder" : patient.insurance.primary.relationshipCode },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{field.label}</p>
                      <p className="text-sm font-mono font-medium text-gray-900 mt-0.5">{field.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {patient.insurance.secondary ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-2">Secondary</Badge>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {patient.insurance.secondary.name}
                      </CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-gray-500">
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    {[
                      { label: "BIN", value: patient.insurance.secondary.bin },
                      { label: "PCN", value: patient.insurance.secondary.pcn },
                      { label: "Group #", value: patient.insurance.secondary.group },
                      { label: "Member ID", value: patient.insurance.secondary.memberId },
                      { label: "Relationship", value: patient.insurance.secondary.relationshipCode === "01" ? "01 – Cardholder" : patient.insurance.secondary.relationshipCode },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{field.label}</p>
                        <p className="text-sm font-mono font-medium text-gray-900 mt-0.5">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-gray-200 shadow-sm flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No secondary insurance on file</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    Add Secondary
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Clinical Tab */}
        <TabsContent value="clinical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Known Allergies
                    </CardTitle>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-gray-500">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.allergies.map((allergy) => (
                      <div
                        key={allergy}
                        className="flex items-center gap-3 p-2.5 bg-red-50 border border-red-100 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-sm font-medium text-red-800">{allergy}</span>
                        <Badge className="ml-auto bg-red-100 text-red-700 border-red-200 text-xs">
                          Allergy
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No known drug allergies (NKDA)</p>
                )}
                <Button size="sm" variant="outline" className="mt-4 w-full gap-2 text-gray-600">
                  <Plus className="w-3.5 h-3.5" />
                  Add Allergy
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-purple-500" />
                    <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Medical Conditions
                    </CardTitle>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-gray-500">
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {patient.conditions.length > 0 ? (
                  <div className="space-y-2">
                    {patient.conditions.map((condition) => (
                      <div
                        key={condition}
                        className="flex items-center gap-3 p-2.5 bg-purple-50 border border-purple-100 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-sm font-medium text-purple-900">{condition}</span>
                        <Badge className="ml-auto bg-purple-100 text-purple-700 border-purple-200 text-xs">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No conditions on file</p>
                )}
                <Button size="sm" variant="outline" className="mt-4 w-full gap-2 text-gray-600">
                  <Plus className="w-3.5 h-3.5" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rx History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Rx #</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Drug</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty / Days</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Prescriber</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Written</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Refills Left</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientRxs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                        No prescription history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    patientRxs.map((rx) => (
                      <TableRow key={rx.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="pl-5 font-mono text-sm text-gray-700">{rx.rxNumber}</TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-900">{rx.drug}</p>
                          <p className="text-xs text-gray-500">{rx.strength}</p>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {rx.qty} / {rx.daysSupply}d
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{rx.prescriberName}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(rx.writtenDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{rx.refillsRemaining}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs border ${statusColors[rx.status]}`}>
                            {statusLabels[rx.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
