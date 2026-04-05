"use client";

import React from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableStore, Table } from "@/store/tableStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTableId: string | null;
  onSelect: (tableId: string | null) => void;
  selectedDate: string;
  selectedTime: string;
}

export function TablePickerModal({ isOpen, onClose, selectedTableId, onSelect, selectedDate, selectedTime }: TablePickerModalProps) {
  const { floors, reservations } = useTableStore();
  const { language } = useSettingsStore();
  const t = translations[language].reservationsPage.tablePicker;
  const tableMapT = translations[language].tableMapPage;

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isTargetingToday = selectedDate === todayStr;

  // Render only 3 main areas (Exclude Takeaway/Direct Orders)
  const displayFloors = floors.filter(f => f.name !== "Direct Orders");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[650px] max-h-[85vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 no-border-section">
        {/* Header */}
        <div className="p-10 pb-6 border-b border-surface-container flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black text-on-surface tracking-tight leading-none text-center sm:text-left">{t.title}</h3>
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mt-3">{t.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-10 custom-scrollbar">
          
          {/* Unassigned Option */}
          <div 
            onClick={() => { onSelect(null); onClose(); }}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
              selectedTableId === null ? "bg-[#006a67]/5 border-[#006a67] shadow-sm" : "bg-surface-container-low border-transparent hover:border-outline/20"
            )}
          >
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-on-surface">{t.unassigned}</h4>
              <p className="text-[10px] font-bold text-outline mt-1 italic">{t.unassignedTip}</p>
            </div>
            {selectedTableId === null && <div className="w-8 h-8 rounded-full bg-[#006a67] text-white flex items-center justify-center"><Check size={18} strokeWidth={3} /></div>}
          </div>

          {/* Grouped Areas */}
          {displayFloors.map((floor) => (
            <div key={floor.name} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-outline/40 tracking-[0.2em] uppercase whitespace-nowrap">{(tableMapT.floors as any)[floor.name.replace(" ", "").toLowerCase()] || floor.name}</span>
                <div className="h-[1px] flex-1 bg-surface-container" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {floor.tables.map((table) => {
                  const isSelected = selectedTableId === table.id;
                  
                  // Logic 1: Existing reservation at this specific time
                  const hasReservation = reservations.some(r => 
                    r.tableId === table.id && 
                    r.date === selectedDate && 
                    r.time === selectedTime &&
                    r.status !== "cancelled"
                  );

                  // Logic 2: Table is currently in use (Only matters if booking for today)
                  const isCurrentlyInUse = isTargetingToday && table.status !== "empty";

                  const isUnavailable = (hasReservation || isCurrentlyInUse) && !isSelected;

                  return (
                    <button
                      key={table.id}
                      disabled={isUnavailable}
                      onClick={() => {
                        onSelect(table.id);
                        onClose();
                      }}
                      className={cn(
                        "relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                        isSelected 
                          ? "bg-brand-coral/10 border-brand-coral shadow-lg scale-105 z-10" 
                          : isUnavailable 
                            ? "bg-surface-container-highest/20 border-transparent opacity-40 cursor-not-allowed" 
                            : "bg-white border-surface-container-low hover:border-outline/40 hover:translate-y-[-2px] shadow-sm active:scale-95"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-black uppercase tracking-tight",
                        isSelected ? "text-on-coral" : "text-on-surface"
                      )}>
                        T-{table.number}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isSelected ? "text-brand-coral/60" : "text-outline/60"
                      )}>
                        {hasReservation ? t.booked : isCurrentlyInUse ? t.occupied : t.available}
                      </span>
                      
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-brand-coral text-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                          <Check size={18} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-10 pt-4 bg-surface-container-lowest border-t border-surface-container mt-auto">
            <div className="flex items-center gap-4 text-outline/60 text-[10px] font-bold italic">
                <span>{t.footerTip}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
