"use client";

import { useState } from "react";
import { Sparkles, Mic, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentEvents, type AgentEvent } from "@/lib/agent-data";
import { Button } from "@/components/ui/button";

interface AgentRailProps {
  isOpen: boolean;
  onClose: () => void;
}

const typePriority: Record<AgentEvent['type'], number> = {
  urgent: 0,
  review: 1,
  info: 2,
  completed: 3,
};

const leftBorderColor: Record<AgentEvent['type'], string> = {
  urgent: 'border-l-red-500',
  review: 'border-l-amber-500',
  completed: 'border-l-green-500',
  info: 'border-l-blue-400',
};

const typeLabelColor: Record<AgentEvent['type'], string> = {
  urgent: 'text-red-600',
  review: 'text-amber-600',
  completed: 'text-green-600',
  info: 'text-blue-500',
};

const typeLabel: Record<AgentEvent['type'], string> = {
  urgent: 'URGENT',
  review: 'REVIEW',
  completed: 'DONE',
  info: 'INFO',
};

function AgentEventCard({ event }: { event: AgentEvent }) {
  return (
    <div
      className={cn(
        'border-l-4 rounded-r-lg px-3 py-2.5 mb-2',
        leftBorderColor[event.type],
        event.read ? 'bg-transparent' : 'bg-white shadow-sm'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn('text-[10px] font-bold uppercase tracking-wide', typeLabelColor[event.type])}>
          {typeLabel[event.type]}
        </span>
        <span className="text-[10px] text-gray-400">{event.timestamp}</span>
      </div>
      <p className="text-xs text-gray-800 leading-relaxed">{event.message}</p>
      {event.actions && event.actions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {event.actions.map((action) => (
            <button
              key={action.label}
              className={cn(
                'h-7 px-2.5 rounded text-xs font-medium transition-colors',
                action.variant === 'primary'
                  ? 'bg-[#7C3AED] text-white hover:bg-[#6d28d9]'
                  : action.variant === 'destructive'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AgentRail({ isOpen, onClose }: AgentRailProps) {
  const [mode, setMode] = useState<'Copilot' | 'Autopilot'>('Copilot');
  const [inputValue, setInputValue] = useState('');

  const sortedEvents = [...agentEvents].sort(
    (a, b) => typePriority[a.type] - typePriority[b.type]
  );

  const pendingCount = agentEvents.filter(
    (e) => e.type === 'urgent' || e.type === 'review'
  ).length;

  const unreadCount = agentEvents.filter((e) => !e.read).length;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Rail panel */}
      <aside
        className={cn(
          // Base
          'flex flex-col bg-[#FAFAF9] border-r border-gray-200',
          // Desktop: inline, always visible
          'hidden md:flex w-72 shrink-0',
        )}
      >
        <AgentRailInner
          mode={mode}
          setMode={setMode}
          sortedEvents={sortedEvents}
          pendingCount={pendingCount}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onClose={onClose}
          showClose={false}
        />
      </aside>

      {/* Mobile drawer from right */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-80 flex flex-col bg-[#FAFAF9] border-l border-gray-200 transition-transform duration-200 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <AgentRailInner
          mode={mode}
          setMode={setMode}
          sortedEvents={sortedEvents}
          pendingCount={pendingCount}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onClose={onClose}
          showClose={true}
        />
      </div>
    </>
  );
}

function AgentRailInner({
  mode,
  setMode,
  sortedEvents,
  pendingCount,
  inputValue,
  setInputValue,
  onClose,
  showClose,
}: {
  mode: 'Copilot' | 'Autopilot';
  setMode: (m: 'Copilot' | 'Autopilot') => void;
  sortedEvents: AgentEvent[];
  pendingCount: number;
  inputValue: string;
  setInputValue: (v: string) => void;
  onClose: () => void;
  showClose: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-sm font-semibold text-gray-900">AI Copilot</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex rounded-full overflow-hidden border border-gray-200 text-xs">
              <button
                onClick={() => setMode('Copilot')}
                className={cn(
                  'px-2.5 py-1 font-medium transition-colors',
                  mode === 'Copilot'
                    ? 'bg-amber-400 text-amber-900'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                )}
              >
                Copilot
              </button>
              <button
                onClick={() => setMode('Autopilot')}
                className={cn(
                  'px-2.5 py-1 font-medium transition-colors',
                  mode === 'Autopilot'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                )}
              >
                Autopilot
              </button>
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          12 actions today &middot; {pendingCount} pending
        </p>
      </div>

      {/* Event feed */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sortedEvents.map((event) => (
          <AgentEventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-gray-200 px-2 py-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask the agent..."
            className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7C3AED] focus:border-[#7C3AED]"
          />
          <button className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-[#7C3AED] text-white hover:bg-[#6d28d9] transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">Voice &bull; Text</p>
      </div>
    </>
  );
}
