import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';

interface CatalogMobileAccordionProps {
  onNavigate?: () => void;
}

export function CatalogMobileAccordion({ onNavigate }: CatalogMobileAccordionProps) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

  const [open, setOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);

  const columnGroups = useMemo(
    () => menu.getColumnGroups(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const featuredContent = useMemo(
    () => menu.getFeaturedContent(activeCategorySlug),
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
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-normal text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
      >
        Equipos
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
            featuredContent={featuredContent}
            onNavigate={closeAll}
          />
        </div>
      ) : null}
    </div>
  );
}
