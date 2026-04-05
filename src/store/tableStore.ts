import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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

export interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

interface TableStore {
  floors: Floor[];
  reservations: Reservation[];
  loading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  initializeRealtime: () => (() => void);
  setFloors: (floors: Floor[]) => void;
  updateTable: (floorIndex: number, tableId: string, updates: Partial<Table>) => Promise<void>;
  addOrderItem: (tableId: string, item: Omit<OrderItem, "cartId" | "status" | "timestamp">) => Promise<void>;
  updateItemStatus: (tableId: string, cartId: string, status: OrderItem["status"]) => Promise<void>;
  updateItemNote: (tableId: string, cartId: string, notes: string) => Promise<void>;
  confirmOrders: (tableId: string) => Promise<void>;
  clearOrders: (tableId: string) => Promise<void>;
  markAsServed: (tableId: string, cartId: string) => Promise<void>;
  addReservation: (res: Omit<Reservation, "id" | "status">) => Promise<void>;
  assignTable: (resId: string, tableId: string) => Promise<void>;
  seatReservation: (resId: string) => Promise<void>;
  transferTable: (floorIndex: number, sourceId: string, destId: string) => Promise<void>;
  deductInventory: (tableId: string) => Promise<void>;
}

export const useTableStore = create<TableStore>((set, get) => ({
  floors: [],
  reservations: [],
  loading: false,

  fetchInitialData: async () => {
    set({ loading: true });
    
    // Fetch Floors
    const { data: floorsData } = await supabase.from('floors').select('*');
    // Fetch Tables
    const { data: tablesData } = await supabase.from('tables').select('*');
    // Fetch Orders
    const { data: ordersData } = await supabase.from('orders').select('*');
    // Fetch Reservations
    const { data: resData } = await supabase.from('reservations').select('*');

    if (floorsData && tablesData) {
      const floorsWithTables = floorsData.map(floor => ({
        ...floor,
        tables: tablesData
          .filter(table => table.floor_id === floor.id)
          .map(table => ({
            ...table,
            timeElapsed: table.time_elapsed,
            orders: ordersData 
              ? ordersData
                  .filter(o => o.table_id === table.id)
                  .map(o => ({
                    id: o.menu_item_id,
                    name: o.name || "Unknown",
                    price: o.price || 0,
                    cartId: o.id,
                    quantity: o.quantity,
                    status: o.status,
                    notes: o.notes,
                    timestamp: new Date(o.created_at).getTime()
                  }))
              : []
          }))
      }));
      set({ floors: floorsWithTables, reservations: resData || [], loading: false });
    }
  },

  initializeRealtime: () => {
    const tablesChannel = supabase.channel('tables_realtime')
      .on('postgres_changes', { event: '*', table: 'tables', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    const ordersChannel = supabase.channel('orders_realtime')
      .on('postgres_changes', { event: '*', table: 'orders', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();
    
    const resChannel = supabase.channel('res_realtime')
      .on('postgres_changes', { event: '*', table: 'reservations', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    const inventoryChannel = supabase.channel('inventory_realtime')
      .on('postgres_changes', { event: '*', table: 'ingredients', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    return () => {
      supabase.removeChannel(tablesChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(resChannel);
      supabase.removeChannel(inventoryChannel);
    };
  },

  setFloors: (floors) => set({ floors }),

  updateTable: async (floorIndex, tableId, updates) => {
    const dbUpdates: any = { ...updates };
    if (updates.timeElapsed) dbUpdates.time_elapsed = updates.timeElapsed;
    delete dbUpdates.orders;

    await supabase.from('tables').update(dbUpdates).eq('id', tableId);
  },

  addOrderItem: async (tableId, item) => {
    await supabase.from('orders').insert([{
      table_id: tableId,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      status: 'pending',
      notes: ''
    }]);
  },

  updateItemStatus: async (tableId, cartId, status) => {
    await supabase.from('orders').update({ status }).eq('id', cartId);
  },

  updateItemNote: async (tableId, cartId, notes) => {
    await supabase.from('orders').update({ notes }).eq('id', cartId);
  },

  confirmOrders: async (tableId) => {
    const { data } = await supabase.from('orders').select('id').eq('table_id', tableId).eq('status', 'pending');
    if (data && data.length > 0) {
      await supabase.from('orders').update({ status: 'sent' }).in('id', data.map(o => o.id));
    }
  },

  deductInventory: async (tableId) => {
    // 1. Lấy tất cả các món ăn trong đơn hàng của bàn này
    const { data: orders } = await supabase
      .from('orders')
      .select('menu_item_id, quantity')
      .eq('table_id', tableId);

    if (!orders || orders.length === 0) return;

    // 2. Với mỗi món ăn, lấy định mức (BOM) tương ứng
    for (const order of orders) {
      const { data: bom } = await supabase
        .from('bom_recipe')
        .select('ingredient_id, quantity_used')
        .eq('product_id', order.menu_item_id);

      if (bom && bom.length > 0) {
        // 3. Thực hiện trừ tồn kho cho từng nguyên liệu
        for (const recipe of bom) {
          const totalDeduction = recipe.quantity_used * order.quantity;
          
          // Lấy tồn kho hiện tại
          const { data: ingredient } = await supabase
            .from('ingredients')
            .select('current_stock')
            .eq('id', recipe.ingredient_id)
            .single();

          if (ingredient) {
            const newStock = Math.max(0, Number(ingredient.current_stock) - totalDeduction);
            await supabase
              .from('ingredients')
              .update({ current_stock: newStock })
              .eq('id', recipe.ingredient_id);
          }
        }
      }
    }
  },

  clearOrders: async (tableId) => {
     // Trước khi xóa đơn hàng và làm trống bàn, thực hiện trừ tồn kho tự động
     await get().deductInventory(tableId);

     await supabase.from('orders').delete().eq('table_id', tableId);
     await supabase.from('tables').update({ status: 'empty', guests: 0, time_elapsed: null }).eq('id', tableId);
  },

  markAsServed: async (tableId, cartId) => {
    await supabase.from('orders').update({ status: 'served' }).eq('id', cartId);
  },

  addReservation: async (res) => {
    await supabase.from('reservations').insert([{ ...res, status: 'pending' }]);
  },

  assignTable: async (resId, tableId) => {
    await supabase.from('reservations').update({ tableId }).eq('id', resId);
    await supabase.from('tables').update({ status: 'reserved' }).eq('id', tableId);
  },

  seatReservation: async (resId) => {
    const { data: res } = await supabase.from('reservations').select('*').eq('id', resId).single();
    if (res && res.tableId) {
      await supabase.from('reservations').update({ status: 'seated' }).eq('id', resId);
      await supabase.from('tables').update({ 
        status: 'occupied', 
        guests: res.pax,
        time_elapsed: 'Just Arrived'
      }).eq('id', res.tableId);
    }
  },

  transferTable: async (floorIndex, sourceId, destId) => {
    await supabase.from('orders').update({ table_id: destId }).eq('table_id', sourceId);
    const { data: sourceTable } = await supabase.from('tables').select('*').eq('id', sourceId).single();
    if (sourceTable) {
        await supabase.from('tables').update({
            status: sourceTable.status,
            guests: sourceTable.guests,
            time_elapsed: sourceTable.time_elapsed
        }).eq('id', destId);
        await supabase.from('tables').update({
            status: 'empty',
            guests: 0,
            time_elapsed: null
        }).eq('id', sourceId);
    }
  }
}));
