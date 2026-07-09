import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/components/admin/categories/category-form-dialog';
import { AdminCategoriasKpis } from '@/components/admin/categorias/admin-categorias-kpis';
import { AdminCategoriasPageHeader } from '@/components/admin/categorias/admin-categorias-page-header';
import { AdminCategoriasTablePanel } from '@/components/admin/categorias/admin-categorias-table-panel';
import { AdminCategoriasWidgets } from '@/components/admin/categorias/admin-categorias-widgets';
import { useAdminSidebar } from '@/context/admin-sidebar-context';
import { ADMIN_CATEGORIAS_RECORDS } from '@/data/admin-categorias-data';
import { useStoreCategoriesMutations } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';
import type { AdminCategoriaRecord, AdminCategoriaStatus } from '@/types/admin-categorias';

function labelsFromForm(values: CategoryFormValues): string[] {
  const parsed = values.inventoryLabels
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
  if (parsed.length > 0) return parsed;
  return values.name.trim() ? [values.name.trim()] : [];
}

function buildRecordFromForm(
  values: CategoryFormValues,
  existing?: AdminCategoriaRecord,
): AdminCategoriaRecord {
  const now = new Date();
  const name = values.name.trim();
  return {
    id: existing?.id ?? `cat-${Date.now()}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    name,
    description: values.tagline.trim() || 'Sin descripción',
    parentName: null,
    productCount: existing?.productCount ?? 0,
    assigneeName: existing?.assigneeName ?? 'Ana Torres',
    assigneeInitials: existing?.assigneeInitials ?? 'AT',
    assigneeRole: existing?.assigneeRole ?? 'Catálogo',
    status: existing?.status ?? 'activa',
  };
}

export function AdminCategoriasDashboard() {
  const [records, setRecords] = useState<AdminCategoriaRecord[]>(() => [...ADMIN_CATEGORIAS_RECORDS]);
  const [headerSearch, setHeaderSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoriaRecord | null>(null);
  const [widgetsKey, setWidgetsKey] = useState(0);
  const { createCategory } = useStoreCategoriesMutations();
  const { open: sidebarOpen } = useAdminSidebar();

  const openCreateDialog = useCallback(() => {
    setEditingCategory(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((record: AdminCategoriaRecord) => {
    setEditingCategory(record);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) setEditingCategory(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: CategoryFormValues) => {
      if (editingCategory) {
        const updated = buildRecordFromForm(values, editingCategory);
        setRecords((prev) => prev.map((item) => (item.id === editingCategory.id ? updated : item)));
        toast.success(`Categoría "${updated.name}" actualizada`);
        return;
      }

      await createCategory.mutateAsync({
        name: values.name.trim(),
        tagline: values.tagline.trim() || null,
        image: values.image.trim() || null,
        parentId: values.parentId,
        inventoryLabels: labelsFromForm(values),
        ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
      });

      const created = buildRecordFromForm(values);
      setRecords((prev) => [created, ...prev]);
      toast.success('Categoría creada correctamente');
    },
    [createCategory, editingCategory],
  );

  const handleToggleFeatured = useCallback((record: AdminCategoriaRecord) => {
    const nextStatus: AdminCategoriaStatus =
      record.status === 'destacada' ? 'activa' : 'destacada';
    setRecords((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, status: nextStatus, updatedAt: new Date() } : item,
      ),
    );
    toast.success(
      nextStatus === 'destacada'
        ? `"${record.name}" marcada como destacada`
        : `"${record.name}" ya no está destacada`,
    );
  }, []);

  const handleArchiveCategory = useCallback((record: AdminCategoriaRecord) => {
    setRecords((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? { ...item, status: 'archivada', updatedAt: new Date() }
          : item,
      ),
    );
    toast.success(`"${record.name}" archivada`);
  }, []);

  return (
    <div className="space-y-3">
      <AdminCategoriasPageHeader
        search={headerSearch}
        onSearchChange={setHeaderSearch}
        onNewCategory={openCreateDialog}
      />
      <AdminCategoriasKpis />

      <div
        className={cn(
          'grid gap-3',
          sidebarOpen
            ? 'xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]'
            : 'lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_17rem]',
        )}
      >
        <AdminCategoriasTablePanel
          records={records}
          headerSearch={headerSearch}
          onEditCategory={openEditDialog}
          onToggleFeatured={handleToggleFeatured}
          onArchiveCategory={handleArchiveCategory}
        />
        <AdminCategoriasWidgets key={widgetsKey} onRefresh={() => setWidgetsKey((value) => value + 1)} />
      </div>

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={editingCategory ? 'Editar categoría' : 'Nueva categoría'}
        description="Las etiquetas de inventario deben coincidir con el campo categoría de los productos."
        parentId={null}
        {...(editingCategory
          ? {
              initial: {
                name: editingCategory.name,
                tagline: editingCategory.description,
              },
            }
          : {})}
        isSaving={createCategory.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
