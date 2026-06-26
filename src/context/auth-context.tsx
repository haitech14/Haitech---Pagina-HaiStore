import * as React from 'react';

import { apiFetch } from '@/lib/api';
import {
  clearStoredAuthSession,
  getAccessToken,
  getDemoToken,
  readStoredAuthSession,
  setDemoToken,
  writeStoredAuthSession,
  type AuthUser,
} from '@/lib/auth-storage';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase-config';
import { signInWithPasswordSafely, signOutSupabaseSafely } from '@/lib/supabase-auth-helpers';
import { canAccessAdminPanel, hasAdminApiAccess } from '@/lib/admin-access';
import { isUserRole, type UserRole } from '@/types/product';
import { readViewAsRoles, writeViewAsRoles } from '@/lib/view-as-role-storage';

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | 'public';
  /** Rol efectivo para precios de catálogo (vista previa admin con un solo rol). */
  effectiveRole: UserRole | 'public';
  viewAsRoles: UserRole[];
  toggleViewAsRole: (role: UserRole) => void;
  clearViewAsRoles: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  canAccessAdminPanel: boolean;
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
  const storedSession = readStoredAuthSession();
  const [user, setUser] = React.useState<AuthUser | null>(storedSession?.user ?? null);
  const [role, setRole] = React.useState<UserRole | 'public'>(storedSession?.role ?? 'public');
  const [viewAsRoles, setViewAsRolesState] = React.useState<UserRole[]>(() => readViewAsRoles());
  const [authProvider, setAuthProvider] = React.useState<'supabase' | 'demo' | null>(
    storedSession?.authProvider ?? null,
  );
  const [isLoading, setIsLoading] = React.useState(() => !storedSession);

  const toggleViewAsRole = React.useCallback((targetRole: UserRole) => {
    setViewAsRolesState((current) => {
      const next = current.includes(targetRole)
        ? current.filter((item) => item !== targetRole)
        : [...current, targetRole];
      writeViewAsRoles(next);
      return next;
    });
  }, []);

  const clearViewAsRoles = React.useCallback(() => {
    setViewAsRolesState([]);
    writeViewAsRoles([]);
  }, []);

  const applyMe = React.useCallback(
    (payload: { user: AuthUser | null; role: string; authProvider?: 'supabase' | 'demo' | null }) => {
      const mapped = mapSessionUser(payload.user, payload.role);
      setUser(mapped.user);
      setRole(mapped.role);
      const provider = payload.authProvider ?? null;
      setAuthProvider(provider);
      if (mapped.user) {
        writeStoredAuthSession({
          user: mapped.user,
          role: mapped.role,
          authProvider: provider,
        });
      } else {
        clearStoredAuthSession();
      }
    },
    [],
  );

  const refreshSession = React.useCallback(async () => {
    const stored = readStoredAuthSession();
    const tokenBefore = await getAccessToken();

    if (!tokenBefore && !stored?.user) {
      applyMe({ user: null, role: 'public', authProvider: null });
      setIsLoading(false);
      return;
    }

    try {
      const me = await Promise.race([
        apiFetch<{
          user: AuthUser | null;
          role: UserRole | 'public';
          authProvider: 'supabase' | 'demo' | null;
        }>('/api/auth/me'),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('auth-me-timeout')), 30_000);
        }),
      ]);

      if (me.user) {
        applyMe(me);
        return;
      }

      const tokenAfter = await getAccessToken();
      if (!tokenBefore && !tokenAfter) {
        applyMe({ user: null, role: 'public', authProvider: null });
        setDemoToken(null);
        return;
      }

      if (tokenAfter) {
        const retry = await apiFetch<{
          user: AuthUser | null;
          role: UserRole | 'public';
          authProvider: 'supabase' | 'demo' | null;
        }>('/api/auth/me');
        if (retry.user) {
          applyMe(retry);
        } else if (stored?.user && tokenAfter === getDemoToken()) {
          applyMe(stored);
        }
      } else if (stored?.user) {
        applyMe({ user: null, role: 'public', authProvider: null });
        setDemoToken(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const keepSession =
        message === 'auth-me-timeout' ||
        message.includes('conexión') ||
        message.includes('502') ||
        message.includes('504') ||
        message.includes('503');

      if (keepSession) {
        console.warn('[auth] No se pudo refrescar la sesión; se mantiene la sesión actual.');
        return;
      }

      applyMe({ user: null, role: 'public', authProvider: null });
      setDemoToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyMe]);

  React.useEffect(() => {
    void refreshSession();

    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          void refreshSession();
        } else if (!getDemoToken()) {
          applyMe({ user: null, role: 'public', authProvider: null });
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.warn('[auth] No se pudo suscribir a cambios de sesión:', error);
      return undefined;
    }
  }, [applyMe, refreshSession]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      setDemoToken(null);

      if (isSupabaseConfigured()) {
        const { data, error } = await signInWithPasswordSafely(normalizedEmail, password);

        if (!error && data.session) {
          try {
            await apiFetch('/api/auth/sync-profile', { method: 'POST' });
          } catch {
            /* perfil puede crearse por trigger */
          }
          await refreshSession();
          setIsLoading(false);
          return;
        }

        await signOutSupabaseSafely();
      }

      let demo: { token: string; user: AuthUser };
      try {
        demo = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login-demo', {
          method: 'POST',
          body: JSON.stringify({ email: normalizedEmail, password }),
        });
      } catch (demoErr) {
        const message = demoErr instanceof Error ? demoErr.message : '';
        const lower = message.toLowerCase();
        if (
          message === 'Recurso no encontrado' ||
          message.includes('404') ||
          lower.includes('failed to fetch') ||
          lower.includes('networkerror') ||
          message.includes('conexión') ||
          message.includes('502') ||
          message.includes('504')
        ) {
          throw new Error(
            'No se pudo conectar con el servidor de autenticación. Ejecuta «npm run dev:all» o «npm run server» en otra terminal.',
          );
        }
        if (message.includes('401') || lower.includes('credencial') || lower.includes('incorrect')) {
          throw new Error('Correo o contraseña incorrectos.');
        }
        throw demoErr;
      }

      setDemoToken(demo.token);
      applyMe({ user: demo.user, role: demo.user.role, authProvider: 'demo' });
      setIsLoading(false);
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
    setViewAsRolesState([]);
    writeViewAsRoles([]);
    await signOutSupabaseSafely();
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* sin sesión demo activa */
    }
    applyMe({ user: null, role: 'public', authProvider: null });
  }, [applyMe]);

  React.useEffect(() => {
    if (!hasAdminApiAccess(user, role) && viewAsRoles.length > 0) {
      clearViewAsRoles();
    }
  }, [user, role, viewAsRoles.length, clearViewAsRoles]);

  const effectiveRole = React.useMemo<UserRole | 'public'>(() => {
    if (viewAsRoles.length === 1 && hasAdminApiAccess(user, role)) return viewAsRoles[0]!;
    return role;
  }, [viewAsRoles, user, role]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      effectiveRole,
      viewAsRoles,
      toggleViewAsRole,
      clearViewAsRoles,
      isLoading,
      isAdmin: hasAdminApiAccess(user, role),
      canAccessAdminPanel: canAccessAdminPanel(user, role),
      authProvider,
      login,
      signUp,
      logout,
    }),
    [user, role, effectiveRole, viewAsRoles, toggleViewAsRole, clearViewAsRoles, isLoading, authProvider, login, signUp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
