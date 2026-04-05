"use client";

import { useEffect } from "react";
import { useTableStore } from "@/store/tableStore";
import { useMenuStore } from "@/store/menuStore";
import { useUserStore } from "@/store/userStore";

export function StoreInitializer() {
  const fetchTables = useTableStore((state) => state.fetchInitialData);
  const initTableRealtime = useTableStore((state) => state.initializeRealtime);
  
  const fetchMenu = useMenuStore((state) => state.fetchItems);
  const fetchStaff = useUserStore((state) => state.fetchStaff);

  useEffect(() => {
    // Initial fetches
    fetchTables();
    fetchMenu();
    fetchStaff();

    // Initialize Realtime subscriptions
    const cleanupTables = initTableRealtime();

    return () => {
      if (cleanupTables) cleanupTables();
    };
  }, [fetchTables, fetchMenu, fetchStaff, initTableRealtime]);

  return null;
}
