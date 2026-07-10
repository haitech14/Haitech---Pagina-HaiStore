import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/components/admin/categories/category-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesMutations,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
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

function filterFlatBySearch(flat: FlatStoreCategory[], search: string): FlatStoreCategory[] {
  const query = search.trim().toLowerCase();
  if (!query) return flat;

  const byId = new Map(flat.map((row) => [row.id, row]));
  const matchIds = new Set(
    flat
      .filter((row) => {
        const haystack = [
          row.name,
          row.slug,
          row.tagline ?? '',
          ...(row.inventoryLabels ?? []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .map((row) => row.id),
  );

  const keep = new Set<string>();
  for (const id of matchIds) {
    let current: FlatStoreCategory | undefined = byId.get(id);
    while (current) {
      keep.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }

  return flat.filter((row) => keep.has(row.id));
}

interface AdminCategoriasTreePanelProps {
  search?: string;
  createTick?: number;
  className?: string;
}

export function AdminCategoriasTreePanel({
  search = '',
  createTick = 0,
  className,
}: AdminCategoriasTreePanelProps) {
  const { data: tree = EMPTY_STORE_CATEGORY_TREE, isLoading, isError, error } =
    useStoreCategoriesTree();
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  } = useStoreCategoriesMutations();

  const [flat, setFlat] = useState<FlatStoreCategory[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'sub' | null>(null);
  const [editing, setEditing] = useState<StoreCategory | null>(null);
  const [parentForNew, setParentForNew] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineName, setInlineName] = useState('');

  useEffect(() => {
    setFlat(flattenCategoryTree(tree));
  }, [tree]);

  useEffect(() => {
    if (createTick > 0) {
      setEditing(null);
      setParentForNew(null);
      setDialogMode('create');
    }
  }, [createTick]);

  const visibleRows = useMemo(() => filterFlatBySearch(flat, search), [flat, search]);

  const persistFlat = async (next: FlatStoreCategory[]) => {
    setFlat(next);
    try {
      await reorderCategories.mutateAsync(flatToReorderItems(next));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo reordenar el árbol');
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

  const startInlineEdit = (row: FlatStoreCategory) => {
    setInlineEditId(row.id);
    setInlineName(row.name);
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineName('');
  };

  const saveInlineName = async (row: FlatStoreCategory) => {
    const nextName = inlineName.trim();
    if (!nextName || nextName === row.name) {
      cancelInlineEdit();
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id: row.id,
        payload: { name: nextName },
      });
      setFlat((prev) =>
        prev.map((entry) => (entry.id === row.id ? { ...entry, name: nextName } : entry)),
      );
      toast.success(`«${nextName}» actualizada`);
      cancelInlineEdit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo renombrar la categoría');
    }
  };

  const handleDelete = async (category: StoreCategory) => {
    if (!window.confirm(`¿Eliminar la categoría «${category.name}»?`)) return;
    const previousFlat = flat;
    setFlat((rows) => rows.filter((row) => row.id !== category.id));
    try {
      await deleteCategory.mutateAsync({ id: category.id, slug: category.slug });
      toast.success(`«${category.name}» eliminada`);
    } catch (err) {
      setFlat(previousFlat);
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar la categoría');
    }
  };

  const isSaving =
    createCategory.isPending ||
    updateCategory.isPending ||
    reorderCategories.isPending ||
    deleteCategory.isPending;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Árbol taxonómico</h2>
          <p className="text-xs text-muted-foreground">
            Arrastra la fila para ordenar · indentar/sacar nivel para anidar · clic en el nombre
            para renombrar · lápiz para editar completa
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {flat.length} categorías
        </Badge>
      </div>

      {isError ? (
        <p role="alert" className="px-4 py-6 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar las categorías. Verifica que el servidor API esté activo.'}
        </p>
      ) : null}

      {isLoading && flat.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Cargando categorías…
        </p>
      ) : visibleRows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          {search.trim()
            ? 'No hay categorías que coincidan con la búsqueda.'
            : 'No hay categorías en el árbol.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Categoría
                </th>
                <th className="hidden min-w-[9rem] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">
                  Slug
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Productos
                </th>
                <th className="w-[12rem] px-2 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const isEditingName = inlineEditId === row.id;
                const rowIndex = flat.findIndex((entry) => entry.id === row.id);

                return (
                  <tr
                    key={row.id}
                    draggable={!isEditingName}
                    onDragStart={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest('button, input, a')) {
                        event.preventDefault();
                        return;
                      }
                      setDragId(row.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => void handleDrop(row.id)}
                    className={cn(
                      'border-b border-border/50 last:border-0',
                      !isEditingName && 'cursor-grab active:cursor-grabbing',
                      dragId === row.id && 'bg-muted/70',
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <div
                        className="flex min-w-0 items-center gap-2"
                        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                      >
                        {row.depth > 0 ? (
                          <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="size-2 shrink-0 rounded-full bg-[hsl(var(--admin-accent))]"
                            aria-hidden="true"
                          />
                        )}

                        {isEditingName ? (
                          <Input
                            value={inlineName}
                            autoFocus
                            draggable={false}
                            className="h-9 max-w-[18rem] text-sm font-medium"
                            aria-label={`Renombrar ${row.name}`}
                            onChange={(event) => setInlineName(event.target.value)}
                            onBlur={() => void saveInlineName(row)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                void saveInlineName(row);
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault();
                                cancelInlineEdit();
                              }
                            }}
                            onClick={(event) => event.stopPropagation()}
                            onMouseDown={(event) => event.stopPropagation()}
                          />
                        ) : (
                          <button
                            type="button"
                            className="min-w-0 cursor-text rounded-sm text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            title="Clic para renombrar"
                            onClick={() => startInlineEdit(row)}
                            onMouseDown={(event) => event.stopPropagation()}
                          >
                            <p
                              className={cn(
                                'truncate text-sm text-foreground',
                                row.depth === 0 ? 'font-semibold' : 'font-medium',
                              )}
                            >
                              {row.name}
                            </p>
                            {row.tagline ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {row.tagline}
                              </p>
                            ) : null}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="hidden px-3 py-2.5 md:table-cell">
                      <span className="truncate font-mono text-sm text-muted-foreground">
                        /{row.slug}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-medium tabular-nums text-foreground">
                        {row.productCount ?? 0}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-2 py-2">
                      <div className="flex flex-nowrap items-center justify-end gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Añadir subcategoría en ${row.name}`}
                          onClick={() => openCreate(row.id)}
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={rowIndex <= 0}
                          aria-label={`Anidar ${row.name} bajo la fila anterior`}
                          onClick={() => void persistFlat(indentCategory(flat, row.id))}
                        >
                          <ChevronDown className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={row.depth === 0}
                          aria-label={`Sacar ${row.name} un nivel`}
                          onClick={() => void persistFlat(outdentCategory(flat, row.id))}
                        >
                          <ChevronRight className="size-4 rotate-180" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Editar ${row.name}`}
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          aria-label={`Eliminar ${row.name}`}
                          onClick={() => void handleDelete(row)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogMode(null);
            setEditing(null);
          }
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
            setEditing(null);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'No se pudo guardar la categoría');
            throw err;
          }
        }}
      />
    </section>
  );
}
