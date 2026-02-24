"use client";

import { useState } from "react";
import { Search, CreditCard, DollarSign, ShoppingCart, Receipt, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockPatients, mockWillCallItems } from "@/lib/mock-data";
import type { Patient } from "@/lib/mock-data";

const paymentMethods = [
  { id: "credit", label: "Credit / Debit", icon: CreditCard },
  { id: "cash", label: "Cash", icon: DollarSign },
  { id: "fsa", label: "FSA / HSA", icon: CreditCard },
  { id: "check", label: "Check", icon: Receipt },
];

export default function POSPage() {
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const filteredPatients = patientSearch.length > 1
    ? mockPatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch)
      ).slice(0, 5)
    : [];

  // Get will-call items for selected patient (simulated)
  const lineItems = selectedPatient
    ? mockWillCallItems.filter(i =>
        i.patientName === `${selectedPatient.firstName} ${selectedPatient.lastName}` &&
        i.status !== "return_to_stock"
      ).map(i => ({ ...i, selected: true }))
    : [];

  const total = lineItems.reduce((sum, i) => sum + i.copay, 0);
  const tax = 0; // Rx typically no tax
  const totalDue = total + tax;

  const handleProcessPayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setProcessed(true);
  };

  const handleNewTransaction = () => {
    setProcessed(false);
    setSelectedPatient(null);
    setPatientSearch("");
  };

  if (processed) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">POS / Checkout</h1>
        <Card className="border border-green-200 bg-green-50 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Payment Processed Successfully</h2>
            <p className="text-green-700 mb-1">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
            <p className="text-green-700 font-semibold text-lg">${totalDue.toFixed(2)} — {paymentMethods.find(m => m.id === paymentMethod)?.label}</p>
            <p className="text-xs text-green-600 mt-3">Transaction ID: TXN-{Date.now()}</p>

            <div className="mt-6 p-4 bg-white rounded-lg border border-green-200 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Receipt</p>
              {lineItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.drug}</p>
                    <p className="text-xs text-gray-400">{item.rxNumber}</p>
                  </div>
                  <span className="text-gray-700">${item.copay.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-300">
                <span>Total Paid</span>
                <span>${totalDue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 gap-2">
                <Receipt className="w-4 h-4" />
                Print Receipt
              </Button>
              <Button
                className="flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
                onClick={handleNewTransaction}
              >
                New Transaction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">POS / Checkout</h1>
        <p className="text-sm text-gray-500 mt-0.5">Process copay collections at the point of sale</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Patient Lookup + Line Items */}
        <div className="col-span-2 space-y-4">
          {/* Patient Lookup */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-base font-semibold text-gray-900">Patient Lookup</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patient by name or phone..."
                  value={patientSearch}
                  onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); }}
                  className="pl-9"
                />
              </div>

              {filteredPatients.length > 0 && !selectedPatient && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {filteredPatients.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPatient(p); setPatientSearch(`${p.firstName} ${p.lastName}`); }}
                      className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                    >
                      <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-gray-500">{p.phone} &bull; DOB: {p.dob}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-purple-900 text-sm">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p className="text-xs text-purple-700">{selectedPatient.phone} &bull; {selectedPatient.insurance.primary.name}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setSelectedPatient(null); setPatientSearch(""); }}
                    className="h-7 w-7 p-0 text-purple-600 hover:bg-purple-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Prescriptions
                </CardTitle>
                {lineItems.length > 0 && (
                  <Badge className="bg-[#7C3AED] text-white">{lineItems.length} item{lineItems.length !== 1 ? "s" : ""}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {!selectedPatient ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a patient to load their prescriptions</p>
                </div>
              ) : lineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No prescriptions ready for pickup</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-200 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.drug}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.rxNumber}</p>
                        <Badge className="mt-1 text-xs bg-green-100 text-green-700 border-green-200">Ready</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">${item.copay.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">Copay</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="space-y-4">
          <Card className="border border-gray-200 shadow-sm sticky top-4">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-base font-semibold text-gray-900">Payment</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {/* Payment Method */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors ${
                          paymentMethod === method.id
                            ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                {lineItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[130px]">{item.drug}</span>
                    <span className="text-gray-900 font-medium">${item.copay.toFixed(2)}</span>
                  </div>
                ))}
                {lineItems.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No items</p>
                )}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Due</span>
                  <span>${totalDue.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white h-11 text-base font-semibold gap-2"
                disabled={lineItems.length === 0 || processing}
                onClick={handleProcessPayment}
              >
                {processing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Process Payment
                  </>
                )}
              </Button>

              {lineItems.length > 0 && (
                <p className="text-xs text-center text-gray-400">
                  Payment via {paymentMethods.find(m => m.id === paymentMethod)?.label}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
