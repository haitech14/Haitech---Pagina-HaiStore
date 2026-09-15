import { isPrinterEquipment } from '@/lib/build-product-detail';
import { resolveCatalogBulkDiscountTiers } from '@/lib/bulk-discount-tiers';
import type { Product } from '@/types/product';
import type { BulkDiscountTier } from '@/types/product-detail';

export function productUsesEquipmentVolumeDiscount(product: Product): boolean {
  return isPrinterEquipment(product);
}

export function resolveProductBulkDiscountTiers(
  product: Product,
  companyTiers?: BulkDiscountTier[] | null,
): BulkDiscountTier[] {
  return resolveCatalogBulkDiscountTiers(
    productUsesEquipmentVolumeDiscount(product),
    companyTiers,
  );
}
