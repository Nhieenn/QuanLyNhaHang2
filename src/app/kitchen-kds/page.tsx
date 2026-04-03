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

interface KDSItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  completed: boolean;
}

interface KDSOrder {
  id: string;
  orderNumber: string;
  table: string;
  guests?: number;
  type: "dine-in" | "takeaway";
  pickupTime?: string;
  startTime: number; // timestamp
  items: KDSItem[];
  isUrgent?: boolean;
}

const INITIAL_ORDERS: KDSOrder[] = [
  {
    id: "o1",
    orderNumber: "#8821",
    table: "Table 04",
    guests: 2,
    type: "dine-in",
    startTime: Date.now() - (8 * 60 + 45) * 1000,
    items: [
      { id: "i1", name: "Organic Quinoa Bowl", quantity: 1, notes: "No onions, extra avocado", completed: false },
      { id: "i2", name: "Pan-Seared Sea Bass", quantity: 1, notes: "Lemon butter on side", completed: false },
    ]
  },
  {
    id: "o2",
    orderNumber: "#8818",
    table: "Table 12",
    guests: 4,
    type: "dine-in",
    startTime: Date.now() - (18 * 60 + 22) * 1000,
    isUrgent: true,
    items: [
      { id: "i3", name: "Truffle Mushroom Risotto", quantity: 2, completed: true },
      { id: "i4", name: "Grilled Halloumi Salad", quantity: 2, notes: "URGENT: Table waiting", completed: false },
    ]
  },
  {
    id: "o3",
    orderNumber: "#8825",
    table: "Table 07",
    guests: 1,
    type: "dine-in",
    startTime: Date.now() - (4 * 60 + 10) * 1000,
    items: [
      { id: "i5", name: "Deconstructed Tiramisu", quantity: 1, notes: "Birthday sparkler requested", completed: false },
    ]
  },
  {
    id: "o4",
    orderNumber: "Takeaway 102",
    table: "Takeaway 102",
    type: "takeaway",
    pickupTime: "12:45",
    startTime: Date.now() - (11 * 60 + 5) * 1000,
    items: [
      { id: "i6", name: "Artisan Sourdough Toast", quantity: 2, notes: "Double avocado spread", completed: false },
      { id: "i7", name: "Flat White (Oat)", quantity: 2, completed: false },
    ]
  }
];

export default function KitchenKDSPage() {
  const [orders, setOrders] = useState<KDSOrder[]>(INITIAL_ORDERS);
  const [now, setNow] = useState(Date.now());

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (startTime: number) => {
    const diff = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}m`;
  };

  const toggleItem = (orderId: string, itemId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return order;
    }));
  };

  const completeOrder = (orderId: string) => {
    // In a real app, this would send an update to the server
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-4xl font-black text-on-surface tracking-tight">Kitchen Monitor</h2>
          <p className="text-outline mt-1 font-bold">{orders.length} Orders currently in preparation</p>
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
        {orders.map((order) => (
          <div 
            key={order.id}
            className={cn(
              "bg-white rounded-[40px] overflow-hidden shadow-ambient transition-all animate-in zoom-in-95 duration-500 border border-surface-container-low",
              order.isUrgent && "ring-2 ring-brand-coral ring-offset-4 ring-offset-surface"
            )}
          >
            {/* Card Header */}
            <div className={cn(
               "px-10 py-8 flex justify-between items-start transition-colors",
               order.isUrgent ? "bg-brand-coral" : "bg-brand-teal"
            )}>
              <div>
                <h3 className={cn(
                  "text-3xl font-black tracking-tight leading-none",
                  order.isUrgent ? "text-on-coral" : "text-[#006a67]"
                )}>
                  {order.table}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-sm font-bold opacity-70",
                    order.isUrgent ? "text-on-coral" : "text-[#006a67]"
                  )}>
                    Order {order.orderNumber} • {order.guests ? `${order.guests} Guests` : `Pickup: ${order.pickupTime}`}
                  </span>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-md",
                order.isUrgent ? "text-on-coral" : "text-[#006a67]"
              )}>
                {order.isUrgent ? <AlertCircle size={20} strokeWidth={3} /> : <Clock size={20} strokeWidth={3} />}
                <span className="text-sm font-black tracking-widest uppercase">
                  {formatTime(order.startTime)}
                </span>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="p-10 pb-6 space-y-8">
              {order.items.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-start gap-5 group cursor-pointer transition-opacity",
                    item.completed && "opacity-40"
                  )}
                  onClick={() => toggleItem(order.id, item.id)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg border-3 transition-all flex items-center justify-center flex-shrink-0 mt-0.5",
                    item.completed 
                      ? "bg-brand-teal border-brand-teal text-[#006a67]" 
                      : "border-surface-container-highest bg-white group-hover:border-brand-teal/50"
                  )}>
                    {item.completed && <Check size={20} strokeWidth={4} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={cn(
                        "text-xl font-bold text-on-surface transition-all truncate",
                        item.completed && "line-through grayscale"
                      )}>
                        {item.name}
                      </h4>
                      <span className="text-lg font-black text-outline ml-4">x{item.quantity}</span>
                    </div>
                    {item.notes && (
                      <p className={cn(
                        "text-sm font-medium mt-1 leading-relaxed decoration-transparent",
                        item.name.toLowerCase().includes("urgent") || item.notes.toUpperCase().includes("URGENT") ? "text-brand-coral font-bold italic" : "text-outline/70"
                      )}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="px-10 pb-10 grid grid-cols-2 gap-4">
              <button 
                className="bg-surface-container-low text-on-surface/50 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors active:scale-95"
              >
                Prepare
              </button>
              <button 
                onClick={() => completeOrder(order.id)}
                className="bg-[#006a67] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} strokeWidth={3} />
                Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
