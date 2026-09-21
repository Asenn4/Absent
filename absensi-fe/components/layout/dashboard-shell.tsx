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
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="relative z-50 w-64 h-full flex flex-col">
            <Sidebar onLinkClick={() => setIsMobileOpen(false)} />
            <button 
              className="absolute top-6 right-4 text-white hover:text-yellow-400 z-50 bg-blue-800/50 p-1 rounded-md"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopHeader onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
