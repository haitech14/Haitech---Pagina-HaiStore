import { toast } from 'sonner';

import { InventoryInlineField } from '@/components/admin/inventory/inventory-inline-field';
import { InventoryInlinePriceEdit } from '@/components/admin/inventory/inventory-inline-price-edit';
import { InventoryPurchasePriceDisplay } from '@/components/admin/inventory/inventory-purchase-price-display';
import { InventorySalePrice } from '@/components/admin/inventory/inventory-sale-price';
import {
  discountVsPublic,
  formatDiscountLabel,
  ROLE_HEADER_META,
} from '@/lib/admin-listas-precios-utils';
import { isBundleProduct } from '@/lib/product-bundle';
import { PRICE_ROLE_LABELS } from '@/lib/roles';
import type { AdminListaPreciosRoleKey } from '@/types/admin-listas-precios';
import type { InventoryProduct, PriceRole } from '@/types/product';

const SALE_ROLE_MAP: Partial<Record<AdminListaPreciosRoleKey, PriceRole>> = {
  public: 'public',
  distribuidor: 'distribuidor',
  mayorista: 'mayorista',
};

interface AdminListasPreciosPriceCellProps {
  product: InventoryProduct;
  role: AdminListaPreciosRoleKey;
  activeFieldId: string | null;
  onActivate: (fieldId: string) => void;
  onClose: () => void;
  saleExchangeRate: number;
  purchaseExchangeRate: number;
  onPatch: (patch: Partial<InventoryProduct>) => Promise<void>;
}

function fieldKey(productId: string, role: AdminListaPreciosRoleKey) {
  return `${productId}:price-${role}`;
}

export function AdminListasPreciosPriceCell({
  product,
  role,
  activeFieldId,
  onActivate,
  onClose,
  saleExchangeRate,
  purchaseExchangeRate,
  onPatch,
}: AdminListasPreciosPriceCellProps) {
  const key = fieldKey(product.id, role);
  const publicUsd = product.prices.public ?? 0;
  const isPurchase = role === 'compra';
  const priceRole = SALE_ROLE_MAP[role];
  const usd = isPurchase ? product.purchase_price_usd ?? 0 : product.prices[priceRole!] ?? 0;
  const exchangeRate = isPurchase ? purchaseExchangeRate : saleExchangeRate;
  const bundleProduct = !isPurchase && isBundleProduct(product);
  const discount = role === 'public' ? null : discountVsPublic(publicUsd, usd);
  const hint =
    role === 'public'
      ? 'Precio más alto'
      : formatDiscountLabel(discount, ROLE_HEADER_META[role].hint);

  const saveUsd = async (nextUsd: number) => {
    if (isPurchase) {
      const currentUsd = product.purchase_price_usd ?? 0;
      if (Math.abs(currentUsd - nextUsd) < 0.0001) return;

      const suppliers = product.suppliers ?? [];
      const syncedSuppliers =
        suppliers.length > 0
          ? suppliers.map((supplier, index) =>
              index === 0 ? { ...supplier, purchase_price_usd: nextUsd } : supplier,
            )
          : suppliers;

      try {
        await onPatch({
          purchase_price_usd: nextUsd,
          ...(syncedSuppliers.length > 0 ? { suppliers: syncedSuppliers } : {}),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'No se pudo guardar el precio de compra',
        );
        throw error;
      }
      return;
    }

    if (!priceRole) return;
    const currentUsd = product.prices[priceRole] ?? 0;
    if (Math.abs(currentUsd - nextUsd) < 0.0001) return;

    try {
      await onPatch({
        prices: { ...product.prices, [priceRole]: nextUsd },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar el precio del producto',
      );
      throw error;
    }
  };

  if (bundleProduct && priceRole) {
    return (
      <div className="text-right" title="Precio sumado de los componentes del pack">
        <InventorySalePrice
          saleUsd={product.prices[priceRole]}
          purchaseUsd={product.purchase_price_usd}
          priceRole={priceRole}
          embedded
        />
        <p className="mt-0.5 text-[0.5625rem] text-muted-foreground">{hint}</p>
      </div>
    );
  }

  const ariaLabel = isPurchase ? 'Precio de compra' : PRICE_ROLE_LABELS[priceRole!];

  return (
    <InventoryInlineField
      fieldId={key}
      activeFieldId={activeFieldId}
      onActivate={() => onActivate(key)}
      onClose={onClose}
      align="end"
      display={
        <div>
          {isPurchase ? (
            <InventoryPurchasePriceDisplay
              product={product}
              exchangeRate={purchaseExchangeRate}
            />
          ) : priceRole ? (
            <InventorySalePrice
              saleUsd={usd}
              purchaseUsd={product.purchase_price_usd}
              priceRole={priceRole}
              embedded
            />
          ) : null}
          <p className="mt-0.5 text-[0.5625rem] text-muted-foreground">{hint}</p>
        </div>
      }
      edit={
        <InventoryInlinePriceEdit
          usd={usd}
          exchangeRate={exchangeRate}
          ariaLabel={ariaLabel}
          onSave={saveUsd}
          onClose={onClose}
          useCharm={!isPurchase}
        />
      }
    />
  );
}
