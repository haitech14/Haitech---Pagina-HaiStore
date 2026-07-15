import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useAdminInventoryCatalogMap } from '@/hooks/use-admin-inventory-price-map';
import { fetchAdminInventoryProductById } from '@/hooks/use-products';
import { notifyProductCatalogChanged } from '@/lib/invalidate-product-queries';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';
import type { ProductBreadcrumb } from '@/types/product-detail';

interface ProductDetailBreadcrumbsBarProps {
  items: ProductBreadcrumb[];
  productId: string;
  className?: string;
}

function canNavigateBack(): boolean {
  const state = window.history.state as { idx?: number } | null;
  return typeof state?.idx === 'number' && state.idx > 0;
}

function parentCatalogHref(items: ProductBreadcrumb[]): string {
  for (let index = items.length - 2; index >= 0; index -= 1) {
    const href = items[index]?.href;
    if (href) return href;
  }
  return '/tienda';
}

export function ProductDetailBreadcrumbsBar({
  items,
  productId,
  className,
}: ProductDetailBreadcrumbsBarProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const catalogMap = useAdminInventoryCatalogMap();
  const catalogEntry = catalogMap?.get(productId) ?? null;
  const listProduct = catalogEntry?.product ?? null;
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const openEdit = useCallback(async () => {
    if (!listProduct) return;
    setLoadingEdit(true);
    try {
      // Admin list omits description/storefront; load full row before editing.
      const full = await fetchAdminInventoryProductById(listProduct.id);
      setEditingProduct(full);
      setEditOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle completo del producto',
      );
    } finally {
      setLoadingEdit(false);
    }
  }, [listProduct]);

  const handleSaved = useCallback(
    (saved: InventoryProduct) => {
      // Mutation already invalidates; reinforce so the open product page updates immediately.
      void notifyProductCatalogChanged(queryClient, {
        productId: saved.id,
        inventoryProduct: saved,
      });
    },
    [queryClient],
  );

  const handleBack = useCallback(() => {
    if (canNavigateBack()) {
      navigate(-1);
      return;
    }
    navigate(parentCatalogHref(items));
  }, [items, navigate]);

  if (items.length === 0) return null;

  return (
    <>
      <div className={cn('flex flex-wrap items-center justify-between gap-x-4 gap-y-2', className)}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 gap-0.5 px-2 text-neutral-500 hover:bg-muted/50 hover:text-neutral-700 focus-visible:ring-blue-600"
            onClick={handleBack}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Atrás
          </Button>
          <ProductDetailBreadcrumbs items={items} className="mb-0 min-w-0 flex-1" />
        </div>
        {isAdmin && listProduct ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 border-border text-foreground hover:bg-muted/50 focus-visible:ring-red-600"
            disabled={loadingEdit}
            onClick={() => {
              void openEdit();
            }}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {loadingEdit ? 'Cargando…' : 'Editar producto'}
          </Button>
        ) : null}
      </div>

      {isAdmin && editingProduct ? (
        <InventoryProductFormDialog
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditingProduct(null);
          }}
          initial={editingProduct}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
