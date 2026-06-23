import { Fragment } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildCategorySelectGroups,
  collectOrphanCategoryLabels,
} from '@/lib/inventory-category-options';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const ALL_INVENTORY_CATEGORIES = 'all';

interface InventoryCategoryFilterSelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  categoryTree: StoreCategoryTreeNode[];
  productCategoryLabels: string[];
  className?: string;
}

export function InventoryCategoryFilterSelect({
  id,
  value,
  onValueChange,
  categoryTree,
  productCategoryLabels,
  className,
}: InventoryCategoryFilterSelectProps) {
  const orphans = collectOrphanCategoryLabels(categoryTree, productCategoryLabels);
  const groups = buildCategorySelectGroups(categoryTree, orphans);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Todas las categorías" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_INVENTORY_CATEGORIES}>Todas las categorías</SelectItem>
        {groups.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex > 0 ? <SelectSeparator /> : null}
            <SelectGroup>
              {group.options.map((option) => (
                <SelectItem
                  key={`${group.id}-${option.value}`}
                  value={option.value}
                  className={cn((option.depth ?? 0) === 0 && 'font-semibold')}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
