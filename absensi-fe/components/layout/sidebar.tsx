"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutDashboard, Users, FileText, CalendarCheck, LogOut, Camera, ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Data Master", href: "/admin/master-data", icon: Users },
  { name: "Verifikasi Wajah", href: "/admin/face-verification", icon: Camera },
  { name: "Log Global", href: "/admin/logs", icon: FileText },
  { name: "Terminal Kiosk", href: "/", icon: ScanFace },
];

const userLinks = [
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Riwayat Saya", href: "/user/history", icon: CalendarCheck },
  { name: "Daftar Wajah", href: "/user/face-registration", icon: Camera },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

export function Sidebar({ onLinkClick }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="w-56 bg-background border-r border-border min-h-screen flex flex-col relative z-20">
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <h1 className="text-sm font-semibold tracking-tight text-foreground font-mono">
          JETSON<span className="text-primary">_ATTEND</span>
        </h1>
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href) && link.href !== "/" || pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10 border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-border">
        <Link
          href={//profile}
          onClick={onLinkClick}
          className="flex items-center gap-2 px-2 py-1.5 mb-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-6 h-6 bg-muted border border-border flex items-center justify-center text-[10px] font-mono font-bold text-foreground">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <span className="truncate max-w-[120px] font-medium">{user?.name}</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-2 py-1.5 w-full text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
