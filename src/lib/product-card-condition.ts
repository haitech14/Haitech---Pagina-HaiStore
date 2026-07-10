import {
  isConsumableProductForCardSpec,
  resolveConsumableEstadoLabel,
} from '@/lib/format-consumable-product-spec-label';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import type { ProductEquipmentConditionLabel } from '@/lib/product-hero-meta';

export function resolveProductCardConditionLabel(
  product: ProductBadgeSource & { name: string; category?: string | null },
): ProductEquipmentConditionLabel | null {
  if (!isPrinterProduct(product)) return null;

  if (productQualifiesAsSeminuevaEquipment(product)) return 'Seminueva';
  if (productQualifiesAsRemanufacturadaEquipment(product)) return 'Remanufacturada';
  if (productQualifiesAsNuevaEquipment(product)) return 'Nueva';

  const category = (product.category ?? '').toLowerCase();
  if (category.includes('seminuevas') || category.includes('seminuevos')) return 'Seminueva';
  if (category.includes('remanufacturadas') || category.includes('remanufacturados')) {
    return 'Remanufacturada';
  }
  if (category.includes('nuevas') || category.includes('nuevos')) return 'Nueva';

  return null;
}

/** Etiqueta de estado/condición para la fila de badges en tarjetas de inicio. */
export function resolveProductCardEstadoLabel(
  product: ProductBadgeSource & { name: string; category?: string | null },
): string | null {
  const equipmentLabel = resolveProductCardConditionLabel(product);
  if (equipmentLabel) return equipmentLabel;

  if (isConsumableProductForCardSpec(product)) {
    return resolveConsumableEstadoLabel(product);
  }

  return null;
}

/** Etiqueta de badge en tarjetas de catálogo (Original/Compatible o condición de equipo). */
export function resolveProductCardBadgeLabel(
  product: ProductBadgeSource & { name: string; category?: string | null },
): string | null {
  const estado = resolveProductCardEstadoLabel(product);
  if (estado) return estado;

  if (isConsumableProductForCardSpec(product)) {
    return 'Original';
  }

  return null;
}
