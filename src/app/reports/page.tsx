"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesStore } from "@/store/salesStore";
import { MENU_ITEMS } from "@/constants/menu";
import { useSettingsStore } from "@/store/settingsStore";
import { translations } from "@/lib/translations";

export default function ReportsPage() {
  const { language } = useSettingsStore();
  const t = translations[language].reportsPage;
  const menuT = translations[language].orderMenuPage;

  const { history, getRevenueByRange, getProfitByRange } = useSalesStore();
  const [timeRange, setTimeRange] = useState("today");

  const formatShortCurrency = (val: number) => {
    const scaled = val * menuT.priceScale;
    if (language === 'vi') {
      if (scaled >= 1000000) return (scaled / 1000000).toFixed(1) + ' Tr';
      if (scaled >= 1000) return (scaled / 1000).toFixed(0) + ' k';
      return scaled.toLocaleString('vi-VN') + ' đ';
    }
    return '$' + scaled.toLocaleString('en-US');
  };

  const stats = useMemo(() => {
    const days = timeRange === "today" ? 1 : timeRange === "week" ? 7 : 30;
    const revenue = getRevenueByRange(days);
    const profit = getProfitByRange(days);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Filter history by range for Top Items calculation
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(s => s.timestamp >= cutoff);
    
    // Calculate Top Items
    const itemMap: Record<string, { name: string, qty: number, revenue: number }> = {};
    filteredHistory.forEach(sale => {
      sale.items.forEach(item => {
        if (!itemMap[item.id]) itemMap[item.id] = { name: item.name, qty: 0, revenue: 0 };
        itemMap[item.id].qty += item.quantity;
        itemMap[item.id].revenue += (item.price * item.quantity);
      });
    });

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    return { revenue, profit, margin, topItems, totalSales: filteredHistory.length };
  }, [history, timeRange, getRevenueByRange, getProfitByRange]);

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="px-10 pt-10 pb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-on-surface tracking-tight">{t.title}</h1>
          <p className="text-outline mt-1 font-bold">{t.subtitle}</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-surface-container-low p-1 rounded-2xl flex gap-1 border border-surface-container">
            {["today", "week", "month"].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                  timeRange === range ? "bg-white text-primary shadow-sm" : "text-outline hover:text-on-surface"
                )}
              >
                {t.timeRange[range as keyof typeof t.timeRange]}
              </button>
            ))}
          </div>
          <button className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all">
            <Download size={20} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <main className="px-10 flex flex-col gap-8 pb-20">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title={t.stats.totalRevenue} 
            value={formatShortCurrency(stats.revenue)} 
            trend="+12.5%" 
            isUp={true} 
            icon={<DollarSign className="text-brand-teal" />}
            color="teal"
          />
          <StatCard 
            title={t.stats.netProfit} 
            value={formatShortCurrency(stats.profit)} 
            trend="+8.2%" 
            isUp={true} 
            icon={<TrendingUp className="text-primary" />}
            color="primary"
          />
          <StatCard 
            title={t.stats.profitMargin} 
            value={`${stats.margin.toFixed(1)}%`} 
            trend="-1.2%" 
            isUp={false} 
            icon={<PieChart className="text-brand-gold" />}
            color="gold"
          />
          <StatCard 
            title={t.stats.transactions} 
            value={stats.totalSales.toString()} 
            trend="+45" 
            isUp={true} 
            icon={<ShoppingBag className="text-brand-coral" />}
            color="coral"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Revenue Over Time (Visual Placeholder using CSS) */}
          <div className="col-span-8 bg-surface-container-lowest rounded-[40px] p-10 border border-surface-container-low shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{t.charts.revenueStream}</h3>
                <p className="text-xs text-outline font-bold mt-1 uppercase tracking-widest">{t.charts.hourlyPerformance}</p>
              </div>
              <BarChart3 className="text-outline/20" size={32} />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {[40, 65, 30, 85, 45, 95, 75, 40, 60, 80, 50, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-primary/10 rounded-t-xl transition-all group-hover:bg-primary/20 group-hover:scale-105" 
                      style={{ height: `${h}%` }} 
                    />
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-xl transition-all duration-700" 
                      style={{ height: `${h * 0.7}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-outline/40 uppercase">{8 + i}{language === 'vi' ? 'g' : 'H'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="col-span-4 bg-surface-container-lowest rounded-[40px] p-10 border border-surface-container-low shadow-sm flex flex-col">
            <h3 className="text-2xl font-black text-on-surface tracking-tight mb-8">{t.charts.bestSellers}</h3>
            <div className="flex flex-col gap-6 flex-1">
              {stats.topItems.length > 0 ? stats.topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs",
                    i === 0 ? "bg-brand-teal/10 text-brand-teal" : "bg-surface-container-low text-outline"
                  )}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-on-surface truncate text-sm uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-outline font-bold">{item.qty} {t.charts.unitsSold}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-sm">{formatShortCurrency(item.revenue)}</p>
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                  <Layers size={48} className="mb-4" />
                  <p className="font-black text-xs uppercase tracking-widest text-center">{t.charts.noData}</p>
                </div>
              )}
            </div>
            {stats.topItems.length > 0 && (
              <button className="mt-8 py-4 bg-surface-container-low w-full rounded-2xl font-black text-[10px] uppercase tracking-widest text-outline hover:bg-surface-container hover:text-on-surface transition-all">
                {t.charts.fullInventory}
              </button>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-on-surface text-white rounded-[40px] p-12 overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-3 gap-12">
            <div>
              <h3 className="text-brand-teal text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t.insights.categorySplit}</h3>
              <h2 className="text-4xl font-black tracking-tight leading-none">{t.insights.coffeeDriver}</h2>
              <p className="mt-4 text-white/60 font-bold leading-relaxed text-sm">
                {t.insights.signatureDrinks}
              </p>
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-8">
              <CategoryStat label={t.insights.coffee} value="74%" color="#71f5ea" />
              <CategoryStat label={t.insights.teas} value="18%" color="#ffca51" />
              <CategoryStat label={t.insights.bites} value="8%" color="#ff8fab" />
            </div>
          </div>
          
          {/* Abstract Bg Decor */}
          <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        </div>

      </main>
    </div>
  );
}

function StatCard({ title, value, trend, isUp, icon, color }: {
  title: string,
  value: string,
  trend: string,
  isUp: boolean,
  icon: React.ReactNode,
  color: "teal" | "primary" | "gold" | "coral"
}) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-[40px] border border-surface-container-low shadow-sm flex flex-col gap-6 group hover:border-primary/20 transition-all">
      <div className="flex justify-between items-start">
        <div className={cn(
          "p-4 rounded-2xl",
          color === "teal" && "bg-brand-teal/10",
          color === "primary" && "bg-primary/10",
          color === "gold" && "bg-brand-gold/10",
          color === "coral" && "bg-brand-coral/10",
        )}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 font-black text-xs px-3 py-1.5 rounded-full",
          isUp ? "bg-brand-teal/10 text-brand-teal" : "bg-brand-coral/10 text-brand-coral"
        )}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-on-surface tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function CategoryStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-white/40">{label}</span>
        <span className="text-2xl font-black" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: value, backgroundColor: color }} />
      </div>
    </div>
  );
}
