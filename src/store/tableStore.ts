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
  name_en?: string;
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
  deleteOrderItem: (cartId: string) => Promise<void>;
  clearPendingOrders: (tableId: string) => Promise<void>;
  markAsServed: (tableId: string, cartId: string) => Promise<void>;
  addReservation: (res: Omit<Reservation, "id" | "status">) => Promise<void>;
  assignTable: (resId: string, tableId: string) => Promise<void>;
  seatReservation: (resId: string) => Promise<void>;
  transferTable: (floorIndex: number, sourceId: string, destId: string) => Promise<void>;
  deductInventory: (tableId: string) => Promise<void>;
  processingIds: Set<string>;
  ensureInfrastructure: () => Promise<void>;
}

export const useTableStore = create<TableStore>((set, get) => ({
  floors: [],
  reservations: [],
  loading: false,
  processingIds: new Set(),
  isRealtimeInitialized: false,

  fetchInitialData: async () => {
    set({ loading: true });
    
    // 1. Fetch all data from Supabase (READ ONLY - NO UPSERTS HERE)
    const { data: floorsData } = await supabase.from('floors').select('*');
    const { data: tablesData } = await supabase.from('tables').select('*');
    const { data: ordersData } = await supabase.from('orders').select('*');
    const { data: resData } = await supabase.from('reservations').select('*');

    // 3. Process and merge data into state
    if (floorsData && tablesData) {
      const floorsWithTables = floorsData.map(floor => {
        const floorTables = tablesData
          .filter(table => table.floor_id === floor.id)
          .map(table => {
            const tableOrders = ordersData 
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
              : [];

            return {
              ...table,
              id: table.id, // Use standard id from DB
              timeElapsed: table.time_elapsed,
              orders: tableOrders
            };
          });

        return {
          ...floor,
          tables: floorTables
        };
      });

      set({ 
        floors: floorsWithTables, 
        reservations: resData || [], 
        loading: false 
      });
    }
  },

  initializeRealtime: () => {
    if (get().isRealtimeInitialized) return () => {};

    // 1. Trigger infrastructure check (Takeaway table)
    get().ensureInfrastructure();
    
    set({ isRealtimeInitialized: true });

    // Sử dụng ID duy nhất cho channel để tránh xung đột 'after subscribe' khi re-render
    const suffix = Date.now();
    
    const tablesChannel = supabase.channel(`tables_realtime_${suffix}`)
      .on('postgres_changes', { event: '*', table: 'tables', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    const ordersChannel = supabase.channel(`orders_realtime_${suffix}`)
      .on('postgres_changes', { event: '*', table: 'orders', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();
    
    const resChannel = supabase.channel(`res_realtime_${suffix}`)
      .on('postgres_changes', { event: '*', table: 'reservations', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    const inventoryChannel = supabase.channel(`inventory_realtime_${suffix}`)
      .on('postgres_changes', { event: '*', table: 'ingredients', schema: 'public' }, () => get().fetchInitialData())
      .subscribe();

    return () => {
      supabase.removeChannel(tablesChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(resChannel);
      supabase.removeChannel(inventoryChannel);
      set({ isRealtimeInitialized: false });
    };
  },

  setFloors: (floors) => set({ floors }),

  updateTable: async (floorIndex, tableId, updates) => {
    const dbUpdates: any = { ...updates };
    
    // Kiểm tra và chuyển đổi camelCase sang snake_case cho DB
    if (updates.timeElapsed) {
      dbUpdates.time_elapsed = updates.timeElapsed;
      delete dbUpdates.timeElapsed;
    }
    
    // Xóa các trường không thuộc Schema của bảng 'tables' hoặc không được phép update
    delete dbUpdates.orders;
    delete dbUpdates.id;
    delete dbUpdates.floorIndex;

    const { error } = await supabase.from('tables').update(dbUpdates).eq('id', tableId);
    if (error) {
      console.error("Error updating table:", error.message);
    }
  },

  addOrderItem: async (tableId, item) => {
    // 1. Thêm món vào bảng orders
    await supabase.from('orders').insert([{
      table_id: tableId,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      status: 'pending',
      notes: ''
    }]);

    // 2. Chuyển trạng thái bàn sang 'occupied' nếu cần
    await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);
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
      // 1. Chuyển trạng thái món sang 'sent'
      await supabase.from('orders').update({ status: 'sent' }).in('id', data.map(o => o.id));
      
      // 2. Đảm bảo bàn được đánh dấu là 'occupied'
      await supabase.from('tables').update({ status: 'occupied' }).eq('id', tableId);
    }
  },

  deductInventory: async (tableId) => {
    console.log(`[Inventory] Starting deduction for table identifier: ${tableId}`);

    // 1. Thử lấy đơn hàng theo tableId trực tiếp (ưu tiên UUID hoặc ID tùy chỉnh như "t1")
    let { data: orders } = await supabase
      .from('orders')
      .select('menu_item_id, quantity, name')
      .eq('table_id', tableId);

    // 2. Nếu không thấy đơn hàng, có thể tableId truyền vào là Số bàn (Number), thử tìm ID theo Số bàn
    if (!orders || orders.length === 0) {
      console.log(`[Inventory] No orders for ID "${tableId}". Checking if it's a table number...`);
      const { data: tableData } = await supabase
        .from('tables')
        .select('id')
        .eq('number', tableId)
        .single();
      
      if (tableData) {
        console.log(`[Inventory] Found ID ${tableData.id} for table number ${tableId}. Retrying fetch...`);
        const { data: retryOrders } = await supabase
          .from('orders')
          .select('menu_item_id, quantity, name')
          .eq('table_id', tableData.id);
        orders = retryOrders;
      }
    }

    if (!orders || orders.length === 0) {
      console.log(`[Inventory] Final check: No orders found to deduct. Table: ${tableId}`);
      return;
    }

    console.log(`[Inventory] Processing ${orders.length} unique items for deduction...`);

    // 3. Với mỗi món ăn, lấy định mức (BOM) tương ứng
    for (const order of orders) {
      const { data: bom } = await supabase
        .from('bom_recipe')
        .select('ingredient_id, quantity_used')
        .eq('product_id', order.menu_item_id);

      if (bom && bom.length > 0) {
        console.log(`[Inventory] Found BOM for ${order.name} (${order.menu_item_id}): ${bom.length} ingredients`);
        
        // 4. Thực hiện trừ tồn kho cho từng nguyên liệu trong công thức
        for (const recipe of bom) {
          const totalDeduction = recipe.quantity_used * order.quantity;
          
          // Lấy tồn kho hiện tại
          const { data: ingredient } = await supabase
            .from('ingredients')
            .select('current_stock, name')
            .eq('id', recipe.ingredient_id)
            .single();

          if (ingredient) {
            const newStock = Math.max(0, Number(ingredient.current_stock) - totalDeduction);
            console.log(`[Inventory] Updating ${ingredient.name}: ${ingredient.current_stock} -> ${newStock} (Used: ${totalDeduction})`);
            
            await supabase
              .from('ingredients')
              .update({ current_stock: newStock })
              .eq('id', recipe.ingredient_id);
          }
        }
      } else {
        console.log(`[Inventory] No BOM recipe found for item: ${order.name} (${order.menu_item_id})`);
      }
    }
  },

  clearOrders: async (tableId) => {
     // Trước khi xóa đơn hàng và làm trống bàn, thực hiện trừ tồn kho tự động
     await get().deductInventory(tableId);

     await supabase.from('orders').delete().eq('table_id', tableId);
     await supabase.from('tables').update({ status: 'empty', guests: 0, time_elapsed: null }).eq('id', tableId);
  },

  clearPendingOrders: async (tableId) => {
    // 0. Prevent duplicate requests
    if (get().processingIds.has(`clear-${tableId}`)) return;
    
    set(state => {
      const newIds = new Set(state.processingIds);
      newIds.add(`clear-${tableId}`);
      return { processingIds: newIds };
    });

    try {
      // 1. Optimistic Update
      const prevFloors = get().floors;
      const updatedFloors = prevFloors.map(floor => ({
        ...floor,
        tables: floor.tables.map(table => 
          table.id === tableId 
            ? { ...table, orders: table.orders.filter(o => o.status !== 'pending') }
            : table
        )
      }));
      set({ floors: updatedFloors });

      // 2. Background Sync
      const { error } = await supabase.from('orders').delete().eq('table_id', tableId).eq('status', 'pending');
      if (error) console.error("Error clearing pending orders:", error.message);
    } finally {
      // 3. Re-enable the action
      set(state => {
        const newIds = new Set(state.processingIds);
        newIds.delete(`clear-${tableId}`);
        return { processingIds: newIds };
      });
    }
  },

  deleteOrderItem: async (cartId) => {
    // 0. Prevent duplicate requests
    if (get().processingIds.has(`delete-${cartId}`)) return;

    set(state => {
      const newIds = new Set(state.processingIds);
      newIds.add(`delete-${cartId}`);
      return { processingIds: newIds };
    });

    try {
      // 1. Optimistic Update
      const prevFloors = get().floors;
      const updatedFloors = prevFloors.map(floor => ({
        ...floor,
        tables: floor.tables.map(table => ({
          ...table,
          orders: table.orders.filter(o => o.cartId !== cartId)
        }))
      }));
      set({ floors: updatedFloors });

      // 2. Background Sync
      const { error } = await supabase.from('orders').delete().eq('id', cartId);
      if (error) console.error("Error deleting order item:", error.message);
    } finally {
      // 3. Re-enable the action
      set(state => {
        const newIds = new Set(state.processingIds);
        newIds.delete(`delete-${cartId}`);
        return { processingIds: newIds };
      });
    }
  },

  markAsServed: async (tableId, cartId) => {
    await supabase.from('orders').update({ status: 'served' }).eq('id', cartId);
  },

  addReservation: async (res) => {
    // 1. Thêm bản ghi đặt chỗ
    const { data: newRes, error } = await supabase
      .from('reservations')
      .insert([{ ...res, status: 'pending' }])
      .select()
      .single();

    if (!error && res.tableId) {
      // 2. Nếu có gán bàn, cập nhật trạng thái bàn đó thành 'reserved'
      await supabase
        .from('tables')
        .update({ status: 'reserved', reservationId: newRes.id })
        .eq('id', res.tableId);
    }
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
  },

  ensureInfrastructure: async () => {
    try {
      // 1. Check for 'Direct Orders' floor (ID-based is safest)
      let { data: takeawayFloor } = await supabase
        .from('floors')
        .select('id')
        .eq('id', 'takeaway')
        .maybeSingle();

      if (!takeawayFloor) {
        // Double check by name if ID check failed
        const { data: byName } = await supabase
          .from('floors')
          .select('id')
          .or('name.eq.Direct Orders,name.eq.Đơn hàng trực tiếp')
          .maybeSingle();
        
        if (byName) {
          takeawayFloor = byName;
        } else {
          const { data: newFloor, error: floorError } = await supabase
            .from('floors')
            .insert([{ 
              id: 'takeaway',
              name: 'Đơn hàng trực tiếp',
              name_en: 'Direct Orders'
            }])
            .select()
            .single();
          
          if (floorError) throw floorError;
          takeawayFloor = newFloor;
        }
      }

      if (takeawayFloor) {
        // 2. Check for 'TAKEAWAY' table in that floor
        const { data: takeawayTable } = await supabase
          .from('tables')
          .select('id')
          .eq('number', 'TAKEAWAY')
          .eq('floor_id', takeawayFloor.id)
          .maybeSingle();

        if (!takeawayTable) {
          const { error: tableError } = await supabase
            .from('tables')
            .insert([{ 
              id: 'TAKEAWAY',
              number: 'TAKEAWAY', 
              floor_id: takeawayFloor.id, 
              status: 'empty' 
            }]);
          
          if (tableError) throw tableError;
        }
      }
    } catch (error) {
      console.error("Infrastructure setup failed:", error);
    }
  }
}));
