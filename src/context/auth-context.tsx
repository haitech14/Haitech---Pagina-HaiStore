import * as React from 'react';

import { apiFetch } from '@/lib/api';
import { setDemoToken } from '@/lib/auth-storage';
import type { AuthUser } from '@/lib/auth-storage';
import { supabase } from '@/lib/supabase';
import { isUserRole, type UserRole } from '@/types/product';

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | 'public';
  isLoading: boolean;
  isAdmin: boolean;
  authProvider: 'supabase' | 'demo' | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function mapSessionUser(
  user: AuthUser | null,
  role: string,
): { user: AuthUser | null; role: UserRole | 'public' } {
  if (!user) return { user: null, role: 'public' };
  const safeRole = isUserRole(role) ? role : 'public';
  return { user: { ...user, role: safeRole }, role: safeRole };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [role, setRole] = React.useState<UserRole | 'public'>('public');
  const [authProvider, setAuthProvider] = React.useState<'supabase' | 'demo' | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const applyMe = React.useCallback(
    (payload: { user: AuthUser | null; role: string; authProvider?: 'supabase' | 'demo' | null }) => {
      const mapped = mapSessionUser(payload.user, payload.role);
      setUser(mapped.user);
      setRole(mapped.role);
      setAuthProvider(payload.authProvider ?? null);
    },
    [],
  );

  const refreshSession = React.useCallback(async () => {
    try {
      const me = await apiFetch<{
        user: AuthUser | null;
        role: UserRole | 'public';
        authProvider: 'supabase' | 'demo' | null;
      }>('/api/auth/me');
      applyMe(me);
    } catch {
      applyMe({ user: null, role: 'public', authProvider: null });
      setDemoToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyMe]);

  React.useEffect(() => {
    void refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void refreshSession();
      } else if (!getDemoTokenExists()) {
        applyMe({ user: null, role: 'public', authProvider: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [applyMe, refreshSession]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      setDemoToken(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!error && data.session) {
        try {
          await apiFetch('/api/auth/sync-profile', { method: 'POST' });
        } catch {
          /* perfil puede crearse por trigger */
        }
        await refreshSession();
        return;
      }

      const demo = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login-demo', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setDemoToken(demo.token);
      applyMe({ user: demo.user, role: demo.user.role, authProvider: 'demo' });
    },
    [applyMe, refreshSession],
  );

  const signUp = React.useCallback(
    async (email: string, password: string, fullName: string) => {
      setDemoToken(null);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName, role: 'public' },
        },
      });

      if (error) throw error;

      if (data.session) {
        await apiFetch('/api/auth/sync-profile', { method: 'POST' });
        await refreshSession();
      }
    },
    [refreshSession],
  );

  const logout = React.useCallback(async () => {
    setDemoToken(null);
    await supabase.auth.signOut();
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* sin sesión demo activa */
    }
    applyMe({ user: null, role: 'public', authProvider: null });
  }, [applyMe]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isLoading,
      isAdmin: role === 'admin',
      authProvider,
      login,
      signUp,
      logout,
    }),
    [user, role, isLoading, authProvider, login, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function getDemoTokenExists() {
  return Boolean(localStorage.getItem('haistore_demo_token'));
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
