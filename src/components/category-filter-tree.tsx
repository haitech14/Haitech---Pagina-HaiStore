import { useCallback, useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

function subtreeContainsSlug(node: StoreCategoryTreeNode, subSlug: string): boolean {
  if (node.slug === subSlug) return true;
  return (node.children ?? []).some((child) =>
    subtreeContainsSlug(child as StoreCategoryTreeNode, subSlug),
  );
}

interface CategoryFilterTreeProps {
  verTodoCount: number;
  subSlug: string | null;
  onSelectSub: (slug: string | null) => void;
  rootCategory?: StoreCategoryTreeNode;
}

interface TreeNodeProps {
  node: StoreCategoryTreeNode;
  depth: number;
  subSlug: string | null;
  onSelectSub: (slug: string | null) => void;
  /** Raíz de agrupación: solo expande/contrae, no aplica filtro. */
  groupOnly?: boolean;
}

function subcategoryItemClass(active: boolean) {
  return cn(
    'flex min-h-10 w-full min-w-0 flex-1 items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    active
      ? 'border-red-600 bg-red-50 text-red-700'
      : 'border-border bg-background hover:border-red-300',
  );
}

function CategoryFilterTreeNode({
  node,
  depth,
  subSlug,
  onSelectSub,
  groupOnly = false,
}: TreeNodeProps) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isActive = !groupOnly && subSlug === node.slug;
  const branchActive = subSlug != null && subtreeContainsSlug(node, subSlug);
  const [expanded, setExpanded] = useState(() => branchActive || depth === 0);

  const toggleExpanded = useCallback(() => {
    setExpanded((open) => !open);
  }, []);

  const rowLabel = (
    <>
      <span className={cn('line-clamp-2 pr-2', groupOnly && 'font-medium')}>{node.name}</span>
      <span className="ml-2 flex shrink-0 items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{node.productCount ?? 0}</span>
        {isActive ? <CheckCircle2 className="size-3.5 text-red-600" aria-hidden="true" /> : null}
      </span>
    </>
  );

  return (
    <li className="list-none" role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div className="flex min-w-0 items-stretch gap-0.5">
        {hasChildren ? (
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? `Contraer ${node.name}` : `Expandir ${node.name}`}
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            )}
          >
            <ChevronRight
              className={cn('size-3.5 transition-transform duration-150', expanded && 'rotate-90')}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="inline-flex size-10 shrink-0 items-center justify-center" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-border" />
          </span>
        )}

        {groupOnly ? (
          <div
            className={cn(
              subcategoryItemClass(false),
              'cursor-default border-dashed bg-muted/30 text-foreground',
            )}
          >
            {rowLabel}
          </div>
        ) : (
          <button type="button" onClick={() => onSelectSub(node.slug)} className={subcategoryItemClass(isActive)}>
            {rowLabel}
          </button>
        )}
      </div>

      {hasChildren && expanded ? (
        <ul
          className="mt-1 space-y-1 border-l-2 border-red-200/70 pl-2"
          style={{ marginLeft: `${(depth + 1) * 0.85}rem` }}
          role="group"
        >
          {children.map((child) => (
            <CategoryFilterTreeNode
              key={child.id}
              node={child as StoreCategoryTreeNode}
              depth={depth + 1}
              subSlug={subSlug}
              onSelectSub={onSelectSub}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CategoryFilterTree({
  verTodoCount,
  subSlug,
  onSelectSub,
  rootCategory,
}: CategoryFilterTreeProps) {
  const childNodes = rootCategory?.children ?? [];

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => onSelectSub(null)}
        className={subcategoryItemClass(subSlug === null)}
      >
        <span>Ver todo</span>
        <span className="text-xs text-muted-foreground">{verTodoCount}</span>
      </button>

      {rootCategory && childNodes.length > 0 ? (
        <ul className="space-y-1" role="tree" aria-label={`Árbol de ${rootCategory.name}`}>
          <CategoryFilterTreeNode
            node={rootCategory}
            depth={0}
            subSlug={subSlug}
            onSelectSub={onSelectSub}
            groupOnly
          />
        </ul>
      ) : childNodes.length > 0 ? (
        <ul className="space-y-1" role="tree" aria-label="Subcategorías">
          {childNodes.map((node) => (
            <CategoryFilterTreeNode
              key={node.id}
              node={node as StoreCategoryTreeNode}
              depth={0}
              subSlug={subSlug}
              onSelectSub={onSelectSub}
            />
          ))}
        </ul>
      ) : (
        <p className="px-1 text-xs text-muted-foreground">Sin subcategorías configuradas.</p>
      )}
    </div>
  );
}
