"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Banknote, 
  Wallet, 
  ChevronRight, 
  Printer, 
  Mail, 
  Users,
  CheckCircle2,
  X,
  Scan,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useTableStore } from "@/store/tableStore";
import { Suspense } from "react";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const INVOICE_ITEMS: InvoiceItem[] = [
  { id: "i1", name: "Organic Quinoa Bowl", quantity: 2, price: 36.00 },
  { id: "i2", name: "Pan-Seared Sea Bass", quantity: 1, price: 28.50 },
  { id: "i3", name: "Oat Milk Latte", quantity: 2, price: 11.00 },
  { id: "i4", name: "Butter Croissant", quantity: 1, price: 4.50 }
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table");
  const { floors, updateTable } = useTableStore();
  
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Tìm bàn thực tế
  let currentTable: any = null;
  let currentFloorIndex = 0;
  for (let i = 0; i < floors.length; i++) {
    const table = floors[i].tables.find(t => t.id === tableId || t.number === tableId);
    if (table) {
      currentTable = table;
      currentFloorIndex = i;
      break;
    }
  }

  const items = currentTable?.orders || [];
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10; // 10% VAT
  const serviceCharge = subtotal * 0.05; // 5% Service
  const total = subtotal + tax + serviceCharge;

  const handleCompletePayment = () => {
    if (tableId) {
      // Clear data and set to empty
      updateTable(currentFloorIndex, tableId, {
        status: "empty",
        guests: undefined,
        timeElapsed: undefined,
        orders: []
      });
    }
    
    // Redirect to feedback
    router.push("/feedback?showRating=true");
  };

  const handlePaymentSelect = (method: string) => {
    setPaymentMethod(method);
    if (method === "wallet") {
      setIsQRModalOpen(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center text-[#006a67] shadow-xl mb-8">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-on-surface tracking-tight">Payment Successful</h2>
        <p className="text-outline mt-2 font-bold mb-10">Invoice #88294 has been paid in full.</p>
        
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-144px)] animate-in fade-in duration-700 py-10 relative">
      
      {/* QR Modal Overlay */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-md" onClick={() => setIsQRModalOpen(false)} />
          <div className="relative w-full max-w-[400px] bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <button 
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-all"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="w-16 h-16 bg-brand-teal/20 text-[#006a67] rounded-full flex items-center justify-center mb-6">
              <Scan size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-on-surface mb-2">E-Wallet Payment</h3>
            <p className="text-sm font-bold text-outline mb-8 text-center">Scan the QR code to complete the transaction</p>
            
            <div className="w-56 h-56 bg-surface-container-low rounded-3xl p-6 relative mb-8 group overflow-hidden">
               <img 
                src="/qr_code_payment.png" 
                alt="Payment QR" 
                className="w-full h-full object-contain mix-blend-multiply opacity-100 group-hover:scale-105 transition-transform duration-500"
               />
               <div className="absolute inset-0 border-4 border-brand-teal/10 rounded-3xl pointer-events-none" />
            </div>

            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-low text-outline hover:text-on-surface font-black text-[10px] uppercase tracking-widest transition-all mb-4">
              <RefreshCw size={14} />
              Refresh QR Code
            </button>

            <p className="text-center text-[10px] font-bold text-outline/60 leading-relaxed uppercase tracking-wide">
              Momo • ZaloPay • Bank App
            </p>
          </div>
        </div>
      )}

      {/* Main Invoice Card (Centered) */}
      <div className="w-full max-w-[650px] bg-white rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tight leading-none mb-2">Invoice</h2>
            <p className="text-sm font-bold text-outline tracking-tight">Table {currentTable?.number || tableId}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest block mb-1">GUESTS</span>
            <p className="text-xl font-black text-on-surface">{currentTable?.guests || 0} Persons</p>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {items.map((item: any) => (
            <div key={item.cartId} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-sm font-black text-on-surface/50">
                  {item.quantity}x
                </div>
                <h4 className="text-base font-black text-on-surface">{item.name}</h4>
              </div>
              <p className="text-base font-black text-on-surface">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-outline italic py-10">No items found for this table.</p>
          )}
        </div>

        {/* Breakdown */}
        <div className="pt-8 border-t border-surface-container space-y-4 mb-4">
          <div className="flex justify-between text-outline text-base font-bold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-outline text-base font-bold">
            <span>Service Charge (10%)</span>
            <span>${serviceCharge.toFixed(2)}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-end mb-12">
          <span className="text-3xl font-black text-on-surface tracking-tight">Total</span>
          <span className="text-6xl font-black text-[#006a67] tracking-tighter">${total.toFixed(2)}</span>
        </div>

        {/* Payment Methods Selection row 3-buttons */}
        <div className="mb-10">
          <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em] block mb-4">PAYMENT METHOD</span>
          <div className="flex gap-4">
            <PaymentMethod 
              icon={Banknote} 
              label="Cash" 
              active={paymentMethod === "cash"} 
              onClick={() => handlePaymentSelect("cash")}
            />
            <PaymentMethod 
              icon={CreditCard} 
              label="Credit Card" 
              active={paymentMethod === "card"} 
              onClick={() => handlePaymentSelect("card")}
            />
            <PaymentMethod 
              icon={Wallet} 
              label="E-Wallet" 
              active={paymentMethod === "wallet"} 
              onClick={() => handlePaymentSelect("wallet")}
            />
          </div>
        </div>

        {/* Complete Payment Button */}
        <button 
          onClick={handleCompletePayment}
          className="w-full bg-[#006a67] text-white py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#005a57] transition-all active:scale-95 group mb-4"
        >
          Complete Payment
        </button>
      </div>

      {/* Footer Options (Outside Card) */}
      <div className="mt-8 flex gap-10 text-outline opacity-40 hover:opacity-100 transition-opacity">
        <FooterOption icon={Printer} label="Print Receipt" />
        <FooterOption icon={Mail} label="Email Invoice" />
        <FooterOption icon={Users} label="Split Bill" />
      </div>
    </div>
  );
}

function PaymentMethod({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-[24px] cursor-pointer transition-all border-2",
        active 
          ? "bg-brand-teal/10 border-brand-teal text-[#006a67] shadow-sm" 
          : "bg-surface-container-low border-transparent text-on-surface/40 hover:bg-surface-container"
      )}
    >
      <Icon size={28} strokeWidth={2.5} />
      <span className="text-xs font-black tracking-tight">{label}</span>
    </div>
  );
}

function FooterOption({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2.5 cursor-pointer hover:text-on-surface transition-colors">
      <Icon size={18} strokeWidth={2.5} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
