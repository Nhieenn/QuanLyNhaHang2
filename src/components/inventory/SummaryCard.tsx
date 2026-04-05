"use client";

import React from "react";
import { AlertCircle, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface SummaryCardProps {
  type: "low-stock" | "assets" | "wastage";
  value: string | number;
  label: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SummaryCard({ type, value, label, subtitle, actionLabel, onAction }: SummaryCardProps) {
  const { language } = useSettingsStore();
  const t = translations[language].inventoryPage;

  const isLowStock = type === "low-stock";
  const isAssets = type === "assets";
  const isWastage = type === "wastage";

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-[32px] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-ambient group min-h-[180px]",
        isLowStock && "bg-brand-coral text-on-coral",
        isAssets && "bg-white text-on-surface border border-surface-container-low",
        isWastage && "bg-primary-container text-on-primary-container"
      )}
    >
      {/* Top Row: Icon & Tag */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
          isLowStock && "bg-on-coral/10",
          isAssets && "bg-primary/10 text-primary",
          isWastage && "bg-on-primary-container/10"
        )}>
          {isLowStock && <AlertCircle size={24} />}
          {isAssets && <DollarSign size={24} />}
          {isWastage && <TrendingDown size={24} />}
        </div>
        
        {isLowStock && (
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            {t.criticalStock}
          </span>
        )}
        {isAssets && (
          <span className="text-[10px] font-black uppercase tracking-widest text-outline">
            {t.currentAssets}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-auto">
        <div className="flex items-baseline gap-1">
          <h2 className={cn(
            "text-5xl font-black tracking-tight leading-none",
            isAssets && "text-on-surface"
          )}>
            {value}
          </h2>
        </div>
        <p className={cn(
          "text-sm font-bold mt-2",
          isLowStock && "text-on-coral/70",
          isAssets && "text-outline",
          isWastage && "text-on-primary-container/70"
        )}>
          {label}
        </p>
        
        {isWastage && subtitle && (
          <p className="text-xs font-medium mt-3 leading-relaxed opacity-80 max-w-[200px]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Button for Wastage */}
      {isWastage && actionLabel && (
        <button 
          onClick={onAction}
          className="mt-6 w-fit bg-on-primary-container/10 hover:bg-on-primary-container/20 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}

      {/* Decorative Background Elements */}
      {isWastage && (
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
           <svg width="160" height="160" viewBox="0 0 160 160" fill="currentColor">
              <rect x="80" y="80" width="80" height="80" rx="20" />
              <rect x="40" y="40" width="40" height="40" rx="10" />
           </svg>
        </div>
      )}
    </div>
  );
}
