import { Navigate } from 'react-router-dom';

import { ADMIN_ROUTES } from '@/lib/admin-routes';

/** Alias legacy: pedidos vive en el módulo Ventas. */
export function AdminPedidosPage() {
  return <Navigate to={ADMIN_ROUTES.VENTAS} replace />;
}
