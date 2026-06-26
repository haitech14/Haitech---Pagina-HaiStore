import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import { ALL_SUBCATEGORIES_QUERY, collectExpandedSlugsForSubcategory } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

function CategoryCount({
  count,
  subdued = false,
}: {
  count: number;
  subdued?: boolean;
}) {
  return (
    <span
      className={cn(
        'shrink-0 min-w-[1.25rem] text-right tabular-nums text-[0.65rem] font-medium',
        count === 0 || subdued
          ? 'text-muted-foreground/45'
          : 'text-muted-foreground',
      )}
    >
      {count}
    </span>
  );
}

function rootItemClass(isActiveCategory: boolean, expanded: boolean) {
  return cn(
    'relative flex min-h-10 w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-xs transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset',
    // Indicador rojo pegado al borde del recuadro (cubre el borde 1px del contenedor).
    isActiveCategory &&
      'before:absolute before:-left-px before:top-0 before:h-full before:w-[3px] before:bg-red-600',
    isActiveCategory
      ? 'bg-red-50/60 font-semibold text-red-700'
      : expanded
        ? 'bg-muted/30 font-medium text-foreground hover:bg-muted/45'
        : 'font-medium text-foreground hover:bg-muted/45',
  );
}

function subItemClass(active: boolean) {
  return cn(
    'relative flex min-h-8 w-full items-center justify-between gap-2 py-1.5 pl-7 pr-2.5 text-left text-[0.6875rem] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset',
    active
      ? 'bg-red-50/90 font-semibold text-red-700 before:absolute before:left-3 before:top-1/2 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:bg-red-600'
      : 'font-normal text-muted-foreground hover:bg-muted/50 hover:text-foreground before:absolute before:left-3 before:top-1/2 before:size-1 before:-translate-y-1/2 before:rounded-full before:bg-border',
  );
}

function subcategoryDisplayName(parentName: string, childName: string): string {
  const normalizedParent = parentName.trim();
  if (!normalizedParent) return childName;
  const lowerParent = normalizedParent.toLowerCase();
  const lowerChild = childName.trim().toLowerCase();
  if (lowerChild.startsWith(lowerParent)) {
    const stripped = childName.trim().slice(normalizedParent.length).trim();
    return stripped || childName;
  }
  return childName;
}

interface CatalogSidebarNavProps {
  categoryTree: StoreCategoryTreeNode[];
  activeCategorySlug: string;
  subSlug: string | null;
  allSubcategoriesSelected?: boolean;
  onSelectSub: (slug: string | null) => void;
  onPrefetchSub?: (slug: string) => void;
}

function NestedSubcategoryList({
  nodes,
  subSlug,
  onSelectSub,
  onPrefetchSub,
  parentName,
  depth = 0,
}: {
  nodes: StoreCategoryTreeNode[];
  subSlug: string | null;
  onSelectSub: (slug: string | null) => void;
  onPrefetchSub?: (slug: string) => void;
  parentName: string;
  depth?: number;
}) {
  return (
    <ul
      className={cn('py-0.5', depth > 0 && 'ml-3 border-l border-border/60 pl-1')}
      role="group"
    >
      {nodes.map((node) => {
        const active = subSlug === node.slug;
        const children = node.children ?? [];
        const count = node.productCount ?? 0;
        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelectSub(node.slug)}
              onMouseEnter={() => onPrefetchSub?.(node.slug)}
              onFocus={() => onPrefetchSub?.(node.slug)}
              className={subItemClass(active)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="line-clamp-2 leading-snug">{subcategoryDisplayName(parentName, node.name)}</span>
              <CategoryCount count={count} subdued={!active && count === 0} />
            </button>
            {children.length > 0 ? (
              <NestedSubcategoryList
                nodes={children}
                subSlug={subSlug}
                onSelectSub={onSelectSub}
                {...(onPrefetchSub ? { onPrefetchSub } : {})}
                parentName={node.name}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function CatalogSidebarNav({
  categoryTree,
  activeCategorySlug,
  subSlug,
  allSubcategoriesSelected = false,
  onSelectSub,
  onPrefetchSub,
}: CatalogSidebarNavProps) {
  const navigate = useNavigate();
  const initialExpandedSlugs = useMemo(
    () => collectExpandedSlugsForSubcategory(categoryTree, activeCategorySlug, subSlug),
    [categoryTree, activeCategorySlug, subSlug],
  );

  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(initialExpandedSlugs);

  useEffect(() => {
    setExpandedSlugs((prev) => {
      if (initialExpandedSlugs.size === 0) return prev;
      const next = new Set(prev);
      for (const slug of initialExpandedSlugs) next.add(slug);
      return next;
    });
  }, [initialExpandedSlugs]);

  const toggleExpanded = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <nav className="py-0.5" aria-label="Navegación por categorías del catálogo">
      {categoryTree.map((root, index) => {
        const isActiveCategory = root.slug === activeCategorySlug;
        const children = root.children ?? [];
        const hasChildren = children.length > 0;
        const expanded = hasChildren && expandedSlugs.has(root.slug);
        const rootActive =
          isActiveCategory && subSlug == null && allSubcategoriesSelected;
        const count = root.productCount ?? 0;
        const cleanCategoryHref = hasChildren
          ? `${categoryPath(root.slug)}?sub=${ALL_SUBCATEGORIES_QUERY}`
          : categoryPath(root.slug);

        return (
          <div
            key={root.id}
            className={cn(index > 0 && 'border-t border-border/50')}
          >
            <div className="relative">
              <Link
                to={
                  isActiveCategory ? cleanCategoryHref : cleanCategoryHref
                }
                className={rootItemClass(isActiveCategory, expanded)}
                aria-current={rootActive ? 'page' : undefined}
                aria-expanded={hasChildren ? expanded : undefined}
                onClick={(event) => {
                  if (!isActiveCategory) return;
                  // Si haces click nuevamente en la categoría activa, retira el filtro de categoría
                  // volviendo a "todo el catálogo" (sin filtros).
                  event.preventDefault();
                  navigate('/tienda', { replace: true, preventScrollReset: true });
                }}
              >
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  {hasChildren ? (
                    expanded ? (
                      <ChevronDown
                        className="size-3.5 shrink-0 text-red-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        className="size-3.5 shrink-0 text-muted-foreground/70"
                        aria-hidden="true"
                      />
                    )
                  ) : (
                    <span className="size-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="line-clamp-2 leading-snug">{root.name}</span>
                </span>
                <CategoryCount count={count} subdued={!isActiveCategory && count === 0} />
              </Link>

              {hasChildren ? (
                <button
                  type="button"
                  className={cn(
                    'absolute left-0 top-0 h-full w-9',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset',
                  )}
                  aria-label={expanded ? `Plegar ${root.name}` : `Desplegar ${root.name}`}
                  aria-expanded={expanded}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleExpanded(root.slug);
                  }}
                >
                  <span className="sr-only">
                    {expanded ? `Plegar ${root.name}` : `Desplegar ${root.name}`}
                  </span>
                </button>
              ) : null}
            </div>

            {hasChildren && expanded ? (
              <div className="border-l-[3px] border-red-200/80 bg-muted/15 pb-1">
                <NestedSubcategoryList
                  nodes={children}
                  subSlug={subSlug}
                  onSelectSub={onSelectSub}
                  {...(onPrefetchSub ? { onPrefetchSub } : {})}
                  parentName={root.name}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
