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
  SendHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [cart, setCart] = useState<CartItem[]>([
    { ...MENU_ITEMS[0], quantity: 1, notes: "No Sugar, Extra Hot" },
    { ...MENU_ITEMS[2], quantity: 1, notes: "Iced, Honey" },
    { ...MENU_ITEMS[3], quantity: 1, notes: "Add Poached Egg" }
  ]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
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
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Table 12</h2>
            <p className="text-sm text-outline font-bold mt-1">Active Order • Alex</p>
          </div>
          <button 
            onClick={() => setCart([])}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-on-coral shadow-sm hover:bg-brand-coral/10 hover:text-on-coral transition-colors"
          >
            <Trash2 size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-surface-container-low flex items-center gap-4 group animate-in flex-col">
              <div className="flex w-full items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center text-primary font-black text-sm">
                  {item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-on-surface">{item.name}</h4>
                  {item.notes && <p className="text-[10px] text-outline font-medium mt-0.5">{item.notes}</p>}
                </div>
                <p className="text-base font-black text-on-surface">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              
              {/* Desktop Quantity Controls (Subtle) */}
              <div className="w-full mt-4 pt-4 border-t border-surface-container flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Minus size={16} /></button>
                  <span className="font-black text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-on-coral uppercase tracking-widest">Remove</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <Plus size={48} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-xs text-center">Your cart is empty<br/>Click an item to add</p>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="p-8 pt-6 border-t border-surface-container bg-white rounded-t-[32px] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-outline text-sm font-bold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-outline text-sm font-bold">
              <span>Tax (8.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface text-2xl font-black mt-4 pt-4 border-t border-surface-container">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="w-full bg-brand-gold text-[#856404] py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#ffc107] transition-all active:scale-95 shadow-lg">
              <Printer size={22} strokeWidth={2.5} />
              Print Provisional Bill
            </button>
            <button className="w-full bg-[#006a67] text-white py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:bg-[#005a57] transition-all active:scale-95 shadow-lg">
              <SendHorizontal size={22} strokeWidth={2.5} />
              Send to Kitchen
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
