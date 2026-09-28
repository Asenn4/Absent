"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Menu } from "lucide-react";

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps = {}) {
  const { user } = useAuth();

  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {user?.role === "admin" ? "admin" : "user"} / panel
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={//profile}
          className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">{user?.name}</span>
          <div className="w-6 h-6 bg-muted border border-border flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}
