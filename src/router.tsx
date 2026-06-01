import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';

const HomePage = lazy(() =>
  import('@/pages/home').then((m) => ({ default: m.HomePage })),
);
const StorePage = lazy(() =>
  import('@/pages/store').then((m) => ({ default: m.StorePage })),
);
const CategoryPage = lazy(() =>
  import('@/pages/category').then((m) => ({ default: m.CategoryPage })),
);
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const LoginRegisterPage = lazy(() =>
  import('@/pages/login-register').then((m) => ({ default: m.LoginRegisterPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/contact').then((m) => ({ default: m.ContactPage })),
);
const AccountPage = lazy(() =>
  import('@/pages/account').then((m) => ({ default: m.AccountPage })),
);
const ProductDetailPage = lazy(() =>
  import('@/pages/product-detail').then((m) => ({ default: m.ProductDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);
const TermsPage = lazy(() => import('@/pages/legal').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() =>
  import('@/pages/legal').then((m) => ({ default: m.PrivacyPage })),
);

const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const AdminPlaceholder = lazy(() =>
  import('@/pages/admin/AdminPlaceholder').then((m) => ({ default: m.AdminPlaceholder })),
);
const AdminInventarioPage = lazy(() =>
  import('@/pages/admin/AdminInventarioPage').then((m) => ({ default: m.AdminInventarioPage })),
);
const AdminClientesPage = lazy(() =>
  import('@/pages/admin/AdminClientesPage').then((m) => ({ default: m.AdminClientesPage })),
);
const AdminConfiguracionLayout = lazy(() =>
  import('@/pages/admin/AdminConfiguracionLayout').then((m) => ({
    default: m.AdminConfiguracionLayout,
  })),
);
const AdminConfiguracionSectionPage = lazy(() =>
  import('@/pages/admin/AdminConfiguracionSectionPage').then((m) => ({
    default: m.AdminConfiguracionSectionPage,
  })),
);
const AdminVentasPage = lazy(() =>
  import('@/pages/admin/AdminVentasPage').then((m) => ({ default: m.AdminVentasPage })),
);
const AdminServiciosPage = lazy(() =>
  import('@/pages/admin/admin-more-modules').then((m) => ({ default: m.AdminServiciosPage })),
);
const AdminEnviosPage = lazy(() =>
  import('@/pages/admin/admin-more-modules').then((m) => ({ default: m.AdminEnviosPage })),
);
const AdminCategoriasPage = lazy(() =>
  import('@/pages/admin/AdminCategoriasPage').then((m) => ({ default: m.AdminCategoriasPage })),
);
const AdminListasPreciosPage = lazy(() =>
  import('@/pages/admin/AdminListasPreciosPage').then((m) => ({
    default: m.AdminListasPreciosPage,
  })),
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

export const router = createBrowserRouter([
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
      { path: 'marketing', element: withSuspense(<AdminPlaceholder page="marketing" />) },
      { path: 'reportes', element: withSuspense(<AdminPlaceholder page="reportes" />) },
      {
        path: 'configuracion',
        element: withSuspense(<AdminConfiguracionLayout />),
        children: [
          { index: true, element: <Navigate to="/admin/configuracion/general" replace /> },
          { path: ':section', element: withSuspense(<AdminConfiguracionSectionPage />) },
        ],
      },
      { path: 'tpv', element: <Navigate to="/admin/ventas?vista=tpv" replace /> },
      { path: 'servicios', element: withSuspense(<AdminServiciosPage />) },
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
  { path: '/panel/usuarios', element: <Navigate to="/admin/configuracion/usuarios" replace /> },
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
      { path: 'terminos', element: withSuspense(<TermsPage />) },
      { path: 'privacidad', element: withSuspense(<PrivacyPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
