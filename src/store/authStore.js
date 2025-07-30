import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],

      login: async (email, password) => {
        try {
          // Always try local authentication first for demo credentials
          const localCredentials = [
            {
              email: 'admin@trade.com',
              password: 'admin123',
              user: {
                id: 1,
                email: 'admin@trade.com',
                name: 'Andrea Amministratore',
                role: 'admin',
                permissions: ['all']
              }
            },
            {
              email: 'secretary@trade.com',
              password: 'secretary123',
              user: {
                id: 2,
                email: 'secretary@trade.com',
                name: 'Segreteria',
                role: 'manager',
                permissions: [
                  'orders.read', 'orders.write', 'clients.read', 'clients.write',
                  'vendors.read', 'vendors.write', 'warehouse.read', 'warehouse.write',
                  'analytics.read', 'reports.read'
                ]
              }
            },
            {
              email: 'mobile@trade.com',
              password: 'mobile123',
              user: {
                id: 3,
                email: 'mobile@trade.com',
                name: 'Utente Mobile',
                role: 'mobile',
                permissions: ['orders.read.public']
              }
            }
          ];

          // Check local credentials first
          const localUser = localCredentials.find(
            cred => cred.email === email && cred.password === password
          );

          if (localUser) {
            set({
              user: localUser.user,
              isAuthenticated: true,
              permissions: localUser.user.permissions
            });
            return { success: true };
          }

          // If not local credentials and Supabase is available, try Supabase authentication
          if (isSupabaseAvailable()) {
            try {
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
              });

              if (error) {
                // If Supabase fails, return error for non-demo credentials
                return { 
                  success: false, 
                  error: 'Credenziali non valide. Usa le credenziali demo o configura Supabase.' 
                };
              }

              // Get user profile from Supabase
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

              set({
                user,
                isAuthenticated: true,
                permissions: user.permissions
              });

              return { success: true };
            } catch (supabaseError) {
              console.error('Supabase authentication error:', supabaseError);
              return { 
                success: false, 
                error: 'Errore di connessione. Usa le credenziali demo.' 
              };
            }
          }

          // If neither local nor Supabase worked
          return { 
            success: false, 
            error: 'Credenziali non valide. Usa: admin@trade.com / admin123' 
          };

        } catch (error) {
          console.error('Login error:', error);
          return { 
            success: false, 
            error: 'Errore durante il login. Usa le credenziali demo.' 
          };
        }
      },

      logout: async () => {
        try {
          // Only try to logout from Supabase if we're using Supabase auth
          if (isSupabaseAvailable() && get().user?.id && typeof get().user.id === 'string') {
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          isAuthenticated: false,
          permissions: []
        });
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
          'api-keys': ['users.read'], // Admin only
          'roles': ['users.read'], // Admin only
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