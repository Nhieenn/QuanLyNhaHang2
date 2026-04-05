export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  tag?: string;
  type: "drink" | "food";
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "latte",
    name: "Oat Milk Latte",
    category: "signature",
    description: "Double shot, organic oat milk",
    price: 5.50,
    tag: "bestSeller",
    type: "drink"
  },
  {
    id: "cortado",
    name: "Cortado",
    category: "signature",
    description: "Equal parts espresso and milk",
    price: 4.25,
    tag: "classic",
    type: "drink"
  },
  {
    id: "matcha",
    name: "Ceremonial Matcha",
    category: "teas",
    description: "Uji source, hand-whisked",
    price: 6.50,
    tag: "premium",
    type: "drink"
  },
  {
    id: "toast",
    name: "Sourdough Toast",
    category: "bites",
    description: "Avocado & organic seeds",
    price: 12.00,
    tag: "organic",
    type: "food"
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "bites",
    description: "Double fermented, French butter",
    price: 4.50,
    tag: "new",
    type: "food"
  }
];
