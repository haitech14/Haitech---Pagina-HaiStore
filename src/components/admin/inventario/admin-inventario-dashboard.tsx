import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { AdminInventarioKpis } from '@/components/admin/inventario/admin-inventario-kpis';
import { AdminInventarioPageHeader } from '@/components/admin/inventario/admin-inventario-page-header';
import { AdminInventarioStockTakeBanner } from '@/components/admin/inventario/admin-inventario-stock-take-banner';
import { AdminInventarioTablePanel } from '@/components/admin/inventario/admin-inventario-table-panel';
import { AdminInventarioWidgets } from '@/components/admin/inventario/admin-inventario-widgets';
import { useAdminUtilityPanel } from '@/context/admin-utility-panel-context';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { cn } from '@/lib/utils';
import {
  fetchAdminInventoryProductById,
  useAdminInventory,
  useInventoryMutations,
} from '@/hooks/use-products';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import {
  upsertAdminInventoryProducts,
} from '@/lib/invalidate-product-queries';
import {
  toastSyncCatalogError,
  toastSyncCatalogSuccess,
} from '@/lib/sync-catalog-feedback';
import type { InventoryProduct } from '@/types/product';
import { toast } from 'sonner';

export function AdminInventarioDashboard() {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    isFetching,
    dataUpdatedAt,
    error,
  } = useAdminInventory();
  const { updateProduct, syncCatalog } = useInventoryMutations();
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

  const openCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  }, []);

  const openEditProduct = useCallback(async (product: InventoryProduct) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
    try {
      const full = await fetchAdminInventoryProductById(product.id);
      setEditingProduct(full);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle completo del producto',
      );
    }
  }, []);

  const handleProductDialogOpenChange = useCallback((open: boolean) => {
    setProductDialogOpen(open);
    if (!open) setEditingProduct(null);
  }, []);

  const { open: utilityPanelOpen } = useAdminUtilityPanel();

  const handleSync = async () => {
    try {
      const result = await syncCatalog.mutateAsync(false);
      toastSyncCatalogSuccess(result);
    } catch (error) {
      toastSyncCatalogError(error);
    }
  };

  return (
    <div className="space-y-3">
      <AdminInventarioPageHeader
        onNewProduct={openCreateProduct}
        onSync={() => {
          void handleSync();
        }}
        isSyncing={syncCatalog.isPending || isFetching}
      />

      <AdminInventarioStockTakeBanner />

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
            onNewProduct={openCreateProduct}
            onEditProduct={openEditProduct}
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
        onOpenChange={handleProductDialogOpenChange}
        initial={editingProduct}
        onCreated={(product) => {
          // No hacer refetch a pelo: puede traer snapshot stale y borrar el upsert
          // de createProduct. Re-merge + invalidate seguro.
          upsertAdminInventoryProducts(queryClient, [product], { prepend: true });
        }}
        onSaved={(product) => {
          upsertAdminInventoryProducts(queryClient, [product], { prepend: true });
        }}
      />
    </div>
  );
}
