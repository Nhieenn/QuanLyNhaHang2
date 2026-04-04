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

export default function KitchenKDSPage() {
  const { floors, updateItemStatus } = useTableStore();
  const [now, setNow] = useState(Date.now());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
  );

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (startTime: number) => {
    const diff = Math.max(0, Math.floor((now - startTime) / 1000));
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}m`;
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
          <h2 className="text-4xl font-black text-on-surface tracking-tight">Kitchen Monitor</h2>
          <p className="text-outline mt-1 font-bold">{activeOrders.length} Orders currently in preparation</p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-surface-container-highest text-on-surface font-black text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors shadow-sm">
            <Zap size={18} strokeWidth={3} />
            Priority View
          </button>
          <button className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all active:scale-95 shadow-lg">
            <Plus size={18} strokeWidth={3} />
            Internal Note
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
                  Table {order.tableNumber}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-sm font-bold opacity-70 text-on-surface"
                  )}>
                    {order.guests} Guests • {order.items.length} Items
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
                            <span className="text-[10px] font-black text-[#856404] uppercase tracking-wider">Preparing</span>
                          </div>
                        )}
                        {item.status === "ready" && (
                          <div className="flex items-center gap-1.5 bg-brand-teal/10 px-2 py-0.5 rounded-md border border-brand-teal/20">
                            <CheckCircle2 size={10} className="text-[#006a67]" />
                            <span className="text-[10px] font-black text-[#006a67] uppercase tracking-wider">Ready</span>
                          </div>
                        )}
                        {item.status === "sent" && (
                          <span className="text-[10px] font-bold text-outline uppercase tracking-widest opacity-40">Just Ordered</span>
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
                  "py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 border-2",
                  selectedItems.size > 0 
                    ? "bg-brand-gold border-brand-gold text-[#856404] shadow-lg" 
                    : "bg-surface-container-low border-transparent text-outline"
                )}
              >
                {selectedItems.size > 0 ? `Prepare (${selectedItems.size}) Selected` : "Prepare All"}
              </button>
              <button 
                onClick={() => handleReadySelected(order.id, order.items)}
                className={cn(
                  "py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                  selectedItems.size > 0
                    ? "bg-[#006a67] text-white"
                    : "bg-surface-container text-outline"
                )}
              >
                <CheckCircle2 size={18} strokeWidth={3} />
                {selectedItems.size > 0 ? `Ready (${selectedItems.size}) Selected` : "Ready All"}
              </button>
            </div>
          </div>
        ))}
        {activeOrders.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-outline opacity-20">
            <Zap size={80} className="mb-6" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">No Active Orders</h3>
            <p className="font-bold">Waiting for tickets from the POS...</p>
          </div>
        )}
      </div>
    </div>
  );
}
