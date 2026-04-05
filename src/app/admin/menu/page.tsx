"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Settings, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle,
  Search,
  Loader2,
  X,
  Edit3,
  Coffee,
  ChefHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menuStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MenuItem } from "@/constants/menu";

export default function MenuManagementPage() {
  const { items, fetchItems, addItem, updateItem, deleteItem, loading } = useMenuStore();
  const { language } = useSettingsStore();
  const t = translations[language].menuManagementPage;
  const menuT = translations[language].orderMenuPage;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Omit<MenuItem, "id">>({
    name: "",
    category: "signature",
    description: "",
    price: 0,
    tag: "",
    type: "drink"
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        tag: item.tag || "",
        type: item.type
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "signature",
        description: "",
        price: 0,
        tag: "",
        type: "drink"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateItem(editingItem.id, formData);
    } else {
      // Create a URL-friendly ID
      const id = formData.name.toLowerCase().replace(/\s+/g, '-');
      await addItem({ ...formData, id } as any);
    }
    setIsModalOpen(false);
  };

  const formatPrice = (price: number) => {
    const converted = price * menuT.priceScale;
    if (language === 'vi') {
      return `${converted.toLocaleString()} ${menuT.currencySymbol}`;
    }
    return `${menuT.currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-[240px] flex flex-col h-full bg-surface">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-4xl font-black text-on-surface tracking-tight">{t.title}</h1>
              <p className="text-sm text-outline font-medium mt-2">{t.subtitle}</p>
            </div>
            
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#006a67] text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-ambient transition-all active:scale-95"
            >
              <Plus size={20} />
              {t.addDish}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <div className="space-y-12">
              {Object.keys(menuT.categories).map((catId) => (
                <div key={catId}>
                  <h2 className="text-2xl font-black text-on-surface mb-6 border-l-4 border-[#006a67] pl-4">
                    {(menuT.categories as any)[catId]}
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {items.filter(item => item.category === catId).map((item) => (
                      <div 
                        key={item.id}
                        className="bg-white rounded-[32px] p-6 flex items-center gap-6 border border-surface-container-low hover:shadow-ambient transition-all group"
                      >
                         <div className="w-24 h-24 rounded-[24px] bg-surface-container-low flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.type === "drink" ? <Coffee size={40} className="text-primary/20" /> : <ChefHat size={40} className="text-primary/20" />}
                         </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-black text-on-surface">
                                {(menuT.items as any)[item.id]?.name || item.name}
                              </h3>
                              <p className="text-xs text-outline font-medium line-clamp-1 mt-0.5">
                                {(menuT.items as any)[item.id]?.desc || item.description}
                              </p>
                            </div>
                            <p className="text-lg font-black text-primary ml-4 uppercase">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-6">
                            <button 
                              onClick={() => handleOpenModal(item)}
                              className="text-xs font-black text-outline hover:text-primary flex items-center gap-1.5 transition-colors"
                            >
                              <Edit3 size={14} />
                              {t.editDish}
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Xác nhận xóa món ăn này khỏi thực đơn?")) {
                                  deleteItem(item.id);
                                }
                              }}
                              className="text-xs font-black text-outline hover:text-brand-coral flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 size={14} />
                              {t.deleteDish}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Menu Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 bg-black/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-2xl rounded-[48px] p-10 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-black text-on-surface tracking-tight">
                        {editingItem ? t.editDish : t.addDish}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low text-outline hover:bg-surface-container transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.name}</label>
                            <input 
                                required
                                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-lg font-black text-on-surface focus:outline-none transition-all shadow-inner"
                                placeholder="..."
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.category}</label>
                            <select 
                                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-lg font-black text-on-surface focus:outline-none transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_24px_center] bg-no-repeat"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                {Object.keys(menuT.categories).map(cat => (
                                    <option key={cat} value={cat}>{(menuT.categories as any)[cat]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.price}</label>
                            <div className="relative">
                                <input 
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-2xl font-black text-on-surface focus:outline-none transition-all shadow-inner"
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-outline/30">{menuT.currencySymbol}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.type}</label>
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: "drink"})}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl font-black text-xs transition-all",
                                        formData.type === "drink" ? "bg-primary text-white" : "bg-surface-container-low text-outline"
                                    )}
                                >
                                    {t.form.type.split(',')[0]}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: "food"})}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl font-black text-xs transition-all",
                                        formData.type === "food" ? "bg-primary text-white" : "bg-surface-container-low text-outline"
                                    )}
                                >
                                    {t.form.type.split(',')[1]}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.description}</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-base font-bold text-on-surface focus:outline-none transition-all shadow-inner"
                            placeholder="..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-6 rounded-[28px] font-black text-sm text-outline hover:bg-surface-container-low transition-colors"
                        >
                            {t.form.cancel}
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] py-6 bg-[#006a67] text-white rounded-[28px] font-black text-base shadow-xl shadow-[#006a67]/20 hover:translate-y-[-2px] transition-all active:scale-95"
                        >
                            {t.form.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
