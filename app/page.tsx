"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("achen@riversidepharmacy.com");
  const [password, setPassword] = useState("••••••••");
  const [role, setRole] = useState("pharmacist");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#7C3AED]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#4c1d95]/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7C3AED] mb-4 shadow-lg shadow-purple-900/50">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Purposefill</h1>
          <p className="text-purple-200/70 text-sm mt-1">Pharmacy Management System</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-xl font-semibold text-gray-900">Pharmacy Staff Login</h2>
            <p className="text-sm text-gray-500">Sign in to access your pharmacy dashboard</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@pharmacy.com"
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Staff Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pharmacist">Pharmacist (RPh)</SelectItem>
                    <SelectItem value="technician">Pharmacy Technician</SelectItem>
                    <SelectItem value="owner">Owner / Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* MFA hint */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Multi-factor authentication is enabled. You&apos;ll receive a code via SMS or authenticator app after login.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-medium"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center">
                <button type="button" className="text-sm text-[#7C3AED] hover:text-[#6d28d9] hover:underline">
                  Forgot password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-purple-200/50 text-xs mt-6">
          HIPAA Compliant &bull; 256-bit AES Encryption &bull; SOC 2 Type II
        </p>
      </div>
    </div>
  );
}
