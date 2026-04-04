import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TableStatus = "empty" | "occupied" | "bill-printed" | "reserved";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem extends MenuItem {
  cartId: string;
  quantity: number;
  status: "pending" | "sent" | "preparing" | "ready" | "served";
  notes?: string;
  timestamp: number;
}

export interface Reservation {
  id: string;
  guestName: string;
  pax: number;
  date: string;
  time: string;
  notes?: string;
  status: "pending" | "seated" | "cancelled";
  tableId?: string;
}

export interface Table {
  id: string;
  number: string;
  status: TableStatus;
  guests?: number;
  timeElapsed?: string;
  reservedTime?: string;
  reservedBy?: string;
  pax?: number;
  orders: OrderItem[];
  reservationId?: string;
}

interface TableStore {
  floors: { name: string; tables: Table[] }[];
  reservations: Reservation[];
  setFloors: (floors: { name: string; tables: Table[] }[]) => void;
  updateTable: (floorIndex: number, tableId: string, updates: Partial<Table>) => void;
  addOrderItem: (tableId: string, item: Omit<OrderItem, "cartId" | "status" | "timestamp">) => void;
  updateItemStatus: (tableId: string, cartId: string, status: OrderItem["status"]) => void;
  updateItemNote: (tableId: string, cartId: string, notes: string) => void;
  confirmOrders: (tableId: string) => void;
  clearOrders: (tableId: string) => void;
  markAsServed: (tableId: string, cartId: string) => void;
  addReservation: (res: Omit<Reservation, "id" | "status">) => void;
  assignTable: (resId: string, tableId: string) => void;
  seatReservation: (resId: string) => void;
}

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "res-smith-10",
    guestName: "Smith Party",
    pax: 4,
    date: "2023-10-24",
    time: "7:30 PM",
    status: "pending",
    tableId: "10"
  }
];

const INITIAL_FLOORS = [
  { 
    name: "Main Dining Room", 
    tables: [
      { id: "4", number: "04", status: "occupied", guests: 3, timeElapsed: "45M", orders: [] },
      { id: "8", number: "08", status: "empty", orders: [] },
      { id: "2", number: "02", status: "bill-printed", guests: 4, timeElapsed: "1H 20M", orders: [] },
      { id: "10", number: "10", status: "reserved", pax: 4, reservedTime: "7:30 PM", reservedBy: "Smith Party", orders: [], reservationId: "res-smith-10" },
      { id: "1", number: "01", status: "empty", orders: [] },
      { id: "3", number: "03", status: "occupied", guests: 2, timeElapsed: "12M", orders: [] },
      { id: "5", number: "05", status: "empty", orders: [] },
      { id: "12", number: "12", status: "empty", orders: [] },
    ] as Table[]
  },
  { 
    name: "Patio Terrace", 
    tables: [
      { id: "21", number: "21", status: "empty", orders: [] },
      { id: "22", number: "22", status: "occupied", guests: 2, timeElapsed: "15M", orders: [] },
      { id: "23", number: "23", status: "empty", orders: [] },
      { id: "24", number: "24", status: "empty", orders: [] },
      { id: "25", number: "25", status: "empty", orders: [] },
      { id: "26", number: "26", status: "empty", orders: [] },
    ] as Table[]
  },
  { 
    name: "VIP Lounge", 
    tables: [
      { id: "V1", number: "V1", status: "empty", orders: [] },
      { id: "V2", number: "V2", status: "occupied", guests: 6, timeElapsed: "1H", orders: [] },
      { id: "V3", number: "V3", status: "empty", orders: [] },
    ] as Table[]
  },
  { 
    name: "Direct Orders", 
    tables: [
      { id: "TAKEAWAY", number: "TW", status: "empty", orders: [] },
    ] as Table[]
  }
];

export const useTableStore = create<TableStore>()(
  persist(
    (set) => ({
      floors: INITIAL_FLOORS,
      reservations: INITIAL_RESERVATIONS,
      
      setFloors: (floors: { name: string; tables: Table[] }[]) => set({ floors }),
      
      updateTable: (floorIndex: number, tableId: string, updates: Partial<Table>) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          const tableIndex = newFloors[floorIndex].tables.findIndex(t => t.id === tableId);
          if (tableIndex !== -1) {
            newFloors[floorIndex].tables[tableIndex] = { 
              ...newFloors[floorIndex].tables[tableIndex], 
              ...updates 
            };
          }
          return { floors: newFloors };
        }),

      addOrderItem: (tableId: string, item: Omit<OrderItem, "cartId" | "status" | "timestamp">) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          let foundTable: Table | undefined;
          for (const floor of newFloors) {
            foundTable = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (foundTable) break;
          }
          if (foundTable) {
            const existingPending = foundTable.orders.find(o => o.id === item.id && o.status === "pending");
            if (existingPending) {
              existingPending.quantity += 1;
            } else {
              foundTable.orders.push({
                ...item,
                cartId: Math.random().toString(36).substring(7),
                status: "pending",
                timestamp: Date.now()
              });
            }
          }
          return { floors: newFloors };
        }),

      updateItemStatus: (tableId: string, cartId: string, status: OrderItem["status"]) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          for (const floor of newFloors) {
            const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (table) {
              const item = table.orders.find(o => o.cartId === cartId);
              if (item) item.status = status;
            }
          }
          return { floors: newFloors };
        }),

      updateItemNote: (tableId: string, cartId: string, notes: string) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          for (const floor of newFloors) {
            const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (table) {
              const item = table.orders.find(o => o.cartId === cartId);
              if (item) item.notes = notes;
            }
          }
          return { floors: newFloors };
        }),

      confirmOrders: (tableId: string) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          for (const floor of newFloors) {
            const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (table) {
              table.orders.forEach(o => {
                if (o.status === "pending") o.status = "sent";
              });
            }
          }
          return { floors: newFloors };
        }),

      clearOrders: (tableId: string) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          for (const floor of newFloors) {
            const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (table) table.orders = [];
          }
          return { floors: newFloors };
        }),

      markAsServed: (tableId: string, cartId: string) => 
        set((state: TableStore) => {
          const newFloors = [...state.floors];
          for (const floor of newFloors) {
            const table = floor.tables.find(t => t.id === tableId || t.number === tableId);
            if (table) {
              const item = table.orders.find(o => o.cartId === cartId);
              if (item) item.status = "served";
            }
          }
          return { floors: newFloors };
        }),

      addReservation: (res: Omit<Reservation, "id" | "status">) => 
        set((state: TableStore) => {
          const newId = Math.random().toString(36).substring(7);
          const newRes: Reservation = {
            ...res,
            id: newId,
            status: "pending"
          };
          
          let nextFloors = state.floors;
          if (res.tableId) {
            nextFloors = state.floors.map(floor => ({
              ...floor,
              tables: floor.tables.map(table => 
                table.id === res.tableId 
                  ? { 
                      ...table, 
                      status: "reserved" as TableStatus, 
                      reservationId: newId,
                      reservedBy: res.guestName,
                      reservedTime: res.time,
                      pax: res.pax
                    } 
                  : table
              )
            }));
          }

          return {
            reservations: [...state.reservations, newRes],
            floors: nextFloors
          };
        }),

      assignTable: (resId: string, tableId: string) => 
        set((state: TableStore) => {
          const newReservations = state.reservations.map(r => 
            r.id === resId ? { ...r, tableId } : r
          );
          const res = state.reservations.find(r => r.id === resId);
          if (!res) return {};

          const newFloors = state.floors.map(floor => ({
            ...floor,
            tables: floor.tables.map(table => 
              table.id === tableId 
                ? { 
                    ...table, 
                    status: "reserved" as TableStatus, 
                    reservationId: resId,
                    reservedBy: res.guestName,
                    reservedTime: res.time,
                    pax: res.pax
                  } 
                : table
            )
          }));

          return {
            reservations: newReservations,
            floors: newFloors
          };
        }),

      seatReservation: (resId: string) => 
        set((state: TableStore) => {
          const reservation = state.reservations.find(r => r.id === resId);
          if (!reservation || !reservation.tableId) return {};

          const newReservations = state.reservations.map(r => 
            r.id === resId ? { ...r, status: "seated" as const } : r
          );

          const newFloors = state.floors.map(floor => ({
            ...floor,
            tables: floor.tables.map(table => 
              table.id === reservation.tableId 
                ? { 
                    ...table, 
                    status: "occupied" as TableStatus, 
                    guests: reservation.pax,
                    timeElapsed: "Just Arrived",
                    reservationId: undefined
                  } 
                : table
            )
          }));

          return {
            reservations: newReservations,
            floors: newFloors
          };
        }),
    }),
    {
      name: "elevated-pos-tables",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
