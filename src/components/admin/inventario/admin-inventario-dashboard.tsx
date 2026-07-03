import { useState } from 'react';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AdminInventarioKpis } from '@/components/admin/inventario/admin-inventario-kpis';
import { AdminInventarioPageHeader } from '@/components/admin/inventario/admin-inventario-page-header';
import { AdminInventarioTablePanel } from '@/components/admin/inventario/admin-inventario-table-panel';
import { AdminInventarioWidgets } from '@/components/admin/inventario/admin-inventario-widgets';

export function AdminInventarioDashboard() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminInventarioPageHeader onNewProduct={() => setProductDialogOpen(true)} />
      <AdminInventarioKpis />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminInventarioTablePanel />
        <AdminInventarioWidgets />
      </div>

      <InventoryProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        initial={null}
      />
    </div>
  );
}
