"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservationsPage() {
  const [viewDate, setViewDate] = useState(new Date(2023, 9, 1)); // Khởi tạo: Tháng 10/2023
  const [selectedFullDate, setSelectedFullDate] = useState(new Date(2023, 9, 24));
  const [selectedSlot, setSelectedSlot] = useState("19:00");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [paxCount, setPaxCount] = useState(2);
  const [isPaxPickerOpen, setIsPaxPickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const paxOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const timeSlots = [
    { time: "18:00", status: "available" },
    { time: "18:30", status: "available" },
    { time: "19:00", status: "available" },
    { time: "19:30", status: "available" },
    { time: "20:00", status: "occupied" },
    { time: "20:30", status: "available" },
    { time: "21:00", status: "available" },
    { time: "21:30", status: "available" },
  ];

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
    setIsPaxPickerOpen(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedSlot(time);
    setIsTimePickerOpen(false);
  };

  const isSelected = (date: number) => {
    return selectedFullDate.getDate() === date && 
           selectedFullDate.getMonth() === currentMonth && 
           selectedFullDate.getFullYear() === currentYear;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Reservations Title Section - Positioned like Table Map's 'Main Dining Room' */}
      <div className="px-10 pt-6">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Reservations Hub</h2>
        <p className="text-outline mt-1 font-medium">15 Active Bookings Today</p>
      </div>

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
                  <span className="text-[10px] font-black text-outline/60 tracking-widest uppercase ml-1">Select Year</span>
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
                  <span className="text-[10px] font-black text-outline/60 tracking-widest uppercase ml-1">Select Month</span>
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
                  Back to Calendar
                </button>
              </div>
            ) : (
              <div className="flex-1 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-2 text-center">
                  {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
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
              <h2 className="text-xl font-black text-on-surface font-display tracking-tight">Available Slots</h2>
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
              <h1 className="text-4xl font-black text-on-surface font-display tracking-tight">New Reservation</h1>
              <p className="text-outline font-medium">Fill in the details to secure the table</p>
            </div>
            <div className="bg-[#ffca51] text-on-surface text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              High Demand
            </div>
          </div>

          <div className="flex flex-col gap-8 flex-1">
            {/* Guest Name */}
            <div className="flex flex-col gap-3">
              <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">Guest Name</label>
              <div className="bg-surface-container-low p-5 rounded-2xl">
                <input 
                  type="text" 
                  placeholder="e.g. Julianne Moore"
                  className="bg-transparent border-none focus:ring-0 w-full text-xl font-bold text-on-surface placeholder-on-surface/20"
                />
              </div>
            </div>

            {/* PAX & Time */}
            <div className="grid grid-cols-2 gap-6">
              {/* PAX Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">PAX (Number of Guests)</label>
                <div 
                  onClick={() => setIsPaxPickerOpen(!isPaxPickerOpen)}
                  className={cn(
                    "bg-surface-container-low p-5 rounded-2xl flex items-center justify-between group cursor-pointer transition-all",
                    isPaxPickerOpen ? "bg-[#006a67]/5 shadow-inner" : "hover:bg-surface-container-highest"
                  )}
                >
                  <span className="text-xl font-bold text-on-surface">{paxCount} Guests</span>
                  <Users size={20} className={cn("transition-colors", isPaxPickerOpen ? "text-[#006a67]" : "text-outline group-hover:text-primary")} />
                </div>
              </div>

              {/* Time Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">Time Preference</label>
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
              <div className="bg-surface-container-low p-8 rounded-[32px] animate-in fade-in zoom-in-95 duration-200 border border-[#006a67]/20 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-on-surface tracking-tight uppercase">
                    {isPaxPickerOpen ? "Select Guest Count" : "Select Prefered Time"}
                  </h3>
                  <button 
                    onClick={() => { setIsPaxPickerOpen(false); setIsTimePickerOpen(false); }}
                    className="text-xs font-black text-outline hover:text-on-surface transition-colors"
                  >
                    CLOSE
                  </button>
                </div>

                {isPaxPickerOpen ? (
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
                    {paxOptions.map(pax => (
                      <button
                        key={pax}
                        onClick={() => handlePaxSelect(pax)}
                        className={cn(
                          "min-w-[80px] h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all snap-center",
                          paxCount === pax 
                            ? "bg-[#006a67] text-white shadow-lg shadow-[#006a67]/30 scale-110" 
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-highest"
                        )}
                      >
                        <span className="text-2xl font-black">{pax}</span>
                        <span className="text-[8px] font-black uppercase opacity-60">Guests</span>
                      </button>
                    ))}
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

            {/* Notes */}
            <div className="flex flex-col gap-3 flex-1">
              <label className="text-[10px] uppercase font-black text-outline/60 tracking-widest ml-1">Notes & Special Requests</label>
              <div className="bg-surface-container-low p-6 rounded-2xl flex-1 focus-within:bg-white transition-colors">
                <textarea 
                  placeholder="Allergies, anniversaries, or seating preferences..."
                  className="bg-transparent border-none focus:ring-0 w-full h-full text-lg font-semibold text-on-surface placeholder-on-surface/20 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer & Action */}
            <div className="mt-4 flex flex-col gap-6">
              <button className="bg-primary hover:bg-primary-dim text-white py-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 group">
                <span className="text-xl font-black font-display tracking-tight">Confirm Booking</span>
                <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-2 text-outline/60 text-xs font-semibold">
                <span>By confirming, a notification will be sent to the guest's contact number.</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
