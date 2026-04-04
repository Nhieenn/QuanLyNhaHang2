"use client";

import React from "react";
import { 
  Plus, 
  Settings2, 
  FileText, 
  Search, 
  Coffee, 
  Milk, 
  Beef, 
  Leaf, 
  Droplets,
  Zap
} from "lucide-react";
import { SummaryCard } from "@/components/inventory/SummaryCard";
import { InventoryItemCard, InventoryStatus } from "@/components/inventory/InventoryItemCard";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  percentage: number;
  status: InventoryStatus;
  image?: string;
  icon?: React.ReactNode;
}

const MOCK_INVENTORY: InventoryItem[] = [
  { id: "1", name: "Coffee Beans", category: "DRY GOODS", value: 42.5, unit: "KG", percentage: 68, status: "healthy", image: "/inventory/coffee_beans.png" },
  { id: "2", name: "Whole Milk", category: "DAIRY", value: 12.0, unit: "L", percentage: 24, status: "warning", image: "/inventory/whole_milk.png" },
  { id: "3", name: "Avocado", category: "PRODUCE", value: 8, unit: "UNITS", percentage: 9, status: "critical", image: "/inventory/avocado.png" },
  { id: "4", name: "Salmon Fillet", category: "PROTEINS", value: 15.5, unit: "KG", percentage: 82, status: "healthy", image: "/inventory/salmon_fillet.png" },
  { id: "5", name: "Baby Spinach", category: "PRODUCE", value: 4.2, unit: "KG", percentage: 55, status: "healthy", image: "/inventory/baby_spinach.png" },
];

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto py-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight leading-none mb-2">Inventory Dashboard</h1>
          <p className="text-sm font-bold text-outline tracking-tight">Manage your stock levels, suppliers, and BOM formulas.</p>
        </div>
        
        <div className="flex gap-4">
          <ActionButton icon={Settings2} label="Manage BOM Formulas" />
          <ActionButton 
            icon={FileText} 
            label="Generate Purchase Order" 
            variant="gold" 
          />
          <ActionButton 
            icon={Plus} 
            label="Add Stock" 
            variant="primary" 
          />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          type="low-stock" 
          value={12} 
          label="Low Stock Items" 
        />
        <SummaryCard 
          type="assets" 
          value="$14,208.50" 
          label="Current Assets" 
        />
        <SummaryCard 
          type="wastage" 
          value="Wastage Report" 
          label="Sustainable Kitchen"
          subtitle="Your organic waste has decreased by 14% this week due to improved salmon portioning."
          actionLabel="View Report"
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {MOCK_INVENTORY.map((item) => (
          <InventoryItemCard 
            key={item.id}
            name={item.name}
            category={item.category}
            value={item.value}
            unit={item.unit}
            percentage={item.percentage}
            status={item.status}
            image={item.image}
            icon={item.icon}
          />
        ))}
        <InventoryItemCard 
          isAddPlaceholder 
          name="" category="" value="" unit="" percentage={0} status="healthy" 
        />
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, variant = "default" }: { icon: any; label: string; variant?: "default" | "gold" | "primary" }) {
  return (
    <button className={`
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
