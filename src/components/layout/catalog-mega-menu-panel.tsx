import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { megaMenuPartnerBrands } from '@/data/mega-menu';
import {
  filterRedundantMegaMenuLinks,
  type LandingCatalogMenuSidebarItem,
  type MegaMenuColumnGroup,
} from '@/lib/mega-menu-from-store-categories';
import { categoryLandingPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.5;

function MegaMenuLink({
  to,
  onNavigate,
  className,
  children,
}: {
  to: string;
  onNavigate: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} onClick={onNavigate} className={className}>
      {children}
    </Link>
  );
}

function MegaMenuColumn({
  group,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
}) {
  const links = filterRedundantMegaMenuLinks(group.title, group.links);
  const hasSubLinks = links.length > 0;

  return (
    <div className="flex min-w-0 flex-col">
      <MegaMenuLink
        to={group.href}
        onNavigate={onNavigate}
        className="group flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card transition-all hover:border-primary/35 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-[4.5rem] items-center justify-center bg-muted/20 p-2 transition-colors group-hover:bg-muted/35 sm:h-20">
          <img
            src={group.image}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </span>
        <span className="border-t border-border/60 px-2.5 py-2">
          <span className="block text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {group.title}
          </span>
        </span>
      </MegaMenuLink>

      {hasSubLinks ? (
        <ul className="mt-1.5 space-y-1 px-0.5" role="list">
          {links.map((link) => (
            <li key={`${group.slug}-${link.href}-${link.name}`}>
              <MegaMenuLink
                to={link.href}
                onNavigate={onNavigate}
                className="block rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.name}
              </MegaMenuLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MegaMenuBrandStrip({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="border-t border-border/60 bg-muted/20 px-3 py-2.5 sm:px-4">
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Marcas que distribuimos
      </p>
      <ul className="flex flex-wrap items-center gap-2.5 sm:gap-3" role="list">
        {megaMenuPartnerBrands.map((brand) => (
          <li key={brand.id}>
            {brand.href ? (
              <Link
                to={brand.href}
                onClick={onNavigate}
                className="flex h-9 items-center rounded-md px-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-full max-w-[5.5rem] object-contain sm:max-w-[6.5rem]"
                  loading="lazy"
                />
              </Link>
            ) : (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-9 max-w-[5.5rem] object-contain sm:h-10 sm:max-w-[6.5rem]"
                loading="lazy"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface CatalogMegaMenuPanelProps {
  activeCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  sidebarItems: LandingCatalogMenuSidebarItem[];
  columnGroups: MegaMenuColumnGroup[];
  showBrandStrip: boolean;
  onNavigate: () => void;
  layout?: 'desktop' | 'mobile';
}

export function CatalogMegaMenuPanel({
  activeCategorySlug,
  onCategoryChange,
  sidebarItems,
  columnGroups,
  showBrandStrip,
  onNavigate,
  layout = 'desktop',
}: CatalogMegaMenuPanelProps) {
  const activeItem =
    sidebarItems.find((item) => item.slug === activeCategorySlug) ?? sidebarItems[0];
  const isMobile = layout === 'mobile';

  return (
    <div
      className={cn(
        'flex bg-background',
        isMobile ? 'flex-col' : 'min-h-[22rem]',
      )}
    >
      <aside
        className={cn(
          'shrink-0 border-border/60 bg-muted/10',
          isMobile
            ? 'border-b px-3 py-2'
            : 'flex w-[10.5rem] flex-col border-r py-2 pl-2 pr-1',
        )}
      >
        {!isMobile ? (
          <p className="mb-1.5 px-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Categorías
          </p>
        ) : null}

        <ul
          className={cn(
            'flex gap-0.5',
            isMobile
              ? 'flex-row overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              : 'max-h-[min(34rem,72vh)] flex-col overflow-y-auto [scrollbar-width:thin]',
          )}
          role="tablist"
          aria-label="Categorías del catálogo"
        >
          {sidebarItems.map((item) => {
            const isActive = activeCategorySlug === item.slug;
            const Icon = item.icon;

            return (
              <li key={item.slug} role="presentation" className={isMobile ? 'shrink-0' : undefined}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onMouseEnter={isMobile ? undefined : () => onCategoryChange(item.slug)}
                  onFocus={() => onCategoryChange(item.slug)}
                  onClick={() => onCategoryChange(item.slug)}
                  className={cn(
                    'flex min-h-8 w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isMobile && 'whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted/80',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded',
                      isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-3" strokeWidth={ICON_STROKE} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 line-clamp-2 text-pretty leading-tight">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div
        className="flex min-w-0 flex-1 flex-col"
        role="tabpanel"
        aria-label={activeItem?.label ?? 'Categoría'}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground sm:text-base">{activeItem?.label}</h3>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {activeItem?.description}
              </p>
            </div>
            <Link
              to={activeItem?.viewAllHref ?? categoryLandingPath(activeCategorySlug)}
              onClick={onNavigate}
              className="inline-flex min-h-8 shrink-0 items-center gap-0.5 rounded-md px-1 text-[0.65rem] font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs"
            >
              Ver todo
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {columnGroups.length > 0 ? (
            <div
              className={cn(
                'grid gap-3',
                columnGroups.length === 1
                  ? 'grid-cols-1 sm:max-w-xs'
                  : columnGroups.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3',
              )}
            >
              {columnGroups.map((group) => (
                <MegaMenuColumn key={`${activeCategorySlug}-${group.slug}`} group={group} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay categorías disponibles.</p>
          )}
        </div>

        {showBrandStrip ? <MegaMenuBrandStrip onNavigate={onNavigate} /> : null}
      </div>
    </div>
  );
}
