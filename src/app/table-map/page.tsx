"use client";

import React, { useState } from "react";
import { Plus, Users, Clock, ReceiptText, ChevronRight, Share2, Bookmark, Receipt, Minus, Hash, Bell as BellIcon, CheckCircle2, UtensilsCrossed as ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTableStore, Table, OrderItem } from "@/store/tableStore";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function TableMapPage() {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [transferMode, setTransferMode] = useState<"none" | "source" | "target">("none");
  const [source, setSource] = useState<{ floor: number; id: string } | null>(null);
  const [target, setTarget] = useState<{ floor: number; id: string } | null>(null);
  
  const { 
    floors, 
    updateTable, 
    setFloors, 
    updateItemStatus, 
    seatReservation, 
    reservations, 
    transferTable,
    fetchInitialData,
    initializeRealtime
  } = useTableStore();
  
  const { language } = useSettingsStore();
  const t = translations[language].tableMapPage;
  const commonT = translations[language].common;

  React.useEffect(() => {
    fetchInitialData();
    const cleanup = initializeRealtime();
    return () => cleanup();
  }, []);

  // Helper to get localized floor name (handles legacy data without ID)
  const getFloorName = (floor: any) => {
    if (floor.id && (t.floors as any)[floor.id]) {
      return (t.floors as any)[floor.id];
    }
    // Fallback mapping by name for legacy data
    const nameMap: Record<string, string> = {
      "Main Dining Room": (t.floors as any).main,
      "Patio Terrace": (t.floors as any).patio,
      "VIP Lounge": (t.floors as any).vip,
      "Direct Orders": (t.floors as any).takeaway
    };
    return nameMap[floor.name] || floor.name;
  };
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [showKeypad, setShowKeypad] = useState(false);
  const router = useRouter();

  // Safety: If loading or no floors, show loading or empty state
  const { loading } = useTableStore();
  const activeFloor = floors && floors.length > 0 ? floors[activeFloorIndex] : null;

  const handleTableClick = (table: Table) => {
    if (!activeFloor) return;
    if (transferMode === "source") {
      if (table.status === "empty") return; 
      setSource({ floor: activeFloorIndex, id: table.id });
      setTransferMode("target");
    } else if (transferMode === "target") {
      if (table.status !== "empty") return; 
      if (source) {
        transferTable(source.floor, source.id, table.id);
        cancelTransfer();
      }
    } else {
      // Fast Path for occupied tables
      if (table.status === "occupied" || table.status === "bill-printed") {
        router.push(`/order-menu?table=${table.id}`);
        return;
      }
      
      // Select Guests for empty tables or Show Info for reserved tables
      setSelectedTable(table);
      if (table.status === "empty") {
        setGuestCount(table.guests || 2);
      }
    }
  };

  const handleStartServing = () => {
    if (!selectedTable || !activeFloor) return;
    
    updateTable(activeFloorIndex, selectedTable.id, {
      status: "occupied",
      guests: guestCount,
      timeElapsed: "Just Started"
    });
    
    setSelectedTable(null);
    router.push(`/order-menu?table=${selectedTable.id}`);
  };

  const handleSeatReservation = () => {
    if (!selectedTable || !selectedTable.reservationId) return;
    
    seatReservation(selectedTable.reservationId);
    const tableId = selectedTable.id;
    setSelectedTable(null);
    router.push(`/order-menu?table=${tableId}`);
  };

  const handlePrintBill = () => {
    if (!selectedTable) return;
    updateTable(activeFloorIndex, selectedTable.id, { status: "bill-printed" });
    setSelectedTable(null);
  };

  const cancelTransfer = () => {
    setTransferMode("none");
    setSource(null);
    setTarget(null);
  };

  if (loading && floors.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-700">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <h3 className="text-2xl font-black text-on-surface tracking-tight">Đang kết nối Cloud...</h3>
        <p className="text-outline font-medium mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (!activeFloor) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-surface-container-low rounded-[32px] flex items-center justify-center text-outline mb-8">
              <Users size={48} strokeWidth={1.5} />
           </div>
           <h3 className="text-3xl font-black text-on-surface tracking-tight">Chưa có Sơ đồ bàn</h3>
           <p className="text-outline font-medium mt-2 max-w-md">Hệ thống không tìm thấy dữ liệu bàn ghế trên Cloud. Vui lòng kiểm tra lại cấu trúc bảng 'floors' trên Supabase.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      
      {/* Transfer HUD */}
      {transferMode !== "none" && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-10 duration-300">
          <div className="bg-[#006a67] text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-white/20">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">
                {transferMode === "source" ? t.transferStep1 : t.transferStep2}
              </span>
              <span className="text-sm font-bold mt-1">
                {transferMode === "source" 
                  ? t.selectToMove 
                  : target 
                    ? `${t.moveToTable} ${target.id} (${getFloorName(floors[target.floor])})?`
                    : `${t.movingTable} ${source?.id}... ${t.selectDestination}`
                }
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={cancelTransfer}
                className="px-4 py-2 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
              >
                {commonT.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
            {language === 'en' && floors[activeFloorIndex]?.name_en 
              ? floors[activeFloorIndex].name_en 
              : getFloorName(activeFloor)}
          </h2>
          <p className="text-outline mt-1 font-medium">{activeFloor.tables ? activeFloor.tables.filter(t => t.status !== "empty").length : 0}/{activeFloor.tables ? activeFloor.tables.length : 0} {t.activeTables}</p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-8 items-center bg-surface-container-lowest px-8 py-5 rounded-[24px] shadow-sm border border-surface-container-low animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#d1d1d1]"></div>
            <span className="text-xs font-black text-outline tracking-widest uppercase">{t.statusEmpty}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#71f5ea]"></div>
            <span className="text-xs font-black text-[#006a67] tracking-widest">{t.statusOccupied}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffcc4d]"></div>
            <span className="text-xs font-black text-[#856404] tracking-widest">{t.statusBillPrinted}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff9999]"></div>
            <span className="text-xs font-black text-[#a64444] tracking-widest uppercase">{t.statusReserved}</span>
          </div>
        </div>
      </div>

      {/* Bento-Style Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {activeFloor.tables && activeFloor.tables.map((table) => (
          <div 
            key={table.id} 
            onClick={() => handleTableClick(table)}
            className={cn(
              "transition-all",
              transferMode !== "none" && (
                (source?.id === table.id && source?.floor === activeFloorIndex) || (target?.id === table.id && target?.floor === activeFloorIndex)
                ? "scale-105 ring-4 ring-[#006a67] ring-offset-4 rounded-xl"
                : "opacity-40 grayscale-[0.5]"
              )
            )}
          >
            <TableCard table={table} />
          </div>
        ))}
      </div>

      {/* Floor Actions Area (Bento Footer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[32px] p-10 flex border border-surface-container-low shadow-ambient justify-between items-center">
            <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">{t.floorOverview}</h3>
                  <p className="text-outline text-sm mt-1 font-medium">{t.realTimeStatus}</p>
                </div>
                <div className="flex gap-4">
                    <StatBox label={t.turnoverRate} value="1.4h" highlight={t.avg} />
                    <StatBox label={t.waitlist} value={`4 ${t.parties}`} />
                    <StatBox label={t.revenue} value={`$${floors.reduce((acc, f) => acc + f.tables.reduce((t_acc, t) => t_acc + t.orders.reduce((o_acc, o) => o_acc + (o.price * o.quantity), 0), 0), 0).toLocaleString()}`} />
                </div>
            </div>
            
            <div className="h-20 w-px bg-surface-container mx-8 hidden lg:block" />

            <button 
              onClick={() => setTransferMode("source")}
              disabled={transferMode !== "none"}
              className={cn(
                "px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                transferMode === "none" ? "bg-[#006a67] text-white hover:bg-[#005a57]" : "bg-surface-container-low text-outline cursor-not-allowed"
              )}
            >
                {t.transferTable}
            </button>
        </div>

        <button 
          onClick={() => setActiveFloorIndex((activeFloorIndex + 1) % floors.length)}
          className="bg-surface-container-low rounded-[32px] p-10 border border-surface-container-low flex flex-col justify-center items-center text-center gap-4 group hover:bg-surface-container-lowest hover:shadow-ambient transition-all active:scale-95"
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface-container-lowest shadow-sm text-outline group-hover:text-primary transition-colors">
            <Share2 size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">{t.switchView}</h3>
            <p className="text-sm text-outline font-medium">
              {(() => {
                const groundFloor = floors[(activeFloorIndex + 1) % floors.length];
                return language === 'en' && groundFloor?.name_en ? groundFloor.name_en : groundFloor?.name;
              })()}
            </p>
          </div>
          <div className="flex gap-2">
            {floors.map((_, i) => (
              <div key={i} className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeFloorIndex === i ? "bg-primary w-4" : "bg-outline/30"
              )}></div>
            ))}
          </div>
        </button>
      </div>

      {/* FAB - Quick Takeaway */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-3 z-50">
        <div className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 delay-500">
          {t.quickTakeaway}
        </div>
        <button 
          onClick={() => router.push('/order-menu?table=TAKEAWAY')}
          className="w-20 h-20 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group active:scale-90 transition-transform"
        >
          <Plus size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Dynamic Interaction Modals */}
      {selectedTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-500 p-4">
          <div 
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-xl transition-all duration-700" 
            onClick={() => setSelectedTable(null)} 
          />
          
          <div className="relative w-full max-w-[500px] bg-surface-container-lowest/95 backdrop-blur-md rounded-[48px] p-12 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ease-out fill-mode-both">
            <button 
              onClick={() => setSelectedTable(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface hover:rotate-90 transition-all duration-300"
            >
              <X size={24} />
            </button>

            {selectedTable.status === "reserved" ? (
               <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-brand-coral/20 text-on-coral rounded-full flex items-center justify-center mb-8 animate-in zoom-in-50 delay-150 duration-500">
                    <Bookmark size={40} fill="currentColor" />
                  </div>
                  <h3 className="text-4xl font-black text-on-surface text-center mb-2 tracking-tighter">{t.table} {selectedTable.number}</h3>
                  <div className="bg-brand-coral/10 px-4 py-1 rounded-full text-[10px] font-black text-on-coral uppercase tracking-widest mb-8">
                     {t.statusReserved}
                  </div>

                  <div className="w-full bg-surface-container-low rounded-3xl p-8 mb-10 space-y-6">
                    <div className="flex justify-between items-center text-on-surface">
                       <span className="text-[10px] font-black text-outline uppercase tracking-widest">Guest Name</span>
                       <span className="text-xl font-black">{selectedTable.reservedBy || "Unknown Guest"}</span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface">
                       <span className="text-[10px] font-black text-outline uppercase tracking-widest">Time & {t.paxLabel}</span>
                       <span className="text-xl font-black">{selectedTable.reservedTime} • {selectedTable.pax} {t.paxLabel}</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-4">
                    <button 
                     onClick={handleSeatReservation}
                     className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <CheckCircle2 size={24} />
                      {t.confirmArrival}
                    </button>
                    <button 
                     onClick={() => setSelectedTable(null)}
                     className="w-full py-5 text-outline font-black text-[10px] uppercase tracking-[0.25em] hover:text-on-surface transition-colors"
                    >
                      {t.keepReserved}
                    </button>
                  </div>
               </div>
            ) : selectedTable.status === "empty" && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-primary-container text-primary rounded-full flex items-center justify-center mb-8 animate-in zoom-in-50 delay-150 duration-500">
                  <Users size={40} />
                </div>
                <h3 className="text-4xl font-black text-on-surface text-center mb-2 tracking-tighter animate-in fade-in slide-in-from-top-4 delay-200 duration-500">{t.table} {selectedTable.number}</h3>
                <p className="text-sm font-bold text-outline text-center mb-10 animate-in fade-in slide-in-from-top-4 delay-300 duration-500">{t.realTimeStatus}</p>
                
                <div className="w-full space-y-8 mb-12 animate-in fade-in slide-in-from-bottom-8 delay-400 duration-700">
                   {!showKeypad ? (
                     <>
                        <div className="flex justify-between items-center bg-surface-container-low rounded-[32px] p-4 pr-10">
                           <button 
                             onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                             className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                           >
                             <Minus size={28} strokeWidth={3} />
                           </button>
                           
                           <button 
                             onClick={() => setShowKeypad(true)}
                             className="flex flex-col items-center group"
                           >
                             <span className="text-6xl font-black text-on-surface tracking-tighter group-hover:scale-110 transition-transform">{guestCount}</span>
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{t.tapToType}</span>
                           </button>

                           <button 
                             onClick={() => setGuestCount(guestCount + 1)}
                             className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                           >
                             <Plus size={28} strokeWidth={3} />
                           </button>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                           {[2, 4, 6, 10, 12].map((n) => (
                             <button 
                               key={n}
                               onClick={() => setGuestCount(n)}
                               className={cn(
                                 "h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                                 guestCount === n ? "bg-primary text-white shadow-md scale-105" : "bg-surface-container-low text-outline hover:bg-surface-container-highest"
                               )}
                             >
                               {n} {t.paxLabel}
                             </button>
                           ))}
                           <button 
                            onClick={() => setShowKeypad(true)}
                            className="h-12 bg-primary-container text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                           >
                             <Hash size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </>
                   ) : (
                     <div className="animate-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                           {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                             <button 
                               key={num}
                               onClick={() => {
                                 const newVal = parseInt(`${guestCount}${num}`);
                                 if (newVal <= 99) setGuestCount(newVal);
                               }}
                               className="h-14 bg-surface-container-low rounded-2xl font-black text-xl hover:bg-surface-container-highest active:scale-95 transition-all"
                             >
                               {num}
                             </button>
                           ))}
                           <button 
                             onClick={() => setGuestCount(Math.floor(guestCount / 10))}
                             className="h-14 bg-surface-container-low text-brand-coral rounded-2xl flex items-center justify-center hover:bg-brand-coral/10 transition-all font-black"
                           >
                             DEL
                           </button>
                           <button 
                             onClick={() => setShowKeypad(false)}
                             className="h-14 bg-primary-container text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                           >
                             OK
                           </button>
                        </div>
                        <div className="flex justify-between items-center py-2 px-4 bg-surface-container-low rounded-2xl">
                           <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t.entryMode}</span>
                           <span className="text-lg font-black text-primary">{guestCount} {t.paxLabel}</span>
                        </div>
                     </div>
                   )}
                </div>

                <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 delay-500 duration-700">
                   <button 
                    onClick={handleStartServing}
                    className="w-full py-6 bg-primary text-white rounded-[24px] font-black text-lg shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
                   >
                     <ReceiptText size={24} className="group-hover:rotate-12 transition-transform" />
                     {t.assignOpenMenu}
                   </button>
                   <button 
                    onClick={() => setSelectedTable(null)}
                    className="w-full py-5 text-outline font-black text-[10px] uppercase tracking-[0.25em] hover:text-on-surface transition-colors"
                   >
                     {t.cancelSeating}
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 group w-full">
      <div className="w-16 h-16 rounded-[24px] bg-white shadow-ambient flex items-center justify-center text-outline group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
        <Icon size={28} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-outline group-hover:text-on-surface">{label}</span>
    </button>
  );
}

function X({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function TableCard({ table }: { table: Table }) {
  const isOccupied = table.status === "occupied";
  const isBillPrinted = table.status === "bill-printed";
  const isReserved = table.status === "reserved";
  const isEmpty = table.status === "empty";
  
  const { language } = useSettingsStore();
  const t = translations[language].tableMapPage;
  const orderMenuT = translations[language].orderMenuPage;
  
  const totalAmount = table.orders.reduce((acc, o) => acc + (o.price * o.quantity), 0);
  const isFoodReady = table.orders.some(o => o.status === "ready");
  const isPreparing = table.orders.some(o => o.status === "preparing") && !isFoodReady;

  const formatPrice = (price: number) => {
    const converted = price * orderMenuT.priceScale;
    if (language === 'vi') {
      return `${converted.toLocaleString()} ${orderMenuT.currencySymbol}`;
    }
    return `${orderMenuT.currencySymbol}${price.toFixed(2)}`;
  };

  const formatTimeElapsed = (time: string | undefined) => {
    if (!time) return null;
    
    // Robust mapping for legacy or key-based strings
    const lowerTime = time.toLowerCase().trim();
    if (lowerTime === "justarrived" || lowerTime === "just arrived") return t.justArrived;
    if (lowerTime === "juststarted" || lowerTime === "just started") return t.justStarted;
    
    // Handle duration strings like "1H 20M" -> "1h 20p" or "45M" -> "45p"
    if (language === 'vi') {
      return time
        .toLowerCase()
        .replace(/h/g, 'h')
        .replace(/m/g, 'p');
    }
    
    return time;
  };

  return (
    <div 
      className={cn(
        "min-w-[216px] min-h-[152px] rounded-xl p-6 flex flex-col justify-between transition-all relative cursor-pointer group active:scale-95 shadow-ambient",
        isEmpty && "bg-white border-2 border-dashed border-outline/30 shadow-none",
        isOccupied && "bg-primary-container",
        isBillPrinted && "bg-brand-gold",
        isReserved && "bg-brand-coral",
        isFoodReady && "ring-4 ring-white ring-offset-2 ring-offset-brand-emerald animate-pulse",
        isPreparing && "ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-container-low"
      )}
    >
      {/* Ready Notification Icon */}
      {isFoodReady && (
        <div className="absolute top-4 right-4 text-white animate-bounce z-20">
          <BellIcon size={24} fill="currentColor" />
        </div>
      )}
      {isReserved && <Bookmark size={24} className="absolute top-6 right-6 text-on-coral" fill="currentColor" />}
      
      {/* Preparing Icon */}
      {isPreparing && (
        <div className="absolute top-4 right-4 text-primary/30 animate-pulse">
          <ChefHat size={24} />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <span className={cn(
          "text-3xl font-black transition-colors",
          isOccupied && "text-primary",
          isBillPrinted && "text-on-gold",
          isReserved && "text-on-coral",
          isEmpty && "text-outline"
        )}>{table.number}</span>
        
        {table.timeElapsed && (
          <div className={cn(
            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
            isOccupied ? "bg-primary text-white" : "bg-on-gold text-brand-gold"
          )}>
            {formatTimeElapsed(table.timeElapsed)}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {isReserved ? (
          <div>
            <p className="text-[10px] font-bold text-on-coral/70 uppercase">{t.statusReserved}</p>
            <p className="text-lg font-black text-on-coral">{table.reservedTime}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex justify-center opacity-40 group-hover:opacity-100 transition-opacity">
            <Plus size={24} />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1">
              <p className={cn(
                "text-xl font-black",
                isOccupied ? "text-primary" : "text-on-gold"
              )}>{formatPrice(totalAmount)}</p>
            </div>
            {table.guests && (
              <div className="flex items-center gap-1 mt-0.5">
                <Users size={12} className={cn(isOccupied ? "text-primary/60" : "text-on-gold/60")} />
                <span className={cn("text-[10px] font-bold", isOccupied ? "text-primary/60" : "text-on-gold/60")}>{table.guests} {t.paxLabel}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="bg-surface-container-low px-5 py-4 rounded-xl min-w-[140px]">
      <p className="text-[10px] font-black text-outline uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        {highlight && <span className="text-xs text-primary font-bold">{highlight}</span>}
      </div>
    </div>
  );
}
