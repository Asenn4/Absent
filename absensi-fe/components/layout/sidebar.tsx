"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LayoutDashboard, Users, FileText, CalendarCheck, ShieldCheck, LogOut, Camera, ScanFace } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white min-h-screen flex flex-col shadow-2xl transition-all duration-300 border-r border-blue-800 relative z-20">
      <div className="p-6 border-b border-blue-600/50 flex items-center gap-3">
        <div className="p-2 bg-yellow-400 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.5)]">
          <ShieldCheck className="w-6 h-6 text-blue-900" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Jetson <span className="text-yellow-400">Attend</span></h1>
      </div>
      <nav className="flex-1 py-8 flex flex-col gap-3 px-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm group relative overflow-hidden",
                isActive
                  ? "text-blue-900 bg-white shadow-md"
                  : "hover:bg-blue-600 hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110", 
                isActive ? "text-blue-700" : "text-blue-300 group-hover:text-white"
              )} />
              <span className={cn("relative z-10 font-bold")}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <Link 
        href={`/${user?.role || 'user'}/profile`} 
        onClick={onLinkClick}
        className="md:hidden p-4 border-t border-blue-600/50 flex items-center gap-3 bg-blue-800/30 hover:bg-blue-800 transition-colors"
      >
        <Avatar className="h-10 w-10 border-2 border-yellow-400">
          <AvatarImage src="" alt="@avatar" />
          <AvatarFallback className="bg-yellow-400 text-blue-900 font-bold">
            {user?.name?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white truncate max-w-[140px]">{user?.name}</span>
          <span className="text-xs text-blue-200 truncate max-w-[140px]">{user?.email}</span>
        </div>
      </Link>
      <div className="p-4 border-t border-blue-600/50">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl transition-all duration-300 font-bold text-sm text-blue-200 hover:bg-yellow-400 hover:text-blue-900 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)] group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
