import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EMPTY_STORE_CATEGORY_TREE, useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { normalizeCategoryName } from '@/lib/catalog-featured';
import {
  categoryInventoryLabel,
  nodeMatchesLabel,
} from '@/lib/inventory-product-category';
import { joinInventoryTagList, parseInventoryTagList } from '@/lib/inventory-tags';
import { flattenCategoryTree, type FlatStoreCategory } from '@/lib/store-category-tree';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

interface AdminListasPreciosCategoryCellProps {
  product: InventoryProduct;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

function resolveSelectedNodes(
  nodes: FlatStoreCategory[],
  categoryLabel: string | null | undefined,
): FlatStoreCategory[] {
  const tags = parseInventoryTagList(categoryLabel);
  if (tags.length === 0) return [];

  return nodes.filter((node) =>
    tags.some(
      (tag) =>
        nodeMatchesLabel(node, tag) ||
        normalizeCategoryName(categoryInventoryLabel(node)) === normalizeCategoryName(tag),
    ),
  );
}

function nodeSearchHaystack(node: FlatStoreCategory): string {
  return normalizeCategoryName(
    [node.name, categoryInventoryLabel(node), ...(node.inventoryLabels ?? [])].join(' '),
  );
}

function collectAncestorIds(
  node: FlatStoreCategory,
  byId: Map<string, FlatStoreCategory>,
): string[] {
  const ids: string[] = [];
  let parentId = node.parentId;
  while (parentId) {
    ids.push(parentId);
    parentId = byId.get(parentId)?.parentId ?? null;
  }
  return ids;
}

function AdminListasPreciosCategoryCellComponent({
  product,
  onPatch,
}: AdminListasPreciosCategoryCellProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());
  /** Selección optimista mientras el PATCH confirma (checkboxes al instante). */
  const [optimisticIds, setOptimisticIds] = useState<string[] | null>(null);
  const patchGenerationRef = useRef(0);
  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();

  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);
  const nodesById = useMemo(
    () => new Map(flatNodes.map((node) => [node.id, node])),
    [flatNodes],
  );
  const childIdsByParent = useMemo(() => {
    const map = new Map<string | null, string[]>();
    for (const node of flatNodes) {
      const key = node.parentId;
      const list = map.get(key) ?? [];
      list.push(node.id);
      map.set(key, list);
    }
    return map;
  }, [flatNodes]);

  const selectedNodes = useMemo(
    () => resolveSelectedNodes(flatNodes, product.category),
    [product.category, flatNodes],
  );
  const committedIds = useMemo(
    () => selectedNodes.map((node) => node.id),
    [selectedNodes],
  );

  useEffect(() => {
    if (!optimisticIds) return;
    if (
      optimisticIds.length === committedIds.length &&
      optimisticIds.every((id) => committedIds.includes(id))
    ) {
      setOptimisticIds(null);
    }
  }, [committedIds, optimisticIds]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const activeIds = useMemo(() => {
    const ids = optimisticIds ?? committedIds;
    return new Set(ids);
  }, [committedIds, optimisticIds]);

  const activeNodes = useMemo(
    () => flatNodes.filter((node) => activeIds.has(node.id)),
    [activeIds, flatNodes],
  );

  const displayLabel = useMemo(() => {
    const tags = parseInventoryTagList(product.category);
    const nodesForLabel = optimisticIds ? activeNodes : selectedNodes;
    if (nodesForLabel.length === 0 && tags.length === 0) return 'Sin categoría';
    if (nodesForLabel.length === 0) return tags.join(', ');
    const matched = new Set(
      nodesForLabel.flatMap((node) => [
        normalizeCategoryName(node.name),
        normalizeCategoryName(categoryInventoryLabel(node)),
        ...(node.inventoryLabels ?? []).map(normalizeCategoryName),
      ]),
    );
    const unresolved = optimisticIds
      ? []
      : tags.filter((tag) => !matched.has(normalizeCategoryName(tag)));
    return [...nodesForLabel.map((node) => node.name), ...unresolved].join(', ');
  }, [activeNodes, optimisticIds, product.category, selectedNodes]);

  const visibleNodes = useMemo(() => {
    const normalizedQuery = normalizeCategoryName(query.trim());
    const hasQuery = normalizedQuery.length > 0;

    let matchingIds = new Set(flatNodes.map((node) => node.id));
    if (hasQuery) {
      matchingIds = new Set<string>();
      for (const node of flatNodes) {
        if (!nodeSearchHaystack(node).includes(normalizedQuery)) continue;
        matchingIds.add(node.id);
        for (const ancestorId of collectAncestorIds(node, nodesById)) {
          matchingIds.add(ancestorId);
        }
      }
    }

    const hiddenByCollapse = new Set<string>();
    if (!hasQuery) {
      for (const node of flatNodes) {
        if (!node.parentId) continue;
        const ancestors = collectAncestorIds(node, nodesById);
        if (ancestors.some((id) => collapsedIds.has(id))) {
          hiddenByCollapse.add(node.id);
        }
      }
    }

    return flatNodes.filter(
      (node) => matchingIds.has(node.id) && !hiddenByCollapse.has(node.id),
    );
  }, [collapsedIds, flatNodes, nodesById, query]);

  const persistSelection = async (nextNodes: FlatStoreCategory[]) => {
    const nextCategory = joinInventoryTagList(
      nextNodes.map((node) => categoryInventoryLabel(node)),
    );
    const generation = ++patchGenerationRef.current;

    try {
      await onPatch({ category: nextCategory || null });
      if (generation !== patchGenerationRef.current) return;
      toast.success(
        nextNodes.length === 0
          ? 'Categorías eliminadas'
          : nextNodes.length === 1
            ? `Categoría actualizada a "${nextNodes[0]!.name}"`
            : `${nextNodes.length} categorías asignadas`,
      );
    } catch (error) {
      if (generation !== patchGenerationRef.current) return;
      setOptimisticIds(null);
      toast.error(
        error instanceof Error ? error.message : 'No se pudo actualizar la categoría',
      );
    }
  };

  const toggleNode = (nodeId: string) => {
    const node = nodesById.get(nodeId);
    if (!node) return;

    const nextIds = activeIds.has(nodeId)
      ? [...activeIds].filter((id) => id !== nodeId)
      : [...activeIds, nodeId];
    const nextNodes = flatNodes.filter((entry) => nextIds.includes(entry.id));

    setOptimisticIds(nextIds);
    void persistSelection(nextNodes);
  };

  const toggleCollapsed = (nodeId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  if (flatNodes.length === 0) {
    return <span className="text-xs text-muted-foreground">{displayLabel}</span>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label={`Categorías de ${product.name}`}
          className={cn(
            'h-auto min-h-5 w-full min-w-[10rem] items-start justify-between gap-1 px-1 py-0.5 text-[0.6875rem] leading-tight font-normal text-muted-foreground shadow-none hover:bg-muted/50',
            activeNodes.length === 0 && 'text-muted-foreground/80',
          )}
        >
          <span className="min-w-0 flex-1 whitespace-normal break-words text-left">
            {displayLabel}
          </span>
          <ChevronsUpDown className="mt-0.5 size-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b px-3 py-2">
          <p className="mb-1.5 text-xs font-medium text-foreground">Árbol taxonómico</p>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
            className="h-8 bg-background text-xs"
          />
        </div>

        <div className="max-h-[18rem] overflow-y-auto p-1" role="tree">
          {visibleNodes.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Sin coincidencias
            </p>
          ) : (
            visibleNodes.map((node) => {
              const isSelected = activeIds.has(node.id);
              const hasChildren = (childIdsByParent.get(node.id)?.length ?? 0) > 0;
              const isCollapsed = collapsedIds.has(node.id);
              const searchActive = normalizeCategoryName(query.trim()).length > 0;

              return (
                <div
                  key={node.id}
                  role="treeitem"
                  aria-expanded={hasChildren ? !isCollapsed || searchActive : undefined}
                  className="flex items-start gap-0.5 rounded-md hover:bg-muted/60"
                  style={{ paddingLeft: `${0.35 + node.depth * 0.85}rem` }}
                >
                  {hasChildren && !searchActive ? (
                    <button
                      type="button"
                      className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={
                        isCollapsed ? `Expandir ${node.name}` : `Contraer ${node.name}`
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => toggleCollapsed(node.id)}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex size-6 shrink-0" aria-hidden="true" />
                  )}

                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-2 py-1.5 pr-2 text-left text-xs"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleNode(node.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none mt-0.5"
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 whitespace-normal break-words leading-snug',
                        node.depth === 0 ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {node.name}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const AdminListasPreciosCategoryCell = memo(AdminListasPreciosCategoryCellComponent);
