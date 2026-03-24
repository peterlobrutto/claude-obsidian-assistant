export type AgentEventType = 'urgent' | 'review' | 'completed' | 'info'

export interface AgentEvent {
  id: string
  type: AgentEventType
  message: string
  timestamp: string
  actions?: { label: string; variant: 'primary' | 'outline' | 'destructive' }[]
  read: boolean
  epic: 'fax_ocr' | 'claim_rejection' | 'refill_outreach'
}

// Epic 11 — AI Fax OCR Extraction (surfaces on Intake queue Fax items)
// Epic 12 — AI Claim Rejection Automation (surfaces on Claims page for rejected claims)
// Epic 13 — AI Predictive Refill Outreach (surfaces on Will-Call / Refill Management)

export const agentEvents: AgentEvent[] = [
  // ── Epic 11: Fax OCR ────────────────────────────────────────────────────────
  {
    id: 'ae011a',
    type: 'review',
    message: 'Fax OCR complete: Simmons, Harold — Hydrocodone/APAP 5/325mg. Confidence 94%. Prescriber DEA verified (BH5544332). Qty 30, 0 refills. Ready to auto-populate intake form — review before approving.',
    timestamp: '11 min ago',
    actions: [
      { label: 'Review & Approve', variant: 'primary' },
      { label: 'Edit Fields', variant: 'outline' },
    ],
    read: false,
    epic: 'fax_ocr',
  },
  // ── Epic 12: Claim Rejection Automation ─────────────────────────────────────
  {
    id: 'ae012a',
    type: 'review',
    message: "Aetna rejected claim for O'Brien, Patricia — Lipitor 40mg. Rejection: Prior Authorization Required (#75). I've drafted the PA narrative from her chart (hyperlipidemia, failed simvastatin trial). Ready to submit.",
    timestamp: '8 min ago',
    actions: [
      { label: 'Review Draft', variant: 'primary' },
      { label: 'Dismiss', variant: 'outline' },
    ],
    read: false,
    epic: 'claim_rejection',
  },
  {
    id: 'ae012b',
    type: 'completed',
    message: 'Claim paid: Express Scripts approved Metformin HCl 500mg for Thompson, Margaret. Paid: $12.40. Patient copay: $4.80.',
    timestamp: '45 min ago',
    actions: [],
    read: true,
    epic: 'claim_rejection',
  },
  {
    id: 'ae012c',
    type: 'completed',
    message: 'Prior auth approved: Humana approved Januvia 100mg for Kim, Barbara. Valid 12 months. Auto-attached to patient record.',
    timestamp: '2 hr ago',
    actions: [],
    read: true,
    epic: 'claim_rejection',
  },
  // ── Epic 13: Predictive Refill Outreach ─────────────────────────────────────
  {
    id: 'ae013a',
    type: 'review',
    message: '12 patients have Rx refills eligible in the next 3 days. Estimated revenue: $340. Suggested outreach: SMS reminder to consented patients. 11 of 12 have TCPA consent on file.',
    timestamp: '31 min ago',
    actions: [{ label: 'View Refill Queue', variant: 'primary' }],
    read: true,
    epic: 'refill_outreach',
  },
  {
    id: 'ae013b',
    type: 'info',
    message: 'Will-Call: Foster, William — Metformin 500mg has been in bin 8 days. Auto-return to stock triggers at 10 days. Recommend SMS pickup reminder (TCPA consent on file).',
    timestamp: '1 hr ago',
    actions: [{ label: 'Send Reminder', variant: 'primary' }],
    read: true,
    epic: 'refill_outreach',
  },
]
