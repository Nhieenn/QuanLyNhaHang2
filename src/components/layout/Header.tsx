"use client";

import React from "react";
import { Search, Bell, UserCircle, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="h-[80px] bg-surface-container-low flex items-center justify-between px-8 fixed top-0 right-0 left-[240px] z-40 no-border-section">
      {/* Standard Header Layout (Matches Table Map - Ảnh 2) */}
      <div className="flex items-center gap-10">
        <div className="relative group bg-surface-container-highest px-6 py-3 rounded-xl flex items-center gap-4 transition-all w-[320px]">
          <Search className="text-outline/40 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search tables or guest..." 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface placeholder-on-surface/30 outline-none w-full"
          />
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-black text-on-surface font-display leading-tight">
            Monday, Oct 24
          </span>
          <span className="text-[10px] font-semibold text-outline font-display">
            12:45 PM • Shift #42
          </span>
        </div>
      </div>

      {/* Tools - Far Right */}
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface">
          <Bell size={28} strokeWidth={2.2} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface">
          <UserCircle size={32} strokeWidth={2} />
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface">
          <Settings size={28} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
