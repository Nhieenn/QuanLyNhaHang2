import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "vi" | "en";

interface SettingsState {
  language: Language;
  notificationsEnabled: boolean;
  
  // Actions
  setLanguage: (lang: Language) => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "vi",
      notificationsEnabled: true,

      setLanguage: (language) => set({ language }),

      toggleNotifications: () => set((state) => ({ 
        notificationsEnabled: !state.notificationsEnabled 
      })),
    }),
    {
      name: "elevated-pos-settings",
    }
  )
);
