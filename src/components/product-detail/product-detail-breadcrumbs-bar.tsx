import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { InventoryProductFormDialog } from '@/components/admin/inventory/inventory-product-form-dialog';
import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { ProductDetailReferralButton } from '@/components/product-detail/product-detail-referral-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { fetchAdminInventoryProductById } from '@/hooks/use-products';
import { notifyProductCatalogChanged } from '@/lib/invalidate-product-queries';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';
import type { ProductBreadcrumb } from '@/types/product-detail';

interface ProductDetailBreadcrumbsBarProps {
  items: ProductBreadcrumb[];
  product: Product;
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

function isSessionAuthError(message: string): boolean {
  return /sesión|expirada|no válida|permisos de administrador|unauthorized|401/i.test(message);
}

export function ProductDetailBreadcrumbsBar({
  items,
  product,
  className,
}: ProductDetailBreadcrumbsBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, canAccessAdminPanel } = useAuth();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Staff del panel, o siempre en localhost para no “perder” el botón si la sesión caducó.
  const showEditButton = canAccessAdminPanel || isAdmin || import.meta.env.DEV;

  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  const goToLogin = useCallback(() => {
    navigate('/login', { state: { from: returnPath } });
  }, [navigate, returnPath]);

  const openEdit = useCallback(async () => {
    if (!product.id || loadingEdit) return;

    if (!canAccessAdminPanel && !isAdmin) {
      toast.message('Inicia sesión de administrador para editar el producto.');
      goToLogin();
      return;
    }

    setLoadingEdit(true);
    try {
      const full = await fetchAdminInventoryProductById(product.id);
      setEditingProduct(full);
      setEditOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle completo del producto';
      if (isSessionAuthError(message)) {
        toast.error('Tu sesión expiró. Inicia sesión de nuevo para editar el producto.');
        goToLogin();
        return;
      }
      toast.error(message);
    } finally {
      setLoadingEdit(false);
    }
  }, [canAccessAdminPanel, goToLogin, isAdmin, loadingEdit, product.id]);

  const handleSaved = useCallback(
    (saved: InventoryProduct) => {
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
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ProductDetailReferralButton product={product} />
          {showEditButton ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1.5 border-border text-foreground hover:bg-muted/50 focus-visible:ring-red-600"
              disabled={loadingEdit}
              onClick={() => {
                void openEdit();
              }}
              title="Editar producto en inventario"
              aria-label="Editar producto"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {loadingEdit ? 'Cargando…' : 'Editar'}
            </Button>
          ) : null}
        </div>
      </div>

      {(canAccessAdminPanel || isAdmin) && editingProduct ? (
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
