import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { buildLandingCatalogMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';

interface CatalogMobileAccordionProps {
  onNavigate?: () => void;
}

export function CatalogMobileAccordion({ onNavigate }: CatalogMobileAccordionProps) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildLandingCatalogMegaMenu(categoryTree), [categoryTree]);

  const [open, setOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);

  const columnGroups = useMemo(
    () => menu.getColumnGroups(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  useEffect(() => {
    const slugs = menu.sidebarItems.map((item) => item.slug);
    if (!slugs.includes(activeCategorySlug)) {
      setActiveCategorySlug(menu.defaultCategorySlug);
    }
  }, [activeCategorySlug, menu.defaultCategorySlug, menu.sidebarItems]);

  const closeAll = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        Catálogo de productos
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="border-t border-border/60">
          <CatalogMegaMenuPanel
            layout="mobile"
            activeCategorySlug={activeCategorySlug}
            onCategoryChange={setActiveCategorySlug}
            sidebarItems={menu.sidebarItems}
            columnGroups={columnGroups}
            showBrandStrip={menu.categoryShowsBrandStrip(activeCategorySlug)}
            onNavigate={closeAll}
          />
        </div>
      ) : null}
    </div>
  );
}
