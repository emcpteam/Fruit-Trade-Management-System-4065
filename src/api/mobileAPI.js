import { supabase } from '@/lib/supabase';

// Mobile API endpoints for React Native app
export class MobileAPI {
  
  // Authentication endpoints
  static async mobileLogin(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles_ts2024')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        user: data.user,
        profile,
        session: data.session
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async mobileLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Orders API for mobile
  static async getPublicOrders(filters = {}) {
    try {
      let query = supabase
        .from('orders_ts2024')
        .select(`
          *,
          clients:client_id(name, city),
          vendors:vendor_id(name, city)
        `)
        .eq('publish_to_app', true)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.product) {
        query = query.ilike('product', `%${filters.product}%`);
      }
      
      if (filters.origin) {
        query = query.ilike('origin', `%${filters.origin}%`);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;

      // Transform data for mobile consumption
      const transformedData = data.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        product: order.product,
        type: order.product_type,
        origin: order.origin,
        quantity: order.quantity,
        price: parseFloat(order.price),
        discount: parseFloat(order.discount || 0),
        deliveryDate: order.delivery_date,
        client: order.clients,
        vendor: order.vendors,
        createdAt: order.created_at,
        finalPrice: parseFloat(order.price) * (1 - (parseFloat(order.discount) || 0) / 100)
      }));

      return {
        success: true,
        data: transformedData,
        count: data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getOrderDetails(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders_ts2024')
        .select(`
          *,
          clients:client_id(name, vat_number, address, city, phone, email),
          vendors:vendor_id(name, vat_number, address, city, phone, email)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const transformedOrder = {
        id: data.id,
        orderNumber: data.order_number,
        product: data.product,
        type: data.product_type,
        origin: data.origin,
        packaging: data.packaging,
        quantity: data.quantity,
        price: parseFloat(data.price),
        discount: parseFloat(data.discount || 0),
        deliveryDate: data.delivery_date,
        paymentTerms: data.payment_terms,
        status: data.status,
        client: data.clients,
        vendor: data.vendors,
        createdAt: data.created_at,
        finalPrice: parseFloat(data.price) * (1 - (parseFloat(data.discount) || 0) / 100)
      };

      return {
        success: true,
        data: transformedOrder
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Interest/Inquiry system for mobile users
  static async submitOrderInquiry(orderId, userInfo, message) {
    try {
      // Create notification for admin users
      const { error: notificationError } = await supabase
        .from('notifications_ts2024')
        .insert({
          user_id: null, // Will be sent to all admin users
          type: 'order_inquiry',
          title: 'Nuova Richiesta da App Mobile',
          message: `Richiesta per ordine #${orderId}: ${message}`,
          data: {
            orderId,
            userInfo,
            message,
            timestamp: new Date().toISOString()
          }
        });

      if (notificationError) throw notificationError;

      // Log inquiry in separate table (if needed)
      // You could create an inquiries table for better tracking

      return {
        success: true,
        message: 'Richiesta inviata con successo!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Market data for mobile analytics
  static async getMarketStats() {
    try {
      // Get recent orders statistics
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders_ts2024')
        .select('price, product, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('publish_to_app', true);

      if (ordersError) throw ordersError;

      // Calculate market statistics
      const productStats = {};
      let totalValue = 0;
      let priceSum = 0;

      recentOrders.forEach(order => {
        const product = order.product.split(' ')[0];
        if (!productStats[product]) {
          productStats[product] = { count: 0, totalPrice: 0 };
        }
        productStats[product].count++;
        productStats[product].totalPrice += parseFloat(order.price);
        totalValue += parseFloat(order.price);
        priceSum += parseFloat(order.price);
      });

      const averagePrice = recentOrders.length > 0 ? priceSum / recentOrders.length : 0;

      // Top products by frequency
      const topProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5)
        .map(([product, stats]) => ({
          product,
          count: stats.count,
          averagePrice: stats.totalPrice / stats.count
        }));

      return {
        success: true,
        data: {
          totalOrders: recentOrders.length,
          averagePrice: averagePrice.toFixed(2),
          totalValue: totalValue.toFixed(2),
          topProducts,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search and filter helpers
  static async searchOrders(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('orders_ts2024')
        .select(`
          *,
          clients:client_id(name, city),
          vendors:vendor_id(name, city)
        `)
        .eq('publish_to_app', true)
        .eq('status', 'pending')
        .or(`product.ilike.%${searchTerm}%, origin.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const transformedData = data.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        product: order.product,
        origin: order.origin,
        price: parseFloat(order.price),
        client: order.clients,
        vendor: order.vendors,
        createdAt: order.created_at
      }));

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getProductCategories() {
    try {
      const { data, error } = await supabase
        .from('orders_ts2024')
        .select('product')
        .eq('publish_to_app', true)
        .eq('status', 'pending');

      if (error) throw error;

      // Extract unique product categories
      const categories = [...new Set(
        data.map(order => order.product.split(' ')[0])
      )].sort();

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async getOrigins() {
    try {
      const { data, error } = await supabase
        .from('orders_ts2024')
        .select('origin')
        .eq('publish_to_app', true)
        .eq('status', 'pending');

      if (error) throw error;

      // Extract unique origins
      const origins = [...new Set(
        data.map(order => order.origin).filter(Boolean)
      )].sort();

      return {
        success: true,
        data: origins
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export REST-style endpoints for external API calls
export const mobileAPIEndpoints = {
  // GET /api/mobile/orders
  getOrders: (req) => {
    const { search, category, origin, minPrice, maxPrice } = req.query || {};
    const filters = {};
    
    if (search) filters.product = search;
    if (origin) filters.origin = origin;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    
    return MobileAPI.getPublicOrders(filters);
  },

  // GET /api/mobile/orders/:id
  getOrderDetails: (req) => {
    const { id } = req.params || {};
    return MobileAPI.getOrderDetails(id);
  },

  // POST /api/mobile/inquiries
  submitInquiry: (req) => {
    const { orderId, userInfo, message } = req.body || {};
    return MobileAPI.submitOrderInquiry(orderId, userInfo, message);
  },

  // GET /api/mobile/stats
  getStats: () => {
    return MobileAPI.getMarketStats();
  },

  // GET /api/mobile/search
  search: (req) => {
    const { q } = req.query || {};
    return MobileAPI.searchOrders(q);
  },

  // GET /api/mobile/categories
  getCategories: () => {
    return MobileAPI.getProductCategories();
  },

  // GET /api/mobile/origins
  getOrigins: () => {
    return MobileAPI.getOrigins();
  }
};

export default MobileAPI;