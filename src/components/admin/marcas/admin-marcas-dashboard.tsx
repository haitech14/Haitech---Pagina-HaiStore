import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { Button } from '@/components/ui/button';
import { AdminMarcaFormDialog } from '@/components/admin/marcas/admin-marca-form-dialog';
import { AdminMarcasKpis } from '@/components/admin/marcas/admin-marcas-kpis';
import { AdminMarcasPageHeader } from '@/components/admin/marcas/admin-marcas-page-header';
import { AdminMarcasTablePanel } from '@/components/admin/marcas/admin-marcas-table-panel';
import { AdminMarcasWidgets } from '@/components/admin/marcas/admin-marcas-widgets';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { useStoreBrandsCatalog, useStoreBrandsMutations } from '@/hooks/use-store-brands';
import type { AdminMarcaFormValues } from '@/lib/admin-marca-form';
import {
  buildMarcasKpisFromSummary,
  buildMarcasWidgetsFromSummary,
  formValuesToStoreBrandInput,
  storeBrandToAdminRecord,
} from '@/lib/store-brands-mapper';
import { cn } from '@/lib/utils';
import type { AdminMarcaRecord } from '@/types/admin-marcas';

export function AdminMarcasDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useStoreBrandsCatalog();
  const { createBrand, updateBrand } = useStoreBrandsMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminMarcaRecord | null>(null);
  const { open: sidebarOpen } = useAdminSidebar();

  const records = useMemo(
    () => (data?.brands ?? []).map(storeBrandToAdminRecord),
    [data?.brands],
  );

  const kpis = useMemo(
    () => (data?.summary ? buildMarcasKpisFromSummary(data.summary) : undefined),
    [data?.summary],
  );

  const widgets = useMemo(
    () => (data?.summary ? buildMarcasWidgetsFromSummary(data.summary) : undefined),
    [data?.summary],
  );

  const openCreateDialog = useCallback(() => {
    setEditingBrand(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((record: AdminMarcaRecord) => {
    setEditingBrand(record);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingBrand(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: AdminMarcaFormValues) => {
      const payload = formValuesToStoreBrandInput(values);

      if (editingBrand) {
        await updateBrand.mutateAsync({ id: editingBrand.id, payload });
        toast.success(`Marca "${payload.name}" actualizada correctamente`);
        return;
      }

      await createBrand.mutateAsync(payload);
      toast.success(`Marca "${payload.name}" creada correctamente`);
    },
    [createBrand, editingBrand, updateBrand],
  );

  const handleToggleFeatured = useCallback(
    async (record: AdminMarcaRecord) => {
      try {
        await updateBrand.mutateAsync({
          id: record.id,
          payload: { featured: !record.featured },
        });
        toast.success(
          record.featured
            ? `"${record.name}" ya no es marca destacada`
            : `"${record.name}" marcada como destacada`,
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la marca');
      }
    },
    [updateBrand],
  );

  const handleToggleStatus = useCallback(
    async (record: AdminMarcaRecord) => {
      const nextStatus = record.status === 'activa' ? 'inactiva' : 'activa';
      try {
        await updateBrand.mutateAsync({
          id: record.id,
          payload: { status: nextStatus },
        });
        toast.success(
          nextStatus === 'activa'
            ? `"${record.name}" activada correctamente`
            : `"${record.name}" desactivada correctamente`,
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la marca');
      }
    },
    [updateBrand],
  );

  const isSaving = createBrand.isPending || updateBrand.isPending;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <AdminMarcasPageHeader onNewBrand={openCreateDialog} />
        <p className="text-sm text-muted-foreground">Cargando marcas…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <AdminMarcasPageHeader onNewBrand={openCreateDialog} />
        <AdminEmptyState
          title="No se pudieron cargar las marcas"
          description={error instanceof Error ? error.message : 'Error desconocido'}
        />
        <Button type="button" variant="outline" className="h-8 text-xs" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AdminMarcasPageHeader onNewBrand={openCreateDialog} brandNames={records.map((r) => r.name)} />
      <AdminMarcasKpis kpis={kpis} />

      <div
        className={cn(
          'grid gap-3',
          sidebarOpen
            ? 'xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_17rem]',
        )}
      >
        <AdminMarcasTablePanel
          records={records}
          onEditBrand={openEditDialog}
          onToggleFeatured={(record) => void handleToggleFeatured(record)}
          onToggleStatus={(record) => void handleToggleStatus(record)}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
        />
        <AdminMarcasWidgets
          total={widgets?.total}
          updatedAt={widgets?.updatedAt}
          originDistribution={widgets?.originDistribution}
          categoryPresence={widgets?.categoryPresence}
          topSellers={widgets?.topSellers}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
        />
      </div>

      <AdminMarcaFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        initial={editingBrand}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
