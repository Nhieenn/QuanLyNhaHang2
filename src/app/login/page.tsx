"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PinPad } from "@/components/auth/PinPad";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUserStore } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useUserStore();
  const { language } = useSettingsStore();
  const [error, setError] = useState(false);
  const t = translations[language];

  const handleLogin = async (pin: string) => {
    const success = await login(pin);
    if (success) {
      router.push("/table-map");
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar - Identical layout to working screens */}
      <div className="pointer-events-none">
        <Sidebar />
      </div>

      {/* Login Area */}
      <main className="flex-1 ml-[240px] flex items-center justify-center relative p-8">
        {/* Dynamic Background elements consistent with theme */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-brand-coral/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 w-full flex justify-center">
            <PinPad 
                onSuccess={handleLogin}
                error={error}
                title={t.loginPage.title}
                subtitle={t.loginPage.subtitle}
            />
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-on-surface">{t.loginPage.branding}</p>
        </div>
      </main>
    </div>
  );
}
