"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { X } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileOpen(false)} />
          <div className="relative z-50 w-56 h-full flex flex-col">
            <Sidebar onLinkClick={() => setIsMobileOpen(false)} />
            <button
              className="absolute top-4 right-3 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopHeader onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
