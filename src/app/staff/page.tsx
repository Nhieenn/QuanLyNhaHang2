"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Settings, 
  Trash2, 
  User, 
  Shield, 
  Coffee, 
  ChefHat,
  Search,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore, Staff } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function StaffManagementPage() {
  const { staffList, fetchStaff, addStaff, updateStaff, deleteStaff, loading } = useUserStore();
  const { language } = useSettingsStore();
  const t = translations[language].staffPage;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Omit<Staff, "id">>({
    name: "",
    pin: "",
    role: "Waiter",
    avatar: "ST"
  });

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        pin: staff.pin,
        role: staff.role,
        avatar: staff.avatar
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        pin: "",
        role: "Waiter",
        avatar: "ST"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      await updateStaff(editingStaff.id, formData);
    } else {
      await addStaff({
        ...formData,
        avatar: formData.name.substring(0, 2).toUpperCase()
      });
    }
    setIsModalOpen(false);
  };

  const roleIcons = {
    Waiter: <Coffee size={20} />,
    Manager: <Shield size={20} />,
    Chef: <ChefHat size={20} />
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
              className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:translate-y-[-2px] hover:shadow-ambient transition-all active:scale-95"
            >
              <UserPlus size={20} />
              {t.addStaff}
            </button>
          </div>

          {loading && staffList.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {staffList.map((staff) => (
                <div 
                  key={staff.id}
                  className="bg-white rounded-[40px] p-8 border border-surface-container-low hover:shadow-ambient transition-all group relative overflow-hidden"
                >
                    {/* Role Pattern Background */}
                    <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        {React.cloneElement(roleIcons[staff.role as keyof typeof roleIcons], { size: 120 })}
                    </div>

                    <div className="flex items-center gap-6 mb-8 relative z-10">
                        <div className="w-20 h-20 rounded-[28px] bg-primary/5 flex items-center justify-center text-primary text-2xl font-black border border-primary/10">
                            {staff.avatar}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-on-surface">{staff.name}</h3>
                            <div className="flex items-center gap-1.5 text-primary mt-1">
                                {roleIcons[staff.role as keyof typeof roleIcons]}
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {(t.roles as any)[staff.role]}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center px-4 py-3 bg-surface-container-low rounded-2xl">
                            <span className="text-xs font-bold text-outline uppercase tracking-wider">{t.form.pin}</span>
                            <span className="font-black text-on-surface tracking-[0.2em]">****</span>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3 relative z-10">
                        <button 
                            onClick={() => handleOpenModal(staff)}
                            className="flex-1 py-4 bg-surface-container-low text-on-surface rounded-2xl font-black text-xs hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                        >
                            <Settings size={14} />
                            {t.editStaff}
                        </button>
                        <button 
                            onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
                                    deleteStaff(staff.id);
                                }
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-brand-coral/5 text-brand-coral rounded-2xl hover:bg-brand-coral hover:text-white transition-all shadow-sm"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 bg-black/40 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-black text-on-surface tracking-tight">
                        {editingStaff ? t.editStaff : t.addStaff}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low text-outline hover:bg-surface-container transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.name}</label>
                        <input 
                            required
                            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-lg font-black text-on-surface focus:outline-none transition-all placeholder:text-outline/30 shadow-inner"
                            placeholder="e.g. Elena Smith"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.pin}</label>
                            <input 
                                required
                                maxLength={4}
                                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-2xl font-black text-on-surface text-center focus:outline-none transition-all tracking-[0.5em] shadow-inner"
                                placeholder="0000"
                                value={formData.pin}
                                onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-outline ml-4">{t.form.role}</label>
                            <select 
                                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-[28px] px-8 py-5 text-lg font-black text-on-surface focus:outline-none transition-all shadow-inner appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_24px_center] bg-no-repeat"
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                            >
                                <option value="Waiter">{(t.roles as any).Waiter}</option>
                                <option value="Manager">{(t.roles as any).Manager}</option>
                                <option value="Chef">{(t.roles as any).Chef}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-5 rounded-[28px] font-black text-sm text-outline hover:bg-surface-container-low transition-colors"
                        >
                            {t.form.cancel}
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] py-5 bg-primary text-white rounded-[28px] font-black text-sm shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all active:scale-95"
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
