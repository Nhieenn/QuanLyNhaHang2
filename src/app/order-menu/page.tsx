"use client";

import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  SendHorizontal,
  Bell as BellIcon,
  CheckCircle2,
  X,
  ChevronRight,
  StickyNote,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useTableStore, MenuItem as StoreMenuItem } from "@/store/tableStore";
import { Suspense } from "react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  tag?: string;
  type: "drink" | "food";
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "latte",
    name: "Oat Milk Latte",
    category: "Signature Coffee",
    description: "Double shot, organic oat milk",
    price: 5.50,
    tag: "BEST SELLER",
    type: "drink"
  },
  {
    id: "cortado",
    name: "Cortado",
    category: "Signature Coffee",
    description: "Equal parts espresso and milk",
    price: 4.25,
    tag: "CLASSIC",
    type: "drink"
  },
  {
    id: "matcha",
    name: "Ceremonial Matcha",
    category: "Hand-picked Teas",
    description: "Uji source, hand-whisked",
    price: 6.50,
    tag: "PREMIUM",
    type: "drink"
  },
  {
    id: "toast",
    name: "Sourdough Toast",
    category: "Artisanal Bites",
    description: "Avocado & organic seeds",
    price: 12.00,
    tag: "ORGANIC",
    type: "food"
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "Artisanal Bites",
    description: "Double fermented, French butter",
    price: 4.50,
    tag: "BAKERY",
    type: "food"
  }
];

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export default function OrderMenuPage() {
  return (
    <Suspense fallback={<div>Loading order menu...</div>}>
      <OrderMenuContent />
    </Suspense>
  );
}

function OrderMenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table");
  const { floors, addOrderItem, confirmOrders, updateItemNote } = useTableStore();
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");

  // Tìm bàn hiện tại dựa trên ID từ URL
  let currentTable: any = null;
  for (const floor of floors) {
    const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
    if (table) {
      currentTable = table;
      break;
    }
  }

  const cart = currentTable?.orders || [];
  const pendingItems = cart.filter((i: any) => i.status === "pending");
  const sentItems = cart.filter((i: any) => i.status === "sent");

  const subtotal = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const addToCart = (item: any) => {
    if (!tableId) return;
    addOrderItem(tableId, {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-8 overflow-hidden bg-surface">
      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto px-10 pb-20 pt-10 custom-scrollbar">
        {["Signature Coffee", "Hand-picked Teas", "Artisanal Bites"].map((category) => (
          <div key={category} className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-3xl font-black text-on-surface tracking-tight">{category}</h2>
              <span className="text-xs font-black text-outline uppercase tracking-widest">
                {MENU_ITEMS.filter(i => i.category === category).length} Items
              </span>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {MENU_ITEMS.filter(i => i.category === category).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white rounded-[32px] p-6 flex items-center gap-6 cursor-pointer hover:shadow-ambient active:scale-95 transition-all group border border-surface-container-low"
                >
                  <div className="w-28 h-28 rounded-[24px] bg-surface-container-low flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    <img 
                      src={item.type === "drink" ? "/icon_drink_symbolic_1775236028971.png" : "/icon_food_symbolic_1775236042870.png"} 
                      alt={item.name}
                      className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {item.tag && (
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full inline-block mb-2 tracking-widest",
                        item.tag === "BEST SELLER" && "bg-brand-teal/20 text-[#006a67]",
                        item.tag === "CLASSIC" && "bg-brand-gold/20 text-[#856404]",
                        item.tag === "PREMIUM" && "bg-brand-teal/20 text-primary",
                        item.tag === "ORGANIC" && "bg-brand-coral/20 text-[#a64444]",
                        item.tag === "BAKERY" && "bg-brand-gold/20 text-[#856404]"
                      )}>
                        {item.tag}
                      </span>
                    )}
                    <h3 className="text-xl font-black text-on-surface leading-tight">{item.name}</h3>
                    <p className="text-xs text-outline font-medium line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-lg font-black text-primary mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Sidebar */}
      <aside className="w-[480px] bg-white border-l border-surface-container flex flex-col h-full shadow-2xl z-10">
        {/* Sidebar Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">
              Table {currentTable?.number || "???"}
            </h2>
            <p className="text-sm text-outline font-bold mt-1">
              {currentTable?.guests || 0} Guests • {currentTable?.timeElapsed || "New"}
            </p>
          </div>
          <button 
            onClick={() => {
              if (!tableId) return;
              const nonPending = cart.filter((i: any) => i.status !== "pending");
              useTableStore.getState().updateTable(0, tableId, { orders: nonPending });
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-coral shadow-sm hover:bg-brand-coral/10 hover:text-on-coral transition-colors"
          >
            <Trash2 size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Cart Items - Unified Running Cart */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar flex flex-col gap-4">
          {cart.map((item: any) => {
            const isPending = item.status === "pending";
            const isPreparing = item.status === "preparing";
            const isReady = item.status === "ready";
            const isSent = item.status === "sent";

            return (
              <div 
                key={item.cartId} 
                className={cn(
                  "rounded-[24px] p-5 flex items-center gap-4 transition-all border",
                  isPending ? "bg-primary/5 border-primary/10" : "bg-white border-surface-container-low shadow-sm"
                )}
              >
                {/* Quantity Badge */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0",
                  isPending ? "bg-primary text-white" : 
                  isReady ? "bg-brand-gold text-on-gold animate-pulse" : 
                  "bg-surface-container-low text-outline"
                )}>
                  {item.quantity}
                </div>

                 {/* Name & Subtext */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "text-base font-black text-on-surface truncate",
                      !isPending && "font-bold"
                    )}>{item.name}</h4>
                    
                    {/* Note Toggle Icon */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNoteId(item.cartId);
                        setNoteValue(item.notes || "");
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        item.notes ? "text-primary bg-primary/10" : "text-outline/30 hover:bg-surface-container-low hover:text-outline"
                      )}
                    >
                      <StickyNote size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  {editingNoteId === item.cartId ? (
                    <input 
                      autoFocus
                      className="w-full bg-surface-container-low border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2"
                      placeholder="Add note (e.g. Less ice)"
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      onBlur={() => {
                        if (tableId) updateItemNote(tableId, item.cartId, noteValue);
                        setEditingNoteId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (tableId) updateItemNote(tableId, item.cartId, noteValue);
                          setEditingNoteId(null);
                        }
                      }}
                    />
                  ) : item.notes ? (
                    <p className="text-[10px] text-primary/70 font-black italic mt-1 flex items-center gap-1">
                      <span className="opacity-40 italic">Note:</span> {item.notes}
                    </p>
                  ) : null}
                  
                  {isPending && !item.notes && !editingNoteId && (
                    <p className="text-[10px] text-primary font-bold mt-0.5 animate-pulse">Waiting for confirmation</p>
                  )}
                  {isSent && !item.notes && !editingNoteId && (
                    <p className="text-[10px] text-outline/40 font-medium italic mt-0.5">Order confirmed</p>
                  )}
                </div>

                {/* STATUS LABEL (Between Name and Price) */}
                <div className="flex-shrink-0 min-w-[80px] flex justify-center">
                  {isPreparing && (
                    <div className="flex items-center gap-1.5 bg-brand-gold/10 px-2 py-0.5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                      <p className="text-[10px] text-on-gold font-black uppercase tracking-wider">Cooking</p>
                    </div>
                  )}
                  {isReady && (
                    <div className="flex items-center gap-1.5 bg-brand-teal/10 px-2 py-0.5 rounded-md border border-brand-teal/20">
                      <BellIcon size={12} className="text-[#006a67] animate-bounce" />
                      <p className="text-[10px] text-[#006a67] font-black uppercase tracking-wider">Ready</p>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0 min-w-[60px]">
                  <p className="text-base font-black text-on-surface">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Individual Delete for Pending Items */}
                {isPending && (
                  <button 
                    onClick={() => tableId && useTableStore.getState().updateTable(0, tableId, { orders: cart.filter((o: any) => o.cartId !== item.cartId) })}
                    className="text-brand-coral/40 hover:text-brand-coral transition-colors"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}

          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-20">
              <Plus size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-xs text-center leading-relaxed">
                Click a menu item<br/>to start ordering
              </p>
            </div>
          )}
        </div>

         {/* Pricing & Actions */}
        <div className="p-8 pt-4 border-t border-surface-container bg-white rounded-t-[32px] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-outline text-xs font-bold px-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-outline text-xs font-bold px-2">
              <span>Tax (8.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface text-xl font-black mt-2 pt-3 border-t border-surface-container px-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

           <div className="flex flex-col gap-3">
            <button 
              onClick={() => tableId && router.push(`/checkout?table=${tableId}`)}
              className="w-full bg-brand-gold text-[#856404] py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#ffc107] transition-all active:scale-95 shadow-lg"
            >
              <FileText size={22} strokeWidth={2.5} />
              Print Provisional Bill
            </button>
            <button 
              onClick={() => tableId && confirmOrders(tableId)}
              disabled={pendingItems.length === 0}
              className={cn(
               "w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
               pendingItems.length > 0 ? "bg-[#006a67] text-white hover:bg-[#005a57]" : "bg-surface-container-low text-outline opacity-50 cursor-not-allowed shadow-none"
              )}
            >
              <SendHorizontal size={22} strokeWidth={2.5} />
              Send {pendingItems.length > 0 ? pendingItems.length : ""} to Kitchen
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
