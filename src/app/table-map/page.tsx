"use client";

import React, { useState } from "react";
import { Plus, Users, Clock, ReceiptText, ChevronRight, Share2, Bookmark, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

type TableStatus = "empty" | "occupied" | "bill-printed" | "reserved";

interface Table {
  id: string;
  number: string;
  status: TableStatus;
  amount?: number;
  guests?: number;
  timeElapsed?: string;
  reservedTime?: string;
  reservedBy?: string;
  pax?: number;
}

export default function TableMapPage() {
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [transferMode, setTransferMode] = useState<"none" | "source" | "target">("none");
  const [source, setSource] = useState<{ floor: number; id: string } | null>(null);
  const [target, setTarget] = useState<{ floor: number; id: string } | null>(null);

  // Multi-Floor Data
  const [floors, setFloors] = useState([
    { 
      name: "Main Dining Room", 
      tables: [
        { id: "4", number: "04", status: "occupied", guests: 3, amount: 64.5, timeElapsed: "45M" },
        { id: "8", number: "08", status: "empty" },
        { id: "2", number: "02", status: "bill-printed", guests: 4, amount: 120.0, timeElapsed: "1H 20M" },
        { id: "10", number: "10", status: "reserved", pax: 4, reservedTime: "7:30 PM", reservedBy: "Smith Party" },
        { id: "1", number: "01", status: "empty" },
        { id: "3", number: "03", status: "occupied", guests: 2, amount: 24.0, timeElapsed: "12M" },
        { id: "5", number: "05", status: "empty" },
        { id: "12", number: "12", status: "empty" },
      ] as Table[]
    },
    { 
      name: "Patio Terrace", 
      tables: [
        { id: "21", number: "21", status: "empty" },
        { id: "22", number: "22", status: "occupied", guests: 2, amount: 45.0, timeElapsed: "15M" },
        { id: "23", number: "23", status: "empty" },
        { id: "24", number: "24", status: "empty" },
        { id: "25", number: "25", status: "empty" },
        { id: "26", number: "26", status: "empty" },
      ] as Table[]
    },
    { 
      name: "VIP Lounge", 
      tables: [
        { id: "V1", number: "V1", status: "empty" },
        { id: "V2", number: "V2", status: "occupied", guests: 6, amount: 240.0, timeElapsed: "1H" },
        { id: "V3", number: "V3", status: "empty" },
      ] as Table[]
    }
  ]);

  const activeFloor = floors[activeFloorIndex];

  const handleTableClick = (table: Table) => {
    if (transferMode === "source") {
      if (table.status === "empty") return; 
      setSource({ floor: activeFloorIndex, id: table.id });
      setTransferMode("target");
    } else if (transferMode === "target") {
      if (table.status !== "empty") return; 
      setTarget({ floor: activeFloorIndex, id: table.id });
    }
  };

  const executeTransfer = () => {
    if (!source || !target) return;

    const newFloors = [...floors];
    const sFloor = newFloors[source.floor];
    const tFloor = newFloors[target.floor];

    const sourceIdx = sFloor.tables.findIndex(t => t.id === source.id);
    const targetIdx = tFloor.tables.findIndex(t => t.id === target.id);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const sourceTable = sFloor.tables[sourceIdx];
      const targetTable = tFloor.tables[targetIdx];

      tFloor.tables[targetIdx] = { 
        ...targetTable, 
        status: sourceTable.status, 
        amount: sourceTable.amount,
        guests: sourceTable.guests,
        timeElapsed: sourceTable.timeElapsed
      };

      sFloor.tables[sourceIdx] = { 
        ...sourceTable, 
        status: "empty", 
        amount: undefined, 
        guests: undefined, 
        timeElapsed: undefined 
      };

      setFloors(newFloors);
      cancelTransfer();
    }
  };

  const cancelTransfer = () => {
    setTransferMode("none");
    setSource(null);
    setTarget(null);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto px-4 lg:px-10 pb-20">
      
      {/* Transfer HUD */}
      {transferMode !== "none" && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-10 duration-300">
          <div className="bg-[#006a67] text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-white/20">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">
                {transferMode === "source" ? "Transfer Step 1" : "Transfer Step 2"}
              </span>
              <span className="text-sm font-bold mt-1">
                {transferMode === "source" 
                  ? "Select a table to move" 
                  : target 
                    ? `Move to Table ${target.id} (${floors[target.floor].name})?`
                    : `Moving Table ${source?.id}... Select destination`
                }
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={cancelTransfer}
                className="px-4 py-2 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              {target && (
                <button 
                  onClick={executeTransfer}
                  className="bg-[#71f5ea] text-[#006a67] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Confirm Transfer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">{activeFloor.name}</h2>
          <p className="text-outline mt-1 font-medium">{activeFloor.tables.filter(t => t.status !== "empty").length}/{activeFloor.tables.length} Tables Active</p>
        </div>
        
        {/* Legend */}
        <div className="flex gap-8 items-center bg-white px-8 py-5 rounded-[24px] shadow-sm border border-surface-container-low animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#d1d1d1]"></div>
            <span className="text-xs font-black text-[#767775] tracking-widest">EMPTY</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#71f5ea]"></div>
            <span className="text-xs font-black text-[#006a67] tracking-widest">OCCUPIED</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ffcc4d]"></div>
            <span className="text-xs font-black text-[#856404] tracking-widest">BILL PRINTED</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ff9999]"></div>
            <span className="text-xs font-black text-[#a64444] tracking-widest uppercase">RESERVED</span>
          </div>
        </div>
      </div>

      {/* Bento-Style Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {activeFloor.tables.map((table) => (
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
        <div className="lg:col-span-2 bg-white rounded-[32px] p-10 flex border border-surface-container-low shadow-ambient justify-between items-center">
            <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">Floor Overview</h3>
                  <p className="text-outline text-sm mt-1 font-medium">Real-time status of all dining zones</p>
                </div>
                <div className="flex gap-4">
                    <StatBox label="TURNOVER RATE" value="1.4h" highlight />
                    <StatBox label="WAITLIST" value="4 Parties" />
                    <StatBox label="REVENUE" value={`$${floors.reduce((acc: number, f: any) => acc + f.tables.reduce((t_acc: number, t: Table) => t_acc + (t.amount || 0), 0), 0).toLocaleString()}`} />
                </div>
            </div>
            
            <div className="h-20 w-px bg-surface-container-low mx-8 hidden lg:block" />

            <button 
              onClick={() => setTransferMode("source")}
              disabled={transferMode !== "none"}
              className={cn(
                "px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                transferMode === "none" ? "bg-[#006a67] text-white hover:bg-[#005a57]" : "bg-surface-container-low text-outline cursor-not-allowed"
              )}
            >
                Transfer Table
            </button>
        </div>

        <button 
          onClick={() => setActiveFloorIndex((activeFloorIndex + 1) % floors.length)}
          className="bg-surface-container-low rounded-[32px] p-10 border border-surface-container-low flex flex-col justify-center items-center text-center gap-4 group hover:bg-white hover:shadow-ambient transition-all active:scale-95"
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white shadow-sm text-outline group-hover:text-primary transition-colors">
            <Share2 size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">Switch View</h3>
            <p className="text-sm text-outline font-medium">{floors[(activeFloorIndex + 1) % floors.length].name}</p>
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

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-20 h-20 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group active:scale-90 transition-transform z-50">
        <Plus size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}

function TableCard({ table }: { table: Table }) {
  const isOccupied = table.status === "occupied";
  const isBillPrinted = table.status === "bill-printed";
  const isReserved = table.status === "reserved";
  const isEmpty = table.status === "empty";

  return (
    <div 
      className={cn(
        "min-w-[216px] min-h-[152px] rounded-xl p-6 flex flex-col justify-between transition-all relative cursor-pointer group active:scale-95 shadow-ambient",
        isEmpty && "bg-white border-2 border-dashed border-[#767775] shadow-none",
        isOccupied && "bg-primary-container",
        isBillPrinted && "bg-brand-gold",
        isReserved && "bg-brand-coral"
      )}
    >
      {isReserved && <Bookmark size={24} className="absolute top-6 right-6 text-on-coral" fill="currentColor" />}
      
      <div className="flex justify-between items-start">
        <div>
          <span className={cn(
            "text-[10px] font-black tracking-widest uppercase block mb-0.5",
            isOccupied && "text-primary/70",
            isBillPrinted && "text-on-gold/80",
            isReserved && "text-on-coral/70",
            isEmpty && "text-outline"
          )}>Table</span>
          <span className={cn(
            "text-4xl font-black block tracking-tight",
            isOccupied && "text-primary",
            isBillPrinted && "text-on-gold",
            isReserved && "text-on-coral",
            isEmpty && "text-surface-container-highest group-hover:text-primary transition-colors"
          )}>{table.number}</span>
        </div>
        
        {table.timeElapsed && (
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black",
            isOccupied ? "bg-primary text-white" : "bg-on-gold text-brand-gold"
          )}>
            {table.timeElapsed}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {isReserved ? (
          <>
            <p className="text-sm font-bold text-on-coral uppercase tracking-wide">Reserved</p>
            <p className="text-2xl font-black text-on-coral mt-1 leading-none">{table.reservedTime}</p>
            <p className="text-xs font-medium text-on-coral/70 mt-1">{table.reservedBy} • {table.pax} pax</p>
          </>
        ) : isEmpty ? (
          <>
             <div className="flex justify-center flex-1">
                <Plus size={36} className="text-surface-container-highest group-hover:text-primary transition-colors" strokeWidth={3} />
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black text-primary text-center tracking-widest uppercase">Tap to Seat</p>
             </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              {isBillPrinted && <Receipt size={20} className="text-on-gold" />}
              <p className={cn(
                "text-2xl font-black leading-none",
                isOccupied ? "text-primary" : "text-on-gold"
              )}>${table.amount?.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center gap-4 mt-1">
              {table.guests && (
                <div className="flex items-center gap-1.5">
                  <Users size={14} className={cn(isOccupied ? "text-primary/70" : "text-on-gold/70")} />
                  <span className={cn("text-xs font-medium", isOccupied ? "text-primary/70" : "text-on-gold/70")}>{table.guests} Guests</span>
                </div>
              )}
              {isBillPrinted && (
                 <span className="text-[10px] font-bold text-on-gold/80 uppercase tracking-widest">Awaiting Payment</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-surface-container-low px-5 py-4 rounded-xl min-w-[140px]">
      <p className="text-[10px] font-black text-outline uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="text-2xl font-bold text-on-surface">{value}</span>
        {highlight && <span className="text-xs text-primary font-bold">avg</span>}
      </div>
    </div>
  );
}
