"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, UserCircle, Settings, CheckCircle2, LogOut, RefreshCcw } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTableStore } from "@/store/tableStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { PinPad } from "@/components/auth/PinPad";
import { SettingsModal } from "./SettingsModal";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const { floors, markAsServed } = useTableStore();
  const { currentUser, switchUser, logout, shiftNumber } = useUserStore();
  const { language } = useSettingsStore();
  const t = translations[language].header;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switchError, setSwitchError] = useState(false);

  // Time & Search State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simple search logic for tables
  const handleSearch = (val: string) => {
    setSearchTerm(val);
    if (val.trim()) {
      const results: any[] = [];
      floors.forEach((floor, fIdx) => {
        floor.tables.forEach(table => {
          if (table.number.toLowerCase().includes(val.toLowerCase()) ||
            (table.guests?.toString().includes(val))) {
            results.push({ ...table, floorName: floor.name, floorIndex: fIdx });
          }
        });
      });
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const formatShiftId = (shiftId: string) => {
    if (!shiftId || !shiftId.startsWith('#')) return shiftId;
    // Internal format is #DDMM-SS (Vietnamese style)
    const match = shiftId.match(/#(\d{2})(\d{2})-(\d{2})/);
    if (!match) return shiftId;

    const [_, dd, mm, ss] = match;
    if (language === 'en') {
      return `#${mm}${dd}-${ss}`;
    }
    return `#${dd}${mm}-${ss}`;
  };

  // Date/Time Formatting
  const dateFormatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Lấy tất cả các món ăn đang ở trạng thái 'ready'
  const readyItems = floors.flatMap(floor =>
    floor.tables.flatMap(table =>
      table.orders.filter(order => order.status === "ready")
        .map(order => ({ ...order, tableNumber: table.number, tableId: table.id }))
    )
  );

  const handleSwitchUser = async (pin: string) => {
    const success = await switchUser(pin);
    if (success) {
      setShowSwitchModal(false);
      setShowUserMenu(false);
      setSwitchError(false);
    } else {
      setSwitchError(true);
      setTimeout(() => setSwitchError(false), 1000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-[80px] bg-surface-container-low flex items-center justify-between px-8 fixed top-0 right-0 left-[240px] z-40 no-border-section">
      <div className="flex items-center gap-10">
        <div className="relative group w-[320px]">
          <div className="bg-surface-container-highest px-6 py-3 rounded-xl flex items-center gap-4 transition-all">
            <Search className="text-outline/40 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface placeholder-on-surface/30 outline-none w-full"
            />
          </div>

          {/* Search Results Overlay */}
          {searchResults.length > 0 && (
            <div className="absolute top-[60px] left-0 w-full bg-white rounded-2xl shadow-2xl border border-surface-container-low p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-2">{t.matchingTables}</p>
              <div className="space-y-1">
                {searchResults.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => {
                      router.push(`/order-menu?table=${table.id}`);
                      setSearchTerm("");
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                        {table.number}
                      </div>
                      <span className="text-xs font-bold text-on-surface">{table.floorName}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-outline">{table.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-black text-on-surface font-display leading-tight capitalize">
            {dateFormatter.format(currentTime)}
          </span>
          <span className="text-[10px] font-semibold text-outline font-display uppercase">
            {timeFormatter.format(currentTime)} • {t.shift} {formatShiftId(shiftNumber)}
          </span>
        </div>
      </div>

      {/* Tools - Far Right */}
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-on-surface",
              showNotifications ? "bg-primary text-white shadow-lg" : "hover:bg-surface-container-highest"
            )}
          >
            <Bell size={28} strokeWidth={2.2} />
            {readyItems.length > 0 && (
              <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-brand-coral border-2 border-surface-container-low rounded-full animate-bounce" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute top-[70px] right-0 w-[400px] bg-white rounded-[32px] shadow-2xl border border-surface-container-low z-50 p-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="text-xl font-black text-on-surface tracking-tight">{t.notifications}</h3>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {readyItems.length} {t.items}
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar pr-2 leading-relaxed">
                  {readyItems.length > 0 ? (
                    readyItems.map((item) => (
                      <div
                        key={item.cartId}
                        className="bg-surface-container-low rounded-2xl p-4 flex justify-between items-center group hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary uppercase bg-primary-container px-2 py-0.5 rounded">{t.table} {item.tableNumber}</span>
                            <h4 className="text-sm font-bold text-on-surface truncate">{item.name}</h4>
                          </div>
                          <p className="text-[10px] text-outline font-medium mt-1 uppercase tracking-tight">{t.quantity}: {item.quantity}</p>
                        </div>
                        <button
                          onClick={() => markAsServed(item.tableId, item.cartId)}
                          className="bg-[#006a67] text-white p-2.5 rounded-xl shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                          title="Complete Serving"
                        >
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center opacity-30">
                      <Bell size={48} className="mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest text-center">{t.allCaughtUp}<br />{t.noReadyItems}</p>
                    </div>
                  )}
                </div>

                {readyItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-surface-container text-center">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{t.pickupTip}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-on-surface",
              showUserMenu ? "bg-primary text-white shadow-lg" : "hover:bg-surface-container-highest"
            )}
          >
            {currentUser ? (
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary text-xs font-black ring-2 ring-white">
                {currentUser.avatar}
              </div>
            ) : (
              <UserCircle size={32} strokeWidth={2} />
            )}
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute top-[70px] right-0 w-[280px] bg-white rounded-[32px] shadow-2xl border border-surface-container-low z-50 p-6 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg">
                    {currentUser?.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-on-surface leading-tight">{currentUser?.name}</h4>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">{(t.roles as any)[currentUser?.role || ""] || currentUser?.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowSwitchModal(true)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-on-surface font-bold text-sm hover:bg-surface-container-low transition-colors group"
                  >
                    <RefreshCcw size={18} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
                    {t.switchStaff}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl text-brand-coral font-bold text-sm hover:bg-brand-coral/10 transition-colors group"
                  >
                    <LogOut size={18} />
                    {t.logout}
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-container">
                  <p className="text-[9px] font-black text-outline uppercase tracking-widest text-center">{t.shiftStarted} {currentUser?.shiftStart}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface"
        >
          <Settings size={28} strokeWidth={2.2} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Quick Switch Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => setShowSwitchModal(false)}
          />
          <div className="relative">
            <PinPad
              title="Quick Switch"
              subtitle="Enter PIN to switch to another staff account"
              onSuccess={handleSwitchUser}
              onCancel={() => setShowSwitchModal(false)}
              error={switchError}
            />
          </div>
        </div>
      )}
    </header>
  );
}
