"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, CheckCircle2, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps = {}) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "Absen Masuk Berhasil", desc: "Wajah Anda terverifikasi pada 07:45:12 AM.", time: "10 menit yang lalu", type: "success" },
    { id: 2, title: "Data Wajah Tersinkron", desc: "Sistem Jetson Nano telah diperbarui.", time: "1 jam yang lalu", type: "info" }
  ];

  return (
    <header className="h-16 mx-4 mt-4 mb-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100 shadow-[0_4px_24px_-8px_rgba(37,99,235,0.15)] flex items-center justify-between px-6 sticky top-4 z-50 transition-all duration-300">
      <div className="flex items-center">
        <h2 className="text-xl font-extrabold text-blue-900 tracking-tight">
          {user?.role === "admin" ? "Portal Admin" : "Portal Pengguna"}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2.5 text-blue-600 hover:text-blue-800 transition-all duration-300 rounded-xl hover:bg-blue-50 shadow-sm hover:shadow-md"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-[100]">
              <div className="px-4 py-3 border-b border-blue-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-blue-900">Notifikasi</h3>
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">2 Baru</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer flex gap-3">
                    <div className="mt-1 flex-shrink-0">
                      {notif.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                      <p className="text-[10px] font-bold text-blue-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Tandai semua dibaca</button>
              </div>
            </div>
          )}
        </div>

        <Link href={`/${user?.role || 'user'}/profile`} className="hidden md:flex items-center gap-4 pl-6 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-blue-900 leading-none group-hover:text-blue-700 transition-colors">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {user?.role === 'admin' ? 'Administrator' : 'Siswa'}
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <Avatar className="relative h-10 w-10 border-2 border-yellow-400 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src="" alt="@avatar" />
              <AvatarFallback className="bg-gradient-to-br from-blue-700 to-blue-800 text-white font-bold">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </Link>
        
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
