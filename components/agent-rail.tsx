"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStandardHoldDays } from "@/lib/settings-store";

interface AgentRailProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'copilot' | 'autopilot';
type ItemType = 'review' | 'info' | 'done';

// ── Copilot items ──────────────────────────────────────────────────────────────
interface CopilotItem {
  id: string;
  type: ItemType;
  timestamp: string;
  message: string;
  actions?: { label: string; variant: 'primary' | 'secondary'; href?: string }[];
}

function buildCopilotItems(holdDays: number): CopilotItem[] {
  return [
    {
      id: "c001",
      type: "review",
      timestamp: "11 min ago",
      message: "Fax OCR complete: Simmons, Harold — Hydrocodone/APAP 5/325mg. Confidence 94%. Prescriber DEA verified (BH5544332). Qty 30, 0 refills. Ready to auto-populate intake form — review before approving.",
      actions: [
        { label: "Review & Approve", variant: "primary" },
        { label: "Edit Fields", variant: "secondary" },
      ],
    },
    {
      id: "c002",
      type: "review",
      timestamp: "8 min ago",
      message: "Aetna rejected claim for O'Brien, Patricia — Lipitor 40mg. Rejection: Prior Authorization Required (#75). I've drafted the PA narrative f chart (hyperlipidemia, failed simvastatin trial). Ready to submit.",
      actions: [
        { label: "Review Draft", variant: "primary" },
        { label: "Dismiss", variant: "secondary" },
      ],
    },
    {
      id: "c003",
      type: "review",
      timestamp: "31 min ago",
      message: "12 patients have Rx refills eligible in the next 3 days. Estimated revenue: $340. Suggested outreach: SMS reminder to consented patients. 11 of 12 have TCPA consent on file.",
      actions: [
        { label: "View Refill Queue", variant: "primary", href: "/outreach?tab=refills" },
      ],
    },
    {
      id: "c004",
      type: "info",
      timestamp: "1 hr ago",
      message: `Will-Call: Foster, William — Metformin 500mg has been in bin 8 days. Auto-return to stock triggers at ${holdDays} days. Recommend SMS pickup reminder (TCPA consent on file).`,
      actions: [
        { label: "Send Reminder", variant: "primary" },
      ],
    },
    {
      id: "c005",
      type: "done",
      timestamp: "45 min ago",
      message: "Claim paid: Express Scripts approved Metformin HCl 500mg for Thompson, Margaret. Paid: $12.40. Patient copay: $4.80.",
    },
    {
      id: "c006",
      type: "done",
      timestamp: "2 hr ago",
      message: "Prior auth approved: Humana approved Januvia 100mg for Kim, Barbara. Valid 12 months. Auto-attached to patient record.",
    },
  ];
}

const leftBorder: Record<ItemType, string> = {
  review: 'border-l-amber-500',
  info:   'border-l-blue-400',
  done:   'border-l-green-500',
};

const badgeColor: Record<ItemType, string> = {
  review: 'text-amber-600',
  info:   'text-blue-500',
  done:   'text-green-600',
};

const badgeLabel: Record<ItemType, string> = {
  review: 'REVIEW',
  info:   'INFO',
  done:   'DONE',
};

function CopilotItemCard({ item }: { item: CopilotItem }) {
  return (
    <div
      className={cn(
        'border-l-4 rounded-r-lg px-3 py-2.5 mb-2',
        leftBorder[item.type],
        item.type === 'done' ? 'bg-transparent' : 'bg-white shadow-sm'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('text-[10px] font-bold uppercase tracking-wide', badgeColor[item.type])}>
          {badgeLabel[item.type]}
        </span>
        <span className="text-[10px] text-gray-400">{item.timestamp}</span>
      </div>
      <p className="text-xs text-gray-800 leading-relaxed">{item.message}</p>
      {item.actions && item.actions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.actions.map((action) => {
            const cls = cn(
              'h-7 px-2.5 rounded text-xs font-medium transition-colors',
              action.variant === 'primary'
                ? 'bg-[#7C3AED] text-white hover:bg-[#6d28d9]'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            );
            return action.href ? (
              <Link key={action.label} href={action.href} className={cls}>
                {action.label}
              </Link>
            ) : (
              <button key={action.label} className={cls}>
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Autopilot live feed ────────────────────────────────────────────────────────
interface LiveAction {
  patient: string;
  drug: string;
  timestamp: string;
  rule: string;
}

const liveActions: LiveAction[] = [
  { patient: "Carla Mendes",     drug: "Metformin 500mg",     timestamp: "Today 9:04 AM",  rule: "Refill threshold reached" },
  { patient: "James Okafor",     drug: "Amlodipine 5mg",      timestamp: "Today 9:11 AM",  rule: "Refill threshold reached" },
  { patient: "Rita Subramaniam", drug: "Lisinopril 10mg",     timestamp: "Today 9:17 AM",  rule: "Claim rejection auto-fix" },
  { patient: "Derek Huang",      drug: "Atorvastatin 40mg",   timestamp: "Today 9:23 AM",  rule: "Prior auth renewal" },
  { patient: "Sylvia Park",      drug: "Sertraline 50mg",     timestamp: "Today 9:31 AM",  rule: "Refill threshold reached" },
  { patient: "Tomás Rivera",     drug: "Omeprazole 20mg",     timestamp: "Today 9:45 AM",  rule: "Expiry alert — auto-reorder" },
  { patient: "Naomi Osei",       drug: "Levothyroxine 75mcg", timestamp: "Today 9:52 AM",  rule: "Refill threshold reached" },
  { patient: "Frank Castillo",   drug: "Gabapentin 300mg",    timestamp: "Today 10:01 AM", rule: "Claim rejection auto-fix" },
];

// ── Autopilot audit log ────────────────────────────────────────────────────────
interface AuditEntry {
  action: string;
  patient: string;
  drug: string;
  approvedBy: string;
  confirmedAt: string;
}

const auditLog: AuditEntry[] = [
  { action: "Refill approved",          patient: "Marcus Webb",  drug: "Lisinopril 10mg",   approvedBy: "R. Patel",  confirmedAt: "Today 8:47 AM" },
  { action: "Claim resubmitted",        patient: "Diane Foster", drug: "Atorvastatin 40mg", approvedBy: "J. Kim",    confirmedAt: "Today 8:53 AM" },
  { action: "Prior auth sent",          patient: "Leon Graves",  drug: "Humira 40mg/0.4mL", approvedBy: "A. Nguyen", confirmedAt: "Today 9:01 AM" },
  { action: "Refill reminder sent",     patient: "Priya Sharma", drug: "Metoprolol 25mg",   approvedBy: "Auto",      confirmedAt: "Today 9:04 AM" },
  { action: "Inventory reorder placed", patient: "—",            drug: "Amoxicillin 500mg",  approvedBy: "C. Brooks", confirmedAt: "Today 9:12 AM" },
];

function AutopilotView() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Live feed */}
      <div className="px-2 pt-3 pb-1">
        <div className="flex items-center gap-2 px-1 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Autopilot Active</span>
        </div>
        <p className="text-[10px] text-gray-400 px-1 mb-3">Autonomous actions taken this session</p>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Patient</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden sm:table-cell">Drug</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Time</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden md:table-cell">Rule</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveActions.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="px-2 py-2 text-gray-900 font-medium leading-tight">{row.patient}</td>
                  <td className="px-2 py-2 text-gray-600 hidden sm:table-cell leading-tight">{row.drug}</td>
                  <td className="px-2 py-2 text-gray-400 whitespace-nowrap leading-tight">{row.timestamp.replace('Today ', '')}</td>
                  <td className="px-2 py-2 text-gray-500 hidden md:table-cell leading-tight">{row.rule}</td>
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">
                      DONE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit log */}
      <div className="px-2 pt-4 pb-3">
        <div className="border-t border-gray-200 pt-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">Audit Log</p>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Action</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden sm:table-cell">Patient</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden sm:table-cell">Drug</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">By</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">At</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-2 py-2 text-gray-900 font-medium leading-tight">{entry.action}</td>
                    <td className="px-2 py-2 text-gray-600 hidden sm:table-cell leading-tight">{entry.patient}</td>
                    <td className="px-2 py-2 text-gray-500 hidden sm:table-cell leading-tight">{entry.drug}</td>
                    <td className={cn("px-2 py-2 leading-tight font-medium", entry.approvedBy === "Auto" ? "text-purple-600" : "text-gray-700")}>
                      {entry.approvedBy}
                    </td>
                    <td className="px-2 py-2 text-gray-400 whitespace-nowrap leading-tight">{entry.confirmedAt.replace('Today ', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rail ───────────────────────────────────────────────────────────────────────
export function AgentRail({ isOpen, onClose }: AgentRailProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[55] bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-[#FAFAF9] border-r border-gray-200">
        <AgentRailInner onClose={onClose} showClose={false} />
      </aside>

      <div className={cn(
        'fixed inset-y-0 right-0 z-[60] w-[85vw] max-w-sm flex flex-col bg-[#FAFAF9] border-l border-gray-200 shadow-xl transition-transform duration-200 ease-in-out md:hidden',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <AgentRailInner onClose={onClose} showClose={true} />
      </div>
    </>
  );
}

function AgentRailInner({
  onClose, showClose,
}: {
  onClose: () => void;
  showClose: boolean;
}) {
  const [mode, setMode] = useState<Mode>('copilot');
  const [holdDays, setHoldDays] = useState(10);

  useEffect(() => {
    setHoldDays(getStandardHoldDays());
  }, []);

  const copilotItems = buildCopilotItems(holdDays);

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm font-semibold text-gray-900">AI Copilot</span>
          </div>
          {showClose && (
            <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            onClick={() => setMode('copilot')}
            className={cn(
              'flex-1 py-1.5 font-medium transition-colors',
              mode === 'copilot'
                ? 'bg-[#7C3AED] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            )}
          >
            Copilot
          </button>
          <button
            onClick={() => setMode('autopilot')}
            className={cn(
              'flex-1 py-1.5 font-medium transition-colors',
              mode === 'autopilot'
                ? 'bg-[#7C3AED] text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            )}
          >
            Autopilot
          </button>
        </div>

        {mode === 'copilot' && (
          <p className="text-[11px] text-gray-400 mt-2">
            3 pending &middot; Copilot mode
          </p>
        )}
      </div>

      {/* Body */}
      {mode === 'copilot' ? (
        <>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {copilotItems.map((item) => (
              <CopilotItemCard key={item.id} item={item} />
            ))}
          </div>

        </>
      ) : (
        <AutopilotView />
      )}
    </>
  );
}
