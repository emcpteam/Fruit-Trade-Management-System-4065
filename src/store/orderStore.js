import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncOrderToSupabase, syncClientToSupabase } from '@/hooks/useSupabaseSync';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      clients: [
        {
          id: 1,
          name: 'AMBROSI & SDEI SRL',
          address: 'VIA DEI SEDANI, 9',
          city: '06032 TREVI FRAZ. BORGO PG',
          vatNumber: '02425260540',
          sdi: 'SDI J6URRTW',
          is_buyer: true,
          is_seller: false,
          phone: '+39 0742 123456',
          email: 'ordini@ambrosi-sdei.it',
          warehouses: [
            {
              id: 1,
              name: 'Magazzino Principale',
              address: 'VIA DEI SEDANI, 9, 06032 TREVI FRAZ. BORGO PG'
            }
          ]
        },
        {
          id: 2,
          name: 'LORA LUCA S.R.L. UNIPERSONALE',
          address: 'VIALE VICENZA, 1',
          city: '37040 CICOGNA DI ROVEREDO DI GUA\' VR',
          vatNumber: '03964980233',
          is_buyer: false,
          is_seller: true,
          phone: '+39 045 987654',
          email: 'info@loraluca.it',
          warehouses: [
            {
              id: 1,
              name: 'Magazzino Lora',
              address: 'VIALE VICENZA, 1, 37040 CICOGNA DI ROVEREDO DI GUA\' VR'
            }
          ]
        },
        {
          id: 3,
          name: 'AGRICOLA VERDE SPA',
          address: 'VIA ROMA, 42',
          city: '20100 MILANO MI',
          vatNumber: '01234567890',
          is_buyer: true,
          is_seller: true,
          phone: '+39 02 123456',
          email: 'info@agricolaverde.it',
          warehouses: [
            {
              id: 1,
              name: 'Magazzino Centrale',
              address: 'VIA ROMA, 42, 20100 MILANO MI'
            }
          ]
        }
      ],
      notifications: [],
      nextOrderNumber: 482,

      // Data setters for Supabase sync
      setOrders: (orders) => set({ orders }),
      setClients: (clients) => set({ clients }),

      addOrder: async (order) => {
        const newOrder = {
          ...order,
          id: Date.now(),
          orderNumber: get().nextOrderNumber,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };

        set(state => ({
          orders: [...state.orders, newOrder],
          nextOrderNumber: state.nextOrderNumber + 1
        }));

        // Sync to Supabase
        await syncOrderToSupabase(newOrder, 'INSERT');
        return newOrder;
      },

      updateOrder: async (id, updates) => {
        const updatedOrders = get().orders.map(order =>
          order.id === id ? { ...order, ...updates, updatedAt: new Date().toISOString() } : order
        );

        set({ orders: updatedOrders });

        // Sync to Supabase
        const updatedOrder = updatedOrders.find(o => o.id === id);
        if (updatedOrder) {
          await syncOrderToSupabase(updatedOrder, 'UPDATE');
        }
      },

      deleteOrder: (id) => {
        set(state => ({
          orders: state.orders.filter(order => order.id !== id)
        }));
      },

      getOrderById: (id) => {
        return get().orders.find(order => order.id === id);
      },

      addClient: async (client) => {
        const newClient = {
          ...client,
          id: Date.now(),
          warehouses: client.warehouses || [],
          is_buyer: client.is_buyer || false,
          is_seller: client.is_seller || false,
          createdAt: new Date().toISOString()
        };

        set(state => ({
          clients: [...state.clients, newClient]
        }));

        // Sync to Supabase
        await syncClientToSupabase(newClient, 'INSERT');
        return newClient;
      },

      updateClient: async (id, updates) => {
        const updatedClients = get().clients.map(client =>
          client.id === id ? { ...client, ...updates } : client
        );

        set({ clients: updatedClients });

        // Sync to Supabase
        const updatedClient = updatedClients.find(c => c.id === id);
        if (updatedClient) {
          await syncClientToSupabase(updatedClient, 'UPDATE');
        }
      },

      deleteClient: (id) => {
        set(state => ({
          clients: state.clients.filter(client => client.id !== id)
        }));
      },

      // Get clients by role
      getBuyers: () => {
        return get().clients.filter(client => client.is_buyer === true);
      },
      
      getSellers: () => {
        return get().clients.filter(client => client.is_seller === true);
      },

      // Notifications management
      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: notification.id || Date.now(),
          timestamp: notification.timestamp || new Date(),
          read: notification.read || false
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100) // Keep last 100
        }));
      },

      markNotificationAsRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        }));
      },

      deleteNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        }));
      },

      // Analytics helpers
      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },

      getOrdersByDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
        });
      },

      getRecentOrders: (days = 30) => {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= cutoffDate;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }),
    {
      name: 'order-storage',
    }
  )
);

export default useOrderStore;