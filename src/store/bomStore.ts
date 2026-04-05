import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BOMRequirement {
  ingredientId: string;
  quantity: number; // Định mức cần dùng cho 1 đơn vị món
}

export interface Recipe {
  menuItemId: string;
  ingredients: BOMRequirement[];
}

interface BOMStore {
  recipes: Record<string, BOMRequirement[]>;
  setRecipe: (menuItemId: string, ingredients: BOMRequirement[]) => void;
  getRecipe: (menuItemId: string) => BOMRequirement[] | undefined;
}

const DEFAULT_RECIPES: Record<string, BOMRequirement[]> = {
  "latte": [
    { ingredientId: "1", quantity: 0.05 }, // 0.05kg Coffee Beans
    { ingredientId: "2", quantity: 0.25 }  // 0.25L Whole Milk
  ],
  "cortado": [
    { ingredientId: "1", quantity: 0.05 },
    { ingredientId: "2", quantity: 0.15 }
  ],
  "matcha": [
    { ingredientId: "2", quantity: 0.20 } // Needs Milk
  ],
  "toast": [
    { ingredientId: "3", quantity: 1 }    // 1 Unit Avocado
  ]
};

export const useBOMStore = create<BOMStore>()(
  persist(
    (set, get) => ({
      recipes: DEFAULT_RECIPES,
      
      setRecipe: (menuItemId, ingredients) => set((state) => ({
        recipes: { ...state.recipes, [menuItemId]: ingredients }
      })),

      getRecipe: (menuItemId) => get().recipes[menuItemId]
    }),
    {
      name: "elevated-pos-bom",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
