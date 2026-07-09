import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AdminInventarioKpis } from '@/components/admin/inventario/admin-inventario-kpis';
import { AdminInventarioPageHeader } from '@/components/admin/inventario/admin-inventario-page-header';
import { AdminInventarioTablePanel } from '@/components/admin/inventario/admin-inventario-table-panel';
import { AdminInventarioWidgets } from '@/components/admin/inventario/admin-inventario-widgets';
import { useAdminUtilityPanel } from '@/context/admin-utility-panel-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { cn } from '@/lib/utils';
import { useAdminInventory, useInventoryMutations } from '@/hooks/use-products';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import { notifyProductCatalogChanged } from '@/lib/invalidate-product-queries';
import type { InventoryProduct } from '@/types/product';

export function AdminInventarioDashboard() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    isFetching,
    refetch,
    dataUpdatedAt,
    error,
  } = useAdminInventory();
  const { updateProduct } = useInventoryMutations();
  const { data: company } = useCompanySettings();

  const saleExchangeRate = normalizeUsdToPenRate(
    company?.usdToPenExchangeRate ?? getUsdToPenSaleRate(),
  );
  const purchaseExchangeRate = normalizeUsdToPenRate(
    company?.usdToPenPurchaseExchangeRate ??
      company?.usdToPenExchangeRate ??
      getUsdToPenPurchaseRate(),
  );

  const handlePatchProduct = useCallback(
    async (productId: string, patch: Partial<InventoryProduct>) => {
      await updateProduct.mutateAsync({ id: productId, payload: patch });
    },
    [updateProduct],
  );

  const { open: utilityPanelOpen } = useAdminUtilityPanel();

  const handleSync = async () => {
    await refetch();
    await notifyProductCatalogChanged(queryClient);
  };

  return (
    <div className="space-y-3">
      <AdminInventarioPageHeader
        onNewProduct={() => setProductDialogOpen(true)}
        onSync={() => {
          void handleSync();
        }}
        isSyncing={isFetching}
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'No se pudieron cargar los productos.'}
        </p>
      ) : null}

      <div
        className={cn(
          'grid gap-3',
          utilityPanelOpen &&
            'xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]',
        )}
      >
        <div className="min-w-0 space-y-3">
          <AdminInventarioKpis products={products} isLoading={isLoading} />
          <AdminInventarioTablePanel
            products={products}
            saleExchangeRate={saleExchangeRate}
            purchaseExchangeRate={purchaseExchangeRate}
            onPatchProduct={handlePatchProduct}
            isLoading={isLoading}
            isSaving={updateProduct.isPending}
          />
        </div>
        {utilityPanelOpen ? (
          <AdminInventarioWidgets
            products={products}
            isLoading={isLoading}
            layout="sidebar"
            className="xl:sticky xl:top-3 xl:max-h-[calc(100dvh-1.5rem)] xl:self-start xl:overflow-y-auto"
            {...(dataUpdatedAt ? { updatedAt: new Date(dataUpdatedAt) } : {})}
          />
        ) : null}
      </div>

      <InventoryProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        initial={null}
      />
    </div>
  );
}
