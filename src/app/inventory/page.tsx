"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Settings2, 
  FileText, 
} from "lucide-react";
import { SummaryCard } from "@/components/inventory/SummaryCard";
import { InventoryItemCard } from "@/components/inventory/InventoryItemCard";
import { useInventoryStore } from "@/store/inventoryStore";
import { AddStockModal } from "@/components/inventory/AddStockModal";
import { BOMModal } from "@/components/inventory/BOMModal";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function InventoryPage() {
  const { language } = useSettingsStore();
  const t = translations[language].inventoryPage;
  const menuT = translations[language].orderMenuPage;

  const { items, getLowStockCount, getTotalAssetValue } = useInventoryStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);

  const lowStockCount = getLowStockCount();
  const totalAssets = getTotalAssetValue();

  const formatCurrency = (val: number) => {
    const scaled = val * menuT.priceScale;
    return scaled.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + menuT.currencySymbol;
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto py-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight leading-none mb-2">{t.title}</h1>
          <p className="text-sm font-bold text-outline tracking-tight">{t.subtitle}</p>
        </div>
        
        <div className="flex gap-4">
          <ActionButton 
            icon={Settings2} 
            label={t.manageBOM} 
            onClick={() => setShowBOMModal(true)}
          />
          <ActionButton 
            icon={FileText} 
            label={t.generatePO} 
            variant="gold" 
            onClick={() => alert("Chức năng đang được phát triển.")}
          />
          <ActionButton 
            icon={Plus} 
            label={t.addStock} 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          type="low-stock" 
          value={lowStockCount} 
          label={t.lowStockLabel} 
        />
        <SummaryCard 
          type="assets" 
          value={formatCurrency(totalAssets)} 
          label={t.currentAssets} 
        />
        <SummaryCard 
          type="wastage" 
          value={t.wastageReport} 
          label="Sustainable Kitchen"
          subtitle={t.wastageSubtitle}
          actionLabel={t.viewReport}
          onAction={() => alert("Chức năng đang được phát triển.")}
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {items.map((item) => (
          <InventoryItemCard 
            key={item.id}
            name={item.name}
            category={item.category}
            value={item.currentValue}
            unit={item.unit}
            percentage={Math.round((item.currentValue / item.maxCapacity) * 100)}
            status={item.status}
            image={item.image}
          />
        ))}
        <InventoryItemCard 
          isAddPlaceholder 
          name="" category="" value="" unit="" percentage={0} status="healthy" 
          onClick={() => setShowAddModal(true)}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStockModal onClose={() => setShowAddModal(false)} />
      )}
      <BOMModal isOpen={showBOMModal} onClose={() => setShowBOMModal(false)} />
    </div>
  );
}

function ActionButton({ 
  icon: Icon, 
  label, 
  variant = "default", 
  onClick 
}: { 
  icon: any; 
  label: string; 
  variant?: "default" | "gold" | "primary";
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`
      flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm
      ${variant === "default" && "bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80"}
      ${variant === "gold" && "bg-brand-gold text-on-gold hover:opacity-90"}
      ${variant === "primary" && "bg-primary text-white hover:bg-primary/90"}
    `}>
      <Icon size={18} strokeWidth={3} />
      {label}
    </button>
  );
}
