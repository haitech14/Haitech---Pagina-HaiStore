import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Header } from '@/components/layout/header';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { SiteFooter } from '@/components/layout/site-footer';
import { HomeStorefrontTrustBar } from '@/components/home/home-storefront-trust-bar';
import { useCart } from '@/context/cart-context';
import { CartProvider } from '@/context/cart-context';
import { useProductCompare } from '@/context/product-compare-context';
import { MobileBottomInsetProvider } from '@/context/mobile-bottom-inset-context';
import { shouldShowMobileBottomNav } from '@/lib/mobile-bottom-nav';
import { cn } from '@/lib/utils';

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

/** Monta el drawer al abrir o en idle (add-to-cart no espera parse del chunk). */
function DeferredShoppingCartDrawer() {
  const { isOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const mount = () => setMounted(true);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(mount, 2000);
    }

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <ShoppingCartDrawer />
    </Suspense>
  );
}

/** Monta compare tray cuando hay items o en idle. */
function DeferredProductCompareTray() {
  const { items } = useProductCompare();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (items.length > 0) setMounted(true);
  }, [items.length]);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const mount = () => setMounted(true);

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(mount, { timeout: 5000 });
    } else {
      timeoutId = window.setTimeout(mount, 2500);
    }

    return () => {
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <ProductCompareTray />
    </Suspense>
  );
}

export function RootLayout() {
  const { pathname } = useLocation();
  const widgetsReady = useDeferredWidgetMount();
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
      <HomeStorefrontTrustBar />
      <SiteFooter />
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
      {widgetsReady ? (
        <Suspense fallback={null}>
          <WhatsAppFloatingButton />
          <HaibotFloatingMenu side="right" />
        </Suspense>
      ) : null}
      <DeferredShoppingCartDrawer />
      <DeferredProductCompareTray />
    </div>
    </MobileBottomInsetProvider>
    </CartProvider>
  );
}
