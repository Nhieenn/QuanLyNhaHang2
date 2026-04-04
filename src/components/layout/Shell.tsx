"use client";

import React, { useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useUserStore();
  const isLoginPage = pathname === "/login";

  // Triển khai Auto-lock sau 30 phút (1,800,000ms)
  const IDLE_TIMEOUT = 30 * 60 * 1000;

  const handleIdle = useCallback(() => {
    if (isAuthenticated && !isLoginPage) {
      logout();
      router.push("/login");
    }
  }, [isAuthenticated, isLoginPage, logout, router]);

  useEffect(() => {
    if (isLoginPage) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleIdle, IDLE_TIMEOUT);
    };

    // Theo dõi các sự kiện tương tác
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Khởi tạo bộ đếm lần đầu
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoginPage, handleIdle, IDLE_TIMEOUT]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-surface">{children}</main>;
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col">
        <Header />
        <main className="mt-[80px] p-8 min-h-[calc(100vh-80px)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
