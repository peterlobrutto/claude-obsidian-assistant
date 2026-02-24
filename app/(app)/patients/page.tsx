"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockPatients } from "@/lib/mock-data";

type SortField = "name" | "dob" | "phone" | "insurance" | "lastRxDate";
type SortDir = "asc" | "desc";

function formatDOB(dob: string) {
  const d = new Date(dob + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  if (field !== current) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 inline ml-1" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-[#7C3AED] inline ml-1" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED] inline ml-1" />;
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = mockPatients
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.dob.includes(q)
      );
    })
    .sort((a, b) => {
      let aVal = "";
      let bVal = "";
      if (sortField === "name") {
        aVal = `${a.lastName} ${a.firstName}`;
        bVal = `${b.lastName} ${b.firstName}`;
      } else if (sortField === "dob") {
        aVal = a.dob;
        bVal = b.dob;
      } else if (sortField === "phone") {
        aVal = a.phone;
        bVal = b.phone;
      } else if (sortField === "insurance") {
        aVal = a.insurance.primary.name;
        bVal = b.insurance.primary.name;
      } else if (sortField === "lastRxDate") {
        aVal = a.lastRxDate;
        bVal = b.lastRxDate;
      }
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mockPatients.length} patients on file</p>
        </div>
        <Button className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white gap-2">
          <Plus className="w-4 h-4" />
          New Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, date of birth, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {search && (
              <p className="text-sm text-gray-500">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-t border-gray-200">
                <TableHead
                  className="cursor-pointer select-none pl-5 font-semibold text-gray-700 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort("name")}
                >
                  Patient Name <SortIcon field="name" current={sortField} dir={sortDir} />
                </TableHead>
                <TableHead
                  className="hidden sm:table-cell cursor-pointer select-none font-semibold text-gray-700 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort("dob")}
                >
                  Date of Birth <SortIcon field="dob" current={sortField} dir={sortDir} />
                </TableHead>
                <TableHead
                  className="hidden sm:table-cell cursor-pointer select-none font-semibold text-gray-700 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort("phone")}
                >
                  Phone <SortIcon field="phone" current={sortField} dir={sortDir} />
                </TableHead>
                <TableHead
                  className="hidden md:table-cell cursor-pointer select-none font-semibold text-gray-700 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort("insurance")}
                >
                  Primary Insurance <SortIcon field="insurance" current={sortField} dir={sortDir} />
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-gray-700 text-xs uppercase tracking-wide">
                  Conditions
                </TableHead>
                <TableHead
                  className="hidden lg:table-cell cursor-pointer select-none font-semibold text-gray-700 text-xs uppercase tracking-wide"
                  onClick={() => toggleSort("lastRxDate")}
                >
                  Last Rx <SortIcon field="lastRxDate" current={sortField} dir={sortDir} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-purple-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="pl-5">
                    <Link href={`/patients/${patient.id}`} className="block">
                      <span className="font-medium text-gray-900">
                        {patient.lastName}, {patient.firstName}
                      </span>
                      <span className="text-xs text-gray-400 sm:hidden block mt-0.5">{patient.phone}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-600 text-sm">
                    <Link href={`/patients/${patient.id}`} className="block">
                      {formatDOB(patient.dob)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-600 text-sm">
                    <Link href={`/patients/${patient.id}`} className="block">
                      {patient.phone}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/patients/${patient.id}`} className="block">
                      <span className="text-sm text-gray-700">{patient.insurance.primary.name}</span>
                      {patient.insurance.secondary && (
                        <span className="text-xs text-gray-400 block">+ Secondary</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Link href={`/patients/${patient.id}`} className="block">
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.slice(0, 2).map((c) => (
                          <Badge key={c} variant="secondary" className="text-[11px] px-1.5 py-0 font-normal">
                            {c}
                          </Badge>
                        ))}
                        {patient.conditions.length > 2 && (
                          <Badge variant="secondary" className="text-[11px] px-1.5 py-0 font-normal">
                            +{patient.conditions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-600 text-sm">
                    <Link href={`/patients/${patient.id}`} className="block">
                      {new Date(patient.lastRxDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
