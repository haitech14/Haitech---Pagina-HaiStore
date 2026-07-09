import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type {
  LandingCatalogMenuSidebarItem,
  MegaMenuColumnGroup,
  MegaMenuFeaturedContent,
} from '@/lib/mega-menu-from-store-categories';
import { categoryLandingPath } from '@/lib/category-path';
import { megaMenuIconForSlug, resolveMegaMenuColumnImage } from '@/lib/mega-menu-visuals';
import { cn } from '@/lib/utils';

const ICON_STROKE = 1.75;
const BRAND_RED = '#E30613';
const MEGA_MENU_NAVY = '#0f1f3d';

function desktopMegaMenuGridClass(count: number): string {
  if (count <= 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  if (count === 9) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';
  if (count === 10) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5';
  if (count === 11) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
  if (count === 12) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
  return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
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
  return (
    <Link to={to} onClick={onNavigate} className={className}>
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
  size?: 'desktop' | 'mobile';
}) {
  const imageSrc = resolveMegaMenuColumnImage(group.slug, group.image);
  const heightClass = size === 'desktop' ? 'h-[4.5rem]' : 'h-14';

  return (
    <MegaMenuLink
      to={group.href}
      onNavigate={onNavigate}
      className="group/thumb block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
    >
      <span
        className={cn(
          'mb-2.5 flex items-center justify-center overflow-hidden rounded-md bg-[#F9FAFB] p-2 transition-colors group-hover/thumb:bg-[#F3F4F6]',
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
  variant?: 'desktop' | 'mobile';
}) {
  const Icon = megaMenuIconForSlug(group.slug);
  const isDesktop = variant === 'desktop';

  return (
    <MegaMenuLink
      to={group.href}
      onNavigate={onNavigate}
      className={cn(
        'group/title inline-flex max-w-full items-center gap-2 rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        isDesktop ? 'mb-2.5 hover:text-[#E30613]' : 'py-1.5 hover:text-[#E30613]',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-[#FFF5F5] text-[#E30613] transition-colors group-hover/title:bg-[#FEE2E2]',
          isDesktop ? 'size-7' : 'size-6',
        )}
      >
        <Icon
          className={isDesktop ? 'size-3.5' : 'size-3'}
          strokeWidth={ICON_STROKE}
          aria-hidden="true"
        />
      </span>
      <span
        className={cn(
          'min-w-0 text-pretty font-semibold leading-snug',
          isDesktop
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
    <div className="flex h-full min-w-0 flex-col">
      <MegaMenuColumnThumbnail group={group} onNavigate={onNavigate} />
      <MegaMenuColumnTitle group={group} onNavigate={onNavigate} />

      {hasSubLinks ? (
        <ul className="mb-3 flex-1 space-y-1.5" role="list">
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
      ) : (
        <div className="mb-3 flex-1" aria-hidden="true" />
      )}

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

export interface CatalogMegaMenuPanelProps {
  activeCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  sidebarItems: LandingCatalogMenuSidebarItem[];
  columnGroups: MegaMenuColumnGroup[];
  featuredContent: MegaMenuFeaturedContent;
  onNavigate: () => void;
  layout?: 'desktop' | 'mobile';
}

export function CatalogMegaMenuPanel({
  activeCategorySlug,
  onCategoryChange,
  sidebarItems,
  columnGroups,
  featuredContent,
  onNavigate,
  layout = 'desktop',
}: CatalogMegaMenuPanelProps) {
  void featuredContent;
  const activeItem =
    sidebarItems.find((item) => item.slug === activeCategorySlug) ?? sidebarItems[0];
  const isMobile = layout === 'mobile';

  const desktopGridClass = desktopMegaMenuGridClass(columnGroups.length);

  if (!isMobile) {
    return (
      <div className="bg-white px-5 py-5 sm:px-6 sm:py-6">
        {columnGroups.length > 0 ? (
          <div className={cn('grid items-stretch gap-x-8 gap-y-6', desktopGridClass)}>
            {columnGroups.map((group) => (
              <MegaMenuDesktopColumn
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
      <aside className="shrink-0 border-b border-[#E5E7EB] bg-white px-3 py-2.5">
        <ul
          className="flex flex-row gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Secciones del menú"
        >
          {sidebarItems.map((item) => {
            const isActive = activeCategorySlug === item.slug;
            const Icon = item.icon;

            return (
              <li key={item.slug} role="presentation" className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onFocus={() => onCategoryChange(item.slug)}
                  onClick={() => onCategoryChange(item.slug)}
                  className={cn(
                    'flex min-h-9 items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                    'whitespace-nowrap',
                    isActive
                      ? 'border-l-[3px] bg-[#FFF5F5] font-semibold text-[#E30613]'
                      : 'border-l-[3px] border-transparent text-[#374151] hover:bg-[#F9FAFB]',
                  )}
                  style={isActive ? { borderLeftColor: BRAND_RED } : undefined}
                >
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
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

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
              to={activeItem?.viewAllHref ?? categoryLandingPath(activeCategorySlug)}
              onClick={onNavigate}
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
