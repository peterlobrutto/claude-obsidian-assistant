"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AgentRail } from "@/components/agent-rail";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  // On desktop, default agent rail open; on mobile, default closed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Desktop: agent rail is inline (always visible via CSS), no state needed
        setAgentOpen(false);
      }
    };
    handleResize();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <AgentRail isOpen={agentOpen} onClose={() => setAgentOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          onAgentToggle={() => setAgentOpen((v) => !v)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
