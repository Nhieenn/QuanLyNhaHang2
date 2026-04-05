"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Users, 
  Calendar as CalendarIcon, 
  UserPlus, 
  CheckCircle2, 
  Clock4, 
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore, Staff } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

const SHIFT_HOURS = [
  { id: "01", name: "Morning", range: "08:00 - 12:00", icon: Clock4 },
  { id: "02", name: "Afternoon", range: "12:00 - 16:00", icon: Clock4 },
  { id: "03", name: "Evening", range: "16:00 - 20:00", icon: Clock4 },
  { id: "04", name: "Night", range: "20:00 - 00:00", icon: Clock4 },
];

export default function ShiftsPage() {
  const { language } = useSettingsStore();
  const t = translations[language].header;
  const commonT = translations[language].common;
  
  const { staffList, schedules, registerStaffToShift, getCurrentShiftId } = useUserStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"schedule" | "staff">("schedule");
  
  // Format Date for ID: #MMDD
  const datePrefix = `#${String(selectedDate.getMonth() + 1).padStart(2, '0')}${String(selectedDate.getDate()).padStart(2, '0')}`;
  const currentShiftId = getCurrentShiftId();

  const handleRegister = (shiftNum: string, staffId: string) => {
    registerStaffToShift(`${datePrefix}-${shiftNum}`, staffId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header Section */}
      <div className="px-10 pt-10 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-on-surface tracking-tight font-display italic uppercase">Shift Hub</h2>
          <p className="text-outline mt-1 font-bold text-sm">Managing the rhythm of your restaurant</p>
        </div>
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === "schedule" ? "bg-white text-primary shadow-sm" : "text-outline hover:bg-white/40"
            )}
          >
            Weekly Schedule
          </button>
          <button 
            onClick={() => setActiveTab("staff")}
            className={cn(
              "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === "staff" ? "bg-white text-primary shadow-sm" : "text-outline hover:bg-white/40"
            )}
          >
            Staff Directory
          </button>
        </div>
      </div>

      <main className="flex-1 p-10 pt-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Shift Grid */}
        <div className="col-span-8 space-y-8">
          
          {/* Current Active Shift Banner */}
          <div className="bg-primary text-white rounded-[40px] p-10 relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 p-12 opacity-10">
                <Clock size={200} strokeWidth={1} />
            </div>
            
            <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-2">
                    <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Active Now</span>
                    <h3 className="text-6xl font-black tracking-tighter">{currentShiftId}</h3>
                    <p className="font-bold text-white/70">The kitchen is buzzing. {schedules[currentShiftId]?.length || 0} staff members currently on duty.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/20 text-center min-w-[160px]">
                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-60 italic">Next Switch</span>
                    <span className="text-3xl font-black">12:00 PM</span>
                </div>
            </div>
          </div>

          {/* Today's 4 Shifts */}
          <div className="grid grid-cols-2 gap-6 pb-20">
            {SHIFT_HOURS.map((shift) => {
              const fullShiftId = `${datePrefix}-${shift.id}`;
              const assignedStaff = schedules[fullShiftId] || [];
              const isActive = currentShiftId === fullShiftId;

              return (
                <div 
                  key={shift.id}
                  className={cn(
                    "bg-surface-container-lowest rounded-[32px] p-8 border-2 transition-all flex flex-col gap-6",
                    isActive ? "border-primary shadow-xl scale-[1.02]" : "border-transparent hover:border-surface-container-high"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="bg-surface-container p-3 rounded-2xl">
                        <shift.icon size={24} className={isActive ? "text-primary" : "text-outline"} />
                    </div>
                    <span className="font-black text-xs text-outline">{shift.range}</span>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-on-surface tracking-tight">{fullShiftId}</h4>
                    <p className="text-xs font-bold text-outline mt-1 italic">{shift.name} Shift</p>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    <span className="text-[9px] font-black text-outline uppercase tracking-widest">Assigned Staff ({assignedStaff.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {assignedStaff.length > 0 ? (
                        assignedStaff.map(sid => {
                          const s = staffList.find(st => st.id === sid);
                          return (
                            <div key={sid} className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
                                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-black">
                                    {s?.avatar}
                                </div>
                                <span className="text-[10px] font-bold text-on-surface">{s?.name}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[10px] font-medium text-outline/40 p-4 border border-dashed border-outline/20 rounded-2xl w-full text-center">
                            No staff registered yet
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {}} // This would open a staff picker
                    className="w-full py-4 bg-surface-container-low hover:bg-primary/5 text-primary hover:text-primary-dim rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} />
                    Manage Staff
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Staff Registration Side Panel */}
        <div className="col-span-4 bg-surface-container-low rounded-[40px] p-8 flex flex-col gap-8 shadow-sm border border-surface-container-high h-fit sticky top-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} />
            </div>
            <div>
                <h4 className="font-black text-xl text-on-surface tracking-tight leading-none">Register Staff</h4>
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mt-2">Assigning to {currentShiftId}</p>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-outline uppercase tracking-widest block ml-1">Available Personnel</span>
            <div className="space-y-3">
                {staffList.map((staff) => {
                    const isRegistered = schedules[currentShiftId]?.includes(staff.id);
                    
                    return (
                        <div 
                            key={staff.id}
                            className={cn(
                                "p-4 rounded-[24px] border-2 transition-all flex items-center justify-between",
                                isRegistered 
                                    ? "bg-brand-teal/5 border-brand-teal/20" 
                                    : "bg-surface-container-lowest border-transparent hover:border-outline/10"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs",
                                    staff.role === "Manager" ? "bg-brand-coral/10 text-on-coral" : "bg-primary/10 text-primary"
                                )}>
                                    {staff.avatar}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-on-surface text-sm uppercase tracking-tight">{staff.name}</span>
                                    <span className="text-[9px] font-black text-outline uppercase tracking-widest">{staff.role} • {staff.isFullTime ? "FT" : "PT"}</span>
                                </div>
                            </div>

                            {isRegistered ? (
                                <div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center">
                                    <UserCheck size={16} strokeWidth={3} />
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleRegister(currentShiftId.split('-')[1], staff.id)}
                                    className="p-2 hover:bg-primary/10 text-outline hover:text-primary transition-all rounded-xl active:scale-90"
                                >
                                    <UserPlus size={20} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>

          <div className="bg-surface-container-low/50 p-6 rounded-3xl border border-dashed border-outline/20">
              <p className="text-[10px] font-bold text-outline text-center leading-relaxed">
                Staff can only be assigned to shifts they are qualified for. Full-time staff are automatically suggested for their primary shifts.
              </p>
          </div>
        </div>
      </main>
    </div>
  );
}
