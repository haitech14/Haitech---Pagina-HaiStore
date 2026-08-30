import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type {
  LandingCatalogMenuSidebarItem,
  MegaMenuColumnGroup,
  MegaMenuFeaturedContent,
} from '@/lib/mega-menu-from-store-categories';
import { categoryLandingPath } from '@/lib/category-path';
import { megaMenuCategorySectionHref } from '@/lib/mega-menu-interest';
import { megaMenuIconForSlug, resolveMegaMenuColumnImage } from '@/lib/mega-menu-visuals';
import { prefetchCategoryFromHref, prefetchCategoryPage } from '@/lib/prefetch-category-page';
import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.75;
const BRAND_RED = '#E30613';
const MEGA_MENU_NAVY = '#111827';
const MEGA_PANEL_HEIGHT = 'min(28rem,calc(72vh-3rem))';

function MegaMenuSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
      {children}
    </p>
  );
}

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
          ? 'mb-0 hover:text-[#E30613]'
          : isDesktop
            ? 'mb-2.5 hover:text-[#E30613]'
            : 'py-1.5 hover:text-[#E30613]',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-[#FFF1F1] text-[#E30613] transition-colors group-hover/title:bg-[#FFE4E4]',
          isSummary ? 'size-9' : isDesktop ? 'size-7' : 'size-6',
        )}
      >
        <Icon
          className={isSummary ? 'size-[1.125rem]' : isDesktop ? 'size-3.5' : 'size-3'}
          strokeWidth={ICON_STROKE}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          'min-w-0 text-pretty font-semibold leading-snug',
          isSummary
            ? 'text-[0.9375rem] tracking-tight text-[#111827] group-hover/title:text-[#E30613]'
            : isDesktop
              ? 'text-[0.6875rem] uppercase tracking-[0.12em] text-[#9CA3AF] group-hover/title:text-[#E30613]'
              : 'text-sm text-[#111827]',
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

function MegaMenuSummaryPanel({
  group,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
}) {
  const hasSubLinks = group.links.length > 0;
  const sectionHref = megaMenuCategorySectionHref(group.href);

  return (
    <div className="flex w-max max-w-full flex-col gap-5">
      <div className="border-b border-[#EEF0F3] pb-3">
        <MegaMenuColumnTitle
          group={{ ...group, href: sectionHref }}
          onNavigate={onNavigate}
          variant="summary"
        />
      </div>

      <div className="flex w-[14rem] max-w-[16rem] flex-col sm:w-[15.5rem]">
        <MegaMenuSectionLabel>Subcategorías</MegaMenuSectionLabel>
        {hasSubLinks ? (
          <ul className="space-y-0.5" role="list">
            {group.links.map((link) => (
              <li key={`${group.slug}-${link.href}-${link.name}`}>
                <MegaMenuLink
                  to={megaMenuCategorySectionHref(link.href)}
                  onNavigate={onNavigate}
                  className={cn(
                    'group/sub flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[0.875rem] leading-snug text-[#374151] transition-colors',
                    'hover:bg-[#F8F9FB] hover:text-[#111827]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  )}
                >
                  <span className="min-w-0">{link.name}</span>
                  <ChevronRight
                    className="size-3.5 shrink-0 text-[#D1D5DB] transition-colors group-hover/sub:text-[#E30613]"
                    aria-hidden="true"
                  />
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
            'mt-4 inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors',
            'text-[#E30613] hover:bg-[#FFF5F5]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
        >
          Ver todo
          <ChevronRight className="size-4" aria-hidden="true" />
        </MegaMenuLink>
      </div>
    </div>
  );
}

function MegaMenuMobileSubcategoryRow({
  group,
  onNavigate,
}: {
  group: MegaMenuColumnGroup;
  onNavigate: () => void;
}) {
  const hasSubLinks = group.links.length > 0;
  const [expanded, setExpanded] = useState(false);
  const Icon = megaMenuIconForSlug(group.slug);

  if (!hasSubLinks) {
    return (
      <MegaMenuLink
        to={group.href}
        onNavigate={onNavigate}
        className={cn(
          'flex items-center gap-3 border-b border-[#EEF0F3] px-3 py-3.5 last:border-b-0',
          'transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F1] text-[#E30613]">
          <Icon className="size-4" strokeWidth={ICON_STROKE} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-pretty text-sm font-semibold text-[#111827]">
          {group.title}
        </span>
        <ChevronRight className="size-4 shrink-0 text-[#D1D5DB]" aria-hidden="true" />
      </MegaMenuLink>
    );
  }

  return (
    <div className="border-b border-[#EEF0F3] last:border-b-0">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className={cn(
          'flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F1] text-[#E30613]">
          <Icon className="size-4" strokeWidth={ICON_STROKE} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-pretty text-sm font-semibold text-[#111827]">
          {group.title}
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-[#9CA3AF] transition-transform', expanded && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {expanded ? (
        <ul className="space-y-0.5 border-t border-[#EEF0F3] bg-white pb-2 pt-1" role="list">
          {group.links.map((link) => (
            <li key={`${group.slug}-${link.href}-${link.name}`}>
              <MegaMenuLink
                to={link.href}
                onNavigate={onNavigate}
                className={cn(
                  'flex items-center gap-2 rounded-md py-2 pl-14 pr-3 text-[0.8125rem] leading-snug text-[#4B5563]',
                  'transition-colors hover:bg-[#F9FAFB] hover:text-[#E30613]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
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

function MobileCatalogMegaMenuAccordion({
  sidebarItems,
  getColumnGroupsForSlug,
  onNavigate,
  initialOpenSlug,
}: {
  sidebarItems: LandingCatalogMenuSidebarItem[];
  getColumnGroupsForSlug: (slug: string) => MegaMenuColumnGroup[];
  onNavigate: () => void;
  initialOpenSlug?: string;
}) {
  const queryClient = useQueryClient();
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpenSlug ?? sidebarItems[0]?.slug ?? null);

  return (
    <div className="px-1 py-2">
      {sidebarItems.map((item) => {
        const isOpen = openSlug === item.slug;
        const Icon = item.icon;
        const groups = getColumnGroupsForSlug(item.slug);
        const viewAllHref = megaMenuCategorySectionHref(
          item.viewAllHref ?? categoryLandingPath(item.slug),
        );

        return (
          <div key={item.slug} className="border-b border-[#EEF0F3] last:border-b-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenSlug(isOpen ? null : item.slug)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors',
                'hover:bg-[#FAFBFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
                isOpen && 'bg-[#FFF8F8]',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  isOpen ? 'bg-[#FFF1F1] text-[#E30613]' : 'bg-[#F3F4F6] text-[#6B7280]',
                )}
              >
                <Icon className="size-4" strokeWidth={ICON_STROKE} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-pretty text-sm font-semibold text-[#111827]">
                {item.label}
              </span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-[#9CA3AF] transition-transform',
                  isOpen && 'rotate-180 text-[#E30613]',
                )}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div className="px-2 pb-3">
                {item.description ? (
                  <p className="mb-2 px-2 text-pretty text-xs leading-relaxed text-[#6B7280]">
                    {item.description}
                  </p>
                ) : null}

                <Link
                  to={viewAllHref}
                  onClick={onNavigate}
                  onMouseEnter={() => prefetchCategoryFromHref(queryClient, viewAllHref)}
                  onFocus={() => prefetchCategoryFromHref(queryClient, viewAllHref)}
                  className="mb-2 inline-flex items-center gap-0.5 px-2 text-sm font-semibold text-[#E30613] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
                >
                  Ver todo
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>

                {groups.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-[#EEF0F3] bg-[#FAFBFC]">
                    {groups.map((group) => (
                      <MegaMenuMobileSubcategoryRow
                        key={`${item.slug}-${group.slug}`}
                        group={group}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="px-2 text-sm text-[#6B7280]">No hay subcategorías disponibles.</p>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
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
        'shrink-0 border-[#EEF0F3]',
        isMobile
          ? 'border-b bg-white px-2.5 py-2'
          : cn(
              'flex w-[14.5rem] flex-col border-r bg-[#F7F8FA] py-3 pl-2.5 pr-2 sm:w-[15.25rem]',
              asLinks && 'border-r-0',
            ),
      )}
      style={!isMobile && scrollable ? { height: MEGA_PANEL_HEIGHT } : undefined}
    >
      {!isMobile ? (
        <MegaMenuSectionLabel>
          <span className="px-1.5">Categorías</span>
        </MegaMenuSectionLabel>
      ) : null}

      <ul
        className={cn(
          'flex gap-0.5',
          isMobile
            ? 'flex-row overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : cn(
                'min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pr-1',
                '[scrollbar-width:thin] [scrollbar-color:#D1D5DB_transparent]',
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
            'relative flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.8125rem] font-medium leading-snug transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-1',
            isMobile && 'whitespace-nowrap text-[0.75rem]',
            isActive
              ? 'bg-white font-semibold text-[#E30613] shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]'
              : 'text-[#4B5563] hover:bg-white/80 hover:text-[#111827]',
          );

          const content = (
            <>
              {isActive ? (
                <span
                  className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#E30613]"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md',
                  isActive
                    ? 'bg-[#FFF1F1] text-[#E30613]'
                    : 'bg-white/70 text-[#6B7280] ring-1 ring-black/[0.04]',
                )}
              >
                <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-pretty leading-snug">{item.label}</span>
              {!isMobile ? (
                <ChevronRight
                  className={cn(
                    'size-3.5 shrink-0 transition-opacity',
                    isActive ? 'text-[#E30613] opacity-100' : 'text-[#D1D5DB] opacity-70',
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
  /** Móvil: resuelve subcategorías por slug para acordeón vertical. */
  getColumnGroupsForSlug?: (categorySlug: string) => MegaMenuColumnGroup[];
  /** Muestra imagen + lista plana cuando hay un solo grupo (p. ej. Productos). */
  desktopContentMode?: 'summary' | 'grid' | 'sidebar-only';
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
  getColumnGroupsForSlug,
  desktopContentMode = 'grid',
  activeCategoryLabels,
}: CatalogMegaMenuPanelProps) {
  void featuredContent;
  void activeCategoryLabels;
  const queryClient = useQueryClient();
  const activeItem =
    sidebarItems.find((item) => item.slug === activeCategorySlug) ?? sidebarItems[0];
  const isMobile = layout === 'mobile';
  const sidebarOnly = !isMobile && desktopContentMode === 'sidebar-only';
  const useSummaryLayout = !isMobile && desktopContentMode === 'summary' && columnGroups.length === 1;
  const desktopGridClass = desktopMegaMenuGridClass(columnGroups.length);

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
      <div className="flex w-max max-w-full bg-white" style={{ height: MEGA_PANEL_HEIGHT }}>
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
          className="flex min-h-0 w-max max-w-full flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D1D5DB_transparent]"
          role="tabpanel"
          aria-label={activeItem?.label ?? 'Categoría'}
        >
          <div className="flex flex-col px-6 py-5 sm:px-7 sm:py-6">
            {columnGroups.length > 0 ? (
              useSummaryLayout ? (
                <MegaMenuSummaryPanel group={columnGroups[0]} onNavigate={onNavigate} />
              ) : (
                <div className={cn('grid w-max max-w-full items-start gap-x-8 gap-y-6', desktopGridClass)}>
                  {columnGroups.map((group) => (
                    <MegaMenuDesktopColumn
                      key={`${activeCategorySlug}-${group.slug}`}
                      group={group}
                      onNavigate={onNavigate}
                    />
                  ))}
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

  if (isMobile && getColumnGroupsForSlug) {
    return (
      <div className="flex flex-col bg-white">
        <MobileCatalogMegaMenuAccordion
          sidebarItems={sidebarItems}
          getColumnGroupsForSlug={getColumnGroupsForSlug}
          onNavigate={onNavigate}
          initialOpenSlug={activeCategorySlug}
        />
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
