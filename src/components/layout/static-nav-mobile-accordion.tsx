import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import type { NavMegaMenuModel } from '@/lib/mega-menu-from-store-categories';
import { cn } from '@/lib/utils';

type StaticNavMobileAccordionProps = {
  label: string;
  icon: LucideIcon;
  menu: NavMegaMenuModel;
  onNavigate?: () => void;
};

export function StaticNavMobileAccordion({
  label,
  icon: Icon,
  menu,
  onNavigate,
}: StaticNavMobileAccordionProps) {
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
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-normal text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 shrink-0 text-white/70 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="border-t border-white/10">
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
