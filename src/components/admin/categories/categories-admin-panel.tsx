import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from 'lucide-react';

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/components/admin/categories/category-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
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

export function CategoriesAdminPanel() {
  const { data: tree, isLoading, isError, error } = useStoreCategoriesTree();
  const {
    syncFromInventory,
    syncFromCatalog,
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

  useEffect(() => {
    if (tree) setFlat(flattenCategoryTree(tree));
  }, [tree]);

  const totalProducts = useMemo(
    () => tree?.reduce((sum, node) => sum + (node.productCount ?? 0), 0) ?? 0,
    [tree],
  );

  const persistFlat = async (next: FlatStoreCategory[]) => {
    setFlat(next);
    await reorderCategories.mutateAsync(flatToReorderItems(next));
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
    setDialogMode('edit');
  };

  const handleDelete = async (category: StoreCategory) => {
    if (!window.confirm(`¿Eliminar la categoría «${category.name}»?`)) return;
    await deleteCategory.mutateAsync({ id: category.id, slug: category.slug });
  };

  const isSaving =
    createCategory.isPending ||
    updateCategory.isPending ||
    reorderCategories.isPending ||
    syncFromInventory.isPending ||
    syncFromCatalog.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className="gap-2 bg-red-600 hover:bg-red-500"
          onClick={() => openCreate(null)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Nueva categoría
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={syncFromCatalog.isPending}
          onClick={() => void syncFromCatalog.mutateAsync()}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Sincronizar catálogo
        </Button>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={syncFromInventory.isPending}
          onClick={() => void syncFromInventory.mutateAsync()}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Actualizar desde inventario
        </Button>
        <Badge variant="secondary" className="ml-auto">
          {flat.length} categorías · {totalProducts} productos en tienda
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Arrastra las filas para ordenar. Usa «Sub» para crear subcategorías e «Indentar» / «Sacar
        nivel» para anidar. Las etiquetas de inventario vinculan los productos de la tienda.
      </p>

      {isError && (
        <p role="alert" className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar las categorías. Verifica que el servidor API esté activo.'}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando categorías…</p>
      ) : flat.length === 0 ? (
        <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          No hay categorías. Pulsa «Actualizar desde inventario» para importarlas del catálogo
          actual.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="w-10 px-2 py-3" aria-label="Orden" />
                <th className="px-4 py-3 text-left font-medium">Categoría</th>
                <th className="px-4 py-3 text-left font-medium">Inventario</th>
                <th className="px-4 py-3 text-right font-medium">Productos</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {flat.map((row) => (
                <tr
                  key={row.id}
                  draggable
                  onDragStart={() => setDragId(row.id)}
                  onDragEnd={() => setDragId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(row.id)}
                  className={cn(
                    'border-b last:border-0',
                    dragId === row.id && 'bg-red-50/60',
                  )}
                >
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className="flex size-9 cursor-grab items-center justify-center rounded-md text-muted-foreground active:cursor-grabbing"
                      aria-label={`Reordenar ${row.name}`}
                    >
                      <GripVertical className="size-4" aria-hidden="true" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                    >
                      {row.depth > 0 ? (
                        <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Tags className="size-4 text-red-600" aria-hidden="true" />
                      )}
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">/{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {(row.inventoryLabels ?? []).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="secondary">{row.productCount ?? 0}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => openCreate(row.id)}
                        aria-label={`Añadir subcategoría en ${row.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                        Sub
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => void persistFlat(indentCategory(flat, row.id))}
                        disabled={flat.findIndex((entry) => entry.id === row.id) <= 0}
                        aria-label={`Anidar ${row.name} bajo la fila anterior`}
                      >
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => void persistFlat(outdentCategory(flat, row.id))}
                        disabled={row.depth === 0}
                        aria-label={`Sacar ${row.name} un nivel`}
                      >
                        <ChevronRight className="size-3.5 rotate-180" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label={`Editar ${row.name}`}
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        aria-label={`Eliminar ${row.name}`}
                        onClick={() => void handleDelete(row)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormDialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
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
          if (dialogMode === 'edit' && editing) {
            await updateCategory.mutateAsync({ id: editing.id, payload });
          } else {
            await createCategory.mutateAsync(payload);
          }
        }}
      />
    </div>
  );
}
