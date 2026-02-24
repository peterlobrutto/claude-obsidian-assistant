"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewPatientPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => router.push("/patients"), 1500);
  };

  if (saved) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Patient Added</h2>
        <p className="text-sm text-gray-500">Redirecting to patient list…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-900 -ml-2">
          <Link href="/patients">
            <ChevronLeft className="w-4 h-4" />
            Patients
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Patient</h1>
        <p className="text-sm text-gray-500 mt-0.5">Add a new patient to the pharmacy system</p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-base font-semibold text-gray-900">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input placeholder="First name" />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input placeholder="Last name" />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Sex</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                  <SelectItem value="U">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input placeholder="(555) 000-0000" type="tel" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input placeholder="email@example.com" type="email" />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Street Address</Label>
              <Input placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input placeholder="City" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input placeholder="IL" maxLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label>ZIP</Label>
                <Input placeholder="62701" maxLength={5} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-6">
          <CardTitle className="text-base font-semibold text-gray-900">Insurance</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Primary Insurance</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select insurer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="aetna">Aetna</SelectItem>
                  <SelectItem value="humana">Humana Medicare</SelectItem>
                  <SelectItem value="medicare">Medicare Part D</SelectItem>
                  <SelectItem value="cigna">Cigna</SelectItem>
                  <SelectItem value="united">UnitedHealth</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                  <SelectItem value="cash">Cash Pay / No Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Member ID</Label>
              <Input placeholder="Member ID" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Group Number</Label>
              <Input placeholder="Group #" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>RxBIN</Label>
              <Input placeholder="RxBIN" className="font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button asChild variant="outline">
          <Link href="/patients">Cancel</Link>
        </Button>
        <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Patient
        </Button>
      </div>
    </div>
  );
}
