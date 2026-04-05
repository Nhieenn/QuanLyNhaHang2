"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  MessageSquare, 
  ChevronDown, 
  Check,
  Zap,
  StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableStore, OrderItem } from "@/store/tableStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function KitchenKDSPage() {
  const { floors, updateItemStatus } = useTableStore();
  const [now, setNow] = useState(Date.now());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPriorityMode, setIsPriorityMode] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [globalNote, setGlobalNote] = useState("");

  // Lấy tất cả các món ăn đã gửi từ mọi tầng
  const activeOrders = floors.flatMap(floor => 
    floor.tables.filter(t => t.orders.some(o => o.status !== "pending" && o.status !== "served"))
      .map(table => ({
        id: table.id,
        tableNumber: table.number,
        guests: table.guests,
        items: table.orders.filter(o => o.status !== "pending" && o.status !== "served")
          .sort((a, b) => a.timestamp - b.timestamp),
        startTime: Math.min(...table.orders.map(o => o.timestamp))
      }))
  ).sort((a, b) => isPriorityMode ? a.startTime - b.startTime : 0);

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { language } = useSettingsStore();
  const t = translations[language].kitchenPage;
  const tableMapT = translations[language].tableMapPage;

  const formatTime = (startTime: number) => {
    const diff = Math.max(0, Math.floor((now - startTime) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      const hSuffix = language === 'vi' ? 'h' : 'h';
      const mSuffix = language === 'vi' ? 'p' : 'm';
      return `${hours}${hSuffix} ${remainingMins}${mSuffix}`;
    }

    const suffix = language === 'vi' ? 'p' : 'm';
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${suffix}`;
  };

  const toggleItemSelection = (cartId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(cartId)) next.delete(cartId);
      else next.add(cartId);
      return next;
    });
  };

  const handlePrepareSelected = (tableId: string, items: OrderItem[]) => {
    const targets = items.filter(item => selectedItems.has(item.cartId) || selectedItems.size === 0);
    targets.forEach(item => {
      if (item.status === "sent") {
        updateItemStatus(tableId, item.cartId, "preparing");
      }
    });
    setSelectedItems(new Set());
  };

  const handleReadySelected = (tableId: string, items: OrderItem[]) => {
    const targets = items.filter(item => selectedItems.has(item.cartId) || selectedItems.size === 0);
    targets.forEach(item => {
      if (item.status === "preparing" || item.status === "sent") {
        updateItemStatus(tableId, item.cartId, "ready");
      }
    });
    setSelectedItems(new Set());
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-4xl font-black text-on-surface tracking-tight">{t.title}</h2>
          <p className="text-outline mt-1 font-bold">{activeOrders.length} {t.subtitle}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPriorityMode(!isPriorityMode)}
            className={cn(
              "flex items-center gap-2.5 px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-95",
              isPriorityMode ? "bg-brand-coral text-white" : "bg-surface-container-highest text-on-surface hover:bg-surface-container-high"
            )}
          >
            <Zap size={18} strokeWidth={3} className={cn(isPriorityMode && "animate-pulse")} />
            {t.priorityView}
          </button>
          <button 
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all active:scale-95 shadow-lg"
          >
            <Plus size={18} strokeWidth={3} />
            {t.internalNote}
          </button>
        </div>
      </div>

      {/* Order Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {activeOrders.map((order) => (
          <div 
            key={order.id}
            className={cn(
              "bg-white rounded-[40px] overflow-hidden shadow-ambient transition-all animate-in zoom-in-95 duration-500 border border-surface-container-low",
              order.items.some(o => o.status === "sent") && "ring-2 ring-primary/20",
              order.items.every(o => o.status === "ready") && "grayscale opacity-50"
            )}
          >
            {/* Card Header */}
            <div className={cn(
               "px-10 py-8 flex justify-between items-start transition-colors",
               order.items.some(o => o.status === "ready") ? "bg-brand-gold" : "bg-brand-teal"
            )}>
              <div>
                <h3 className={cn(
                  "text-3xl font-black tracking-tight leading-none text-on-surface"
                )}>
                  {tableMapT.table} {order.tableNumber}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-sm font-bold opacity-70 text-on-surface"
                  )}>
                    {order.guests} {t.guestsUnit} • {order.items.length} {t.itemsUnit}
                  </span>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-on-surface"
              )}>
                <Clock size={20} strokeWidth={3} />
                <span className="text-sm font-black tracking-widest uppercase">
                  {formatTime(order.startTime)}
                </span>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="p-10 pb-6 space-y-8">
              {order.items.map((item) => (
                  <div 
                    key={item.cartId} 
                    className={cn(
                      "flex items-start gap-5 group cursor-pointer transition-all p-2 -m-2 rounded-2xl",
                      item.status === "ready" && "opacity-40",
                      selectedItems.has(item.cartId) && "bg-surface-container-low"
                    )}
                    onClick={() => toggleItemSelection(item.cartId)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center flex-shrink-0 mt-0.5",
                      selectedItems.has(item.cartId)
                        ? "bg-primary border-primary text-white shadow-lg scale-110" 
                        : "border-surface-container-highest bg-white group-hover:border-primary/50"
                    )}>
                      {selectedItems.has(item.cartId) ? <Check size={24} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-surface-container-highest" />}
                    </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={cn(
                        "text-xl font-bold text-on-surface transition-all truncate",
                        item.status === "ready" && "line-through grayscale"
                      )}>
                        {item.name}
                      </h4>
                      <span className="text-lg font-black text-outline ml-4">x{item.quantity}</span>
                    </div>
                      <div className="flex items-center gap-2 mt-2">
                        {item.status === "preparing" && (
                          <div className="flex items-center gap-1.5 bg-brand-gold/10 px-2 py-0.5 rounded-md border border-brand-gold/20">
                            <Zap size={10} className="text-[#856404]" fill="currentColor" />
                            <span className="text-[10px] font-black text-[#856404] uppercase tracking-wider">{t.preparing}</span>
                          </div>
                        )}
                        {item.status === "ready" && (
                          <div className="flex items-center gap-1.5 bg-brand-teal/10 px-2 py-0.5 rounded-md border border-brand-teal/20">
                            <CheckCircle2 size={10} className="text-[#006a67]" />
                            <span className="text-[10px] font-black text-[#006a67] uppercase tracking-wider">{t.ready}</span>
                          </div>
                        )}
                        {item.status === "sent" && (
                          <span className="text-[10px] font-bold text-outline uppercase tracking-widest opacity-40">{t.justOrdered}</span>
                        )}
                      </div>
                      
                      {/* Kitchen Notes */}
                      {item.notes && (
                        <div className="mt-2 p-2 bg-brand-gold/5 border border-brand-gold/10 rounded-lg flex items-start gap-2 max-w-[280px]">
                          <StickyNote size={12} className="text-[#856404] mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] font-bold text-[#856404] italic leading-tight">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="px-10 pb-10 grid grid-cols-2 gap-4">
              <button 
                onClick={() => handlePrepareSelected(order.id, order.items)}
                className={cn(
                  "py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] border-2",
                  selectedItems.size > 0 
                    ? "bg-brand-gold border-brand-gold text-[#856404] shadow-lg" 
                    : "bg-surface-container-low border-transparent text-outline"
                )}
              >
                {selectedItems.size > 0 ? t.prepareSelected.replace("{n}", selectedItems.size.toString()) : t.prepareAll}
              </button>
              <button 
                onClick={() => handleReadySelected(order.id, order.items)}
                className={cn(
                  "py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2",
                  selectedItems.size > 0
                    ? "bg-[#006a67] text-white"
                    : "bg-surface-container text-outline"
                )}
              >
                <CheckCircle2 size={18} strokeWidth={3} />
                {selectedItems.size > 0 ? t.readySelected.replace("{n}", selectedItems.size.toString()) : t.readyAll}
              </button>
            </div>
          </div>
        ))}
        {activeOrders.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-outline opacity-20">
            <Zap size={80} className="mb-6" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">{t.noActiveOrders}</h3>
            <p className="font-bold">{t.waitingForTickets}</p>
          </div>
        )}
      </div>

      {/* Internal Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 px-4">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-md" onClick={() => setShowNoteModal(false)} />
          <div className="relative w-full max-w-[500px] bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{t.internalNote}</h3>
                <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <X size={24} />
                </button>
             </div>
             <textarea 
               value={globalNote}
               onChange={(e) => setGlobalNote(e.target.value)}
               placeholder="Nhập ghi chú quan trọng cho toàn bộ bếp..."
               className="w-full h-40 bg-surface-container-low rounded-3xl p-6 text-on-surface font-sans text-sm focus:outline-none focus:ring-4 focus:ring-brand-teal/20 placeholder:text-outline/40 resize-none transition-all mb-6"
             />
             <button 
               onClick={() => setShowNoteModal(false)}
               className="w-full py-4 rounded-2xl bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all shadow-lg"
             >
               Lưu ghi chú
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add X icon to imports
import { X } from "lucide-react";
