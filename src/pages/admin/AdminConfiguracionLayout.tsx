import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';

import { ADMIN_ROUTES, ADMIN_SETTINGS_SECTIONS } from '@/lib/admin-routes';

const SECTION_SET = new Set<string>(ADMIN_SETTINGS_SECTIONS);

export function AdminConfiguracionLayout() {
  const { section } = useParams<{ section?: string }>();
  const { pathname } = useLocation();
  const isUsersPage = pathname.startsWith(ADMIN_ROUTES.SETTINGS_USUARIOS);

  if (section && !SECTION_SET.has(section)) {
    return <Navigate to="/admin/configuracion/general" replace />;
  }

  return (
    <div className="space-y-3">
      {!isUsersPage ? (
        <p className="max-w-3xl text-sm text-muted-foreground">
          Datos de la empresa y diseño de cotizaciones PDF. Los cambios se reflejan al generar nuevas
          cotizaciones, en la tienda y en el TPV.
        </p>
      ) : null}
      <Outlet />
    </div>
  );
}
