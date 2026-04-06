"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  TrendingDown, 
  AlertTriangle, 
  RefreshCcw,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { translations } from "@/lib/translations";
import { useSettingsStore } from "@/store/settingsStore";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const { language } = useSettingsStore();

  const fetchIngredients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });
    if (data) setIngredients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const item = {
      id: editingItem?.id || formData.get('id') as string,
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      current_stock: Number(formData.get('current_stock')),
      min_stock: Number(formData.get('min_stock')),
    };

    if (editingItem) {
      await supabase.from('ingredients').update(item).eq('id', item.id);
    } else {
      await supabase.from('ingredients').insert([item]);
    }

    setShowModal(false);
    setEditingItem(null);
    fetchIngredients();
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = ingredients.length;
  const lowStockCount = ingredients.filter(i => i.current_stock <= i.min_stock).length;

  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-4xl font-black text-on-surface tracking-tight">Quản lý Kho hàng</h2>
          <p className="text-outline mt-1 font-bold">Theo dõi và cập nhật nguyên vật liệu Realtime</p>
        </div>
        
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#006a67] text-white font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all active:scale-95 shadow-lg"
        >
          <Plus size={18} strokeWidth={3} />
          Thêm Nguyên liệu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-surface-container-low shadow-sm">
          <div className="flex items-center gap-4 text-outline mb-4">
            <Package size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tổng mặt hàng</span>
          </div>
          <div className="text-4xl font-black text-on-surface">
            {isMounted ? totalItems : 0}
          </div>
        </div>
        <div className="bg-brand-gold/10 p-8 rounded-[32px] border border-brand-gold/20 shadow-sm">
          <div className="flex items-center gap-4 text-[#856404] mb-4">
            <AlertTriangle size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Sắp hết hàng</span>
          </div>
          <div className="text-4xl font-black text-[#856404]">
            {isMounted ? lowStockCount : 0}
          </div>
        </div>
        <div className="bg-brand-teal/10 p-8 rounded-[32px] border border-brand-teal/20 shadow-sm text-on-surface">
          <div className="flex items-center gap-4 opacity-70 mb-4">
            <TrendingDown size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tỉ lệ tiêu thụ</span>
          </div>
          <div className="text-4xl font-black">Ổn định</div>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="bg-white rounded-[40px] overflow-hidden border border-surface-container-low shadow-ambient">
        <div className="p-8 border-b border-surface-container-low flex justify-between items-center bg-surface-container-lowest">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Tìm theo tên hoặc mã nguyên liệu..."
              className="w-full bg-white border border-surface-container-high rounded-full py-3 pl-12 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchIngredients}
            className="p-3 hover:bg-surface-container-low rounded-full transition-colors text-outline"
          >
            <RefreshCcw size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest">
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest">Mã/Tên Nguyên liệu</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-center">Đơn vị</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-right">Tồn hiện tại</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-outline uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-surface-container-low hover:bg-surface-container-lowest/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-on-surface">{item.name}</span>
                      <span className="text-[10px] font-black text-outline tracking-widest uppercase">{item.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-surface-container-low rounded-full text-[10px] font-black text-outline uppercase">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-xl text-on-surface">
                    {item.current_stock.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {item.current_stock <= item.min_stock ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-coral/10 text-on-coral border border-brand-coral/20">
                        <AlertTriangle size={12} />
                        <span className="text-[10px] font-black uppercase">Sắp hết</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                        <Package size={12} />
                        <span className="text-[10px] font-black uppercase">Dồi dào</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 text-outline">
                      <button 
                        onClick={() => { setEditingItem(item); setShowModal(true); }}
                        className="p-2 hover:bg-brand-teal/10 hover:text-brand-teal rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-[500px] bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-on-surface tracking-tight">
                {editingItem ? "Cập nhật Kho" : "Thêm Nguyên liệu"}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Mã Nguyên liệu</label>
                <input 
                  name="id"
                  defaultValue={editingItem?.id}
                  disabled={!!editingItem}
                  required
                  placeholder="ví dụ: beans, milk..."
                  className="w-full bg-surface-container-low rounded-2xl py-4 px-6 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Tên nguyên liệu</label>
                <input 
                  name="name"
                  defaultValue={editingItem?.name}
                  required
                  placeholder="Nhập tên nguyên liệu..."
                  className="w-full bg-surface-container-low rounded-2xl py-4 px-6 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Tồn kho hiện tại</label>
                  <input 
                    name="current_stock"
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.current_stock}
                    required
                    className="w-full bg-surface-container-low rounded-2xl py-4 px-6 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Đơn vị (g, ml, pcs...)</label>
                  <input 
                    name="unit"
                    defaultValue={editingItem?.unit}
                    required
                    className="w-full bg-surface-container-low rounded-2xl py-4 px-6 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Mức cảnh báo sắp hết</label>
                <input 
                  name="min_stock"
                  type="number"
                  step="0.01"
                  defaultValue={editingItem?.min_stock}
                  required
                  className="w-full bg-surface-container-low rounded-2xl py-4 px-6 font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-brand-teal/20 transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-[#006a67] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#005a57] transition-all shadow-lg mt-4 active:scale-95"
              >
                {editingItem ? "Lưu thay đổi" : "Thêm vào Kho"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
