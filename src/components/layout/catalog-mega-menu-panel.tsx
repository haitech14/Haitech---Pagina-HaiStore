import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type {
  LandingCatalogMenuSidebarItem,
  MegaMenuColumnGroup,
  MegaMenuFeaturedContent,
} from '@/lib/mega-menu-from-store-categories';
import { getBrandLogo, getBrandName, getBrandSlug } from '@/data/brands';
import { hasCatalogIndexInMemory, loadCatalogIndex } from '@/lib/catalog-featured';
import { categoryLandingPath } from '@/lib/category-path';
import {
  getMegaMenuInterestBrands,
  getMegaMenuInterestProducts,
  megaMenuCategoryBrandHref,
  megaMenuCategorySectionHref,
} from '@/lib/mega-menu-interest';
import { megaMenuIconForSlug, resolveMegaMenuColumnImage } from '@/lib/mega-menu-visuals';
import { productPath } from '@/lib/product-path';
import { prefetchCategoryFromHref, prefetchCategoryPage } from '@/lib/prefetch-category-page';
import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.75;
const BRAND_RED = '#E30613';
const MEGA_MENU_NAVY = '#0f1f3d';

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
  const queryClient = useQueryClient();
  const prefetch = () => prefetchCategoryFromHref(queryClient, to);

  return (
    <Link
      to={to}
      onClick={onNavigate}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className={className}
    >
      {children}
    </Link>
  );
}

function MegaMenuColumnThumbnail({
  group,
  onNavigate,
  size = 'desktop',
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
  size?: 'desktop' | 'mobile' | 'summary';
}) {
  const imageSrc = resolveMegaMenuColumnImage(group.slug, group.image);
  const heightClass =
    size === 'summary' ? 'h-36 w-44' : size === 'desktop' ? 'h-[4.5rem]' : 'h-14';

  return (
    <MegaMenuLink
      to={group.href}
      onNavigate={onNavigate}
      className="group/thumb block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-md bg-[#F9FAFB] p-2 transition-colors group-hover/thumb:bg-[#F3F4F6]',
          size === 'summary' ? 'mb-0 h-36 w-44 shrink-0' : 'mb-2.5',
          heightClass,
        )}
      >
        <img
          src={imageSrc}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/thumb:scale-[1.03]"
          loading="lazy"
        />
      </span>
    </MegaMenuLink>
  );
}

function MegaMenuColumnTitle({
  group,
  onNavigate,
  variant = 'desktop',
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
  variant?: 'desktop' | 'mobile' | 'summary';
}) {
  const Icon = megaMenuIconForSlug(group.slug);
  const isDesktop = variant === 'desktop';
  const isSummary = variant === 'summary';

  return (
    <MegaMenuLink
      to={group.href}
      onNavigate={onNavigate}
      className={cn(
        'group/title inline-flex max-w-full items-center gap-2 rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        isSummary
          ? 'mb-4 hover:text-[#E30613]'
          : isDesktop
            ? 'mb-2.5 hover:text-[#E30613]'
            : 'py-1.5 hover:text-[#E30613]',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-[#FFF5F5] text-[#E30613] transition-colors group-hover/title:bg-[#FEE2E2]',
          isSummary ? 'size-8' : isDesktop ? 'size-7' : 'size-6',
        )}
      >
        <Icon
          className={isSummary ? 'size-4' : isDesktop ? 'size-3.5' : 'size-3'}
          strokeWidth={ICON_STROKE}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          'min-w-0 text-pretty font-semibold leading-snug',
          isSummary
            ? 'text-sm uppercase tracking-[0.1em] text-[#0f1f3d] group-hover/title:text-[#E30613]'
            : isDesktop
              ? 'text-[0.6875rem] uppercase tracking-[0.12em] text-[#9CA3AF] group-hover/title:text-[#E30613]'
              : 'text-sm text-[#0f1f3d]',
        )}
      >
        {group.title}
      </span>
    </MegaMenuLink>
  );
}

function MegaMenuDesktopColumn({
  group,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
}) {
  const hasSubLinks = group.links.length > 0;

  return (
    <div className="flex w-[11.5rem] max-w-[14rem] flex-col sm:w-[12.5rem]">
      <MegaMenuColumnThumbnail group={group} onNavigate={onNavigate} />
      <MegaMenuColumnTitle group={group} onNavigate={onNavigate} />

      {hasSubLinks ? (
        <ul className="mb-3 space-y-1.5" role="list">
          {group.links.map((link) => (
            <li key={`${group.slug}-${link.href}-${link.name}`}>
              <MegaMenuLink
                to={link.href}
                onNavigate={onNavigate}
                className={cn(
                  'block rounded-md py-0.5 text-[0.8125rem] leading-snug text-[#374151] transition-colors',
                  'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
              >
                {link.name}
              </MegaMenuLink>
            </li>
          ))}
        </ul>
      ) : null}

      <MegaMenuLink
        to={group.href}
        onNavigate={onNavigate}
        className={cn(
          'mt-auto inline-flex items-center gap-0.5 text-[0.8125rem] font-semibold transition-colors',
          'text-[#E30613] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        )}
      >
        Ver todo
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </MegaMenuLink>
    </div>
  );
}

function MegaMenuInterestProducts({
  categorySlug,
  labels,
  onNavigate,
}: {
  categorySlug: string;
  labels: readonly string[];
  onNavigate: () => void;
}) {
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    if (hasCatalogIndexInMemory()) {
      setCatalogReady(true);
      return;
    }
    let cancelled = false;
    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) setCatalogReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const products = useMemo(
    () => (catalogReady ? getMegaMenuInterestProducts(labels, 4) : []),
    [catalogReady, labels],
  );

  if (products.length === 0) return null;

  return (
    <div className="min-w-0">
      <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        Te puede interesar
      </p>
      <ul className="grid grid-cols-2 gap-2.5 sm:gap-3" role="list">
        {products.map((product) => (
          <li key={product.id}>
            <MegaMenuLink
              to={productPath(product)}
              onNavigate={onNavigate}
              className={cn(
                'group/product flex h-full flex-col gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-2 transition-colors',
                'hover:border-[#E30613]/35 hover:bg-[#FFF5F5]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              )}
            >
              <span className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-white">
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/product:scale-[1.03]"
                    loading="lazy"
                  />
                ) : null}
              </span>
              <span className="line-clamp-2 text-[0.6875rem] font-medium leading-snug text-[#0f1f3d] group-hover/product:text-[#E30613]">
                {product.name}
              </span>
            </MegaMenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaMenuInterestBrands({
  categorySlug,
  labels,
  onNavigate,
}: {
  categorySlug: string;
  labels: readonly string[];
  onNavigate: () => void;
}) {
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    if (hasCatalogIndexInMemory()) {
      setCatalogReady(true);
      return;
    }
    let cancelled = false;
    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) setCatalogReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const brands = useMemo(
    () => (catalogReady ? getMegaMenuInterestBrands(labels, 6) : []),
    [catalogReady, labels],
  );

  if (brands.length === 0) return null;

  return (
    <div className="min-w-0 border-t border-[#E5E7EB] pt-3">
      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        Marcas
      </p>
      <ul className="flex flex-wrap items-center gap-2" role="list">
        {brands.map((brand) => {
          const logo = getBrandLogo(brand);
          const name = getBrandName(brand);
          return (
            <li key={getBrandSlug(brand)}>
              <MegaMenuLink
                to={megaMenuCategoryBrandHref(categorySlug, brand)}
                onNavigate={onNavigate}
                className={cn(
                  'inline-flex h-9 min-w-[3.5rem] items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-2.5 transition-colors',
                  'hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
                aria-label={`Ver ${name}`}
              >
                {logo ? (
                  <img src={logo} alt={name} className="max-h-5 max-w-[4.5rem] object-contain" loading="lazy" />
                ) : (
                  <span className="text-[0.6875rem] font-semibold text-[#374151]">{name}</span>
                )}
              </MegaMenuLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MegaMenuSummaryPanel({
  group,
  categorySlug,
  categoryLabels,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  categorySlug: string;
  categoryLabels: readonly string[];
  onNavigate: () => void;
}) {
  const hasSubLinks = group.links.length > 0;
  const sectionHref = megaMenuCategorySectionHref(group.href);

  return (
    <div className="flex w-max max-w-full flex-col gap-4">
      <MegaMenuColumnTitle
        group={{ ...group, href: sectionHref }}
        onNavigate={onNavigate}
        variant="summary"
      />

      <div className="flex gap-6">
        <div className="flex w-[13.5rem] max-w-[16rem] shrink-0 flex-col sm:w-[15rem]">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Subcategorías
          </p>
          {hasSubLinks ? (
            <ul className="space-y-2" role="list">
              {group.links.map((link) => (
                <li key={`${group.slug}-${link.href}-${link.name}`}>
                  <MegaMenuLink
                    to={megaMenuCategorySectionHref(link.href)}
                    onNavigate={onNavigate}
                    className={cn(
                      'block rounded-md py-0.5 text-sm leading-snug text-[#374151] transition-colors',
                      'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                    )}
                  >
                    {link.name}
                  </MegaMenuLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#6B7280]">
              Explora todos los productos de esta categoría.
            </p>
          )}

          <MegaMenuLink
            to={sectionHref}
            onNavigate={onNavigate}
            className={cn(
              'mt-4 inline-flex items-center gap-0.5 text-sm font-semibold transition-colors',
              'text-[#E30613] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            )}
          >
            Ver todo
            <ChevronRight className="size-4" aria-hidden="true" />
          </MegaMenuLink>
        </div>

        <div className="flex w-[16.5rem] max-w-[20rem] shrink-0 flex-col gap-4 sm:w-[18rem]">
          <MegaMenuInterestProducts
            categorySlug={categorySlug}
            labels={categoryLabels}
            onNavigate={onNavigate}
          />
          <MegaMenuInterestBrands
            categorySlug={categorySlug}
            labels={categoryLabels}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

function MegaMenuLinkGroup({
  group,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
}) {
  const hasSubLinks = group.links.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="min-w-0">
      {hasSubLinks ? (
        <>
          <div className="mb-1 flex items-start gap-2">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className={cn(
                'mt-2 flex size-6 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors',
                'hover:bg-[#F3F4F6] hover:text-[#E30613]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              )}
              aria-expanded={expanded}
              aria-label={expanded ? `Contraer ${group.title}` : `Expandir ${group.title}`}
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform', !expanded && '-rotate-90')}
                aria-hidden="true"
              />
            </button>
            <div className="min-w-0 flex-1">
              <MegaMenuColumnThumbnail group={group} onNavigate={onNavigate} size="mobile" />
              <MegaMenuColumnTitle group={group} onNavigate={onNavigate} variant="mobile" />
            </div>
          </div>
        </>
      ) : (
        <div className="py-1">
          <MegaMenuColumnThumbnail group={group} onNavigate={onNavigate} size="mobile" />
          <MegaMenuColumnTitle group={group} onNavigate={onNavigate} variant="mobile" />
        </div>
      )}

      {hasSubLinks && expanded ? (
        <ul className="mb-3 ml-8 space-y-1 border-l border-[#E5E7EB] pl-3" role="list">
          {group.links.map((link) => (
            <li key={`${group.slug}-${link.href}-${link.name}`}>
              <MegaMenuLink
                to={link.href}
                onNavigate={onNavigate}
                className={cn(
                  'block rounded-md py-1 text-[0.8125rem] leading-snug text-[#4B5563] transition-colors',
                  'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
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

function desktopMegaMenuGridClass(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2 sm:grid-cols-3';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';
}

function CatalogMegaMenuSidebar({
  sidebarItems,
  activeCategorySlug,
  onCategoryChange,
  onNavigate,
  isMobile,
  scrollable = false,
  asLinks = false,
  /** En escritorio: click navega a la categoría; hover actualiza el panel derecho. */
  navigateOnSelect = false,
}: {
  sidebarItems: LandingCatalogMenuSidebarItem[];
  activeCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  onNavigate?: () => void;
  isMobile: boolean;
  /** Lista vertical con scroll hasta la última categoría. */
  scrollable?: boolean;
  /** Cada ítem navega a su categoría (sin panel derecho). */
  asLinks?: boolean;
  navigateOnSelect?: boolean;
}) {
  const queryClient = useQueryClient();
  const useLinks = asLinks || navigateOnSelect;

  const prefetchSlug = (slug: string, href: string) => {
    prefetchCategoryFromHref(queryClient, href);
    prefetchCategoryPage(queryClient, {
      slug,
      subSlug: slug === 'multifuncionales' ? ALL_SUBCATEGORIES_QUERY : null,
    });
  };

  return (
    <aside
      className={cn(
        'shrink-0 border-[#E5E7EB] bg-[#FAFAFA]',
        isMobile
          ? 'border-b bg-white px-2.5 py-2'
          : cn(
              'w-[13.5rem] border-r py-2.5 pl-2.5 pr-2 sm:w-[14.25rem]',
              asLinks && 'border-r-0',
            ),
      )}
    >
      {!isMobile ? (
        <p className="mb-2 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
          Categorías
        </p>
      ) : null}

      <ul
        className={cn(
          'flex gap-1',
          isMobile
            ? 'flex-row overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : cn(
                'flex-col',
                scrollable &&
                  'max-h-[min(28rem,calc(75vh-3.5rem))] overflow-y-auto overscroll-contain pr-0.5 [-ms-overflow-style:auto] [scrollbar-width:thin]',
              ),
        )}
        role={useLinks && !navigateOnSelect ? 'list' : 'tablist'}
        aria-label="Categorías del menú"
      >
        {sidebarItems.map((item) => {
          const isActive = activeCategorySlug === item.slug;
          const Icon = item.icon;
          const href = megaMenuCategorySectionHref(
            item.viewAllHref ?? categoryLandingPath(item.slug),
          );

          const itemClassName = cn(
            'flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.8125rem] font-medium leading-snug transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            isMobile && 'whitespace-nowrap text-[0.75rem]',
            isActive
              ? 'border-l-[3px] bg-[#FFF5F5] font-semibold text-[#E30613]'
              : 'border-l-[3px] border-transparent text-[#374151] hover:bg-[#F3F4F6]',
          );

          const content = (
            <>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-md',
                  isActive
                    ? 'bg-[#E30613]/10 text-[#E30613]'
                    : 'bg-[#F3F4F6] text-[#6B7280]',
                )}
              >
                <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-pretty leading-snug">{item.label}</span>
              {!isMobile ? (
                <ChevronRight
                  className={cn(
                    'size-3.5 shrink-0',
                    isActive ? 'text-[#E30613]' : 'text-[#D1D5DB]',
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </>
          );

          return (
            <li key={item.slug} role="presentation" className={isMobile ? 'shrink-0' : undefined}>
              {useLinks ? (
                <Link
                  to={href}
                  role={navigateOnSelect ? 'tab' : undefined}
                  aria-selected={navigateOnSelect ? isActive : undefined}
                  onClick={onNavigate}
                  onMouseEnter={
                    isMobile
                      ? undefined
                      : () => {
                          prefetchSlug(item.slug, href);
                          onCategoryChange(item.slug);
                        }
                  }
                  onFocus={() => {
                    prefetchSlug(item.slug, href);
                    onCategoryChange(item.slug);
                  }}
                  className={itemClassName}
                  style={isActive ? { borderLeftColor: BRAND_RED } : undefined}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onMouseEnter={
                    isMobile
                      ? undefined
                      : () => {
                          prefetchSlug(item.slug, href);
                          onCategoryChange(item.slug);
                        }
                  }
                  onFocus={() => {
                    prefetchSlug(item.slug, href);
                    onCategoryChange(item.slug);
                  }}
                  onClick={() => onCategoryChange(item.slug)}
                  className={itemClassName}
                  style={isActive ? { borderLeftColor: BRAND_RED } : undefined}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export interface CatalogMegaMenuPanelProps {
  activeCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  sidebarItems: LandingCatalogMenuSidebarItem[];
  columnGroups: MegaMenuColumnGroup[];
  featuredContent: MegaMenuFeaturedContent;
  onNavigate: () => void;
  layout?: 'desktop' | 'mobile';
  /** Muestra imagen + lista plana cuando hay un solo grupo (p. ej. Productos). */
  desktopContentMode?: 'summary' | 'grid' | 'sidebar-only';
  /** Etiquetas de inventario para sugerir productos/marcas de la categoría activa. */
  activeCategoryLabels?: readonly string[];
}

export function CatalogMegaMenuPanel({
  activeCategorySlug,
  onCategoryChange,
  sidebarItems,
  columnGroups,
  featuredContent,
  onNavigate,
  layout = 'desktop',
  desktopContentMode = 'grid',
  activeCategoryLabels,
}: CatalogMegaMenuPanelProps) {
  void featuredContent;
  const queryClient = useQueryClient();
  const activeItem =
    sidebarItems.find((item) => item.slug === activeCategorySlug) ?? sidebarItems[0];
  const isMobile = layout === 'mobile';
  const sidebarOnly = !isMobile && desktopContentMode === 'sidebar-only';
  const useSummaryLayout = !isMobile && desktopContentMode === 'summary' && columnGroups.length === 1;
  const desktopGridClass = desktopMegaMenuGridClass(columnGroups.length);
  const categoryLabels = useMemo(() => {
    if (activeCategoryLabels && activeCategoryLabels.length > 0) return activeCategoryLabels;
    return activeItem?.label ? [activeItem.label] : [];
  }, [activeCategoryLabels, activeItem?.label]);

  const handleCategoryChange = (slug: string) => {
    prefetchCategoryPage(queryClient, {
      slug,
      subSlug: slug === 'multifuncionales' ? ALL_SUBCATEGORIES_QUERY : null,
    });
    onCategoryChange(slug);
  };

  if (sidebarOnly) {
    return (
      <div className="w-[12rem] bg-white sm:w-[12.75rem]">
        <CatalogMegaMenuSidebar
          sidebarItems={sidebarItems}
          activeCategorySlug={activeCategorySlug}
          onCategoryChange={handleCategoryChange}
          onNavigate={onNavigate}
          isMobile={false}
          scrollable
          asLinks
        />
      </div>
    );
  }

  if (!isMobile) {
    return (
      <div className="flex w-max max-w-full bg-white">
        <CatalogMegaMenuSidebar
          sidebarItems={sidebarItems}
          activeCategorySlug={activeCategorySlug}
          onCategoryChange={handleCategoryChange}
          onNavigate={onNavigate}
          isMobile={false}
          scrollable
          navigateOnSelect
        />

        <div
          className="flex w-max max-w-full flex-col"
          role="tabpanel"
          aria-label={activeItem?.label ?? 'Categoría'}
        >
          <div className="flex max-h-[min(32rem,calc(75vh-3.5rem))] flex-col overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
            {columnGroups.length > 0 ? (
              useSummaryLayout ? (
                <MegaMenuSummaryPanel
                  group={columnGroups[0]}
                  categorySlug={activeCategorySlug}
                  categoryLabels={categoryLabels}
                  onNavigate={onNavigate}
                />
              ) : (
                <div className="flex w-max max-w-full gap-8">
                  <div className={cn('grid w-max max-w-full items-start gap-x-8 gap-y-6', desktopGridClass)}>
                    {columnGroups.map((group) => (
                      <MegaMenuDesktopColumn
                        key={`${activeCategorySlug}-${group.slug}`}
                        group={group}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                  <div className="flex w-[16.5rem] shrink-0 flex-col gap-4 border-l border-[#E5E7EB] pl-6 sm:w-[18rem]">
                    <MegaMenuInterestProducts
                      categorySlug={activeCategorySlug}
                      labels={categoryLabels}
                      onNavigate={onNavigate}
                    />
                    <MegaMenuInterestBrands
                      categorySlug={activeCategorySlug}
                      labels={categoryLabels}
                      onNavigate={onNavigate}
                    />
                  </div>
                </div>
              )
            ) : (
              <p className="text-sm text-[#6B7280]">No hay categorías disponibles.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const linkGridClass =
    columnGroups.length <= 2
      ? 'grid-cols-1'
      : columnGroups.length <= 4
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex flex-col bg-white">
        <CatalogMegaMenuSidebar
          sidebarItems={sidebarItems}
          activeCategorySlug={activeCategorySlug}
          onCategoryChange={handleCategoryChange}
          isMobile
        />

      <div
        className="flex min-w-0 flex-1 flex-col"
        role="tabpanel"
        aria-label={activeItem?.label ?? 'Sección'}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold sm:text-lg" style={{ color: MEGA_MENU_NAVY }}>
                {activeItem?.label}
              </h3>
              <p className="mt-0.5 max-w-[28rem] text-pretty text-xs leading-relaxed text-[#6B7280] sm:text-sm">
                {activeItem?.description}
              </p>
            </div>
            <Link
              to={megaMenuCategorySectionHref(
                activeItem?.viewAllHref ?? categoryLandingPath(activeCategorySlug),
              )}
              onClick={onNavigate}
              onMouseEnter={() =>
                prefetchCategoryFromHref(
                  queryClient,
                  activeItem?.viewAllHref ?? categoryLandingPath(activeCategorySlug),
                )
              }
              onFocus={() =>
                prefetchCategoryFromHref(
                  queryClient,
                  activeItem?.viewAllHref ?? categoryLandingPath(activeCategorySlug),
                )
              }
              className="inline-flex min-h-8 shrink-0 items-center gap-0.5 rounded-md px-1 text-sm font-semibold transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
              style={{ color: BRAND_RED }}
            >
              Ver todo
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {columnGroups.length > 0 ? (
            <div className={cn('grid gap-x-6 gap-y-1', linkGridClass)}>
              {columnGroups.map((group) => (
                <MegaMenuLinkGroup
                  key={`${activeCategorySlug}-${group.slug}`}
                  group={group}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">No hay categorías disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
