import { Outlet, ScrollRestoration } from 'react-router-dom';

import { HaibotFloatingMenu } from '@/components/haibot/haibot-floating-menu';
import { Header } from '@/components/layout/header';
import { SiteFooter } from '@/components/layout/site-footer';
import { ShoppingCartDrawer } from '@/components/cart/shopping-cart-drawer';
import { ProductCompareTray } from '@/components/product/product-compare-tray';
import { SubscriptionPopup } from '@/components/SubscriptionPopup';

export function RootLayout() {
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
      <SubscriptionPopup />
      <ShoppingCartDrawer />
      <ProductCompareTray />
      <HaibotFloatingMenu />
    </div>
  );
}
