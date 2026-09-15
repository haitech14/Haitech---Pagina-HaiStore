import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, Pencil, Share2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ProductEditor } from '@/components/ProductEditor';
import { ProductDetailBreadcrumbs } from '@/components/product-detail/product-detail-breadcrumbs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useWishlist } from '@/context/wishlist-context';
import { fetchAdminInventoryProductById } from '@/hooks/use-products';
import { isApiConnectionError } from '@/lib/api';
import { notifyProductCatalogChanged } from '@/lib/invalidate-product-queries';
import { productToWishlistItem } from '@/lib/wishlist-product';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';
import type { ProductBreadcrumb } from '@/types/product-detail';

interface ProductDetailBreadcrumbsBarProps {
  items: ProductBreadcrumb[];
  product: Product;
  onShareClick?: () => void;
  className?: string;
}

function isSessionAuthError(message: string): boolean {
  return /sesión|expirada|no válida|permisos de administrador|unauthorized|401/i.test(message);
}

export function ProductDetailBreadcrumbsBar({
  items,
  product,
  onShareClick,
  className,
}: ProductDetailBreadcrumbsBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { isSelected, toggle } = useWishlist();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const showEditButton = isAdmin;
  const wishlisted = isSelected(product.id);

  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  const goToLogin = useCallback(() => {
    navigate('/login', { state: { from: returnPath } });
  }, [navigate, returnPath]);

  const openEdit = useCallback(async () => {
    if (!product.id || loadingEdit) return;

    if (!isAdmin) {
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
      if (isApiConnectionError(error)) return;
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
  }, [goToLogin, isAdmin, loadingEdit, product.id]);

  const handleSaved = useCallback(
    (saved: InventoryProduct) => {
      void notifyProductCatalogChanged(queryClient, {
        productId: saved.id,
        inventoryProduct: saved,
      });
    },
    [queryClient],
  );

  if (items.length === 0) return null;

  return (
    <>
      <div className={cn('border-b border-neutral-100 bg-white text-neutral-700', className)}>
        <div className="container flex items-center justify-between gap-x-2 py-0.5">
          <ProductDetailBreadcrumbs items={items} className="mb-0 min-w-0 flex-1" />
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              onClick={() => toggle(productToWishlistItem(product))}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={cn('size-3', wishlisted ? 'fill-[#E31B23] text-[#E31B23]' : '')}
                aria-hidden="true"
              />
              Favoritos
            </Button>
            {onShareClick ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                onClick={onShareClick}
              >
                <Share2 className="size-3" aria-hidden="true" />
                Compartir
              </Button>
            ) : null}
            {showEditButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 shrink-0 gap-1 border-border px-1.5 text-[11px] text-foreground hover:bg-muted/50 focus-visible:ring-[#E31B23]"
                disabled={loadingEdit}
                onClick={() => {
                  void openEdit();
                }}
                title="Editar producto en inventario"
                aria-label="Editar producto"
              >
                <Pencil className="size-2.5" aria-hidden="true" />
                {loadingEdit ? 'Cargando…' : 'Editar'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isAdmin && editingProduct ? (
        <ProductEditor
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditingProduct(null);
          }}
          product={editingProduct}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
