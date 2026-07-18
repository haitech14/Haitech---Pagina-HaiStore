import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Header } from '@/components/layout/header';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { CartProvider } from '@/context/cart-context';
import { MobileBottomInsetProvider } from '@/context/mobile-bottom-inset-context';
import { shouldShowMobileBottomNav } from '@/lib/mobile-bottom-nav';
import { cn } from '@/lib/utils';

const SiteFooter = lazy(() =>
  import('@/components/layout/site-footer').then((m) => ({ default: m.SiteFooter })),
);

const HomeStorefrontTrustBar = lazy(() =>
  import('@/components/home/home-storefront-trust-bar').then((m) => ({
    default: m.HomeStorefrontTrustBar,
  })),
);

const ShoppingCartDrawer = lazy(() =>
  import('@/components/cart/shopping-cart-drawer').then((m) => ({
    default: m.ShoppingCartDrawer,
  })),
);

const ProductCompareTray = lazy(() =>
  import('@/components/product/product-compare-tray').then((m) => ({
    default: m.ProductCompareTray,
  })),
);

const MobileBottomNav = lazy(() =>
  import('@/components/layout/mobile-bottom-nav').then((m) => ({
    default: m.MobileBottomNav,
  })),
);

const WhatsAppFloatingButton = lazy(() =>
  import('@/components/layout/whatsapp-floating-button').then((m) => ({
    default: m.WhatsAppFloatingButton,
  })),
);

const HaibotFloatingMenu = lazy(() =>
  import('@/components/haibot/haibot-floating-menu').then((m) => ({
    default: m.HaibotFloatingMenu,
  })),
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
  const { pathname } = useLocation();
  const widgetsReady = useDeferredWidgetMount();
  const chromeReady = useDeferredWidgetMount(600);
  const showMobileBottomNav = shouldShowMobileBottomNav(pathname);

  return (
    <CartProvider>
    <MobileBottomInsetProvider>
    <div className="flex min-h-dvh flex-col bg-background">
      <ScrollToTop />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Header />
      <main
        id="contenido"
        className={cn(
          'flex-1',
          showMobileBottomNav &&
            'pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
        )}
      >
        <Outlet />
      </main>
      {chromeReady ? (
        <Suspense fallback={null}>
          <HomeStorefrontTrustBar />
          <SiteFooter />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <MobileBottomNav />
        <ShoppingCartDrawer />
        <ProductCompareTray />
      </Suspense>
      {widgetsReady ? (
        <Suspense fallback={null}>
          <WhatsAppFloatingButton />
          <HaibotFloatingMenu side="right" />
        </Suspense>
      ) : null}
    </div>
    </MobileBottomInsetProvider>
    </CartProvider>
  );
}
