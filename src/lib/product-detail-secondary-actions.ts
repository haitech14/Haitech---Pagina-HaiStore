import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import type { Product } from '@/types/product';

/** Multifuncionales / impresoras nuevas o seminuevas. */
export function productQualifiesForRentalCta(product: Product): boolean {
  if (!isPrinterEquipment(product)) return false;
  return (
    productQualifiesAsNuevaEquipment(product) ||
    productQualifiesAsSeminuevaEquipment(product)
  );
}

/** Tóner o repuestos originales / compatibles. */
export function productQualifiesForMaintenancePlanCta(product: Product): boolean {
  void product;
  return false;
}
