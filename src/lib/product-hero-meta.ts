import { getProductCardTitleContent } from '@/lib/product-card-title';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { stripProductCodeDisplayPrefix } from '@/lib/product-display-code';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import type { Product } from '@/types/product';

const KNOWN_BRAND_PATTERN =
  /\b(RICOH|HP|CANON|EPSON|BROTHER|KONICA|KYOCERA|XEROX|LEXMARK|SAMSUNG)\b/i;

export type ProductEquipmentConditionLabel = 'Nueva' | 'Seminueva' | 'Remanufacturada';

export type ProductStockAvailabilityTone = 'available' | 'low' | 'unavailable';

export interface ProductStockAvailability {
  label: string;
  tone: ProductStockAvailabilityTone;
  quantity: number;
}

/** Marca sincronizada con tarjetas de catálogo (inventario → nombre). */
export function resolveProductHeroBrand(product: ProductBadgeSource): string | null {
  const fromInventory = product.brand?.trim();
  if (fromInventory) return fromInventory.toUpperCase();

  const fromName = product.name.match(KNOWN_BRAND_PATTERN)?.[1];
  if (fromName) return fromName.toUpperCase();

  return null;
}

/** Código de inventario listo para UI (misma lógica que tarjetas). */
export function resolveProductHeroCode(
  product: ProductBadgeSource & {
    code?: string | null;
    category?: string | null;
    id?: string;
  },
): string | null {
  const fromCard = getProductCardTitleContent(product).code;
  if (fromCard) return fromCard;

  const raw = product.code?.trim();
  if (!raw) return null;

  const stripped = stripProductCodeDisplayPrefix(raw);
  return stripped || raw;
}

/** Condición del equipo para la ficha (Nueva, Seminueva, Remanufacturada). */
export function resolveProductEquipmentConditionLabel(
  product: Product,
): ProductEquipmentConditionLabel | null {
  if (!isPrinterProduct(product)) return null;

  if (productQualifiesAsSeminuevaEquipment(product)) return 'Seminueva';
  if (productQualifiesAsRemanufacturadaEquipment(product)) return 'Remanufacturada';

  const category = (product.category ?? '').toLowerCase();
  if (category.includes('seminuevas')) return 'Seminueva';
  if (category.includes('remanufacturadas') || category.includes('remanufacturados')) {
    return 'Remanufacturada';
  }

  if (productQualifiesAsNuevaEquipment(product)) return 'Nueva';
  if (category.includes('nuevas') || category.includes('nuevos')) return 'Nueva';

  return 'Nueva';
}

/** Etiqueta de stock alineada al inventario real. */
export function resolveProductStockAvailability(
  product: Product,
  outOfStock: boolean,
): ProductStockAvailability {
  const quantity = outOfStock ? 0 : Math.max(0, Math.floor(Number(product.stock) || 0));

  if (quantity <= 0) {
    return { label: 'Sin stock', tone: 'unavailable', quantity: 0 };
  }

  if (quantity <= 3) {
    return {
      label: `Últimas unidades · ${quantity} unids.`,
      tone: 'low',
      quantity,
    };
  }

  return {
    label: `En stock · ${quantity} unids.`,
    tone: 'available',
    quantity,
  };
}
