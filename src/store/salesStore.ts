import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SaleRecord {
  id: string;
  tableId: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    cost: number; // Chi phí nguyên liệu tại thời điểm bán
  }[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: number;
  paymentMethod: string;
}

interface SalesStore {
  history: SaleRecord[];
  addSale: (sale: Omit<SaleRecord, "id" | "timestamp">) => void;
  getDailyRevenue: (dateStr?: string) => number;
  getDailyProfit: (dateStr?: string) => number;
  getRevenueByRange: (days: number) => number;
  getProfitByRange: (days: number) => number;
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      history: [],

      addSale: (sale) => set((state) => ({
        history: [
          ...state.history,
          {
            ...sale,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now()
          }
        ]
      })),

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
    }),
    {
      name: "elevated-pos-sales",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
