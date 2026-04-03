"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle, Check, BookOpen, MessageSquarePlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  status: "pending" | "preparing" | "ready";
}

interface KDSOrder {
  id: string;
  orderNumber: string;
  location: string; // Table 04, Takeaway 102, etc.
  guests?: number;
  timeStarted: string;
  type: "dine-in" | "takeaway";
  isUrgent?: boolean;
  items: KDSItem[];
}

const initialOrders: KDSOrder[] = [
  {
    id: "1",
    orderNumber: "#8821",
    location: "Table 04",
    guests: 2,
    timeStarted: "08:45m",
    type: "dine-in",
    items: [
      { id: "1-1", name: "Organic Quinoa Bowl", quantity: 1, note: "No onions, extra avocado", status: "pending" },
      { id: "1-2", name: "Pan-Seared Sea Bass", quantity: 1, note: "Lemon butter on side", status: "preparing" },
    ]
  },
  {
    id: "2",
    orderNumber: "#8818",
    location: "Table 12",
    guests: 4,
    timeStarted: "18:22m",
    type: "dine-in",
    isUrgent: true,
    items: [
      { id: "2-1", name: "Truffle Mushroom Risotto", quantity: 2, status: "ready" },
      { id: "2-2", name: "Grilled Halloumi Salad", quantity: 2, note: "URGENT: Table waiting", status: "preparing" },
    ]
  },
  {
    id: "3",
    orderNumber: "#8825",
    location: "Table 07",
    guests: 1,
    timeStarted: "04:10m",
    type: "dine-in",
    items: [
      { id: "3-1", name: "Deconstructed Tiramisu", quantity: 1, note: "Birthday sparkler requested", status: "pending" },
    ]
  },
  {
    id: "4",
    orderNumber: "Takeaway 102",
    location: "Takeaway 102",
    timeStarted: "11:05m",
    type: "takeaway",
    items: [
      { id: "4-1", name: "Artisan Sourdough Toast", quantity: 2, note: "Double avocado spread", status: "pending" },
      { id: "4-2", name: "Flat White (Oat)", quantity: 2, status: "pending" },
    ]
  }
];

export default function KitchenKDSPage() {
  const [orders, setOrders] = useState(initialOrders);

  const toggleItemStatus = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? {
            ...order,
            items: order.items.map(item => 
              item.id === itemId 
                ? { ...item, status: item.status === "ready" ? "pending" : "ready" } 
                : item
            )
          }
        : order
    ));
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Kitchen Monitor</h2>
          <p className="text-on-surface/50 font-sans mt-2">{orders.length} Orders currently in preparation</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-surface-container-highest/50 px-6 py-3 rounded-xl flex items-center gap-2 font-display font-bold text-on-surface hover:bg-surface-container-highest transition-all shadow-sm">
              <BookOpen size={20} />
              Priority View
           </button>
           <button className="bg-primary px-6 py-3 rounded-xl flex items-center gap-2 font-display font-bold text-white hover:bg-primary-dim transition-all shadow-ambient">
              <Plus size={20} />
              Internal Note
           </button>
        </div>
      </div>

      {/* Order Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 mb-12">
        {orders.map((order) => (
          <KDSOrderCard 
            key={order.id} 
            order={order} 
            onToggleItem={(itemId) => toggleItemStatus(order.id, itemId)} 
          />
        ))}
      </div>
    </div>
  );
}

function KDSOrderCard({ order, onToggleItem }: { order: KDSOrder, onToggleItem: (id: string) => void }) {
  const isUrgent = order.isUrgent;

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden flex flex-col no-border-section transition-all h-full",
      isUrgent ? "bg-error-container/5 border-2 border-error-container/20" : "bg-white shadow-ambient"
    )}>
      {/* Card Header */}
      <div className={cn(
        "px-8 py-6 flex justify-between items-center",
        order.type === "takeaway" ? "bg-[#73f1e4]/30" : (isUrgent ? "bg-error-container/20" : "bg-primary-container/30")
      )}>
        <div>
          <h3 className="text-2xl font-display font-bold text-on-surface">{order.location}</h3>
          <p className="text-xs font-sans text-on-surface/50 uppercase tracking-wider font-bold">
            Order {order.orderNumber} • {order.guests ? `${order.guests} Guests` : "Pickup: 12:45"}
          </p>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-xl flex items-center gap-2 font-display font-bold",
          isUrgent ? "bg-error-container text-white" : "bg-primary-container text-primary"
        )}>
           {isUrgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
           {order.timeStarted}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-8 space-y-6">
        {order.items.map((item) => (
          <div 
            key={item.id} 
            className="flex items-start gap-4 group cursor-pointer"
            onClick={() => onToggleItem(item.id)}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all",
              item.status === "ready" ? "bg-primary border-primary text-white" : "border-surface-container-highest group-hover:border-primary/30"
            )}>
              {item.status === "ready" && <Check size={18} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <h4 className={cn(
                  "font-display font-bold text-lg transition-all",
                  item.status === "ready" ? "text-on-surface/30 line-through" : "text-on-surface"
                )}>
                  {item.name}
                </h4>
                <span className={cn(
                  "font-display font-bold",
                  item.status === "ready" ? "text-on-surface/20" : "text-on-surface"
                 )}>x{item.quantity}</span>
              </div>
              {item.note && (
                <p className={cn(
                  "text-xs font-sans font-bold uppercase tracking-wider italic mt-1",
                  item.note.includes("URGENT") ? "text-error-container" : "text-on-surface/40"
                )}>
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Card Actions */}
      <div className="p-8 pt-0 grid grid-cols-2 gap-4">
         <button className="h-16 bg-surface-container-highest/20 rounded-xl font-display font-bold text-on-surface hover:bg-surface-container-highest/40 transition-all touch-target">
            Prepare
         </button>
         <button className="h-16 bg-primary text-white rounded-xl font-display font-bold hover:bg-primary-dim transition-all shadow-sm touch-target">
            Ready
         </button>
      </div>
    </div>
  );
}
