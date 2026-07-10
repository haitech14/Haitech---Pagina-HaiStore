import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminCategoriasKpis } from '@/components/admin/categorias/admin-categorias-kpis';
import { AdminCategoriasPageHeader } from '@/components/admin/categorias/admin-categorias-page-header';
import { AdminCategoriasTreePanel } from '@/components/admin/categorias/admin-categorias-tree-panel';
import { AdminCategoriasWidgets } from '@/components/admin/categorias/admin-categorias-widgets';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesMutations,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import { cn } from '@/lib/utils';
import type { AdminCategoriaRecord } from '@/types/admin-categorias';
import type { StoreCategory } from '@/types/store-category';

function mapStoreCategoryToRecord(
  category: StoreCategory & { depth?: number },
  byId: Map<string, StoreCategory>,
): AdminCategoriaRecord {
  const parent = category.parentId ? byId.get(category.parentId) : null;
  const now = new Date();

  return {
    id: category.id,
    createdAt: now,
    updatedAt: now,
    name: category.name,
    description: category.tagline?.trim() || 'Sin descripción',
    parentName: parent?.name ?? null,
    productCount: category.productCount ?? 0,
    assigneeName: 'Catálogo',
    assigneeInitials: 'CT',
    assigneeRole: 'Tienda',
    status: 'activa',
  };
}

export function AdminCategoriasDashboard() {
  const [headerSearch, setHeaderSearch] = useState('');
  const [createTick, setCreateTick] = useState(0);
  const [widgetsKey, setWidgetsKey] = useState(0);

  const {
    data: tree = EMPTY_STORE_CATEGORY_TREE,
    isError,
    error,
    refetch,
  } = useStoreCategoriesTree();
  const { syncFromCatalog } = useStoreCategoriesMutations();
  const { open: sidebarOpen } = useAdminSidebar();

  const handleSyncCatalog = async () => {
    try {
      await syncFromCatalog.mutateAsync();
      toast.success('Catálogo sincronizado: tienda, servicios, alquiler y software.');
      await refetch();
    } catch (syncError) {
      toast.error(
        syncError instanceof Error
          ? syncError.message
          : 'No se pudo sincronizar el catálogo. Verifica que la API esté activa.',
      );
    }
  };

  const records = useMemo(() => {
    const flat = flattenCategoryTree(tree);
    const byId = new Map(flat.map((row) => [row.id, row]));
    return flat.map((row) => mapStoreCategoryToRecord(row, byId));
  }, [tree]);

  return (
    <div className="space-y-3">
      <AdminCategoriasPageHeader
        search={headerSearch}
        onSearchChange={setHeaderSearch}
        onNewCategory={() => setCreateTick((value) => value + 1)}
        onSyncCatalog={() => void handleSyncCatalog()}
        isSyncingCatalog={syncFromCatalog.isPending}
      />
      <AdminCategoriasKpis records={records} />

      {isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error instanceof Error
            ? error.message
            : 'No se pudieron cargar las categorías. Verifica que el servidor API esté activo.'}
        </p>
      ) : null}

      <div
        className={cn(
          'grid gap-3',
          sidebarOpen
            ? 'xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_17rem]',
        )}
      >
        <AdminCategoriasTreePanel search={headerSearch} createTick={createTick} />
        <AdminCategoriasWidgets
          key={widgetsKey}
          records={records}
          onRefresh={() => {
            setWidgetsKey((value) => value + 1);
            void refetch();
          }}
        />
      </div>
    </div>
  );
}
