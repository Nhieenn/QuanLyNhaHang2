import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface SaleRecord {
  id: string;
  tableId: string;
  items: {
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
    cost: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: number;
  paymentMethod: string;
}

interface SalesStore {
  history: SaleRecord[];
  loading: boolean;
  
  // Actions
  fetchHistory: () => Promise<void>;
  addSale: (sale: Omit<SaleRecord, "id" | "timestamp">) => Promise<void>;
  getDailyRevenue: (dateStr?: string) => number;
  getDailyProfit: (dateStr?: string) => number;
  getRevenueByRange: (days: number) => number;
  getProfitByRange: (days: number) => number;
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  history: [],
  loading: false,

  fetchHistory: async () => {
    set({ loading: true });
    // Lấy sales cùng với items qua join
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('timestamp', { ascending: false });
    
    if (sales) {
      const formatted: SaleRecord[] = sales.map(s => ({
        id: s.id,
        tableId: s.table_id,
        subtotal: Number(s.subtotal),
        tax: Number(s.tax),
        total: Number(s.total),
        paymentMethod: s.payment_method,
        timestamp: Number(s.timestamp),
        items: s.sale_items.map((si: any) => ({
          menu_item_id: si.menu_item_id,
          name: si.name,
          price: Number(si.price),
          quantity: Number(si.quantity),
          cost: Number(si.cost)
        }))
      }));
      set({ history: formatted, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addSale: async (sale) => {
    const saleId = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    // 1. Chèn vào bảng sales
    const { error: saleError } = await supabase
      .from('sales')
      .insert([{
        id: saleId,
        table_id: sale.tableId,
        subtotal: sale.subtotal,
        tax: sale.tax,
        total: sale.total,
        payment_method: sale.paymentMethod,
        timestamp: timestamp
      }]);

    if (!saleError) {
      // 2. Chèn vào bảng sale_items
      const itemsToInsert = sale.items.map(item => ({
        sale_id: saleId,
        menu_item_id: item.menu_item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert);
      
      if (!itemsError) {
        await get().fetchHistory();
      }
    }
  },

  getDailyRevenue: (dateStr) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return get().history
      .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === targetDate)
      .reduce((acc, s) => acc + s.total, 0);
  },

  getDailyProfit: (dateStr) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return get().history
      .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === targetDate)
      .reduce((acc, s) => {
        const saleRevenue = s.subtotal;
        const saleCost = s.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        return acc + (saleRevenue - saleCost);
      }, 0);
  },

  getRevenueByRange: (days) => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return get().history
      .filter(s => s.timestamp >= cutoff)
      .reduce((acc, s) => acc + s.total, 0);
  },

  getProfitByRange: (days) => {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    return get().history
      .filter(s => s.timestamp >= cutoff)
      .reduce((acc, s) => {
        const saleRevenue = s.subtotal;
        const saleCost = s.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
        return acc + (saleRevenue - saleCost);
      }, 0);
  }
}));
