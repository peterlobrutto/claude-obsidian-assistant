"use client";

import { useState } from "react";
import { Save, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { mockUsers } from "@/lib/mock-data";

const payersList = [
  { id: 1, name: "Blue Cross Blue Shield", bin: "004336", pcn: "ADV", phone: "1-800-262-2583", active: true },
  { id: 2, name: "Aetna", bin: "010517", pcn: "AETNARX", phone: "1-800-238-6279", active: true },
  { id: 3, name: "Humana Medicare", bin: "015581", pcn: "HUM", phone: "1-800-457-4708", active: true },
  { id: 4, name: "Medicare Part D (CMS)", bin: "610014", pcn: "MEDDPART", phone: "1-800-633-4227", active: true },
  { id: 5, name: "Cigna", bin: "009999", pcn: "CIG", phone: "1-800-997-1654", active: true },
  { id: 6, name: "UnitedHealth", bin: "610020", pcn: "UHC", phone: "1-888-445-8745", active: true },
  { id: 7, name: "Medicaid (Illinois)", bin: "600428", pcn: "ILMED", phone: "1-877-782-5565", active: true },
  { id: 8, name: "WellCare", bin: "610649", pcn: "WELC", phone: "1-866-822-1339", active: false },
];

function SaveSuccessToast({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg text-sm z-50">
      <CheckCircle className="w-4 h-4 text-green-400" />
      Settings saved successfully
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage pharmacy configuration and system preferences</p>
      </div>

      <Tabs defaultValue="pharmacy">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="pharmacy">Pharmacy Info</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="printer">Label Printer</TabsTrigger>
          <TabsTrigger value="payers">Payers</TabsTrigger>
          <TabsTrigger value="willcall">Will-Call Settings</TabsTrigger>
        </TabsList>

        {/* Pharmacy Info */}
        <TabsContent value="pharmacy" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Pharmacy Information</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Pharmacy Name</Label>
                  <Input defaultValue="Riverside Pharmacy" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input defaultValue="1428 Riverside Drive" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input defaultValue="Suite 100" placeholder="Suite, Unit, etc." />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input defaultValue="Springfield" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input defaultValue="IL" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ZIP Code</Label>
                    <Input defaultValue="62701" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input defaultValue="(217) 555-0100" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fax Number</Label>
                  <Input defaultValue="(217) 555-0101" />
                </div>
              </div>

              <Separator />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Regulatory Identifiers</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>DEA Number</Label>
                  <Input defaultValue="AR1234563" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>NPI Number</Label>
                  <Input defaultValue="1234567890" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>NCPDP / NABP #</Label>
                  <Input defaultValue="1234567" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>State License #</Label>
                  <Input defaultValue="054-012345" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>State License Expiry</Label>
                  <Input type="date" defaultValue="2025-06-30" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pharmacy Type</Label>
                  <Select defaultValue="retail">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Independent Retail</SelectItem>
                      <SelectItem value="compounding">Compounding</SelectItem>
                      <SelectItem value="ltc">Long-Term Care</SelectItem>
                      <SelectItem value="specialty">Specialty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Staff Users</CardTitle>
                <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2 h-8 text-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Last Login</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map(user => (
                    <TableRow key={user.id} className="border-gray-100">
                      <TableCell className="pl-5 font-medium text-gray-900">{user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          user.role === "Pharmacist" ? "bg-purple-100 text-purple-700 border-purple-200 text-xs" :
                          user.role === "Owner" ? "bg-blue-100 text-blue-700 border-blue-200 text-xs" :
                          "bg-gray-100 text-gray-600 border-gray-200 text-xs"
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                        }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {user.id !== "u001" && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Label Printer */}
        <TabsContent value="printer" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Label Printer Configuration</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Printer Model</Label>
                  <Select defaultValue="zebra_zp450">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zebra_zp450">Zebra ZP 450</SelectItem>
                      <SelectItem value="zebra_gk420">Zebra GK420d</SelectItem>
                      <SelectItem value="dymo_4xl">DYMO LabelWriter 4XL</SelectItem>
                      <SelectItem value="brother_ql820">Brother QL-820NWB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Label Size</Label>
                  <Select defaultValue="3x1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3x1">3&quot; x 1&quot; Vial Label</SelectItem>
                      <SelectItem value="4x3">4&quot; x 3&quot; Bag Label</SelectItem>
                      <SelectItem value="4x6">4&quot; x 6&quot; Large Bag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Printer IP Address</Label>
                  <Input defaultValue="192.168.1.45" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Connection Type</Label>
                  <Select defaultValue="network">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="network">Network (TCP/IP)</SelectItem>
                      <SelectItem value="usb">USB Direct</SelectItem>
                      <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Copies Per Prescription</Label>
                  <Input type="number" defaultValue="1" min="1" max="3" />
                </div>
                <div className="space-y-1.5">
                  <Label>Print Auxiliary Label</Label>
                  <Select defaultValue="yes">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — Print auxiliary warning labels</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2">
                  Test Print
                </Button>
                <p className="text-xs text-gray-500">Last test: Jan 24, 2024 at 8:12 AM — Successful</p>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Printer Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payers */}
        <TabsContent value="payers" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Insurance Payers</CardTitle>
                <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2 h-8 text-sm">
                  <Plus className="w-3.5 h-3.5" />
                  Add Payer
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide">Payer Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">BIN</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">PCN</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Help Desk</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payersList.map(payer => (
                    <TableRow key={payer.id} className="border-gray-100">
                      <TableCell className="pl-5 font-medium text-gray-900">{payer.name}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">{payer.bin}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">{payer.pcn}</TableCell>
                      <TableCell className="text-sm text-gray-600">{payer.phone}</TableCell>
                      <TableCell>
                        <Badge className={
                          payer.active
                            ? "bg-green-100 text-green-700 border-green-200 text-xs"
                            : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                        }>
                          {payer.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-500">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Will-Call Settings */}
        <TabsContent value="willcall" className="mt-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-base font-semibold text-gray-900">Will-Call Hold Period Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Standard Hold Period (days)</Label>
                  <Input type="number" defaultValue="14" min="7" max="30" />
                  <p className="text-xs text-gray-500">Prescriptions are flagged &quot;Expiring Soon&quot; after this many days</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Return-to-Stock Period (days)</Label>
                  <Input type="number" defaultValue="21" min="14" max="60" />
                  <p className="text-xs text-gray-500">Prescriptions are returned to stock after this many days</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Controlled Substance Hold (days)</Label>
                  <Input type="number" defaultValue="7" min="3" max="14" />
                  <p className="text-xs text-gray-500">Shorter hold period for CII–CIV substances</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Refrigerated Medication Hold (days)</Label>
                  <Input type="number" defaultValue="7" min="3" max="14" />
                  <p className="text-xs text-gray-500">For insulin, biologics, and other refrigerated items</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Expiry Notifications</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Patient Notification Method</Label>
                    <Select defaultValue="sms_email">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms_email">SMS + Email</SelectItem>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="none">No Notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Send Reminder (days before expiry)</Label>
                    <Input type="number" defaultValue="3" min="1" max="7" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save Will-Call Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SaveSuccessToast show={saved} />
    </div>
  );
}
