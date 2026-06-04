import { Navigate } from 'react-router-dom';

import { ADMIN_ROUTES } from '@/lib/admin-routes';

/** Redirección legacy → módulo CRM. */
export function AdminClientesPage() {
  return <Navigate to={ADMIN_ROUTES.CRM_RESUMEN} replace />;
}
