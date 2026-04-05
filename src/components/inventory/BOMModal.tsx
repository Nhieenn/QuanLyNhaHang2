"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Save, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU_ITEMS, MenuItem } from "@/constants/menu";
import { useInventoryStore } from "@/store/inventoryStore";
import { useBOMStore, BOMRequirement } from "@/store/bomStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BOMModal({ isOpen, onClose }: BOMModalProps) {
  const { language } = useSettingsStore();
  const t = translations[language].inventoryPage.bomModal;

  const { items: inventoryItems } = useInventoryStore();
  const { recipes, setRecipe } = useBOMStore();
  
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<BOMRequirement[]>([]);

  if (!isOpen) return null;

  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setCurrentRecipe(recipes[item.id] || []);
  };

  const addIngredient = () => {
    if (inventoryItems.length === 0) return;
    setCurrentRecipe([...currentRecipe, { ingredientId: inventoryItems[0].id, quantity: 0 }]);
  };

  const removeIngredient = (index: number) => {
    setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, updates: Partial<BOMRequirement>) => {
    setCurrentRecipe(currentRecipe.map((ing, i) => i === index ? { ...ing, ...updates } : ing));
  };

  const handleSave = () => {
    if (selectedMenuItem) {
      setRecipe(selectedMenuItem.id, currentRecipe);
      // Optional: Show success toast
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">{t.title}</h2>
            <p className="text-sm text-outline font-bold">{t.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-outline">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Menu List */}
          <div className="w-1/3 border-r border-surface-container overflow-y-auto p-4 flex flex-col gap-2 bg-surface-container-lowest">
            <span className="text-[10px] font-black text-outline/60 tracking-widest uppercase ml-2 mb-2">Chọn món để cấu hình</span>
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectMenuItem(item)}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-4 transition-all text-left",
                  selectedMenuItem?.id === item.id 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-white hover:bg-surface-container-low text-on-surface border border-surface-container-low"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container-low/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">
                    {item.type === "drink" ? "☕" : "🥐"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-xs uppercase tracking-tight truncate">{item.name}</p>
                  <p className={cn("text-[10px] font-bold", selectedMenuItem?.id === item.id ? "text-white/60" : "text-outline")}>
                    {item.category}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Side: Recipe Editor */}
          <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6">
            {!selectedMenuItem ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                <Info size={48} className="mb-4" />
                <p className="font-black text-sm uppercase tracking-widest text-center">Chọn một món bên trái<br/>để chỉnh sửa định mức</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-on-surface tracking-tight">Định mức cho {selectedMenuItem.name}</h3>
                  <button 
                    onClick={addIngredient}
                    className="flex items-center gap-2 bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-teal/20 transition-all border border-brand-teal/20"
                  >
                    <Plus size={16} /> {t.addItem}
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {currentRecipe.length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-surface-container rounded-3xl flex flex-center items-center justify-center text-outline/40">
                      <p className="font-bold text-sm">Chưa có thành phần nào</p>
                    </div>
                  ) : (
                    currentRecipe.map((req, index) => (
                      <div key={index} className="flex gap-4 items-center animate-in slide-in-from-right-4 duration-300">
                        <div className="flex-1">
                          <select 
                            value={req.ingredientId}
                            onChange={(e) => updateIngredient(index, { ingredientId: e.target.value })}
                            className="w-full bg-surface-container-low border border-surface-container rounded-2xl p-4 font-bold text-on-surface focus:ring-2 focus:ring-primary/20 appearance-none"
                          >
                            {inventoryItems.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input 
                            type="number"
                            value={req.quantity || ""}
                            step="0.01"
                            onChange={(e) => updateIngredient(index, { quantity: parseFloat(e.target.value) || 0 })}
                            placeholder="Qty"
                            className="w-full bg-surface-container-low border border-surface-container rounded-2xl p-4 font-bold text-on-surface text-center"
                          />
                        </div>
                        <button 
                          onClick={() => removeIngredient(index)}
                          className="p-4 text-brand-coral/40 hover:text-brand-coral transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto pt-8 flex gap-4">
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-brand-teal text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-dim transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> {t.saveBom}
                    </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
