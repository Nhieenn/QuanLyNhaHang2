"use client";

import React, { useState } from "react";
import { X, Plus, Package, Ruler, BarChart3, Tag } from "lucide-react";
import { useInventoryStore } from "@/store/inventoryStore";
import { cn } from "@/lib/utils";

interface AddStockModalProps {
  onClose: () => void;
}

export function AddStockModal({ onClose }: AddStockModalProps) {
  const { addItem } = useInventoryStore();
  
  const [formData, setFormData] = useState({
    name: "",
    category: "DRY GOODS",
    currentValue: "",
    unit: "KG",
    maxCapacity: "",
    minThreshold: "",
    pricePerUnit: ""
  });

  const categories = ["DRY GOODS", "DAIRY", "PRODUCE", "PROTEINS", "BEVERAGES", "EQUIPMENT"];
  const units = ["KG", "L", "UNITS", "BOXES", "PACKS"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.currentValue) return;

    addItem({
      name: formData.name,
      category: formData.category,
      currentValue: parseFloat(formData.currentValue),
      unit: formData.unit,
      maxCapacity: parseFloat(formData.maxCapacity) || 100,
      minThreshold: parseFloat(formData.minThreshold) || 10,
      pricePerUnit: parseFloat(formData.pricePerUnit) || 0
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-[600px] rounded-[48px] shadow-2xl p-12 animate-in zoom-in-95 duration-500 overflow-hidden no-border-section">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface hover:rotate-90 transition-all duration-300"
        >
          <X size={24} strokeWidth={3} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                <Package size={32} />
            </div>
            <div>
                <h3 className="text-3xl font-black text-on-surface tracking-tight leading-none">Track Item</h3>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mt-2">New Inventory Asset</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
                {/* Item Name */}
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Item Name</label>
                    <div className="bg-surface-container-low px-6 py-4 rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Arabica Coffee Beans"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="bg-transparent border-none focus:ring-0 w-full text-lg font-bold text-on-surface placeholder-on-surface/20"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Category</label>
                    <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-surface-container-low px-6 py-4 rounded-2xl border-none focus:ring-2 ring-primary/20 text-sm font-bold text-on-surface"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Price Per Unit */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Cost Per Unit ($)</label>
                    <div className="bg-surface-container-low px-6 py-4 rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
                        <input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            value={formData.pricePerUnit}
                            onChange={(e) => setFormData({...formData, pricePerUnit: e.target.value})}
                            className="bg-transparent border-none focus:ring-0 w-full text-base font-bold text-on-surface"
                        />
                    </div>
                </div>

                {/* Current Value & Unit */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Current Stock</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-surface-container-low px-6 py-4 rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
                            <input 
                                required
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={formData.currentValue}
                                onChange={(e) => setFormData({...formData, currentValue: e.target.value})}
                                className="bg-transparent border-none focus:ring-0 w-full text-base font-bold text-on-surface"
                            />
                        </div>
                        <select 
                            value={formData.unit}
                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            className="w-24 bg-surface-container-low px-3 py-4 rounded-2xl border-none focus:ring-2 ring-primary/20 text-xs font-black text-outline uppercase"
                        >
                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>

                {/* Min Threshold */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">Alert Threshold</label>
                    <div className="bg-surface-container-low px-6 py-4 rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
                        <input 
                            type="number" 
                            placeholder="Critical level"
                            value={formData.minThreshold}
                            onChange={(e) => setFormData({...formData, minThreshold: e.target.value})}
                            className="bg-transparent border-none focus:ring-0 w-full text-base font-bold text-on-surface"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button 
                type="submit"
                className="w-full bg-primary text-white py-6 rounded-[28px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-dim transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-3"
            >
                Add to Inventory
                <Plus size={24} strokeWidth={3} />
            </button>
        </form>
      </div>
    </div>
  );
}
