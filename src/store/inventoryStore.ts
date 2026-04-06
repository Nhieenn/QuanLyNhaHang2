import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type InventoryStatus = "healthy" | "warning" | "critical";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  unit: string;
  maxCapacity: number;
  minThreshold: number;
  status: InventoryStatus;
  lastUpdated: number;
  image?: string;
  pricePerUnit?: number;
}

interface InventoryStore {
  items: InventoryItem[];
  loading: boolean;
  realtimeChannel: any | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  subscribeRealtime: () => void;
  addItem: (item: Omit<InventoryItem, "id" | "status" | "lastUpdated"> & { id?: string }) => Promise<void>;
  updateStock: (id: string, newValue: number) => Promise<void>;
  deductStock: (id: string, amount: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  
  // Stats helpers
  getLowStockCount: () => number;
  getTotalAssetValue: () => number;
}

const calculateStatus = (current: number, threshold: number, max: number): InventoryStatus => {
  if (current <= threshold) return "critical";
  if (current <= max * 0.3) return "warning";
  return "healthy";
};

// Mặc định cho các trường còn thiếu trong DB
const mapDBToItem = (dbItem: any): InventoryItem => {
  const current = Number(dbItem.current_stock);
  const min = Number(dbItem.min_stock);
  const max = Number(dbItem.max_capacity || 5000); // Mặc định 5kg nếu ko có
  
  return {
    id: dbItem.id,
    name: dbItem.name,
    unit: dbItem.unit,
    currentValue: current,
    minThreshold: min,
    maxCapacity: max,
    category: dbItem.category || "GENERAL",
    pricePerUnit: Number(dbItem.price_per_unit || 10),
    image: dbItem.image_url || "/inventory/placeholder.png",
    status: calculateStatus(current, min, max),
    lastUpdated: new Date(dbItem.created_at || Date.now()).getTime()
  };
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  loading: false,
  realtimeChannel: null,

  fetchItems: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) {
      set({ items: data.map(mapDBToItem), loading: false });
    } else {
      set({ loading: false });
    }
  },

  subscribeRealtime: () => {
    if (get().realtimeChannel) return;

    const channel = supabase
      .channel('inventory_realtime_channel')
      .on('postgres_changes', { event: '*', table: 'ingredients', schema: 'public' }, () => {
        get().fetchItems();
      })
      .subscribe();
    
    set({ realtimeChannel: channel });
  },

  addItem: async (item) => {
    const { data } = await supabase
      .from('ingredients')
      .insert([{
        id: item.id || Math.random().toString(36).substring(7),
        name: item.name,
        unit: item.unit,
        current_stock: item.currentValue,
        min_stock: item.minThreshold,
        category: item.category,
        max_capacity: item.maxCapacity,
        price_per_unit: item.pricePerUnit,
        image_url: item.image
      }])
      .select();
    
    if (data) {
      await get().fetchItems();
    }
  },

  updateStock: async (id, newValue) => {
    const { error } = await supabase
      .from('ingredients')
      .update({ current_stock: newValue })
      .eq('id', id);
    
    if (!error) {
      await get().fetchItems();
    }
  },

  deductStock: async (id, amount) => {
    const item = get().items.find(i => i.id === id);
    if (!item) return;
    
    const newValue = Math.max(0, item.currentValue - amount);
    await get().updateStock(id, newValue);
  },

  removeItem: async (id) => {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await get().fetchItems();
    }
  },

  getLowStockCount: () => {
    return get().items.filter(item => item.status === "critical" || item.status === "warning").length;
  },

  getTotalAssetValue: () => {
    return get().items.reduce((acc, item) => acc + (item.currentValue * (item.pricePerUnit || 10)), 0);
  }
}));
