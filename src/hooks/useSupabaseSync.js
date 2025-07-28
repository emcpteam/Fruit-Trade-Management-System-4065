import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import useOrderStore from '@/store/orderStore';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export const useSupabaseSync = () => {
  const { setOrders, setClients, setVendors, addOrder, updateOrder, addNotification } = useOrderStore();
  const { user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        // Check if Supabase is properly configured
        const isSupabaseConfigured = !(
          supabase.supabaseUrl.includes('your-project') || 
          supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
        );

        if (!isSupabaseConfigured) {
          console.log('Supabase not configured, using local storage');
          setIsInitialized(true);
          return;
        }

        // Try to initialize necessary tables
        try {
          // Simple query to check connection
          await supabase.from('orders_ts2024').select('count', { count: 'exact', head: true });
        } catch (tableError) {
          console.error('Tables may not exist yet:', tableError);
          // Continue with local data if tables don't exist
          setIsInitialized(true);
          return;
        }

        // Fetch orders with error handling
        let orders = [];
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders_ts2024')
            .select('*')
            .order('created_at', { ascending: false });

          if (!ordersError) {
            orders = ordersData || [];
          } else {
            console.warn('Error fetching orders:', ordersError);
          }
        } catch (error) {
          console.error('Exception fetching orders:', error);
        }

        // Fetch clients with error handling
        let clients = [];
        try {
          const { data: clientsData, error: clientsError } = await supabase
            .from('clients_ts2024')
            .select('*')
            .order('name');

          if (!clientsError) {
            clients = clientsData || [];
          } else {
            console.warn('Error fetching clients:', clientsError);
          }
        } catch (error) {
          console.error('Exception fetching clients:', error);
        }

        // Fetch vendors with error handling
        let vendors = [];
        try {
          const { data: vendorsData, error: vendorsError } = await supabase
            .from('vendors_ts2024')
            .select('*')
            .order('name');

          if (!vendorsError) {
            vendors = vendorsData || [];
          } else {
            console.warn('Error fetching vendors:', vendorsError);
          }
        } catch (error) {
          console.error('Exception fetching vendors:', error);
        }

        // Transform data to match local store format
        const transformedOrders = orders.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          clientId: order.client_id,
          vendorId: order.vendor_id,
          product: order.product,
          type: order.product_type,
          origin: order.origin,
          packaging: order.packaging,
          quantity: order.quantity,
          price: parseFloat(order.price),
          discount: parseFloat(order.discount || 0),
          deliveryDate: order.delivery_date,
          paymentTerms: order.payment_terms,
          status: order.status,
          publishToApp: order.publish_to_app,
          invoiceNumber: order.invoice_number,
          createdAt: order.created_at,
          updatedAt: order.updated_at
        }));

        const transformedClients = clients.map(client => ({
          id: client.id,
          name: client.name,
          vatNumber: client.vat_number,
          address: client.address,
          city: client.city,
          sdi: client.sdi_code,
          phone: client.phone,
          email: client.email,
          createdAt: client.created_at
        }));

        const transformedVendors = vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          vatNumber: vendor.vat_number,
          address: vendor.address,
          city: vendor.city,
          phone: vendor.phone,
          email: vendor.email,
          createdAt: vendor.created_at
        }));

        // Only update stores if we have data to avoid overwriting default data
        if (transformedOrders.length > 0) setOrders(transformedOrders);
        if (transformedClients.length > 0) setClients(transformedClients);
        if (transformedVendors.length > 0) setVendors(transformedVendors);

        console.log('✅ Supabase data synced successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setIsInitialized(true);
        // Don't show error toast - use local data instead
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions if Supabase is configured
    let ordersSubscription;
    let notificationsSubscription;

    try {
      if (!(supabase.supabaseUrl.includes('your-project') || supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co')) {
        ordersSubscription = supabase
          .channel('orders_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders_ts2024' },
            (payload) => {
              console.log('Orders change received!', payload);
              try {
                switch (payload.eventType) {
                  case 'INSERT':
                    const newOrder = transformOrder(payload.new);
                    addOrder(newOrder);
                    toast.success('Nuovo ordine ricevuto!');
                    break;
                  case 'UPDATE':
                    const updatedOrder = transformOrder(payload.new);
                    updateOrder(updatedOrder.id, updatedOrder);
                    toast.success('Ordine aggiornato!');
                    break;
                  case 'DELETE':
                    // Handle delete if needed
                    break;
                }
              } catch (e) {
                console.error('Error handling order change:', e);
              }
            }
          )
          .subscribe((status) => {
            console.log('Orders subscription status:', status);
          });

        if (user) {
          notificationsSubscription = supabase
            .channel('notifications_changes')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications_ts2024',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                console.log('New notification!', payload);
                try {
                  addNotification(payload.new);
                  toast.success(payload.new.title);
                } catch (e) {
                  console.error('Error handling notification:', e);
                }
              }
            )
            .subscribe((status) => {
              console.log('Notifications subscription status:', status);
            });
        }
      }
    } catch (err) {
      console.error('Error setting up realtime subscriptions:', err);
    }

    // Cleanup subscriptions
    return () => {
      try {
        if (ordersSubscription) ordersSubscription.unsubscribe();
        if (notificationsSubscription) notificationsSubscription.unsubscribe();
      } catch (err) {
        console.error('Error unsubscribing from channels:', err);
      }
    };
  }, [user]);

  // Helper function to transform order data
  const transformOrder = (order) => ({
    id: order.id,
    orderNumber: order.order_number,
    clientId: order.client_id,
    vendorId: order.vendor_id,
    product: order.product,
    type: order.product_type,
    origin: order.origin,
    packaging: order.packaging,
    quantity: order.quantity,
    price: parseFloat(order.price),
    discount: parseFloat(order.discount || 0),
    deliveryDate: order.delivery_date,
    paymentTerms: order.payment_terms,
    status: order.status,
    publishToApp: order.publish_to_app,
    invoiceNumber: order.invoice_number,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  });

  return { isInitialized };
};

// Sync functions for CRUD operations
export const syncOrderToSupabase = async (order, operation = 'INSERT') => {
  // Check if Supabase is properly configured
  if (
    supabase.supabaseUrl.includes('your-project') || 
    supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
  ) {
    return { success: true }; // Local mode
  }

  try {
    const orderData = {
      order_number: order.orderNumber,
      client_id: order.clientId,
      vendor_id: order.vendorId,
      product: order.product,
      product_type: order.type,
      origin: order.origin,
      packaging: order.packaging,
      quantity: order.quantity,
      price: order.price,
      discount: order.discount,
      delivery_date: order.deliveryDate,
      payment_terms: order.paymentTerms,
      status: order.status,
      publish_to_app: order.publishToApp,
      invoice_number: order.invoiceNumber
    };

    let result;
    if (operation === 'INSERT') {
      result = await supabase
        .from('orders_ts2024')
        .insert(orderData)
        .select()
        .single();
    } else if (operation === 'UPDATE') {
      result = await supabase
        .from('orders_ts2024')
        .update(orderData)
        .eq('id', order.id)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Supabase sync error:', error);
    return { success: false, error };
  }
};

export const syncClientToSupabase = async (client, operation = 'INSERT') => {
  // Check if Supabase is properly configured
  if (
    supabase.supabaseUrl.includes('your-project') || 
    supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
  ) {
    return { success: true }; // Local mode
  }

  try {
    const clientData = {
      name: client.name,
      vat_number: client.vatNumber,
      address: client.address,
      city: client.city,
      sdi_code: client.sdi,
      phone: client.phone,
      email: client.email
    };

    let result;
    if (operation === 'INSERT') {
      result = await supabase
        .from('clients_ts2024')
        .insert(clientData)
        .select()
        .single();
    } else if (operation === 'UPDATE') {
      result = await supabase
        .from('clients_ts2024')
        .update(clientData)
        .eq('id', client.id)
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Supabase sync error:', error);
    return { success: false, error };
  }
};