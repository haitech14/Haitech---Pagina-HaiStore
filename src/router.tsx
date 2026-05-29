import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { RootLayout } from '@/components/layout/root-layout';

const HomePage = lazy(() =>
  import('@/pages/home').then((m) => ({ default: m.HomePage })),
);
const StorePage = lazy(() =>
  import('@/pages/store').then((m) => ({ default: m.StorePage })),
);
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const LoginRegisterPage = lazy(() =>
  import('@/pages/login-register').then((m) => ({ default: m.LoginRegisterPage })),
);
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin-inventory').then((m) => ({ default: m.AdminInventoryPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/contact').then((m) => ({ default: m.ContactPage })),
);
const ProductDetailPage = lazy(() =>
  import('@/pages/product-detail').then((m) => ({ default: m.ProductDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
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
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: 'tienda', element: withSuspense(<StorePage />) },
      { path: 'tienda/producto/:id', element: withSuspense(<ProductDetailPage />) },
      { path: 'panel/inventario', element: withSuspense(<AdminInventoryPage />) },
      { path: 'panel/usuarios', element: withSuspense(<AdminInventoryPage />) },
      { path: 'panel', element: withSuspense(<AdminInventoryPage />) },
      { path: 'contacto', element: withSuspense(<ContactPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
