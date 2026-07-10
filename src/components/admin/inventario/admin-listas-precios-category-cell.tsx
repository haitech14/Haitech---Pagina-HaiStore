import { useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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

function categorySearchValue(node: FlatStoreCategory, nodes: FlatStoreCategory[]): string {
  const parts = [node.name, ...(node.inventoryLabels ?? [])];
  let parentId = node.parentId;
  while (parentId) {
    const parent = nodes.find((entry) => entry.id === parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }
  return parts.join(' ');
}

export function AdminListasPreciosCategoryCell({
  product,
  onPatch,
}: AdminListasPreciosCategoryCellProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();

  const flatNodes = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);
  const selectedNodes = useMemo(
    () => resolveSelectedNodes(flatNodes, product.category),
    [product.category, flatNodes],
  );
  const selectedIds = useMemo(
    () => new Set(selectedNodes.map((node) => node.id)),
    [selectedNodes],
  );

  const displayLabel =
    selectedNodes.length === 0
      ? 'Sin categoría'
      : selectedNodes.map((node) => node.name).join(', ');

  const persistSelection = async (nextNodes: FlatStoreCategory[]) => {
    const nextCategory = joinInventoryTagList(
      nextNodes.map((node) => categoryInventoryLabel(node)),
    );

    if ((product.category ?? '').trim() === nextCategory) return;

    setSaving(true);
    try {
      await onPatch({ category: nextCategory || null });
      toast.success(
        nextNodes.length === 0
          ? 'Categorías eliminadas'
          : nextNodes.length === 1
            ? `Categoría actualizada a "${nextNodes[0]!.name}"`
            : `${nextNodes.length} categorías asignadas`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo actualizar la categoría',
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const node = flatNodes.find((entry) => entry.id === nodeId);
    if (!node) return;

    const nextNodes = selectedIds.has(nodeId)
      ? selectedNodes.filter((entry) => entry.id !== nodeId)
      : [...selectedNodes, node];

    void persistSelection(nextNodes);
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
          disabled={saving}
          role="combobox"
          aria-expanded={open}
          aria-label={`Categorías de ${product.name}`}
          className={cn(
            'h-auto min-h-7 w-full min-w-[6.5rem] items-start justify-between gap-1 px-1 py-1 text-xs font-normal text-muted-foreground shadow-none hover:bg-muted/50',
            selectedNodes.length === 0 && 'text-muted-foreground/80',
          )}
        >
          <span className="min-w-0 flex-1 text-left line-clamp-2 whitespace-normal" title={displayLabel}>
            {displayLabel}
          </span>
          <ChevronsUpDown className="mt-0.5 size-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[14rem] p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command>
          <CommandInput placeholder="Buscar categoría…" aria-label="Buscar categoría" />
          <CommandList>
            <CommandEmpty>Sin coincidencias</CommandEmpty>
            <CommandGroup>
              {flatNodes.map((node) => {
                const isSelected = selectedIds.has(node.id);
                return (
                  <CommandItem
                    key={node.id}
                    value={categorySearchValue(node, flatNodes)}
                    onSelect={() => toggleNode(node.id)}
                    onMouseDown={(event) => event.preventDefault()}
                    className="cursor-pointer gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="pointer-events-none"
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        node.depth > 0 && 'text-muted-foreground',
                      )}
                      style={{ paddingLeft: `${node.depth * 0.75}rem` }}
                    >
                      {node.name}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
