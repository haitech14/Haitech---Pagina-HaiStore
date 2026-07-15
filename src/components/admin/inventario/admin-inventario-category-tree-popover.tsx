import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/components/admin/categories/category-form-dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  useStoreCategoriesMutations,
  useStoreCategoriesTree,
  EMPTY_STORE_CATEGORY_TREE,
} from '@/hooks/use-store-categories';
import { categoryInventoryLabel } from '@/lib/inventory-product-category';
import {
  flattenCategoryTree,
  flatToReorderItems,
  indentCategory,
  outdentCategory,
  reorderFlatItems,
  type FlatStoreCategory,
} from '@/lib/store-category-tree';
import { cn } from '@/lib/utils';
import type { StoreCategory } from '@/types/store-category';

function labelsFromForm(values: CategoryFormValues): string[] {
  const parsed = values.inventoryLabels
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
  if (parsed.length > 0) return parsed;
  return values.name.trim() ? [values.name.trim()] : [];
}

function categoryBreadcrumbLabel(row: FlatStoreCategory, flat: FlatStoreCategory[]): string {
  const parts: string[] = [row.name];
  let parentId = row.parentId;
  while (parentId) {
    const parent = flat.find((entry) => entry.id === parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }
  return parts.join(' › ');
}

function payloadFromForm(values: CategoryFormValues): Partial<StoreCategory> {
  const payload: Partial<StoreCategory> = {
    name: values.name.trim(),
    tagline: values.tagline.trim() || null,
    image: values.image.trim() || null,
    parentId: values.parentId,
    inventoryLabels: labelsFromForm(values),
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
}

interface AdminInventarioCategoryTreePopoverProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function AdminInventarioCategoryTreePopover({
  value,
  onValueChange,
  className,
}: AdminInventarioCategoryTreePopoverProps) {
  const [open, setOpen] = useState(false);
  const [flat, setFlat] = useState<FlatStoreCategory[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'sub' | null>(null);
  const [editing, setEditing] = useState<StoreCategory | null>(null);
  const [parentForNew, setParentForNew] = useState<string | null>(null);

  const { data: tree = EMPTY_STORE_CATEGORY_TREE, isLoading } = useStoreCategoriesTree();
  const { createCategory, updateCategory, reorderCategories } = useStoreCategoriesMutations();

  useEffect(() => {
    setFlat(flattenCategoryTree(tree));
  }, [tree]);

  const selectedLabel = useMemo(() => {
    if (value === 'todos') return 'Categorías: Todas';
    const match = flat.find(
      (row) =>
        categoryInventoryLabel(row) === value ||
        row.name === value ||
        (row.inventoryLabels ?? []).includes(value),
    );
    if (match) return categoryBreadcrumbLabel(match, flat);
    return value;
  }, [flat, value]);

  const persistFlat = async (next: FlatStoreCategory[]) => {
    setFlat(next);
    try {
      await reorderCategories.mutateAsync(flatToReorderItems(next));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo reordenar las categorías',
      );
      setFlat(flattenCategoryTree(tree));
    }
  };

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = reorderFlatItems(flat, dragId, targetId);
    setDragId(null);
    await persistFlat(next);
  };

  const openCreate = (parentId: string | null = null) => {
    setEditing(null);
    setParentForNew(parentId);
    setDialogMode(parentId ? 'sub' : 'create');
  };

  const openEdit = (category: StoreCategory) => {
    setEditing(category);
    setParentForNew(category.parentId);
    setDialogMode('edit');
  };

  const selectCategory = (filterValue: string) => {
    onValueChange(filterValue);
    setOpen(false);
  };

  const isSaving =
    createCategory.isPending || updateCategory.isPending || reorderCategories.isPending;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-auto min-h-8 w-auto max-w-full min-w-[12rem] shrink-0 justify-between gap-2 bg-background px-3 py-1.5 text-xs font-normal sm:min-w-[14rem] sm:max-w-[min(36rem,calc(100vw-8rem))]',
              className,
            )}
            aria-label="Categorías"
            aria-expanded={open}
            title={selectedLabel}
          >
            <span className="min-w-0 whitespace-normal break-words text-left leading-snug">
              {selectedLabel}
            </span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[22rem] p-0"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
            <p className="text-xs font-medium text-foreground">Árbol de categorías</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => openCreate(null)}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nueva
            </Button>
          </div>

          <div className="max-h-[18rem] overflow-y-auto p-1">
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted',
                value === 'todos' && 'bg-muted font-medium',
              )}
              onClick={() => selectCategory('todos')}
            >
              <span className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">Categorías: Todas</span>
              {value === 'todos' ? (
                <Check className="size-3.5 shrink-0 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
              ) : null}
            </button>

            {isLoading ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Cargando categorías…
              </p>
            ) : flat.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No hay categorías en el árbol.
              </p>
            ) : (
              flat.map((row) => {
                const filterValue = categoryInventoryLabel(row);
                const isSelected = value === filterValue || value === row.name;
                return (
                  <div
                    key={row.id}
                    draggable
                    onDragStart={() => setDragId(row.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => void handleDrop(row.id)}
                    className={cn(
                      'group flex items-center gap-0.5 rounded-md',
                      dragId === row.id && 'bg-red-50/70',
                      isSelected && 'bg-muted',
                    )}
                  >
                    <button
                      type="button"
                      className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground active:cursor-grabbing"
                      aria-label={`Reordenar ${row.name}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <GripVertical className="size-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 pr-1 text-left text-xs hover:text-foreground"
                      style={{ paddingLeft: `${row.depth * 0.85}rem` }}
                      onClick={() => selectCategory(filterValue)}
                    >
                      {row.depth > 0 ? (
                        <ChevronRight
                          className="size-3 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span
                        className={cn(
                          'min-w-0 whitespace-normal break-words leading-snug',
                          row.depth === 0 && 'font-medium',
                        )}
                      >
                        {row.name}
                      </span>
                      {isSelected ? (
                        <Check
                          className="ml-auto size-3.5 shrink-0 text-[hsl(var(--admin-accent))]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>

                    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Añadir subcategoría en ${row.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openCreate(row.id);
                        }}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={`Editar ${row.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(row);
                        }}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={flat.findIndex((entry) => entry.id === row.id) <= 0}
                        aria-label={`Anidar ${row.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void persistFlat(indentCategory(flat, row.id));
                        }}
                      >
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={row.depth === 0}
                        aria-label={`Sacar nivel ${row.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          void persistFlat(outdentCategory(flat, row.id));
                        }}
                      >
                        <ChevronRight className="size-3.5 rotate-180" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="border-t px-3 py-2 text-[0.65rem] leading-snug text-muted-foreground">
            Arrastra para ordenar. Usa + para subcategoría, lápiz para editar e indentar/sacar
            nivel para anidar.
          </p>
        </PopoverContent>
      </Popover>

      <CategoryFormDialog
        open={dialogMode !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDialogMode(null);
        }}
        title={
          dialogMode === 'edit'
            ? 'Editar categoría'
            : dialogMode === 'sub'
              ? 'Nueva subcategoría'
              : 'Nueva categoría'
        }
        description="Las etiquetas de inventario deben coincidir con el campo categoría de los productos."
        {...(editing ? { initial: editing } : {})}
        parentId={parentForNew}
        isSaving={isSaving}
        onSubmit={async (values) => {
          const payload = payloadFromForm(values);
          try {
            if (dialogMode === 'edit' && editing) {
              await updateCategory.mutateAsync({ id: editing.id, payload });
              toast.success(`Categoría «${values.name.trim()}» actualizada`);
            } else {
              await createCategory.mutateAsync(payload);
              toast.success(`Categoría «${values.name.trim()}» creada`);
            }
            setDialogMode(null);
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'No se pudo guardar la categoría',
            );
            throw error;
          }
        }}
      />
    </>
  );
}
