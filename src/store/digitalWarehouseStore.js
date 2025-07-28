import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export const useDigitalWarehouseStore = create(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,

      // Initialize store with Supabase data
      initializeFromSupabase: async () => {
        set({ isLoading: true, error: null });
        try {
          // Check if Supabase is properly configured
          const isSupabaseConfigured = !(
            supabase.supabaseUrl.includes('your-project') ||
            supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
          );

          if (!isSupabaseConfigured) {
            console.log('Supabase not configured, using local data for warehouse');
            set({ isLoading: false });
            return;
          }

          // Check if table exists by running a simple count query
          try {
            await supabase.from('warehouse_products_ts2024').select('count', { count: 'exact', head: true });
          } catch (tableError) {
            console.warn('warehouse_products_ts2024 table may not exist yet:', tableError);
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('warehouse_products_ts2024')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching products:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          // Transform Supabase data to match local format
          const transformedProducts = data?.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: parseFloat(product.price),
            unit: product.unit,
            origin: product.origin,
            season: product.season,
            currentStock: product.current_stock || 0,
            minQuantity: product.min_quantity || 0,
            maxQuantity: product.max_quantity || 0,
            supplier: product.supplier,
            specifications: product.specifications || [],
            tags: product.tags || [],
            images: product.images || [],
            rating: product.rating,
            notes: product.notes,
            createdAt: product.created_at,
            updatedAt: product.updated_at
          })) || [];

          set({ products: transformedProducts, isLoading: false });
        } catch (error) {
          console.error('Error initializing from Supabase:', error);
          set({
            error: 'Errore durante il caricamento dei prodotti. Verranno utilizzati i dati locali.',
            isLoading: false
          });
        }
      },

      // CRUD operations with Supabase sync
      addProduct: async (product) => {
        try {
          const newProduct = {
            ...product,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            currentStock: product.currentStock || 0,
            images: product.images || []
          };

          // Add to local state first for immediate UI update
          set(state => ({
            products: [...state.products, newProduct]
          }));

          // Check if Supabase is properly configured
          const isSupabaseConfigured = !(
            supabase.supabaseUrl.includes('your-project') ||
            supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
          );

          // Sync to Supabase if configured
          if (isSupabaseConfigured) {
            try {
              const supabaseProduct = {
                id: newProduct.id,
                name: newProduct.name,
                description: newProduct.description,
                category: newProduct.category,
                price: newProduct.price,
                unit: newProduct.unit,
                origin: newProduct.origin,
                season: newProduct.season,
                current_stock: newProduct.currentStock,
                min_quantity: newProduct.minQuantity,
                max_quantity: newProduct.maxQuantity,
                supplier: newProduct.supplier,
                specifications: newProduct.specifications,
                tags: newProduct.tags,
                images: newProduct.images,
                rating: newProduct.rating,
                notes: newProduct.notes
              };

              const { error } = await supabase
                .from('warehouse_products_ts2024')
                .insert(supabaseProduct);

              if (error) {
                console.error('Error syncing product to Supabase:', error);
                // Product is already in local state, so this is not critical
              }
            } catch (error) {
              console.error('Error syncing to Supabase:', error);
              // Product is already in local state, so this is not critical
            }
          }

          return newProduct;
        } catch (error) {
          console.error('Error adding product:', error);
          // Remove from local state if there was an error
          set(state => ({
            products: state.products.filter(p => p.id !== newProduct?.id)
          }));
          throw error;
        }
      },

      updateProduct: async (id, updates) => {
        try {
          const updatedProduct = {
            ...updates,
            updatedAt: new Date().toISOString()
          };

          // Update local state first for immediate UI update
          set(state => ({
            products: state.products.map(product =>
              product.id === id ? { ...product, ...updatedProduct } : product
            )
          }));

          // Check if Supabase is properly configured
          const isSupabaseConfigured = !(
            supabase.supabaseUrl.includes('your-project') ||
            supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
          );

          // Sync to Supabase if configured
          if (isSupabaseConfigured) {
            try {
              const supabaseUpdates = {
                name: updatedProduct.name,
                description: updatedProduct.description,
                category: updatedProduct.category,
                price: updatedProduct.price,
                unit: updatedProduct.unit,
                origin: updatedProduct.origin,
                season: updatedProduct.season,
                current_stock: updatedProduct.currentStock,
                min_quantity: updatedProduct.minQuantity,
                max_quantity: updatedProduct.maxQuantity,
                supplier: updatedProduct.supplier,
                specifications: updatedProduct.specifications,
                tags: updatedProduct.tags,
                images: updatedProduct.images,
                rating: updatedProduct.rating,
                notes: updatedProduct.notes,
                updated_at: updatedProduct.updatedAt
              };

              // Remove undefined values
              Object.keys(supabaseUpdates).forEach(key => {
                if (supabaseUpdates[key] === undefined) {
                  delete supabaseUpdates[key];
                }
              });

              const { error } = await supabase
                .from('warehouse_products_ts2024')
                .update(supabaseUpdates)
                .eq('id', id);

              if (error) {
                console.error('Error updating product in Supabase:', error);
                // Product is already updated in local state
              }
            } catch (error) {
              console.error('Error syncing update to Supabase:', error);
              // Product is already updated in local state
            }
          }

          return get().products.find(p => p.id === id);
        } catch (error) {
          console.error('Error updating product:', error);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        try {
          // Store original product for rollback
          const originalProducts = get().products;
          
          // Remove from local state first for immediate UI update
          set(state => ({
            products: state.products.filter(product => product.id !== id)
          }));

          // Check if Supabase is properly configured
          const isSupabaseConfigured = !(
            supabase.supabaseUrl.includes('your-project') ||
            supabase.supabaseUrl === 'https://<PROJECT-ID>.supabase.co'
          );

          // Sync to Supabase if configured
          if (isSupabaseConfigured) {
            try {
              const { error } = await supabase
                .from('warehouse_products_ts2024')
                .delete()
                .eq('id', id);

              if (error) {
                console.error('Error deleting product from Supabase:', error);
                // Rollback local state
                set({ products: originalProducts });
                throw error;
              }
            } catch (error) {
              console.error('Error syncing delete to Supabase:', error);
              // Rollback local state
              set({ products: originalProducts });
              throw error;
            }
          }
        } catch (error) {
          console.error('Error deleting product:', error);
          throw error;
        }
      },

      // Utility functions
      getProductById: (id) => {
        return get().products.find(product => product.id === id);
      },

      getProductsByCategory: (category) => {
        return get().products.filter(product => product.category === category);
      },

      getProductsBySupplier: (supplierId) => {
        return get().products.filter(product => product.supplier?.id === supplierId);
      },

      getLowStockProducts: () => {
        return get().products.filter(product => 
          product.currentStock <= product.minQuantity
        );
      },

      getOutOfStockProducts: () => {
        return get().products.filter(product => product.currentStock === 0);
      },

      updateStock: async (id, quantity) => {
        await get().updateProduct(id, { currentStock: quantity });
      },

      // Bulk operations
      bulkUpdatePrices: async (categoryOrSupplier, percentage) => {
        const products = get().products;
        const updates = products
          .filter(product => 
            product.category === categoryOrSupplier || 
            product.supplier?.name === categoryOrSupplier
          )
          .map(product => ({
            id: product.id,
            price: product.price * (1 + percentage / 100)
          }));

        for (const update of updates) {
          await get().updateProduct(update.id, { price: update.price });
        }
      },

      // Statistics
      getStatistics: () => {
        const products = get().products;
        return {
          totalProducts: products.length,
          totalCategories: [...new Set(products.map(p => p.category))].length,
          totalSuppliers: [...new Set(products.map(p => p.supplier?.name).filter(Boolean))].length,
          availableProducts: products.filter(p => p.currentStock > 0).length,
          lowStockProducts: products.filter(p => p.currentStock <= p.minQuantity).length,
          outOfStockProducts: products.filter(p => p.currentStock === 0).length,
          averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
          totalValue: products.reduce((sum, p) => sum + (p.price * p.currentStock), 0)
        };
      },

      // Clear any errors
      clearError: () => set({ error: null })
    }),
    {
      name: 'digital-warehouse-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize from Supabase when store is rehydrated
        if (state) {
          state.initializeFromSupabase();
        }
      }
    }
  )
);