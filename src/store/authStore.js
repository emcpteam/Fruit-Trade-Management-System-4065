import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],

      login: async (email, password) => {
        try {
          // Try Supabase authentication first
          if (supabase && !supabase.supabaseUrl.includes('your-project')) {
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

            const user = {
              id: data.user.id,
              email: data.user.email,
              name: profile?.name || data.user.email.split('@')[0],
              role: profile?.role || 'user',
              permissions: profile?.permissions || []
            };

            set({ user, isAuthenticated: true, permissions: user.permissions });
            return { success: true };
          }

          // Fallback to local authentication
          if (email === 'admin@trade.com' && password === 'admin123') {
            const user = {
              id: 1,
              email: 'admin@trade.com',
              name: 'Andrea',
              role: 'admin',
              permissions: ['all']
            };
            set({ user, isAuthenticated: true, permissions: user.permissions });
            return { success: true };
          } else if (email === 'secretary@trade.com' && password === 'secretary123') {
            const user = {
              id: 2,
              email: 'secretary@trade.com',
              name: 'Segreteria',
              role: 'manager',
              permissions: [
                'orders.read',
                'orders.write',
                'clients.read',
                'clients.write',
                'vendors.read',
                'vendors.write',
                'warehouse.read',
                'warehouse.write',
                'analytics.read',
                'reports.read'
              ]
            };
            set({ user, isAuthenticated: true, permissions: user.permissions });
            return { success: true };
          } else if (email === 'mobile@trade.com' && password === 'mobile123') {
            const user = {
              id: 3,
              email: 'mobile@trade.com',
              name: 'Utente Mobile',
              role: 'mobile',
              permissions: ['orders.read.public']
            };
            set({ user, isAuthenticated: true, permissions: user.permissions });
            return { success: true };
          }

          return { success: false, error: 'Credenziali non valide' };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: error.message || 'Errore durante il login' };
        }
      },

      logout: async () => {
        try {
          if (supabase && !supabase.supabaseUrl.includes('your-project')) {
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
        set({ user: null, isAuthenticated: false, permissions: [] });
      },

      updateUserRole: (userId, newRole, newPermissions) => {
        const { user } = get();
        if (user && user.id === userId) {
          set({
            user: { ...user, role: newRole, permissions: newPermissions },
            permissions: newPermissions
          });
        }
      },

      hasRole: (role) => {
        const { user } = get();
        return user?.role === role || user?.role === 'admin';
      },

      hasPermission: (permission) => {
        const { user, permissions } = get();
        // Admin has all permissions
        if (user?.role === 'admin' || permissions.includes('all')) {
          return true;
        }
        // Check specific permission
        return permissions.includes(permission);
      },

      canAccessModule: (module) => {
        const { user } = get();
        if (!user) return false;

        // Admin can access everything
        if (user.role === 'admin') return true;

        // Module-specific access rules
        const modulePermissions = {
          'dashboard': ['orders.read'],
          'new-order': ['orders.write'],
          'orders': ['orders.read'],
          'clients': ['clients.read'],
          'vendors': ['vendors.read'],
          'warehouse': ['warehouse.read'],
          'register': ['orders.read'],
          'invoices': ['invoices.read'],
          'analytics': ['analytics.read'],
          'predictive-analytics': ['analytics.read'],
          'reports': ['reports.read'],
          'suggestions': ['users.read'], // Admin only
          'api-keys': ['users.read'],    // Admin only
          'roles': ['users.read'],       // Admin only
          'settings': ['users.read']
        };

        const requiredPermissions = modulePermissions[module] || [];
        return requiredPermissions.some(permission => get().hasPermission(permission));
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;