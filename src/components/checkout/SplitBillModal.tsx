"use client";

import React, { useState } from "react";
import { X, Users, ListFilter, Check, Calculator, ArrowRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderItem } from "@/store/tableStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface SplitBillModalProps {
  onClose: () => void;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  serviceChargeRate: number;
  onConfirm: (splitData: SplitData) => void;
}

export type SplitData = 
  | { mode: "equal"; count: number; totalPerPerson: number }
  | { mode: "itemized"; selectedCartIds: string[]; totalForSection: number };

export function SplitBillModal({ onClose, items, subtotal, taxRate, serviceChargeRate, onConfirm }: SplitBillModalProps) {
  const { language } = useSettingsStore();
  const t = translations[language].checkoutPage.splitModal;
  const menuT = translations[language].orderMenuPage;

  const [mode, setMode] = useState<"equal" | "itemized">("equal");
  const [personCount, setPersonCount] = useState(2);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const formatCurrency = (val: number) => {
    const scaled = val * menuT.priceScale;
    return scaled.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + menuT.currencySymbol;
  };

  const totalWithTax = subtotal * (1 + taxRate + serviceChargeRate);

  const calculateItemizedTotal = () => {
    const selectedItems = items.filter(item => selectedIds.includes(item.cartId));
    const sectionSubtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return sectionSubtotal * (1 + taxRate + serviceChargeRate);
  };

  const handleConfirm = () => {
    if (mode === "equal") {
      onConfirm({
        mode: "equal",
        count: personCount,
        totalPerPerson: totalWithTax / personCount
      });
    } else {
      if (selectedIds.length === 0) return;
      onConfirm({
        mode: "itemized",
        selectedCartIds: selectedIds,
        totalForSection: calculateItemizedTotal()
      });
    }
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[550px] rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95 duration-500 overflow-hidden no-border-section">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#006a67] text-white flex items-center justify-center shadow-lg">
                <Users size={30} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight leading-none">{t.title}</h3>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mt-2">{t.subtitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-all"
            >
              <X size={20} />
            </button>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-surface-container-low p-1.5 rounded-[24px] mb-8">
            <button 
              onClick={() => setMode("equal")}
              className={cn(
                "flex-1 py-4 px-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                mode === "equal" ? "bg-white text-[#006a67] shadow-sm" : "text-outline/60 hover:text-outline"
              )}
            >
              <Calculator size={16} />
              {t.equalSplit}
            </button>
            <button 
                onClick={() => setMode("itemized")}
                className={cn(
                  "flex-1 py-4 px-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  mode === "itemized" ? "bg-white text-[#006a67] shadow-sm" : "text-outline/60 hover:text-outline"
                )}
            >
              <ListFilter size={16} />
              {t.itemizedSplit}
            </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px] flex flex-col">
            {mode === "equal" ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                          className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-[#006a67] hover:scale-105 active:scale-95 transition-all"
                        >
                          <Minus size={24} strokeWidth={3} />
                        </button>
                        <div className="flex flex-col items-center min-w-[100px]">
                            <span className="text-6xl font-black text-[#006a67] tracking-tighter">{personCount}</span>
                            <span className="text-[10px] font-black uppercase text-outline">{translations[language].checkoutPage.personsSuffix}</span>
                        </div>
                        <button 
                          onClick={() => setPersonCount(Math.min(20, personCount + 1))}
                          className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-[#006a67] hover:scale-105 active:scale-95 transition-all text-xl font-bold"
                        >
                          +
                        </button>
                    </div>

                    <div className="w-full bg-surface-container-low p-6 rounded-3xl flex justify-between items-center">
                        <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t.sharePerPerson}</span>
                        <span className="text-2xl font-black text-on-surface">{formatCurrency(totalWithTax / personCount)}</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 space-y-3 animate-in slide-in-from-right-4 duration-300">
                    <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">{translations[language].checkoutPage.noItemsSelected}</p>
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                        {items.map((item) => {
                            const isSelected = selectedIds.includes(item.cartId);
                            return (
                                <div 
                                    key={item.cartId}
                                    onClick={() => toggleItem(item.cartId)}
                                    className={cn(
                                        "flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all border-2",
                                        isSelected ? "bg-brand-teal/10 border-brand-teal shadow-sm" : "bg-surface-container-low border-transparent hover:border-outline/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                                            isSelected ? "bg-[#006a67] text-white" : "bg-white/50 text-transparent border-2 border-outline/20"
                                        )}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-on-surface leading-none">{item.name}</h4>
                                            <span className="text-[10px] font-bold text-outline uppercase">qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-on-surface">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="pt-4 border-t border-surface-container flex justify-between items-center">
                        <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t.itemsSelected.replace("{n}", selectedIds.length.toString())}</span>
                        <div className="text-right">
                           <span className="text-[10px] font-black text-outline uppercase block leading-none">{t.subtotalSection}</span>
                           <span className="text-xl font-black text-[#006a67]">{formatCurrency(calculateItemizedTotal())}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Action */}
        <button 
          onClick={handleConfirm}
          className="w-full bg-[#006a67] text-white py-6 rounded-[24px] font-black text-lg shadow-xl shadow-[#006a67]/20 hover:bg-[#005a57] transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-3 group"
        >
          {t.confirmBtn}
          <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
