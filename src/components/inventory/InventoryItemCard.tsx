"use client";

import React from "react";
import { Plus, Coffee, Milk, Droplets, Egg, Beef, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export type InventoryStatus = "healthy" | "warning" | "critical";

interface InventoryItemCardProps {
  name: string;
  category: string;
  value: string | number;
  unit: string;
  percentage: number;
  status: InventoryStatus;
  image?: string;
  icon?: React.ReactNode;
  isAddPlaceholder?: boolean;
  onClick?: () => void;
}

export function InventoryItemCard({
  name,
  category,
  value,
  unit,
  percentage,
  status,
  image,
  icon,
  isAddPlaceholder,
  onClick
}: InventoryItemCardProps) {
  if (isAddPlaceholder) {
    return (
      <button 
        onClick={onClick}
        className="group relative h-[220px] rounded-[32px] border-2 border-dashed border-surface-container-highest flex flex-col items-center justify-center gap-4 transition-all hover:bg-white hover:border-primary/30 hover:shadow-ambient"
      >
        <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-primary transition-all duration-300">
          <Plus size={28} />
        </div>
        <span className="text-sm font-black text-outline group-hover:text-on-surface transition-colors">
          Track New Ingredient
        </span>
      </button>
    );
  }

  const isHealthy = status === "healthy";
  const isWarning = status === "warning";
  const isCritical = status === "critical";

  return (
    <div className="group h-[220px] bg-white rounded-[32px] p-6 shadow-sm border border-surface-container-low transition-all duration-300 hover:shadow-ambient flex flex-col justify-between">
      {/* Header: Image & Info */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low overflow-hidden flex items-center justify-center text-outline/40">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="group-hover:scale-110 transition-transform duration-500 text-primary/40">
                 {icon || <Leaf size={24} />}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-on-surface leading-tight tracking-tight">{name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-outline">{category}</span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-black text-on-surface tracking-tighter leading-none">{value}</p>
          <span className="text-[10px] font-black uppercase tracking-widest text-outline">{unit}</span>
        </div>
      </div>

      {/* Footer: Progress & Status */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
           <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/40">STOCK LEVEL</span>
           <span className={cn(
             "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
             isHealthy && "text-primary",
             isWarning && "text-brand-gold",
             isCritical && "text-brand-coral"
           )}>
             {percentage}% {status.charAt(0).toUpperCase() + status.slice(1)}
           </span>
        </div>
        
        <div className="relative h-2 bg-surface-container-low rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute left-0 top-0 h-full transition-all duration-1000 ease-out rounded-full",
              isHealthy && "bg-primary",
              isWarning && "bg-brand-gold",
              isCritical && "bg-brand-coral"
            )}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
