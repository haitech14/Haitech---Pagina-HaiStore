import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid3x3, Home, Search, ShoppingBag } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/context/cart-context';
import {
  MOBILE_BOTTOM_NAV_HEIGHT_PX,
  useSetMobileBottomNavInset,
} from '@/context/mobile-bottom-inset-context';
import { buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { shouldShowMobileBottomNav } from '@/lib/mobile-bottom-nav';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';

type MobileNavSheet = 'categories' | null;

function focusSiteHeaderSearch() {
  const input = document.querySelector<HTMLInputElement>('[data-site-header-search-input]');
  if (!input) return;
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => {
    input.focus({ preventScroll: true });
  }, 200);
}

const navItemClass =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[0.625rem] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-1.5 -top-1 flex min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.625rem] font-bold leading-4 text-white"
      aria-hidden="true"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { totalItems, setCartOpen } = useCart();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

  const [activeSheet, setActiveSheet] = useState<MobileNavSheet>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);

  const visible = shouldShowMobileBottomNav(pathname);
  useSetMobileBottomNavInset(visible ? MOBILE_BOTTOM_NAV_HEIGHT_PX : 0);

  const columnGroups = useMemo(
    () => menu.getColumnGroups(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const featuredContent = useMemo(
    () => menu.getFeaturedContent(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  useEffect(() => {
    setActiveSheet(null);
  }, [pathname]);

  useEffect(() => {
    const slugs = menu.sidebarItems.map((item) => item.slug);
    if (!slugs.includes(activeCategorySlug)) {
      setActiveCategorySlug(menu.defaultCategorySlug);
    }
  }, [activeCategorySlug, menu.defaultCategorySlug, menu.sidebarItems]);

  if (!visible) return null;

  const closeSheet = () => setActiveSheet(null);
  const handleNavigate = () => closeSheet();

  return (
    <>
      <nav
        aria-label="Navegación principal móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="container flex items-stretch gap-0.5 px-2 py-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-red-600' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Home className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Inicio</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setActiveSheet('categories')}
            aria-expanded={activeSheet === 'categories'}
            aria-controls="mobile-nav-categories-sheet"
            className={cn(
              navItemClass,
              activeSheet === 'categories' ? 'text-red-600' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Grid3x3 className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Categorías</span>
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className={cn(navItemClass, 'relative text-muted-foreground hover:text-foreground')}
            aria-label={
              totalItems > 0
                ? `Carrito, ${totalItems} artículo${totalItems === 1 ? '' : 's'}`
                : 'Carrito'
            }
          >
            <span className="relative">
              <ShoppingBag className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
              <NavBadge count={totalItems} />
            </span>
            <span>Carrito</span>
          </button>

          <button
            type="button"
            onClick={focusSiteHeaderSearch}
            className={cn(navItemClass, 'text-muted-foreground hover:text-foreground')}
          >
            <Search className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Buscar</span>
          </button>
        </div>
      </nav>

      <Sheet open={activeSheet === 'categories'} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent
          id="mobile-nav-categories-sheet"
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <SheetTitle className="text-base">Categorías</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CatalogMegaMenuPanel
              layout="mobile"
              activeCategorySlug={activeCategorySlug}
              onCategoryChange={setActiveCategorySlug}
              sidebarItems={menu.sidebarItems}
              columnGroups={columnGroups}
              featuredContent={featuredContent}
              onNavigate={handleNavigate}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
