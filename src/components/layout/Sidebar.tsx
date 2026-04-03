"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
/* Custom High-Fidelity Icons to match Figma Figure 5 */
const TableMapIcon = ({ className, size = 24, strokeWidth = 2.5 }: { className?: string; size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 8h18" />
    <path d="M4 8v11" />
    <path d="M20 8v11" />
    <path d="M8 8v7" />
    <path d="M16 8v7" />
    <path d="M7 15h10" />
  </svg>
);

const KitchenIcon = ({ className, size = 24, strokeWidth = 2.5 }: { className?: string; size?: number; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12h15c0 3-2 5-5 5H5c-3 0-5-2-5-5Z" />
    <path d="M17 12l5-5" />
    <path d="M5 8V4" />
    <path d="M9 8V4" />
    <path d="M13 8V4" />
  </svg>
);

import { 
  Calendar, 
  UtensilsCrossed, 
  Banknote, 
  SquarePen, 
  Package 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Table Map", href: "/table-map", icon: TableMapIcon },
  { name: "Reservations", href: "/reservations", icon: Calendar },
  { name: "Order Menu", href: "/order-menu", icon: UtensilsCrossed },
  { name: "Kitchen KDS", href: "/kitchen-kds", icon: KitchenIcon },
  { name: "Checkout", href: "/checkout", icon: Banknote },
  { name: "Feedback", href: "/feedback", icon: SquarePen },
  { name: "Inventory", href: "/inventory", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-surface-container flex flex-col py-10 z-50 no-border-section">
      <div className="px-8 mb-4">
        <h1 className="text-lg font-black text-on-surface tracking-tight">Elevated POS</h1>
        <p className="text-xs text-outline font-medium mt-1">Staff: Alex</p>
      </div>

      <nav className="flex flex-col gap-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/table-map" && (pathname === "/" || pathname === "/table-map"));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "mx-3 flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-200 group",
                isActive 
                  ? "bg-[#71f5ea] text-[#006a67] shadow-sm" 
                  : "text-on-surface hover:bg-surface-container-highest"
              )}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 3 : 2.5}
                className={cn(
                  "transition-colors",
                  isActive ? "text-[#006a67]" : "text-on-surface/70 group-hover:text-on-surface"
                )} 
              />
              <span className={cn(
                "font-display text-base tracking-tight",
                isActive ? "font-black" : "font-bold"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info removed to match Figma */}
    </aside>
  );
}
