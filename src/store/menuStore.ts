import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { MenuItem } from "@/constants/menu";

interface MenuStore {
  items: MenuItem[];
  loading: boolean;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  loading: false,

  fetchItems: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });
    
    if (data) {
      set({ items: data as MenuItem[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  addItem: async (item) => {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select();
    
    if (data) {
      set((state) => ({ items: [...state.items, data[0]] }));
    }
  },

  updateItem: async (id, updates) => {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (data) {
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      }));
    }
  },

  deleteItem: async (id) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }));
    }
  },
}));
