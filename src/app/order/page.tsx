"use client";

import React, { useState } from "react";
import { Plus, Minus, Trash2, Printer, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  description: string;
  image: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  note?: string;
}

const products: Product[] = [
  { id: "1", name: "Oat Milk Latte", price: 5.50, category: "Signature Coffee", badge: "BEST SELLER", description: "Double shot, organic oat milk", image: "/coffee-1.png" },
  { id: "2", name: "Cortado", price: 4.25, category: "Signature Coffee", badge: "CLASSIC", description: "Equal parts espresso and milk", image: "/coffee-2.png" },
  { id: "3", name: "Ceremonial Matcha", price: 6.50, category: "Hand-picked Teas", badge: "PREMIUM", description: "Uji source, hand-whisked", image: "/tea-1.png" },
  { id: "4", name: "Sourdough Toast", price: 12.00, category: "Artisanal Bites", badge: "ORGANIC", description: "Avocado & organic seeds", image: "/food-1.png" },
  { id: "5", name: "Butter Croissant", price: 4.50, category: "Artisanal Bites", badge: "BAKERY", description: "Double fermented, French butter", image: "/food-2.png" },
];

export default function OrderMenuPage() {
  const [cart, setCart] = useState<OrderItem[]>([
    { product: products[0], quantity: 1, note: "No Sugar, Extra Hot" },
    { product: products[2], quantity: 1, note: "Iced, Honey" },
    { product: products[3], quantity: 1, note: "Add Poached Egg" },
  ]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  return (
    <div className="flex bg-surface min-h-[calc(100vh-80px)] -m-8 relative">
      {/* Product List */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex flex-col gap-12 max-w-[1000px]">
          {/* Categories */}
          <Section title="Signature Coffee" count={6}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.filter(p => p.category === "Signature Coffee").map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </Section>

          <Section title="Hand-picked Teas" count={4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.filter(p => p.category === "Hand-picked Teas").map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </Section>

          <Section title="Artisanal Bites" count={8}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.filter(p => p.category === "Artisanal Bites").map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </Section>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="w-[380px] bg-white shadow-ambient flex flex-col p-8 z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-on-surface">Table 12</h2>
            <p className="text-sm text-on-surface/50 font-sans">Active Order • Alex</p>
          </div>
          <button className="p-3 bg-error-container/10 text-error-container rounded-xl hover:bg-error-container hover:text-white transition-all">
            <Trash2 size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          {cart.map((item, i) => (
            <CartItem key={i} item={item} />
          ))}
        </div>

        {/* Totals */}
        <div className="mt-8 border-t border-surface-container-highest pt-8 space-y-4">
          <div className="flex justify-between text-on-surface/50 font-sans">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-on-surface/50 font-sans">
            <span>Tax (8.5%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-2xl font-display font-bold text-on-surface">Total</span>
            <span className="text-3xl font-display font-bold text-on-surface">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          <button className="w-full h-16 bg-primary-container text-primary font-display font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-primary-container/80 transition-all shadow-sm">
            <Printer size={20} />
            Print Provisional Bill
          </button>
          <button className="w-full h-16 bg-primary text-white font-display font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-primary-dim transition-all shadow-ambient">
            <Send size={20} className="rotate-45" />
            Send to Kitchen
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string, count: number, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-baseline border-b border-surface-container-highest pb-4">
        <h3 className="text-2xl font-display font-bold text-on-surface">{title}</h3>
        <span className="text-[10px] font-bold text-on-surface/40 tracking-widest uppercase">{count} ITEMS</span>
      </div>
      {children}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-surface-container-lowest rounded-[32px] p-4 flex gap-6 hover:shadow-ambient transition-all cursor-pointer group no-border-section">
      {/* Image Placeholder with real size/shape */}
      <div className="w-[120px] h-[120px] bg-surface-container-highest rounded-2xl overflow-hidden relative">
         <div className="absolute inset-0 flex items-center justify-center text-on-surface/20 font-bold text-xs">
            {product.name}
         </div>
         {/* Once I generate images, I will put them here */}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          {product.badge && (
            <span className="px-2 py-0.5 bg-primary-container text-primary text-[8px] font-bold rounded-md uppercase tracking-wider">
              {product.badge}
            </span>
          )}
        </div>
        <h4 className="text-lg font-display font-bold text-on-surface group-hover:text-primary transition-colors">{product.name}</h4>
        <p className="text-xs text-on-surface/50 line-clamp-2">{product.description}</p>
        <span className="text-lg font-display font-bold text-primary mt-1">${product.price.toFixed(2)}</span>
      </div>
    </div>
  );
}

function CartItem({ item }: { item: OrderItem }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl flex items-start gap-4 transition-all no-border-section border-2 border-transparent",
      item.product.id === "1" ? "bg-primary-container/10 border-primary-container/30" : "bg-surface-container-highest/30"
    )}>
      <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-display font-bold">
        {item.quantity}
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-baseline">
          <h5 className="text-sm font-bold text-on-surface">{item.product.name}</h5>
          <span className="text-sm font-bold text-on-surface">${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
        <p className="text-xs text-on-surface/50 italic">{item.note}</p>
        
        <div className="flex items-center gap-4 mt-3">
           <button className="touch-target p-1 text-on-surface/30 hover:text-primary"><Minus size={16} /></button>
           <button className="touch-target p-1 text-on-surface/30 hover:text-primary"><Plus size={16} /></button>
        </div>
      </div>
    </div>
  );
}
