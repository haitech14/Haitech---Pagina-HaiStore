import { Suspense, type ReactNode } from 'react';
import { Link, Navigate, createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';
import { lazyWithRetry } from '@/lib/lazy-with-retry';
import { prefetchHomeCatalog } from '@/lib/prefetch-home-catalog';
import { prefetchCategoryPage } from '@/lib/prefetch-category-page';
import { prefetchStoreRoute } from '@/lib/prefetch-store-route';
import { queryClient } from '@/providers';

const loadStoreModule = () => import('@/pages/store');
const HomePage = lazyWithRetry(() => import('@/pages/home').then((m) => ({ default: m.HomePage })), 'inicio');
const StorePage = lazyWithRetry(
  () => loadStoreModule().then((m) => ({ default: m.StorePage })),
  'tienda',
);
const CategoryStorefrontPage = lazyWithRetry(
  () => loadStoreModule().then((m) => ({ default: m.CategoryStorefrontPage })),
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
const DescargasPage = lazyWithRetry(
  () => import('@/pages/descargas').then((m) => ({ default: m.DescargasPage })),
  'descargas',
);
const CheckoutPage = lazyWithRetry(
  () => import('@/pages/checkout').then((m) => ({ default: m.CheckoutPage })),
  'checkout',
);
const CheckoutSuccessPage = lazyWithRetry(
  () => import('@/pages/checkout-success-page').then((m) => ({ default: m.CheckoutSuccessPage })),
  'checkout-exito',
);
const CheckoutMercadoPagoReturnPage = lazyWithRetry(
  () =>
    import('@/pages/checkout-mercadopago-return-page').then((m) => ({
      default: m.CheckoutMercadoPagoReturnPage,
    })),
  'checkout-mp',
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
const ServiciosPage = lazyWithRetry(
  () => import('@/pages/servicios').then((m) => ({ default: m.ServiciosPage })),
  'servicios',
);
const SoftwarePage = lazyWithRetry(
  () => import('@/pages/software').then((m) => ({ default: m.SoftwarePage })),
  'software',
);
const SoftwareDetallePage = lazyWithRetry(
  () => import('@/pages/software-detalle').then((m) => ({ default: m.SoftwareDetailPage })),
  'software-detalle',
);
const ServicioDetallePage = lazyWithRetry(
  () => import('@/pages/servicio-detalle').then((m) => ({ default: m.ServiceDetailPage })),
  'servicio-detalle',
);
const HaiProtectPage = lazyWithRetry(
  () => import('@/pages/haiprotect').then((m) => ({ default: m.HaiProtectPage })),
  'haiprotect',
);
const ForumLayout = lazyWithRetry(
  () => import('@/components/forum/forum-layout').then((m) => ({ default: m.ForumLayout })),
  'foro',
);
const ForumHomePage = lazyWithRetry(
  () => import('@/pages/forum/forum-home-page').then((m) => ({ default: m.ForumHomePage })),
  'foro',
);
const ForumThreadPage = lazyWithRetry(
  () => import('@/pages/forum/forum-thread-page').then((m) => ({ default: m.ForumThreadPage })),
  'foro-tema',
);
const ForumNewThreadPage = lazyWithRetry(
  () => import('@/pages/forum/forum-new-thread-page').then((m) => ({ default: m.ForumNewThreadPage })),
  'foro-nuevo',
);
const ForumCategoryPage = lazyWithRetry(
  () => import('@/pages/forum/forum-category-page').then((m) => ({ default: m.ForumCategoryPage })),
  'foro-categoria',
);
const ForumNovedadesPage = lazyWithRetry(
  () => import('@/pages/forum/forum-novedades-page').then((m) => ({ default: m.ForumNovedadesPage })),
  'foro-novedades',
);
const ForumMiembrosPage = lazyWithRetry(
  () => import('@/pages/forum/forum-miembros-page').then((m) => ({ default: m.ForumMiembrosPage })),
  'foro-miembros',
);
const ForumEventosPage = lazyWithRetry(
  () => import('@/pages/forum/forum-eventos-page').then((m) => ({ default: m.ForumEventosPage })),
  'foro-eventos',
);
const ForumRecursosPage = lazyWithRetry(
  () => import('@/pages/forum/forum-recursos-page').then((m) => ({ default: m.ForumRecursosPage })),
  'foro-recursos',
);
const ForumPreguntasPage = lazyWithRetry(
  () => import('@/pages/forum/forum-preguntas-page').then((m) => ({ default: m.ForumPreguntasPage })),
  'foro-preguntas',
);
const ForumTutorialesPage = lazyWithRetry(
  () => import('@/pages/forum/forum-tutoriales-page').then((m) => ({ default: m.ForumTutorialesPage })),
  'foro-tutoriales',
);
const ForumFirmwarePage = lazyWithRetry(
  () => import('@/pages/forum/forum-firmware-page').then((m) => ({ default: m.ForumFirmwarePage })),
  'foro-firmware',
);

const AdminLayout = lazyWithRetry(
  () => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
  'admin',
);
const AdminDashboard = lazyWithRetry(
  () => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
  'panel',
);
const AdminResumenPage = lazyWithRetry(
  () => import('@/pages/admin/AdminResumenPage').then((m) => ({ default: m.AdminResumenPage })),
  'resumen',
);
const AdminInventarioPage = lazyWithRetry(
  () => import('@/pages/admin/AdminInventarioPage').then((m) => ({ default: m.AdminInventarioPage })),
  'inventario',
);
const AdminMediosPage = lazyWithRetry(
  () => import('@/pages/admin/AdminMediosPage').then((m) => ({ default: m.AdminMediosPage })),
  'medios',
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
const AdminMarketingCuponesPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminMarketingCuponesPage').then((m) => ({
      default: m.AdminMarketingCuponesPage,
    })),
  'marketing-cupones',
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
const AdminConfiguracionUsuariosPage = lazyWithRetry(
  () =>
    import('@/pages/admin/AdminConfiguracionUsuariosPage').then((m) => ({
      default: m.AdminConfiguracionUsuariosPage,
    })),
  'configuración-usuarios',
);
const AdminPedidosPage = lazyWithRetry(
  () => import('@/pages/admin/AdminPedidosPage').then((m) => ({ default: m.AdminPedidosPage })),
  'pedidos',
);
const AdminBandejaPage = lazyWithRetry(
  () => import('@/pages/admin/AdminBandejaPage').then((m) => ({ default: m.AdminBandejaPage })),
  'bandeja',
);
const AdminMuralPage = lazyWithRetry(
  () => import('@/pages/admin/AdminMuralPage').then((m) => ({ default: m.AdminMuralPage })),
  'mural',
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
const AdminAtributosPage = lazyWithRetry(
  () => import('@/pages/admin/AdminAtributosPage').then((m) => ({ default: m.AdminAtributosPage })),
  'atributos',
);
const AdminVariantesPage = lazyWithRetry(
  () => import('@/pages/admin/AdminVariantesPage').then((m) => ({ default: m.AdminVariantesPage })),
  'variantes',
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
      { path: 'resumen', element: withSuspense(<AdminResumenPage />) },
      { path: 'ventas', element: withSuspense(<AdminVentasPage />) },
      { path: 'pedidos', element: withSuspense(<AdminPedidosPage />) },
      { path: 'bandeja', element: withSuspense(<AdminBandejaPage />) },
      { path: 'mural', element: withSuspense(<AdminMuralPage />) },
      { path: 'productos', element: <Navigate to="/admin/inventario" replace /> },
      { path: 'inventario', element: withSuspense(<AdminInventarioPage />) },
      { path: 'medios', element: withSuspense(<AdminMediosPage />) },
      { path: 'album', element: <Navigate to="/admin/medios" replace /> },
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
      { path: 'marketing/cupones', element: withSuspense(<AdminMarketingCuponesPage />) },
      { path: 'reportes', element: <Navigate to="/admin/resumen?vista=reportes" replace /> },
      {
        path: 'configuracion',
        element: withSuspense(<AdminConfiguracionLayout />),
        children: [
          { index: true, element: <Navigate to="/admin/configuracion/general" replace /> },
          {
            path: 'usuarios',
            element: withSuspense(<AdminConfiguracionUsuariosPage />),
          },
          { path: ':section', element: withSuspense(<AdminConfiguracionSectionPage />) },
        ],
      },
      { path: 'tpv', element: <Navigate to="/admin/ventas?vista=tpv" replace /> },
      { path: 'servicios', element: withSuspense(<AdminServiciosPage />) },
      { path: 'alquileres-planes', element: withSuspense(<AdminAlquileresPage />) },
      { path: 'envios', element: withSuspense(<AdminEnviosPage />) },
      { path: 'categorias', element: withSuspense(<AdminCategoriasPage />) },
      { path: 'atributos', element: withSuspense(<AdminAtributosPage />) },
      { path: 'variantes', element: withSuspense(<AdminVariantesPage />) },
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
  { path: '/panel/pedidos', element: <Navigate to="/admin/pedidos" replace /> },
  { path: '/panel/ventas', element: <Navigate to="/admin/ventas" replace /> },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        loader: () => prefetchHomeCatalog(queryClient),
        element: withSuspense(<HomePage />),
      },
      {
        path: 'foro',
        element: withSuspense(<ForumLayout />),
        children: [
          { index: true, element: withSuspense(<ForumHomePage />) },
          { path: 'tema/:slug', element: withSuspense(<ForumThreadPage />) },
          { path: 'nuevo', element: withSuspense(<ForumNewThreadPage />) },
          { path: 'categoria/:slug', element: withSuspense(<ForumCategoryPage />) },
          { path: 'preguntas', element: withSuspense(<ForumPreguntasPage />) },
          { path: 'tutoriales', element: withSuspense(<ForumTutorialesPage />) },
          { path: 'firmware', element: withSuspense(<ForumFirmwarePage />) },
          { path: 'novedades', element: withSuspense(<ForumNovedadesPage />) },
          { path: 'miembros', element: withSuspense(<ForumMiembrosPage />) },
          { path: 'eventos', element: withSuspense(<ForumEventosPage />) },
          { path: 'recursos', element: withSuspense(<ForumRecursosPage />) },
        ],
      },
      { path: 'tienda', element: withSuspense(<StorePage />), loader: () => prefetchStoreRoute(queryClient) },
      { path: 'servicios', element: withSuspense(<ServiciosPage />) },
      { path: 'servicios/:slug', element: withSuspense(<ServicioDetallePage />) },
      { path: 'software', element: withSuspense(<SoftwarePage />) },
      { path: 'software/:slug', element: withSuspense(<SoftwareDetallePage />) },
      { path: 'haiprotect', element: withSuspense(<HaiProtectPage />) },
      { path: 'alquiler', element: <Navigate to="/servicios?seccion=alquiler" replace /> },
      {
        path: 'servicio-tecnico',
        element: <Navigate to="/servicios?seccion=servicio-tecnico" replace />,
      },
      {
        path: 'outsourcing',
        element: <Navigate to="/servicios?seccion=outsourcing" replace />,
      },
      {
        path: 'servicios-corporativos',
        element: <Navigate to="/servicios?seccion=servicios-corporativos" replace />,
      },
      {
        path: 'categoria/software',
        element: <Navigate to="/software" replace />,
      },
      { path: 'categoria/:slug', loader: ({ params, request }) => {
          const url = new URL(request.url);
          const subSlug = url.searchParams.get('sub');
          return prefetchCategoryPage(queryClient, {
            slug: params.slug ?? '',
            subSlug,
          });
        }, element: withSuspense(<CategoryStorefrontPage />) },
      { path: 'tienda/producto/:id', element: withSuspense(<ProductDetailPage />) },
      { path: 'checkout', element: withSuspense(<CheckoutPage />) },
      { path: 'checkout/exito/:orderNumber', element: withSuspense(<CheckoutSuccessPage />) },
      {
        path: 'checkout/pago/mercadopago',
        element: withSuspense(<CheckoutMercadoPagoReturnPage />),
      },
      { path: 'contacto', element: withSuspense(<ContactPage />) },
      { path: 'descargas', element: withSuspense(<DescargasPage />) },
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
