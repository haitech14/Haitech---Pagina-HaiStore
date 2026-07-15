import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import type { NavMegaMenuModel } from '@/lib/mega-menu-from-store-categories';
import { cn } from '@/lib/utils';

type StaticNavMobileAccordionProps = {
  label: string;
  icon: LucideIcon;
  menu: NavMegaMenuModel;
  /** Si se define, el label navega aquí; el caret sigue abriendo el submenú. */
  labelHref?: string;
  onNavigate?: () => void;
};

export function StaticNavMobileAccordion({
  label,
  icon: Icon,
  menu,
  labelHref,
  onNavigate,
}: StaticNavMobileAccordionProps) {
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

  const headerClassName =
    'flex min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-normal text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset';

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
      {labelHref ? (
        <div className="flex min-h-11 w-full items-stretch">
          <Link
            to={labelHref}
            onClick={() => onNavigate?.()}
            className={cn(
              headerClassName,
              'min-w-0 flex-1 justify-start rounded-none hover:bg-white/10',
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </span>
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? `Contraer ${label}` : `Expandir ${label}`}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 text-white/70 transition-transform', open && 'rotate-180')}
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={headerClassName}
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
      )}

      {open ? (
        <div className="border-t border-white/10">
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
