"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { usePathname } from "next/navigation";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

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
