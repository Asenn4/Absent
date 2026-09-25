"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextProps {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from cookie on mount or pathname change
  const refreshUser = useCallback(() => {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_role='));
    const userCookie = cookies.find(c => c.trim().startsWith('user_id='));
    
    if (authCookie && userCookie) {
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser({
              id: data.user.id,
              name: data.user.nama,
              email: data.user.email,
              role: data.user.role
            });
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser, pathname]);

  // Use useLayoutEffect on client to prevent flashing of cached pages before redirect
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  // Client-side route protection (catches bfcache / manual URL entry / cached history)
  useIsomorphicLayoutEffect(() => {
    // Halaman "/" adalah Kiosk Publik: siapa saja boleh mengaksesnya
    if (pathname === "/") {
      return;
    }

    // Re-verify cookie on client to bypass any React state caching (BFCache)
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth_role='));
    const roleValue = authCookie ? authCookie.split('=')[1] : null;

    // Jika tidak ada cookie auth, hanya halaman login atau register yang boleh dibuka
    if (!roleValue) {
      if (pathname !== "/login" && !pathname.startsWith("/register")) {
        window.location.replace("/login");
      }
      return;
    }

    // Jika memiliki cookie auth dan berada di halaman login/register, alihkan ke dashboard masing-masing
    if (pathname === "/login" || pathname.startsWith("/register")) {
      router.replace(`/${roleValue}/dashboard`);
    } else if (roleValue === "user" && pathname.startsWith("/admin")) {
      router.replace("/user/dashboard");
    } else if (roleValue === "admin" && pathname.startsWith("/user")) {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  // Force hard refresh on Back/Forward browser navigation to prevent BFCache leakage
  useEffect(() => {
    const handlePopState = () => {
      // Re-check authentication when navigating back/forward
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('auth_role='));
      if (!authCookie && pathname !== "/" && pathname !== "/login" && !pathname.startsWith("/register")) {
        window.location.replace("/login");
      } else {
        window.location.reload();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [pathname]);

  const login = (role: Role) => {
    document.cookie = `auth_role=${role}; path=/; max-age=86400`;
    window.location.replace(`/${role}/dashboard`);
  };

  const logout = async () => {
    // Remove cookies
    document.cookie = "auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}

    setUser(null);
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
