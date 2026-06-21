import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import { Header } from '@/components/layout/header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ShoppingCartDrawer } from '@/components/cart/shopping-cart-drawer';
import { ProductCompareTray } from '@/components/product/product-compare-tray';

const HaibotFloatingMenu = lazy(() =>
  import('@/components/haibot/haibot-floating-menu').then((m) => ({
    default: m.HaibotFloatingMenu,
  })),
);
const SubscriptionPopup = lazy(() =>
  import('@/components/SubscriptionPopup').then((m) => ({ default: m.SubscriptionPopup })),
);

function useDeferredWidgetMount(delayMs = 2500) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const timeoutId = window.setTimeout(activate, delayMs);

    const onFirstScroll = () => {
      activate();
      window.removeEventListener('scroll', onFirstScroll, { capture: true });
    };
    window.addEventListener('scroll', onFirstScroll, { once: true, capture: true, passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', onFirstScroll, { capture: true });
    };
  }, [delayMs]);

  return ready;
}

export function RootLayout() {
  const widgetsReady = useDeferredWidgetMount();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <ScrollRestoration />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      {widgetsReady ? (
        <Suspense fallback={null}>
          <SubscriptionPopup />
          <HaibotFloatingMenu />
        </Suspense>
      ) : null}
      <ShoppingCartDrawer />
      <ProductCompareTray />
    </div>
  );
}
