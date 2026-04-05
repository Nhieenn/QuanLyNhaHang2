"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Minus,
  Plus,
  Hash,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTableStore } from "@/store/tableStore";
import { TablePickerModal } from "@/components/reservations/TablePickerModal";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

function ReservationsContent() {
  const { language } = useSettingsStore();
  const t = translations[language].reservationsPage;
  const tableMapT = translations[language].tableMapPage;

  const now = new Date();
  const [viewDate, setViewDate] = useState(now); 
  const [selectedFullDate, setSelectedFullDate] = useState(now);
  const [selectedSlot, setSelectedSlot] = useState("19:00");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [paxCount, setPaxCount] = useState(2);
  const [isPaxPickerOpen, setIsPaxPickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  
  const [paxEntryMode, setPaxEntryMode] = useState<"stepper" | "numpad">("stepper");
  const [tempPaxValue, setTempPaxValue] = useState("");

  const { addReservation, reservations, floors, assignTable } = useTableStore();
  const [guestName, setGuestName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  const selectedTable = floors.flatMap(f => f.tables).find(t => t.id === selectedTableId);

  // Get all empty tables across all floors
  const availableTables = floors.flatMap(f => f.tables.filter(t => t.status === "empty"));
  const totalTablesCount = floors.reduce((acc, f) => acc + f.tables.length, 0);

  const handleConfirmBooking = () => {
    if (!guestName.trim()) return;

    setIsSendingNotification(true);
    
    // Create reservation with tableId
    addReservation({
      guestName,
      pax: paxCount,
      date: selectedFullDate.toISOString().split('T')[0],
      time: selectedSlot,
      notes,
      tableId: selectedTableId || undefined
    });

    // Simulate notification sending
    setTimeout(() => {
        setIsSendingNotification(false);
        setIsSuccess(true);
    }, 1500);

    setTimeout(() => {
      setIsSuccess(false);
      setGuestName("");
      setNotes("");
      setSelectedTableId(null);
    }, 5000);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() + i);
  const paxOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Dynamic Time Slots Check
  const baseSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
  const dateStr = selectedFullDate.toISOString().split('T')[0];
  
  const timeSlots = baseSlots.map(time => {
    const bookingsAtTime = reservations.filter(r => r.date === dateStr && r.time === time);
    // Nếu số đơn đặt chỗ >= số bàn hiện có (đơn giản hóa), coi như hết chỗ
    const isOccupied = bookingsAtTime.length >= totalTablesCount;
    return { time, status: isOccupied ? "occupied" : "available" as const };
  });

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

  const handleYearSelect = (year: number) => {
    setViewDate(new Date(year, currentMonth, 1));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const handlePaxSelect = (count: number) => {
    setPaxCount(count);
  };

  const handleNumpadAction = (action: string) => {
    if (action === "OK") {
      const val = parseInt(tempPaxValue);
      if (!isNaN(val) && val > 0) setPaxCount(val);
      setPaxEntryMode("stepper");
      setTempPaxValue("");
    } else if (action === "DEL") {
      setTempPaxValue(prev => prev.slice(0, -1));
    } else {
      if (tempPaxValue.length < 2) {
        setTempPaxValue(prev => prev + action);
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedSlot(time);
    setIsTimePickerOpen(false);
  };

  // Dynamic Occupancy Logic
  const isSelectedDateToday = selectedFullDate.toDateString() === new Date().toDateString();
  const currentOccupancy = isSelectedDateToday 
    ? floors.flatMap(f => f.tables).filter(t => t.status !== "empty").length 
    : 0;
  
  const slotBookingsCount = reservations.filter(r => 
    r.date === selectedFullDate.toISOString().split('T')[0] && 
    r.time === selectedSlot && 
    r.status !== "cancelled"
  ).length;

  const totalEffectiveLoad = currentOccupancy + slotBookingsCount;
  const loadRate = (totalEffectiveLoad / (totalTablesCount || 1)) * 100;

  const getStatusInfo = () => {
    if (loadRate >= 95) return { label: t.statusFull, color: "bg-brand-coral/20 text-brand-coral border border-brand-coral/30" };
    if (loadRate >= 75) return { label: t.statusHighDemand, color: "bg-[#ffca51] text-on-surface shadow-sm" };
    if (loadRate >= 40) return { label: t.statusModerate, color: "bg-primary/20 text-primary border border-primary/30" };
    return { label: t.statusQuiet, color: "bg-brand-emerald/20 text-[#006a67] border border-brand-emerald/30" };
  };

  const statusInfo = getStatusInfo();

  const isSelected = (date: number) => {
    return selectedFullDate.getDate() === date && 
           selectedFullDate.getMonth() === currentMonth && 
           selectedFullDate.getFullYear() === currentYear;
  };

  const monthNames = t.calendar.months;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Reservations Title Section - Positioned like Table Map's 'Main Dining Room' */}
      <div className="px-10 pt-6">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">{t.title}</h2>
        <p className="text-outline mt-1 font-medium">{t.subtitle}</p>
      </div>
      {isSendingNotification && (
        <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black text-sm animate-pulse mx-10 mt-4 flex items-center gap-3">
           <Loader2 size={16} className="animate-spin" />
           {t.sendingSms}
        </div>
      )}
      {isSuccess && (
        <div className="bg-brand-teal/20 text-[#006a67] px-6 py-3 rounded-2xl font-black text-sm animate-in fade-in slide-in-from-top-4 mx-10 mt-4">
           {t.bookingSaved}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-10 pt-4 grid grid-cols-12 gap-8">
        
        {/* Left Column: Calendar & Slots */}
        <div className="col-span-4 flex flex-col gap-8">
          
          {/* Calendar Card */}
          <div className="bg-surface-container-lowest rounded-[32px] p-8 shadow-sm min-h-[460px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="text-xl font-black text-on-surface font-display tracking-tight hover:text-primary transition-colors flex items-center gap-2 group"
              >
                {monthNames[currentMonth]} {currentYear}
                <ChevronRight size={20} className={cn("transition-transform", isPickerOpen ? "rotate-90" : "group-hover:translate-x-1")} />
              </button>
              {!isPickerOpen && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {isPickerOpen ? (
              <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Year Slider (Horizontal) */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-outline/60 tracking-widest uppercase ml-1">{t.calendar.selectYear}</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                          "px-6 py-2 rounded-xl font-bold text-sm snap-center whitespace-nowrap transition-all",
                          currentYear === year 
                            ? "bg-[#006a67] text-white shadow-md shadow-[#006a67]/20" 
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Month Grid */}
                <div className="flex flex-col gap-3 flex-1">
                  <span className="text-[10px] font-black text-outline/60 tracking-widest uppercase ml-1">{t.calendar.selectMonth}</span>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {monthNames.map((name, i) => (
                      <button
                        key={name}
                        onClick={() => handleMonthSelect(i)}
                        className={cn(
                          "rounded-xl font-bold text-xs transition-all",
                          currentMonth === i 
                            ? "bg-primary-container text-primary border-2 border-primary" 
                            : "bg-surface-container-low text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        {name.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsPickerOpen(false)}
                  className="mt-2 py-3 bg-surface-container-highest text-on-surface font-black text-xs rounded-xl uppercase tracking-widest hover:bg-outline/10 transition-colors"
                >
                  {t.calendar.backToCalendar}
                </button>
              </div>
            ) : (
              <div className="flex-1 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 text-center">
                  {t.calendar.days.map(day => (
                    <span key={day} className="text-[10px] font-black text-outline/40 tracking-widest mb-4 uppercase">{day}</span>
                  ))}
                  
                  {/* Dynamic Padding */}
                  {[...Array(firstDay)].map((_, i) => (
                    <span key={`pad-${i}`} className="h-10"></span>
                  ))}

                  {/* Dynamic Date Buttons */}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const date = i + 1;
                    const active = isSelected(date);
                    
                    // Dynamic Weekend Check
                    const dayOfWeek = (firstDay + i) % 7;
                    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                    
                    return (
                      <button 
                        key={date}
                        onClick={() => setSelectedFullDate(new Date(currentYear, currentMonth, date))}
                        className="relative flex items-center justify-center group h-12"
                      >
                        {active && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute w-12 h-12 bg-[#71f5ea]/40 rounded-2xl scale-110 blur-[1px]"></div>
                            <div className="w-10 h-10 bg-[#006a67] rounded-[14px] z-10 shadow-sm"></div>
                          </div>
                        )}
                        <span className={cn(
                          "relative z-20 text-base transition-all",
                          active ? "text-white font-black scale-110" : "text-on-surface/80 font-bold hover:text-primary",
                          !active && isWeekend && "font-black text-on-surface"
                        )}>
                          {date}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Available Slots Card */}
          <div className="bg-surface-container-low rounded-[32px] p-8">
            <div className="flex items-center gap-3 mb-7">
              <Clock size={24} className="text-[#006a67]" strokeWidth={2.5} />
              <h2 className="text-xl font-black text-on-surface font-display tracking-tight">{t.calendar.availableSlots}</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={slot.status === "occupied"}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={cn(
                    "py-4 rounded-2xl font-black text-base transition-all duration-200",
                    selectedSlot === slot.time 
                      ? "bg-[#006a67] text-white shadow-lg shadow-[#006a67]/20 scale-105" 
                      : slot.status === "occupied"
                        ? "bg-surface-container-highest/30 text-outline/30 cursor-not-allowed italic line-through"
                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-highest hover:translate-y-[-2px]"
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: New Reservation Form */}
        <div className="col-span-8 bg-surface-container-lowest rounded-[32px] p-12 shadow-sm border border-surface-container-low flex flex-col relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-black text-on-surface font-display tracking-tight">{t.form.title}</h1>
              <p className="text-outline font-medium">{t.form.subtitle}</p>
            </div>
            <div className={cn(
              "text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest transition-all duration-500",
              statusInfo.color
            )}>
              {statusInfo.label}
            </div>
          </div>

          <div className="flex flex-col gap-8 flex-1">
            {/* Guest Name */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">{t.form.guestName}</label>
              <div className="bg-surface-container-low p-5 rounded-2xl focus-within:ring-2 ring-primary/20 transition-all">
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={t.form.namePlaceholder}
                  className="bg-transparent border-none focus:ring-0 w-full text-xl font-bold text-on-surface placeholder-on-surface/20"
                />
              </div>
            </div>

            {/* Table Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">{t.form.assignTable}</label>
              <div 
                onClick={() => setIsTablePickerOpen(true)}
                className={cn(
                  "bg-surface-container-low p-6 rounded-2xl flex items-center justify-between cursor-pointer group transition-all",
                  selectedTableId ? "bg-brand-coral/5 border-2 border-brand-coral/20" : "hover:bg-surface-container-highest"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs",
                    selectedTableId ? "bg-brand-coral text-white" : "bg-surface-container-highest text-outline"
                  )}>
                    {selectedTable ? `${t.form.tablePrefix}-${selectedTable.number}` : "???"}
                  </div>
                  <div>
                    <span className="font-bold text-on-surface">
                      {selectedTable ? `${tableMapT.table} ${selectedTable.number}` : t.form.noTable}
                    </span>
                    <p className="text-[10px] font-black text-outline uppercase tracking-widest">
                       {selectedTableId ? (language === 'vi' ? "Đã giữ vị trí cụ thể" : "Specific placement secured") : (language === 'vi' ? "Chạm để chọn từ sơ đồ" : "Touch to select from floor plan")}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-outline group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* PAX & Time */}
            <div className="grid grid-cols-2 gap-6">
              {/* PAX Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">{t.form.paxLabel}</label>
                <div 
                  onClick={() => setIsPaxPickerOpen(!isPaxPickerOpen)}
                  className={cn(
                    "bg-surface-container-low p-5 rounded-2xl flex items-center justify-between group cursor-pointer transition-all",
                    isPaxPickerOpen ? "bg-[#006a67]/5 shadow-inner" : "hover:bg-surface-container-highest"
                  )}
                >
                  <span className="text-xl font-bold text-on-surface">{paxCount} {t.form.guestsSuffix}</span>
                  <Users size={20} className={cn("transition-colors", isPaxPickerOpen ? "text-[#006a67]" : "text-outline group-hover:text-primary")} />
                </div>
              </div>

              {/* Time Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">{t.form.timePreference}</label>
                <div 
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                  className={cn(
                    "bg-surface-container-low p-5 rounded-2xl flex items-center justify-between group cursor-pointer transition-all font-mono",
                    isTimePickerOpen ? "bg-[#006a67]/5 shadow-inner" : "hover:bg-surface-container-highest"
                  )}
                >
                  <span className="text-xl font-bold text-on-surface">{selectedSlot}</span>
                  <Clock size={20} className={cn("transition-colors", isTimePickerOpen ? "text-[#006a67]" : "text-outline group-hover:text-primary")} />
                </div>
              </div>
            </div>

            {/* Smart Pickers Overlay Section */}
            {(isPaxPickerOpen || isTimePickerOpen) && (
              <div className="bg-surface-container-low p-8 rounded-[32px] animate-in fade-in zoom-in-95 duration-200 border border-[#006a67]/20 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-on-surface tracking-tight uppercase">
                    {isPaxPickerOpen ? t.paxPicker.title : t.paxPicker.titleTime}
                  </h3>
                  <button 
                    onClick={() => { setIsPaxPickerOpen(false); setIsTimePickerOpen(false); setPaxEntryMode("stepper"); }}
                    className="text-xs font-black text-outline hover:text-on-surface transition-colors"
                  >
                    {t.paxPicker.close}
                  </button>
                </div>

                {isPaxPickerOpen ? (
                  <div className="flex-1 flex flex-col justify-center">
                    {paxEntryMode === "stepper" ? (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Stepper Control */}
                        <div className="flex items-center justify-between bg-white rounded-3xl p-6 shadow-sm mb-8">
                          <button 
                            onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                            className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-brand-coral hover:text-white transition-all active:scale-90"
                          >
                            <Minus size={32} strokeWidth={3} />
                          </button>
                          
                          <div 
                            onClick={() => setPaxEntryMode("numpad")}
                            className="flex flex-col items-center cursor-pointer group"
                          >
                            <span className="text-7xl font-black text-primary tracking-tighter group-active:scale-95 transition-transform">
                              {paxCount}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-black text-outline uppercase tracking-widest mt-1">
                              <Hash size={10} />
                              <span>{t.paxPicker.tapToType}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => setPaxCount(paxCount + 1)}
                            className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-brand-teal hover:text-white transition-all active:scale-90"
                          >
                            <Plus size={32} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-5 gap-3">
                          {[2, 4, 6, 10, 12].map(preset => (
                            <button
                              key={preset}
                              onClick={() => setPaxCount(preset)}
                              className={cn(
                                "py-4 rounded-xl font-black text-base transition-all",
                                paxCount === preset ? "bg-primary text-white shadow-lg" : "bg-white text-on-surface border border-surface-container hover:bg-primary/10"
                              )}
                            >
                              {preset}P
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
                        <div className="bg-white px-8 py-4 rounded-2xl mb-6 shadow-inner border-2 border-primary">
                          <span className="text-5xl font-black text-primary tracking-tighter">
                            {tempPaxValue || "0"}
                            <span className="text-xl ml-2 font-black text-outline/40">{t.paxPicker.paxUnit}</span>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px]">
                          {[1,2,3,4,5,6,7,8,9].map(n => (
                            <button 
                              key={n} 
                              onClick={() => handleNumpadAction(n.toString())}
                              className="h-16 rounded-2xl bg-white text-on-surface font-black text-2xl shadow-sm hover:bg-primary hover:text-white transition-all active:scale-95"
                            >
                              {n}
                            </button>
                          ))}
                          <button onClick={() => handleNumpadAction("0")} className="h-16 rounded-2xl bg-white text-on-surface font-black text-2xl shadow-sm hover:bg-primary hover:text-white transition-all active:scale-95">0</button>
                          <button onClick={() => handleNumpadAction("DEL")} className="h-16 rounded-2xl bg-brand-coral/10 text-on-coral font-black text-sm uppercase tracking-widest hover:bg-brand-coral hover:text-white transition-all">DEL</button>
                          <button onClick={() => handleNumpadAction("OK")} className="h-16 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-primary-dim">OK</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={slot.status === "occupied"}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={cn(
                          "py-4 rounded-xl font-black text-sm transition-all",
                          selectedSlot === slot.time 
                            ? "bg-[#006a67] text-white shadow-md" 
                            : slot.status === "occupied"
                              ? "opacity-30 cursor-not-allowed line-through"
                              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 flex-1">
              <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">{t.form.notes}</label>
              <div className="bg-surface-container-low p-6 rounded-2xl flex-1 focus-within:bg-white transition-colors border-2 border-transparent focus-within:border-primary/10">
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.form.notesPlaceholder}
                  className="bg-transparent border-none focus:ring-0 w-full h-full text-lg font-semibold text-on-surface placeholder-on-surface/20 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-6">
              <button 
                onClick={handleConfirmBooking}
                disabled={!guestName.trim()}
                className="bg-primary hover:bg-primary-dim disabled:opacity-30 disabled:grayscale text-white py-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 group"
              >
                <span className="text-xl font-black font-display tracking-tight">{t.form.confirmBtn}</span>
                <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-outline/60 text-xs font-semibold">
                <span>{t.form.notificationTip}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TablePickerModal 
        isOpen={isTablePickerOpen} 
        onClose={() => setIsTablePickerOpen(false)} 
        selectedTableId={selectedTableId}
        onSelect={(tabId) => setSelectedTableId(tabId)}
        selectedDate={selectedFullDate.toISOString().split('T')[0]}
        selectedTime={selectedSlot}
      />
    </div>
  );
}

export default function ReservationsPage() {
  return <ReservationsContent />;
}
