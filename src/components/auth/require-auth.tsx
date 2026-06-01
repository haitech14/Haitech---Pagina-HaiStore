import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { canAccessAdminPanel } from '@/lib/admin-access';

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <span className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <span className="sr-only">Verificando sesión…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !canAccessAdminPanel(user, role)) {
    return <Navigate to="/tienda" replace state={{ reason: 'admin-denied' }} />;
  }

  return children;
}
