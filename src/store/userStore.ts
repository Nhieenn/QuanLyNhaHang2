import { create } from "zustand";

export interface Staff {
  id: string;
  name: string;
  pin: string;
  role: "Waiter" | "Manager" | "Chef";
  avatar: string;
  shiftStart?: string;
}

interface UserStore {
  staffList: Staff[];
  currentUser: Staff | null;
  isAuthenticated: boolean;
  shiftNumber: number;
  
  // Actions
  login: (pin: string) => boolean;
  logout: () => void;
  switchUser: (pin: string) => boolean;
  setShift: (num: number) => void;
}

const INITIAL_STAFF: Staff[] = [
  { id: "1", name: "Alex", pin: "1234", role: "Waiter", avatar: "AX", shiftStart: "10:30 AM" },
  { id: "2", name: "Manager", pin: "0000", role: "Manager", avatar: "MG", shiftStart: "08:00 AM" },
  { id: "3", name: "Chef Marco", pin: "8888", role: "Chef", avatar: "MC", shiftStart: "09:00 AM" },
];

export const useUserStore = create<UserStore>((set, get) => ({
  staffList: INITIAL_STAFF,
  currentUser: INITIAL_STAFF[0],
  isAuthenticated: true,
  shiftNumber: 42,

  login: (pin) => {
    const staff = get().staffList.find(s => s.pin === pin);
    if (staff) {
      set({ currentUser: staff, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  switchUser: (pin) => {
    const staff = get().staffList.find(s => s.pin === pin);
    if (staff) {
      set({ currentUser: staff, isAuthenticated: true });
      return true;
    }
    return false;
  },

  setShift: (num) => {
    set({ shiftNumber: num });
  }
}));
