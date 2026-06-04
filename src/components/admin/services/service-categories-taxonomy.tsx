import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  compareServiceCategoryByCode,
  serviceCategoryCode,
  type ServiceCategoryWithOrder,
} from '@/lib/service-categories-taxonomy';
import { cn } from '@/lib/utils';

interface ServiceCategoriesTaxonomyProps {
  categories: ServiceCategoryWithOrder[];
  onToggleCategory: (id: string) => void;
  onPatchCategoryField: (id: string, field: 'name' | 'description', value: string) => void;
}

export function ServiceCategoriesTaxonomy({
  categories,
  onToggleCategory,
  onPatchCategoryField,
}: ServiceCategoriesTaxonomyProps) {
  const sorted = useMemo(
    () => [...categories].sort(compareServiceCategoryByCode),
    [categories],
  );

  if (sorted.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        No hay categorías de servicio configuradas.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-card" role="list" aria-label="Categorías de servicio">
      {sorted.map((category) => {
        const code = serviceCategoryCode(category);
        return (
          <li
            key={category.id}
            className={cn(
              'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4',
              !category.active && 'opacity-60',
            )}
          >
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(7rem,auto)_1fr_1.2fr] sm:items-center sm:gap-3">
              <span className="font-mono text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                {code}
              </span>
              <div>
                <Label htmlFor={`cat-name-${category.id}`} className="sr-only">
                  Nombre de categoría
                </Label>
                <Input
                  id={`cat-name-${category.id}`}
                  value={category.name}
                  className="h-10 font-medium"
                  onChange={(e) => onPatchCategoryField(category.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`cat-desc-${category.id}`} className="sr-only">
                  Descripción de categoría
                </Label>
                <Input
                  id={`cat-desc-${category.id}`}
                  value={category.description}
                  className="h-10 text-sm"
                  onChange={(e) => onPatchCategoryField(category.id, 'description', e.target.value)}
                />
              </div>
            </div>

            <Button
              type="button"
              variant={category.active ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'min-h-10 w-full shrink-0 sm:w-auto sm:min-w-[5.5rem]',
                category.active && 'bg-[hsl(var(--admin-accent))]',
              )}
              onClick={() => onToggleCategory(category.id)}
            >
              {category.active ? 'Activa' : 'Inactiva'}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
