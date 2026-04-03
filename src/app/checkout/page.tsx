"use client";

import React from "react";
import { CreditCard, Banknote, QrCode, Wallet, ChevronRight, User, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12">
      {/* Bill Overview */}
      <div className="flex-1 space-y-8">
        <div className="bg-surface-container-low rounded-[32px] p-8 no-border-section shadow-sm">
           <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-on-surface">Payment Summary</h2>
                <p className="text-on-surface/50 font-sans">Table 12 • 4 Guests • Order #8818</p>
              </div>
              <div className="text-right">
                 <span className="text-sm font-bold text-on-surface/40 uppercase tracking-widest">Total Amount</span>
                 <p className="text-5xl font-display font-bold text-primary">$120.00</p>
              </div>
           </div>

           <div className="space-y-4">
              <BillItem name="Truffle Mushroom Risotto" qty={2} price={48.00} />
              <BillItem name="Grilled Halloumi Salad" qty={2} price={32.00} />
              <BillItem name="Oat Milk Latte" qty={3} price={16.50} />
              <BillItem name="Provisional Fee (5%)" price={6.00} isSecondary />
              <div className="pt-4 border-t border-surface-container-highest flex justify-between items-baseline">
                 <span className="text-xl font-display font-bold text-on-surface">Subtotal</span>
                 <span className="text-2xl font-display font-bold text-on-surface">$102.50</span>
              </div>
           </div>
        </div>

        {/* Guest Selection */}
        <div className="bg-surface-container-highest/20 rounded-[32px] p-8 no-border-section">
           <h3 className="text-xl font-display font-bold text-on-surface mb-6">Payment Splits</h3>
           <div className="flex gap-4">
              <SplitOption active label="Single Payer" />
              <SplitOption label="Split by 4" />
              <SplitOption label="Custom Amount" />
           </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="w-full lg:w-[450px] space-y-6">
         <h3 className="text-xl font-display font-bold text-on-surface">Payment Methods</h3>
         <div className="grid grid-cols-2 gap-4">
            <PaymentMethod icon={CreditCard} label="Credit Card" active />
            <PaymentMethod icon={Banknote} label="Cash Payment" />
            <PaymentMethod icon={QrCode} label="Scan to Pay" />
            <PaymentMethod icon={Wallet} label="E-Wallet" />
         </div>

         <div className="mt-12 bg-white rounded-[32px] p-8 shadow-ambient no-border-section space-y-6">
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl">
               <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                  <ReceiptText size={24} className="text-primary" />
               </div>
               <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">E-Receipt</p>
                  <p className="text-xs text-on-surface/50">Send to customer's email</p>
               </div>
               <div className="w-12 h-6 bg-surface-container-highest rounded-full flex items-center px-1">
                   <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
               </div>
            </div>

            <button className="w-full h-20 bg-primary text-white text-xl font-display font-bold rounded-2xl shadow-ambient hover:bg-primary-dim transition-all flex items-center justify-center gap-3 active:scale-95 touch-target">
               COMPLETE PAYMENT
               <ChevronRight size={24} />
            </button>
         </div>
      </div>
    </div>
  );
}

function BillItem({ name, qty, price, isSecondary }: { name: string; qty?: number; price: number; isSecondary?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-1">
      <div className="flex gap-2 items-baseline">
        {qty && <span className="text-xs font-bold text-primary">x{qty}</span>}
        <span className={cn("text-sm font-sans", isSecondary ? "text-on-surface/40" : "font-bold text-on-surface")}>{name}</span>
      </div>
      <span className={cn("text-sm font-display font-bold text-on-surface", isSecondary && "text-on-surface/40")}>${price.toFixed(2)}</span>
    </div>
  );
}

function SplitOption({ active, label }: { active?: boolean; label: string }) {
  return (
    <button className={cn(
      "px-6 py-4 rounded-2xl font-display font-bold text-sm transition-all shadow-sm",
      active ? "bg-primary text-white" : "bg-white text-on-surface/50 hover:bg-white/80"
    )}>
      {label}
    </button>
  );
}

function PaymentMethod({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "flex flex-col items-center justify-center gap-3 aspect-square rounded-3xl transition-all shadow-sm group",
      active ? "bg-primary-container text-primary border-2 border-primary/20" : "bg-white text-on-surface/50 hover:bg-surface-container-highest/50 "
    )}>
      <Icon size={32} className={cn("group-hover:scale-110 transition-transform", active ? "text-primary" : "text-on-surface/20")} />
      <span className="text-xs font-bold font-sans">{label}</span>
    </button>
  );
}
