"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet, 
  ChevronRight, 
  ReceiptText, 
  User, 
  Users,
  ShieldCheck,
  Printer,
  Mail,
  History,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "drink" | "food";
}

const BILL_ITEMS: BillItem[] = [
  { id: "i1", name: "Oat Milk Latte", price: 5.50, quantity: 2, type: "drink" },
  { id: "i2", name: "Ceremonial Matcha", price: 6.50, quantity: 1, type: "drink" },
  { id: "i3", name: "Sourdough Toast", price: 12.00, quantity: 1, type: "food" },
  { id: "i4", name: "Butter Croissant", price: 4.50, quantity: 2, type: "food" }
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = BILL_ITEMS.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085;
  const serviceFee = 4.00;
  const total = subtotal + tax + serviceFee;

  const handleCompletePayment = () => {
    setIsSuccess(true);
    // Real logic would be here
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center text-[#006a67] shadow-xl mb-8">
          <ShieldCheck size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-on-surface tracking-tight">Payment Successful</h2>
        <p className="text-outline mt-2 font-bold mb-10">Order #8818 has been processed and billed.</p>
        
        <div className="flex gap-4">
          <button className="px-10 py-5 rounded-2xl bg-white border border-surface-container-low font-black text-sm uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center gap-2">
            <Printer size={18} />
            Print Receipt
          </button>
          <button onClick={() => window.location.href = "/table-map"} className="px-10 py-5 rounded-2xl bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all flex items-center gap-2 shadow-lg">
            Back to Home
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      {/* Bill Overview */}
      <div className="flex-1 space-y-10">
        <div className="bg-white rounded-[40px] p-10 shadow-ambient border border-surface-container-low relative overflow-hidden">
          {/* Decorative highlight */}
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-teal" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl font-black text-on-surface tracking-tight">Bill Overview</h2>
              <p className="text-outline mt-1 font-bold">Table 12 • 4 Guests • Order #8818</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em] block mb-1">TOTAL AMOUNT</span>
              <p className="text-5xl font-black text-primary tracking-tighter">${total.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="max-h-[320px] overflow-y-auto pr-4 custom-scrollbar space-y-5">
              {BILL_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <img 
                      src={item.type === "drink" ? "/icon_drink_symbolic_1775236028971.png" : "/icon_food_symbolic_1775236042870.png"} 
                      alt="" 
                      className="w-10 h-10 object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-on-surface">{item.name}</h4>
                    <span className="text-xs font-bold text-outline">x{item.quantity} • Unit Price: ${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-lg font-black text-on-surface">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t-2 border-dashed border-surface-container mt-8 space-y-4">
              <div className="flex justify-between text-outline text-sm font-bold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-outline text-sm font-bold">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-outline text-sm font-bold">
                <span>Tax (8.5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface text-3xl font-black mt-4 pt-4">
                <span className="tracking-tight">Grand Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Bill Card */}
        <div className="bg-surface-container-low rounded-[32px] p-8 flex justify-between items-center group cursor-pointer hover:bg-white transition-all shadow-sm border border-surface-container-low">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#006a67] shadow-sm">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface leading-none">Split Bill</h3>
              <p className="text-outline text-sm font-bold mt-1">Divide the payment between guests</p>
            </div>
          </div>
          <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Payment Side */}
      <div className="w-full lg:w-[480px] flex flex-col gap-8">
        <h3 className="text-xl font-black text-on-surface tracking-tight uppercase tracking-widest pl-2 opacity-60">Payment Methods</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <PaymentOption 
            active={paymentMethod === "card"} 
            onClick={() => setPaymentMethod("card")}
            icon={CreditCard} 
            label="Credit Card" 
          />
          <PaymentOption 
            active={paymentMethod === "cash"} 
            onClick={() => setPaymentMethod("cash")}
            icon={Banknote} 
            label="Cash Payment" 
          />
          <PaymentOption 
            active={paymentMethod === "qr"} 
            onClick={() => setPaymentMethod("qr")}
            icon={QrCode} 
            label="Scan to Pay" 
          />
          <PaymentOption 
            active={paymentMethod === "wallet"} 
            onClick={() => setPaymentMethod("wallet")}
            icon={Wallet} 
            label="E-Wallet" 
          />
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-ambient mt-4 space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-surface-container active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Mail className="text-[#006a67]" />
                <span className="text-sm font-bold">Email Receipt</span>
              </div>
              <div className="w-10 h-6 bg-brand-teal rounded-full flex items-center justify-end px-1 shadow-inner">
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-2xl border border-surface-container active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Printer className="text-brand-gold" />
                <span className="text-sm font-bold">Print after payment</span>
              </div>
              <div className="w-10 h-6 bg-brand-gold rounded-full flex items-center justify-end px-1 shadow-inner">
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleCompletePayment}
            className="w-full bg-[#006a67] text-white py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-4 shadow-lg hover:bg-[#005a57] transition-all active:scale-95 group mb-4"
          >
            Complete Payment
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-[10px] font-black text-outline text-center uppercase tracking-widest opacity-40">
            By completing, you agree to our terms of service
          </p>
        </div>

        {/* Floating help or history tip */}
        <div className="flex items-center gap-3 justify-center text-outline opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
          <History size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Recent Transactions</span>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-4 aspect-square rounded-[32px] cursor-pointer transition-all border-2",
        active 
          ? "bg-brand-teal/20 border-brand-teal text-[#006a67] shadow-lg scale-105" 
          : "bg-white border-transparent text-outline hover:bg-surface-container-low shadow-sm"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
        active ? "bg-white text-[#006a67] shadow-sm" : "bg-surface-container-low text-outline"
      )}>
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-black tracking-tight">{label}</span>
    </div>
  );
}
