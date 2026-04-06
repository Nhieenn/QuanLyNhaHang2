"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useTableStore, OrderItem } from "@/store/tableStore";
import { useSalesStore } from "@/store/salesStore";
import { useBOMStore } from "@/store/bomStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { Suspense } from "react";
import { SplitBillModal, SplitData } from "@/components/checkout/SplitBillModal";
import { ReceiptTemplate } from "@/components/checkout/ReceiptTemplate";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { language } = useSettingsStore();
  const t = translations[language].checkoutPage;
  const menuT = translations[language].orderMenuPage;

  const searchParams = useSearchParams();
  const router = useRouter();
  const tableId = searchParams.get("table");
  const { floors, updateTable, clearOrders, fetchInitialData, initializeRealtime } = useTableStore();

  useEffect(() => {
    fetchInitialData();
    const cleanup = initializeRealtime();
    return () => cleanup();
  }, []);
  
  const formatCurrency = (val: number) => {
    const scaled = val * menuT.priceScale;
    return scaled.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      minimumFractionDigits: language === 'vi' ? 0 : 2,
      maximumFractionDigits: language === 'vi' ? 0 : 2
    }) + menuT.currencySymbol;
  };
  
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRefreshingQR, setIsRefreshingQR] = useState(false);
  
  // Split Bill State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [activeSplit, setActiveSplit] = useState<SplitData | null>(null);

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);

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

  const allItems: OrderItem[] = currentTable?.orders || [];
  // Nếu đang tách theo món, chỉ tính tiền các món đã chọn
  const displayItems = activeSplit?.mode === "itemized" 
    ? allItems.filter((item: OrderItem) => activeSplit.selectedCartIds.includes(item.cartId))
    : allItems;

  const subtotal = activeSplit?.mode === "equal" 
    ? (allItems.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0) / activeSplit.count)
    : displayItems.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0);

  const tax = Math.round(subtotal * 0.10 * 100) / 100; 
  const serviceCharge = Math.round(subtotal * 0.05 * 100) / 100; 
  const total = subtotal + tax + serviceCharge;

  const { addSale } = useSalesStore();
  const { getRecipe } = useBOMStore();
  const { items: inventoryItems } = useInventoryStore();

  const calculateItemCost = (menuItemId: string) => {
    const recipe = getRecipe(menuItemId);
    if (!recipe) return 0;
    return recipe.reduce((acc, ing) => {
      const invItem = inventoryItems.find(i => i.id === ing.ingredientId);
      return acc + (ing.quantity * (invItem?.pricePerUnit || 0));
    }, 0);
  };

  const handleCompletePayment = async () => {
    if (!tableId || !currentTable) return;

    // Chuẩn bị dữ liệu Sale để lưu báo cáo
    const recordedItems = displayItems.map(item => ({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      cost: calculateItemCost(item.id)
    }));

    addSale({
      tableId,
      items: recordedItems,
      subtotal,
      tax,
      total,
      paymentMethod
    });

    if (activeSplit?.mode === "itemized") {
      // Logic cho tách hóa đơn theo món vẫn giữ nguyên
      const remainingOrders = allItems.filter((item: OrderItem) => !activeSplit.selectedCartIds.includes(item.cartId));
      
      if (remainingOrders.length === 0) {
        await clearOrders(currentTable.id);
      } else {
        // Tạm thời update list món còn lại (Chưa trừ kho ở bước này vì khách chưa trả hết bàn)
        await updateTable(currentFloorIndex, currentTable.id, {
          orders: remainingOrders
        });
      }
    } else {
      // Thanh toán toàn bộ bàn - Kích hoạt trừ kho và Reset bàn
      await clearOrders(currentTable.id);
    }
    
    setIsSuccess(true);
    setIsQRModalOpen(false);
  };

  const handleRefreshQR = () => {
    setIsRefreshingQR(true);
    setTimeout(() => setIsRefreshingQR(false), 1500);
  };

  const handlePrint = () => {
    setShowReceipt(true);
    setTimeout(() => {
        window.print();
        setShowReceipt(false);
    }, 500);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-brand-teal rounded-full flex items-center justify-center text-[#006a67] shadow-xl mb-8">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-on-surface tracking-tight">{t.successTitle}</h2>
        <p className="text-outline mt-2 font-bold mb-10">
          {activeSplit ? t.successSubtitlePartial : t.successSubtitleFull.replace("{id}", "88294")}
        </p>
        
        <div className="flex gap-4">
          <button 
            onClick={handlePrint}
            className="px-10 py-5 rounded-2xl bg-white border border-surface-container-low font-black text-sm uppercase tracking-widest hover:bg-surface-container-low transition-all flex items-center gap-2"
          >
            <Printer size={18} />
            {t.printReceipt}
          </button>
          <button 
            onClick={() => router.push("/feedback?showRating=true")} 
            className="px-10 py-5 rounded-2xl bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all flex items-center gap-2 shadow-lg"
          >
            {t.leaveFeedback}
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
            
            <h3 className="text-2xl font-black text-on-surface mb-2">{t.walletTitle}</h3>
            <p className="text-sm font-bold text-outline mb-8 text-center uppercase tracking-widest text-[10px]">{t.total}: {formatCurrency(total)}</p>
            
            <div className="w-56 h-56 bg-surface-container-low rounded-3xl p-6 relative mb-8 group overflow-hidden flex items-center justify-center">
               {isRefreshingQR ? (
                 <Loader2 size={40} className="text-[#006a67] animate-spin" />
               ) : (
                 <img 
                  src="/qr_code_payment.png" 
                  alt="Payment QR" 
                  className="w-full h-full object-contain mix-blend-multiply opacity-100 group-hover:scale-105 transition-transform duration-500"
                 />
               )}
               <div className="absolute inset-0 border-4 border-brand-teal/10 rounded-3xl pointer-events-none" />
            </div>

            <button 
              onClick={handleRefreshQR}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface-container-low text-outline hover:text-on-surface font-black text-[10px] uppercase tracking-widest transition-all mb-4"
            >
              <RefreshCw size={14} className={cn(isRefreshingQR && "animate-spin")} />
              {t.refreshQr}
            </button>

            <button 
              onClick={handleCompletePayment}
              className="w-full py-4 bg-brand-teal text-[#006a67] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
            >
              {t.simulateSuccess}
            </button>
          </div>
        </div>
      )}

      {/* Main Invoice Card (Centered) */}
      <div className="w-full max-w-[650px] bg-white rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tight leading-none mb-2">{t.title}</h2>
            <p className="text-sm font-bold text-outline tracking-tight">{translations[language].tableMapPage.table} {currentTable?.number || tableId}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest block mb-1">
              {activeSplit?.mode === "equal" ? t.perPerson : t.guests}
            </span>
            <p className="text-xl font-black text-on-surface">
              {activeSplit?.mode === "equal" ? t.oneOf : ""}{currentTable?.guests || 0} {t.personsSuffix}
            </p>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {displayItems.map((item: any) => (
            <div key={item.cartId} className="flex items-center justify-between animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-sm font-black text-on-surface/50">
                  {item.quantity}x
                </div>
                <h4 className="text-base font-black text-on-surface">{item.name}</h4>
              </div>
              <p className="text-base font-black text-on-surface">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
          {displayItems.length === 0 && (
            <p className="text-center text-outline italic py-10">{t.noItemsSelected}</p>
          )}
        </div>

        {/* Breakdown */}
        <div className="pt-8 border-t border-surface-container space-y-4 mb-4">
          <div className="flex justify-between text-outline text-base font-bold">
            <span>{activeSplit?.mode === "equal" ? t.subtotalDivided : t.subtotal}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-outline text-base font-bold">
            <span>{t.serviceCharge}</span>
            <span>{formatCurrency(serviceCharge)}</span>
          </div>
          <div className="flex justify-between text-outline text-base font-bold text-[10px] uppercase tracking-widest opacity-40">
             <span>VAT (10%)</span>
             <span>{formatCurrency(tax)}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-end mb-12">
          <span className="text-3xl font-black text-on-surface tracking-tight">{t.total}</span>
          <span className="text-5xl lg:text-6xl font-black text-[#006a67] tracking-tighter">{formatCurrency(total)}</span>
        </div>

        {/* Payment Methods Selection row 3-buttons */}
        <div className="mb-10">
          <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em] block mb-4">{t.paymentMethod}</span>
          <div className="flex gap-4">
            <PaymentMethod 
              icon={Banknote} 
              label={t.methodCash} 
              active={paymentMethod === "cash"} 
              onClick={() => setPaymentMethod("cash")}
            />
            <PaymentMethod 
              icon={CreditCard} 
              label={t.methodCard} 
              active={paymentMethod === "card"} 
              onClick={() => setPaymentMethod("card")}
            />
            <PaymentMethod 
              icon={Wallet} 
              label={t.methodWallet} 
              active={paymentMethod === "wallet"} 
              onClick={() => {
                setPaymentMethod("wallet");
                setIsQRModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Complete Payment Button */}
        <button 
          onClick={handleCompletePayment}
          className="w-full bg-[#006a67] text-white py-6 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#005a57] transition-all active:scale-95 group mb-4"
        >
          {t.completePayment}
        </button>
      </div>

      {/* Footer Options (Outside Card) */}
      <div className="mt-8 flex gap-10 text-outline opacity-40 hover:opacity-100 transition-opacity">
        <FooterOption icon={Printer} label={t.printReceipt} onClick={handlePrint} />
        <FooterOption icon={Mail} label={t.emailInvoice} onClick={() => alert("Emailing system is simulated.")} />
        <FooterOption icon={Users} label={t.splitBill} onClick={() => setShowSplitModal(true)} />
      </div>

      {/* Split Modal */}
      {showSplitModal && (
        <SplitBillModal 
            onClose={() => setShowSplitModal(false)}
            items={allItems}
            subtotal={allItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}
            taxRate={0.10}
            serviceChargeRate={0.05}
            onConfirm={(data) => {
                setActiveSplit(data);
                setShowSplitModal(false);
            }}
        />
      )}

      {/* Hidden Print Area */}
      {showReceipt && (
        <div className="fixed inset-0 bg-white z-[200] flex items-start justify-center pt-20">
            <ReceiptTemplate 
               tableNumber={currentTable?.number || "?"}
               items={displayItems}
               subtotal={subtotal}
               tax={tax}
               serviceCharge={serviceCharge}
               total={total}
               cashierName="John Doe"
               orderTime={new Date().toLocaleTimeString()}
            />
        </div>
      )}
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

function FooterOption({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-2.5 cursor-pointer hover:text-on-surface transition-colors">
      <Icon size={18} strokeWidth={2.5} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
