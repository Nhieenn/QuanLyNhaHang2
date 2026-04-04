"use client";

import React from "react";
import { X, Volume2, VolumeX, Globe, Settings, Terminal } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { language, setLanguage, notificationsEnabled, toggleNotifications } = useSettingsStore();
  const t = translations[language].settings;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-[480px] rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95 duration-500 overflow-hidden no-border-section">
        {/* Dynamic Background decoration */}
        <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface hover:rotate-90 transition-all duration-300"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <Settings size={32} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{t.title}</h3>
                <p className="text-xs font-bold text-outline uppercase tracking-widest">{t.subtitle}</p>
            </div>
        </div>

        <div className="space-y-8">
            {/* Appearance Section Removed Per User Request */}

            {/* Section: Language */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                   <h4 className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">{t.language}</h4>
                   <Globe size={14} className="text-outline" />
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setLanguage("vi")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm transition-all border-2",
                            language === "vi" ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-low text-outline border-transparent"
                        )}
                    >
                        <span>VN</span>
                        <span>Tiếng Việt</span>
                    </button>
                    <button 
                        onClick={() => setLanguage("en")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm transition-all border-2",
                            language === "en" ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-low text-outline border-transparent"
                        )}
                    >
                        <span>EN</span>
                        <span>English</span>
                    </button>
                </div>
            </section>

            {/* Section: Sound */}
            <section>
                <h4 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4">{t.notifications}</h4>
                <button 
                    onClick={toggleNotifications}
                    className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl transition-all",
                        notificationsEnabled ? "bg-primary/10 text-primary" : "bg-surface-container-low text-outline"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {notificationsEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                        <span className="text-sm font-black">{t.soundEnabled}</span>
                    </div>
                    <div className={cn(
                        "w-12 h-6 rounded-full relative transition-colors duration-300",
                        notificationsEnabled ? "bg-primary" : "bg-outline/30"
                    )}>
                        <div className={cn(
                             "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
                             notificationsEnabled ? "translate-x-6" : ""
                        )} />
                    </div>
                </button>
            </section>
        </div>

        {/* Footer: Version */}
        <div className="mt-10 pt-6 border-t border-surface-container flex justify-between items-center opacity-40">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase">{t.version} 0.1.0-alpha</span>
            </div>
            <p className="text-[10px] font-bold">Elevated POS</p>
        </div>
      </div>
    </div>
  );
}
