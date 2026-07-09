import { useMemo } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EMPTY_STORE_CATEGORY_TREE, useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  categoryInventoryLabel,
  listRootCategories,
  resolveProductCategoryPlacement,
} from '@/lib/inventory-product-category';
import { inventoryCategoryParentLabel } from '@/lib/inventory-stock-status';
import type { InventoryProduct } from '@/types/product';

interface AdminListasPreciosCategoryCellProps {
  product: InventoryProduct;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

export function AdminListasPreciosCategoryCell({
  product,
  onPatch,
}: AdminListasPreciosCategoryCellProps) {
  const { data: categoryTree = EMPTY_STORE_CATEGORY_TREE } = useStoreCategoriesTree();

  const placement = useMemo(
    () => resolveProductCategoryPlacement(categoryTree, product.category),
    [categoryTree, product.category],
  );

  const roots = useMemo(() => listRootCategories(categoryTree), [categoryTree]);

  const displayLabel =
    placement.parent?.name ??
    (placement.raw ? inventoryCategoryParentLabel(placement.raw) : 'Sin categoría');

  const selectedId = placement.parent?.id ?? '';

  const handleChange = async (parentId: string) => {
    const parent = roots.find((node) => node.id === parentId);
    if (!parent) return;

    try {
      await onPatch({ category: categoryInventoryLabel(parent) });
      toast.success(`Categoría actualizada a "${parent.name}"`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo actualizar la categoría',
      );
    }
  };

  if (roots.length === 0) {
    return <span className="text-xs text-muted-foreground">{displayLabel}</span>;
  }

  return (
    <Select value={selectedId || undefined} onValueChange={(value) => void handleChange(value)}>
      <SelectTrigger
        className="h-7 w-full min-w-[6.5rem] border-0 bg-transparent px-1 text-xs text-muted-foreground shadow-none hover:bg-muted/50 focus:ring-1"
        aria-label={`Categoría de ${product.name}`}
      >
        <SelectValue placeholder={displayLabel}>{displayLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {roots.map((node) => (
          <SelectItem key={node.id} value={node.id}>
            {node.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
