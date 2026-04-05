"use client";

import React from "react";
import { OrderItem } from "@/store/tableStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface ReceiptTemplateProps {
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  cashierName: string;
  orderTime: string;
}

export function ReceiptTemplate({
  tableNumber,
  items,
  subtotal,
  tax,
  serviceCharge,
  total,
  cashierName,
  orderTime
}: ReceiptTemplateProps) {
  const { language } = useSettingsStore();
  const t = translations[language].checkoutPage.receipt;
  const menuT = translations[language].orderMenuPage;

  const formatCurrency = (val: number) => {
    const scaled = val * menuT.priceScale;
    return scaled.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + menuT.currencySymbol;
  };

  return (
    <div className="receipt-container w-[300px] bg-white p-8 font-mono text-[11px] leading-tight text-black shadow-lg mx-auto" id="thermal-receipt">
      {/* Header */}
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-sm font-black uppercase tracking-tighter">Elevated POS</h1>
        <p>{t.address}</p>
        <p>{t.city}</p>
        <p className="pt-2">Tel: +84 123 456 789</p>
      </div>

      <div className="border-b border-dashed border-black mb-4"></div>

      {/* Info */}
      <div className="space-y-1 mb-4 flex justify-between">
         <div className="text-left">
            <p>{translations[language].tableMapPage.table}: <span className="font-black">#{tableNumber}</span></p>
            <p>{t.staff}: {cashierName}</p>
         </div>
         <div className="text-right">
            <p>{new Date().toLocaleDateString()}</p>
            <p>{orderTime}</p>
         </div>
      </div>

      <div className="border-b border-dashed border-black mb-4"></div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between font-black">
          <span className="w-4/6 text-left">{t.item}</span>
          <span className="w-1/6 text-center">{t.qty}</span>
          <span className="w-1/6 text-right">{t.total}</span>
        </div>
        {items.map((item) => (
          <div key={item.cartId} className="flex justify-between">
            <span className="w-4/6 text-left uppercase">{item.name}</span>
            <span className="w-1/6 text-center">{item.quantity}</span>
            <span className="w-1/6 text-right">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black mb-4"></div>

      {/* Totals */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between">
          <span>{translations[language].checkoutPage.subtotal}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT (10%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>{translations[language].checkoutPage.serviceCharge}</span>
          <span>{formatCurrency(serviceCharge)}</span>
        </div>
        <div className="flex justify-between font-black text-sm pt-2">
          <span>{translations[language].checkoutPage.total}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black mb-6"></div>

      {/* Footer */}
      <div className="text-center space-y-2 opacity-80">
        <p className="font-black uppercase tracking-widest">{t.thankYou}</p>
        <p>{t.visitAgain}</p>
        <p className="text-[9px]">{translations[language].checkoutPage.title}: #INV-{Math.floor(100000 + Math.random() * 900000)}</p>
        <div className="pt-4 flex justify-center">
           <div className="w-24 h-24 bg-black/10 flex items-center justify-center opacity-30 italic text-[10px]">{t.qrPlaceholder}</div>
        </div>
      </div>
    </div>
  );
}
