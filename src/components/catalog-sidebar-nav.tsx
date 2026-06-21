import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { categoryPath } from '@/lib/category-path';
import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

function itemClass(active: boolean) {
  return cn(
    'flex min-h-10 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    active
      ? 'border-red-600 bg-red-50 font-medium text-red-700'
      : 'border-border bg-background text-foreground hover:border-red-300',
  );
}

interface CatalogSidebarNavProps {
  categoryTree: StoreCategoryTreeNode[];
  activeCategorySlug: string;
  subSlug: string | null;
  allSubcategoriesSelected?: boolean;
  onSelectSub: (slug: string | null) => void;
}

function SubcategoryList({
  nodes,
  subSlug,
  onSelectSub,
  depth = 0,
}: {
  nodes: StoreCategoryTreeNode[];
  subSlug: string | null;
  onSelectSub: (slug: string | null) => void;
  depth?: number;
}) {
  return (
    <ul
      className={cn('mt-1 space-y-1', depth > 0 && 'border-l-2 border-red-200/60 pl-2')}
      role="group"
    >
      {nodes.map((node) => {
        const active = subSlug === node.slug;
        const children = node.children ?? [];
        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelectSub(node.slug)}
              className={itemClass(active)}
            >
              <span className="line-clamp-2">{node.name}</span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                {node.productCount ?? 0}
                {active ? <CheckCircle2 className="size-3.5 text-red-600" aria-hidden="true" /> : null}
              </span>
            </button>
            {children.length > 0 ? (
              <SubcategoryList
                nodes={children}
                subSlug={subSlug}
                onSelectSub={onSelectSub}
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
}: CatalogSidebarNavProps) {
  const activeRoot = categoryTree.find((node) => node.slug === activeCategorySlug);
  const subcategories = activeRoot?.children ?? [];

  return (
    <nav className="space-y-1" aria-label="Navegación por categorías del catálogo">
      {categoryTree.map((root) => {
        const isActiveCategory = root.slug === activeCategorySlug;
        const showSubs = isActiveCategory && (root.children?.length ?? 0) > 0;

        return (
          <div key={root.id} className="space-y-1">
            <Link
              to={
                root.slug === 'multifuncionales'
                  ? `${categoryPath(root.slug)}?sub=${ALL_SUBCATEGORIES_QUERY}`
                  : categoryPath(root.slug)
              }
              className={itemClass(isActiveCategory && (subSlug == null && allSubcategoriesSelected))}
              aria-current={
                isActiveCategory && subSlug == null && allSubcategoriesSelected ? 'page' : undefined
              }
            >
              <span className="line-clamp-2">{root.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {root.productCount ?? 0}
              </span>
            </Link>

            {showSubs ? (
              <div className="ml-1 space-y-1 border-l-2 border-border/80 pl-2">
                <SubcategoryList
                  nodes={subcategories}
                  subSlug={subSlug}
                  onSelectSub={onSelectSub}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
