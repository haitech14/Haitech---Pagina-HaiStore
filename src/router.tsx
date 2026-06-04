import { Suspense, type ReactNode } from 'react';
import { Link, Navigate, createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import { lazyWithRetry } from '@/lib/lazy-with-retry';

const HomePage = lazyWithRetry(() => import('@/pages/home').then((m) => ({ default: m.HomePage })), 'inicio');
const StorePage = lazyWithRetry(() => import('@/pages/store').then((m) => ({ default: m.StorePage })), 'tienda');
const CategoryPage = lazyWithRetry(
  () => import('@/pages/category').then((m) => ({ default: m.CategoryPage })),
  'categoría',
);
const LoginPage = lazyWithRetry(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })), 'login');
const LoginRegisterPage = lazyWithRetry(
  () => import('@/pages/login-register').then((m) => ({ default: m.LoginRegisterPage })),
  'registro',
);
const ContactPage = lazyWithRetry(
  () => import('@/pages/contact').then((m) => ({ default: m.ContactPage })),
  'contacto',
);
const AccountPage = lazyWithRetry(
  () => import('@/pages/account').then((m) => ({ default: m.AccountPage })),
  'mi cuenta',
);
const FavoritesPage = lazyWithRetry(
  () => import('@/pages/favorites').then((m) => ({ default: m.FavoritesPage })),
  'favoritos',
);
const ProductDetailPage = lazyWithRetry(
  () => import('@/pages/product-detail').then((m) => ({ default: m.ProductDetailPage })),
  'producto',
);
const NotFoundPage = lazyWithRetry(
  () => import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
  'página',
);
const TermsPage = lazyWithRetry(() => import('@/pages/legal').then((m) => ({ default: m.TermsPage })), 'términos');
const PrivacyPage = lazyWithRetry(
  () => import('@/pages/legal').then((m) => ({ default: m.PrivacyPage })),
  'privacidad',
);

const AdminLayout = lazyWithRetry(
  () => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
  'admin',
);
const AdminDashboard = lazyWithRetry(
  () => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
  'panel',
);
const AdminPlaceholder = lazyWithRetry(
  () => import('@/pages/admin/AdminPlaceholder').then((m) => ({ default: m.AdminPlaceholder })),
  'admin',
);
const AdminInventarioPage = lazyWithRetry(
  () => import('@/pages/admin/AdminInventarioPage').then((m) => ({ default: m.AdminInventarioPage })),
  'inventario',
);
const AdminClientesPage = lazyWithRetry(
  () => import('@/pages/admin/AdminClientesPage').then((m) => ({ default: m.AdminClientesPage })),
  'clientes',
);
const AdminCrmLayout = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminCrmLayout').then((m) => ({
      default: m.AdminCrmLayout,
    })),
  'crm-layout',
);
const AdminCrmResumenPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminCrmResumenPage').then((m) => ({
      default: m.AdminCrmResumenPage,
    })),
  'crm-resumen',
);
const AdminCrmPipelinePage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminCrmPipelinePage').then((m) => ({
      default: m.AdminCrmPipelinePage,
    })),
  'crm-pipeline',
);
const AdminCrmMuralPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminCrmMuralPage').then((m) => ({
      default: m.AdminCrmMuralPage,
    })),
  'crm-mural',
);
const AdminCrmClientesPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminCrmClientesPage').then((m) => ({
      default: m.AdminCrmClientesPage,
    })),
  'crm-clientes',
);
const AdminMarketingPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminMarketingPage').then((m) => ({
      default: m.AdminMarketingPage,
    })),
  'marketing',
);
const AdminConfiguracionLayout = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminConfiguracionLayout').then((m) => ({
      default: m.AdminConfiguracionLayout,
    })),
  'configuración',
);
const AdminConfiguracionSectionPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminConfiguracionSectionPage').then((m) => ({
      default: m.AdminConfiguracionSectionPage,
    })),
  'configuración',
);
const AdminVentasPage = lazyWithRetry(
  () => import('@/pages/admin/AdminVentasPage').then((m) => ({ default: m.AdminVentasPage })),
  'ventas',
);
const AdminServiciosPage = lazyWithRetry(
  () => import('@/pages/admin/admin-more-modules').then((m) => ({ default: m.AdminServiciosPage })),
  'servicios',
);
const AdminAlquileresPage = lazyWithRetry(
  () => import('@/pages/admin/admin-more-modules').then((m) => ({ default: m.AdminAlquileresPage })),
  'alquileres',
);
const AdminEnviosPage = lazyWithRetry(
  () => import('@/pages/admin/admin-more-modules').then((m) => ({ default: m.AdminEnviosPage })),
  'envíos',
);
const AdminCategoriasPage = lazyWithRetry(
  () => import('@/pages/admin/AdminCategoriasPage').then((m) => ({ default: m.AdminCategoriasPage })),
  'categorías',
);
const AdminListasPreciosPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminListasPreciosPage').then((m) => ({
      default: m.AdminListasPreciosPage,
    })),
  'listas de precios',
);

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span
        className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
        aria-hidden="true"
      />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

function RouteErrorFallback() {
  const error = useRouteError();
  const detail =
    isRouteErrorResponse(error)
      ? error.statusText || `Error ${error.status}`
      : error instanceof Error
        ? error.message
        : null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
      <h1 className="text-xl font-semibold text-balance">No se pudo cargar esta página</h1>
      {detail ? (
        <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
      ) : (
        <p className="max-w-md text-sm text-muted-foreground">
          Ocurrió un error inesperado. Prueba recargar o volver al inicio.
        </p>
      )}
      <p className="max-w-md text-xs text-muted-foreground">
        Si acabas de publicar un despliegue, haz una recarga forzada (Ctrl+F5) para actualizar los
        archivos de la app.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={() => window.location.reload()}
        >
          Recargar
        </button>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorFallback />,
    children: [
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/login/registro',
    element: withSuspense(<LoginRegisterPage />),
  },
  {
    path: '/admin',
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: withSuspense(<AdminDashboard />) },
      { path: 'ventas', element: withSuspense(<AdminVentasPage />) },
      { path: 'pedidos', element: <Navigate to="/admin/ventas" replace /> },
      { path: 'productos', element: <Navigate to="/admin/inventario" replace /> },
      { path: 'inventario', element: withSuspense(<AdminInventarioPage />) },
      { path: 'clientes', element: withSuspense(<AdminClientesPage />) },
      {
        path: 'crm',
        element: withSuspense(<AdminCrmLayout />),
        children: [
          { index: true, element: <Navigate to="/admin/crm/resumen" replace /> },
          { path: 'resumen', element: withSuspense(<AdminCrmResumenPage />) },
          { path: 'pipeline', element: withSuspense(<AdminCrmPipelinePage />) },
          { path: 'mural', element: withSuspense(<AdminCrmMuralPage />) },
          { path: 'clientes', element: withSuspense(<AdminCrmClientesPage />) },
        ],
      },
      { path: 'marketing', element: withSuspense(<AdminMarketingPage />) },
      { path: 'reportes', element: withSuspense(<AdminPlaceholder page="reportes" />) },
      {
        path: 'configuracion',
        element: withSuspense(<AdminConfiguracionLayout />),
        children: [
          { index: true, element: <Navigate to="/admin/configuracion/general" replace /> },
          {
            path: 'usuarios',
            element: <Navigate to="/admin/crm/clientes" replace />,
          },
          { path: ':section', element: withSuspense(<AdminConfiguracionSectionPage />) },
        ],
      },
      { path: 'tpv', element: <Navigate to="/admin/ventas?vista=tpv" replace /> },
      { path: 'servicios', element: withSuspense(<AdminServiciosPage />) },
      { path: 'alquileres-planes', element: withSuspense(<AdminAlquileresPage />) },
      { path: 'envios', element: withSuspense(<AdminEnviosPage />) },
      { path: 'categorias', element: withSuspense(<AdminCategoriasPage />) },
      { path: 'listas-precios', element: withSuspense(<AdminListasPreciosPage />) },
      {
        path: 'apariencia',
        element: <Navigate to="/admin/configuracion/apariencia" replace />,
      },
    ],
  },
  { path: '/panel', element: <Navigate to="/admin" replace /> },
  { path: '/panel/inventario', element: <Navigate to="/admin/inventario" replace /> },
  { path: '/panel/usuarios', element: <Navigate to="/admin/crm/clientes" replace /> },
  {
    path: '/panel/configuracion',
    element: <Navigate to="/admin/configuracion/general" replace />,
  },
  { path: '/panel/pedidos', element: <Navigate to="/admin/ventas" replace /> },
  { path: '/panel/ventas', element: <Navigate to="/admin/ventas" replace /> },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'tienda', element: withSuspense(<StorePage />) },
      { path: 'categoria/:slug', element: withSuspense(<CategoryPage />) },
      { path: 'tienda/producto/:id', element: withSuspense(<ProductDetailPage />) },
      { path: 'contacto', element: withSuspense(<ContactPage />) },
      { path: 'mi-cuenta', element: withSuspense(<AccountPage />) },
      { path: 'favoritos', element: withSuspense(<FavoritesPage />) },
      { path: 'terminos', element: withSuspense(<TermsPage />) },
      { path: 'privacidad', element: withSuspense(<PrivacyPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
    ],
  },
]);
