import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Staff {
  id: string;
  name: string;
  pin: string;
  role: "Waiter" | "Manager" | "Chef";
  avatar: string;
  shiftStart?: string;
  isFullTime?: boolean;
}

interface UserStore {
  staffList: Staff[];
  currentUser: Staff | null;
  isAuthenticated: boolean;
  shiftNumber: string;
  schedules: Record<string, string[]>;
  loading: boolean;
  
  // Actions
  fetchStaff: () => Promise<void>;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (pin: string) => Promise<boolean>;
  setShift: (num: string) => void;
  registerStaffToShift: (shiftId: string, staffId: string) => void;
  addStaff: (staffData: Omit<Staff, "id">) => Promise<void>;
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  getCurrentShiftId: () => string;
}

const getDynamicShiftId = () => {
  const now = new Date();
  const h = now.getHours();
  let sNum = "01";
  if (h >= 12 && h < 16) sNum = "02";
  else if (h >= 16 && h < 20) sNum = "03";
  else if (h >= 20 || h < 8) sNum = "04";
  
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `#${dd}${mm}-${sNum}`;
};

export const useUserStore = create<UserStore>((set, get) => ({
  staffList: [],
  currentUser: null,
  isAuthenticated: false,
  shiftNumber: getDynamicShiftId(),
  schedules: {},
  loading: false,

  fetchStaff: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('staff').select('*');
    if (data) {
      set({ staffList: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  login: async (pin) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('pin', pin)
      .single();

    if (data) {
      set({ currentUser: data, isAuthenticated: true, loading: false });
      return true;
    }
    set({ loading: false });
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  switchUser: async (pin) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('pin', pin)
      .single();

    if (data) {
      set({ currentUser: data, isAuthenticated: true });
      return true;
    }
    return false;
  },

  setShift: (num) => {
    set({ shiftNumber: num });
  },

  registerStaffToShift: (shiftId, staffId) => {
    set((state) => {
      const currentStaff = state.schedules[shiftId] || [];
      if (currentStaff.includes(staffId)) return state;
      return {
        schedules: {
          ...state.schedules,
          [shiftId]: [...currentStaff, staffId]
        }
      };
    });
  },

  addStaff: async (staffData: Omit<Staff, "id">) => {
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select();
    
    if (data) {
      set((state) => ({ staffList: [...state.staffList, data[0]] }));
    }
  },

  updateStaff: async (id: string, updates: Partial<Staff>) => {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (data) {
      set((state) => ({
        staffList: state.staffList.map((s) => (s.id === id ? { ...s, ...data[0] } : s)),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data[0] } : state.currentUser
      }));
    }
  },

  deleteStaff: async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        staffList: state.staffList.filter((s) => s.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        isAuthenticated: state.currentUser?.id === id ? false : state.isAuthenticated
      }));
    }
  },

  getCurrentShiftId: () => getDynamicShiftId()
}));
