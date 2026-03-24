"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/patients": { label: "Patients" },
  "/patients/new": { label: "New Patient", parent: "/patients" },
  "/prescriptions": { label: "Prescriptions" },
  "/prescriptions/new": { label: "New Prescription", parent: "/prescriptions" },
  "/will-call": { label: "Will-Call" },
  "/claims": { label: "Claims" },
  "/pos": { label: "POS / Checkout" },
  "/reports": { label: "Reports" },
  "/inventory": { label: "Inventory" },
  "/settings": { label: "Settings" },
};

interface AppHeaderProps {
  onMenuToggle: () => void;
  onAgentToggle: () => void;
}

export function AppHeader({ onMenuToggle, onAgentToggle }: AppHeaderProps) {
  const pathname = usePathname();

  let crumbs: { label: string; href: string }[] = [{ label: "Home", href: "/dashboard" }];
  const current = breadcrumbMap[pathname];
  if (current) {
    if (current.parent) {
      const parent = breadcrumbMap[current.parent];
      if (parent) crumbs.push({ label: parent.label, href: current.parent });
    }
    crumbs.push({ label: current.label, href: pathname });
  } else if (pathname.startsWith("/patients/")) {
    crumbs.push({ label: "Patients", href: "/patients" });
    crumbs.push({ label: "Patient Detail", href: pathname });
  }

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
              {i < crumbs.length - 1 ? (
                <Link href={crumb.href} className="hover:text-gray-900 transition-colors hidden sm:inline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-sm text-gray-500 font-medium hidden lg:inline">Riverside Pharmacy</span>

        {/* Agent toggle button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAgentToggle}
            className="gap-1.5 text-gray-600 hover:text-[#7C3AED] hover:bg-purple-50 md:hidden"
            aria-label="Toggle AI Agent"
          >
            <Sparkles className="w-4 h-4" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAgentToggle}
            className="gap-1.5 text-gray-600 hover:text-[#7C3AED] hover:bg-purple-50 hidden md:flex"
            aria-label="Toggle AI Agent"
          >
            <Sparkles className="w-4 h-4" size={16} />
            <span className="text-sm font-medium">Agent</span>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-semibold">
                  AC
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight">Dr. Amanda Chen</p>
                <p className="text-[11px] text-gray-500 leading-tight">Pharmacist</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Sign Out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
