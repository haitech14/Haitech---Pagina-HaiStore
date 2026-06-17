import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import {
  megaMenuDestacadosColumnGroups,
  megaMenuPartnerBrands,
  megaMenuSectionMeta,
  megaMenuServiciosColumnGroups,
  type MegaMenuSectionId,
} from '@/data/mega-menu';
import {
  buildMegaMenuColumnGroupsForSection,
  type MegaMenuColumnGroup,
} from '@/lib/mega-menu-from-store-categories';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const ICON_STROKE = 1.5;

type MegaMenuCatalogSectionId = Exclude<MegaMenuSectionId, 'destacados' | 'servicios'>;

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
  return (
    <div className="flex min-w-0 flex-col">
      <MegaMenuLink
        to={group.href}
        onNavigate={onNavigate}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex h-28 items-center justify-center overflow-hidden rounded-md bg-muted/30 p-3 transition-colors group-hover:bg-muted/50 sm:h-32">
          <img
            src={group.image}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </span>
      </MegaMenuLink>

      <h4 className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-foreground">
        {group.title}
      </h4>

      <ul className="mt-2 space-y-1.5" role="list">
        {group.links.map((link) => (
          <li key={`${group.slug}-${link.href}-${link.name}`}>
            <MegaMenuLink
              to={link.href}
              onNavigate={onNavigate}
              className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.name}
            </MegaMenuLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaMenuBrandStrip({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="border-t border-border/60 bg-muted/20 px-4 py-3 sm:px-5">
      <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Marcas que distribuimos
      </p>
      <ul className="flex flex-wrap items-center gap-3 sm:gap-4" role="list">
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

function columnGroupsForSection(
  sectionId: MegaMenuSectionId,
  tree: StoreCategoryTreeNode[],
): MegaMenuColumnGroup[] {
  if (sectionId === 'destacados') return [...megaMenuDestacadosColumnGroups];
  if (sectionId === 'servicios') return [...megaMenuServiciosColumnGroups];
  return buildMegaMenuColumnGroupsForSection(sectionId as MegaMenuCatalogSectionId, tree);
}

function sectionShowsBrands(sectionId: MegaMenuSectionId): boolean {
  return sectionId === 'impresion' || sectionId === 'suministros' || sectionId === 'tecnologia';
}

export interface CatalogMegaMenuPanelProps {
  activeSection: MegaMenuSectionId;
  onSectionChange: (sectionId: MegaMenuSectionId) => void;
  sidebarSectionIds: MegaMenuSectionId[];
  onNavigate: () => void;
  layout?: 'desktop' | 'mobile';
}

export function CatalogMegaMenuPanel({
  activeSection,
  onSectionChange,
  sidebarSectionIds,
  onNavigate,
  layout = 'desktop',
}: CatalogMegaMenuPanelProps) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const sidebarItems = sidebarSectionIds.map((id) => ({
    id,
    ...megaMenuSectionMeta[id],
  }));
  const columnGroups = columnGroupsForSection(activeSection, categoryTree);
  const activeMeta = megaMenuSectionMeta[activeSection];
  const isMobile = layout === 'mobile';

  const sectionViewAllHref =
    activeSection === 'servicios'
      ? '/servicios'
      : activeSection === 'destacados'
        ? '/tienda'
        : columnGroups[0]?.href ?? '/tienda';

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
            : 'w-[12.5rem] border-r py-3 pl-3 pr-2',
        )}
      >
        {!isMobile ? (
          <p className="mb-2 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Categorías
          </p>
        ) : null}

        <ul
          className={cn(
            'flex gap-1',
            isMobile
              ? 'flex-row overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
              : 'flex-col',
          )}
          role="tablist"
          aria-label="Secciones del catálogo"
        >
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <li key={item.id} role="presentation" className={isMobile ? 'shrink-0' : undefined}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onMouseEnter={isMobile ? undefined : () => onSectionChange(item.id)}
                  onFocus={() => onSectionChange(item.id)}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isMobile && 'whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted/80',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md',
                      isActive ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={ICON_STROKE} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-pretty leading-snug">{item.label}</span>
                  {!isMobile ? (
                    <ChevronRight
                      className={cn(
                        'size-3.5 shrink-0',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground/70',
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div
        className="flex min-w-0 flex-1 flex-col"
        role="tabpanel"
        aria-label={activeMeta.label}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground sm:text-lg">{activeMeta.label}</h3>
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{activeMeta.description}</p>
            </div>
            <Link
              to={sectionViewAllHref}
              onClick={onNavigate}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todo
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {columnGroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {columnGroups.map((group) => (
                <MegaMenuColumn key={`${activeSection}-${group.slug}`} group={group} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay categorías disponibles.</p>
          )}
        </div>

        {sectionShowsBrands(activeSection) ? <MegaMenuBrandStrip onNavigate={onNavigate} /> : null}
      </div>
    </div>
  );
}
