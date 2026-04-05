import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  addItem: (item: Omit<InventoryItem, "id" | "status" | "lastUpdated">) => void;
  updateStock: (id: string, newValue: number) => void;
  deductStock: (id: string, amount: number) => void;
  removeItem: (id: string) => void;
  // Stats helpers
  getLowStockCount: () => number;
  getTotalAssetValue: () => number;
}

const calculateStatus = (current: number, threshold: number, max: number): InventoryStatus => {
  if (current <= threshold) return "critical";
  if (current <= max * 0.3) return "warning";
  return "healthy";
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { 
    id: "1", 
    name: "Coffee Beans", 
    category: "DRY GOODS", 
    currentValue: 42.5, 
    unit: "KG", 
    maxCapacity: 60,
    minThreshold: 10,
    status: "healthy",
    lastUpdated: Date.now(),
    image: "/inventory/coffee_beans.png",
    pricePerUnit: 12.50
  },
  { 
    id: "2", 
    name: "Whole Milk", 
    category: "DAIRY", 
    currentValue: 12.0, 
    unit: "L", 
    maxCapacity: 50,
    minThreshold: 15,
    status: "warning",
    lastUpdated: Date.now(),
    image: "/inventory/whole_milk.png",
    pricePerUnit: 1.80
  },
  { 
    id: "3", 
    name: "Avocado", 
    category: "PRODUCE", 
    currentValue: 8, 
    unit: "UNITS", 
    maxCapacity: 100,
    minThreshold: 20,
    status: "critical", 
    lastUpdated: Date.now(),
    image: "/inventory/avocado.png",
    pricePerUnit: 0.75
  },
  { 
    id: "4", 
    name: "Salmon Fillet", 
    category: "PROTEINS", 
    currentValue: 15.5, 
    unit: "KG", 
    maxCapacity: 20,
    minThreshold: 5,
    status: "healthy",
    lastUpdated: Date.now(),
    image: "/inventory/salmon_fillet.png" 
  },
  { 
    id: "5", 
    name: "Baby Spinach", 
    category: "PRODUCE", 
    currentValue: 4.2, 
    unit: "KG", 
    maxCapacity: 10,
    minThreshold: 3,
    status: "healthy",
    lastUpdated: Date.now(),
    image: "/inventory/baby_spinach.png" 
  },
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: INITIAL_INVENTORY,

      addItem: (item) => set((state) => {
        const id = Math.random().toString(36).substring(7);
        const status = calculateStatus(item.currentValue, item.minThreshold, item.maxCapacity);
        const newItem: InventoryItem = {
          ...item,
          id,
          status,
          lastUpdated: Date.now()
        };
        return { items: [...state.items, newItem] };
      }),

      updateStock: (id, newValue) => set((state) => ({
        items: state.items.map(item => 
          item.id === id 
            ? { 
                ...item, 
                currentValue: newValue, 
                status: calculateStatus(newValue, item.minThreshold, item.maxCapacity),
                lastUpdated: Date.now()
              } 
            : item
        )
      })),

      deductStock: (id, amount) => set((state) => {
        const item = state.items.find(i => i.id === id);
        if (!item) return state;
        const newValue = Math.max(0, item.currentValue - amount);
        return {
          items: state.items.map(i => 
            i.id === id 
              ? { 
                  ...i, 
                  currentValue: newValue, 
                  status: calculateStatus(newValue, i.minThreshold, i.maxCapacity),
                  lastUpdated: Date.now()
                } 
              : i
          )
        };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),

      getLowStockCount: () => {
        return get().items.filter(item => item.status === "critical" || item.status === "warning").length;
      },

      getTotalAssetValue: () => {
        return get().items.reduce((acc, item) => acc + (item.currentValue * (item.pricePerUnit || 10)), 0);
      }
    }),
    {
      name: "elevated-pos-inventory",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
