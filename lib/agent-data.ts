export type AgentEventType = 'urgent' | 'review' | 'completed' | 'info'

export interface AgentEvent {
  id: string
  type: AgentEventType
  message: string
  timestamp: string
  actions?: { label: string; variant: 'primary' | 'outline' | 'destructive' }[]
  read: boolean
}

export const agentEvents: AgentEvent[] = [
  {
    id: 'ae001',
    type: 'urgent',
    message: '3 new e-scripts received. 2 auto-queued for filling. 1 needs review: Hydrocodone/APAP 5-325mg for Thompson, Margaret — last fill was 22 days ago on a 30-day supply.',
    timestamp: '2 min ago',
    actions: [{ label: 'Review Rx', variant: 'primary' }],
    read: false,
  },
  {
    id: 'ae002',
    type: 'review',
    message: "Aetna rejected claim for O'Brien, Patricia — Lipitor 40mg. Rejection: Prior Authorization Required (#75). I've drafted the PA narrative from her chart (hyperlipidemia, failed simvastatin trial). Ready to submit.",
    timestamp: '8 min ago',
    actions: [
      { label: 'Review Draft', variant: 'primary' },
      { label: 'Dismiss', variant: 'outline' },
    ],
    read: false,
  },
  {
    id: 'ae003',
    type: 'urgent',
    message: 'DUR Alert: Sertraline 100mg (active) + new Tramadol 50mg Rx for Nguyen, Charles. Risk: Serotonin syndrome (HIGH). Source: FDB MedKnowledge. Recommend alternative analgesic or enhanced monitoring. Pharmacist override required.',
    timestamp: '14 min ago',
    actions: [{ label: 'Review Alert', variant: 'primary' }],
    read: false,
  },
  {
    id: 'ae004',
    type: 'review',
    message: 'Inventory: Amoxicillin 500mg capsules (NDC 00093-4155-78) below reorder point — 48 caps on hand, par is 200. McKesson has stock at $0.18/cap, estimated delivery tomorrow AM.',
    timestamp: '22 min ago',
    actions: [
      { label: 'Auto-Order', variant: 'primary' },
      { label: 'Adjust', variant: 'outline' },
    ],
    read: false,
  },
  {
    id: 'ae005',
    type: 'review',
    message: '12 patients have Rx refills eligible today. Estimated revenue: $340. Ready to batch-queue for filling.',
    timestamp: '31 min ago',
    actions: [{ label: 'View Queue', variant: 'primary' }],
    read: true,
  },
  {
    id: 'ae006',
    type: 'completed',
    message: 'Claim paid: Express Scripts approved Metformin HCl 500mg for Thompson, Margaret. Paid: $12.40. Patient copay: $4.80.',
    timestamp: '45 min ago',
    actions: [],
    read: true,
  },
  {
    id: 'ae007',
    type: 'info',
    message: 'PDMP check complete: Rivera, James — no flags. Controlled substance history reviewed for TX PDMP. Cleared for dispensing.',
    timestamp: '1 hr ago',
    actions: [],
    read: true,
  },
  {
    id: 'ae008',
    type: 'completed',
    message: 'Prior auth approved: Humana approved Januvia 100mg for Kim, Barbara. Valid 12 months. Auto-attached to patient record.',
    timestamp: '2 hr ago',
    actions: [],
    read: true,
  },
]
