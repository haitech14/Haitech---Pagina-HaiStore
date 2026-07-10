import { getProductCardTitleContent } from '@/lib/product-card-title';
import { resolveProductCardEstadoLabel } from '@/lib/product-card-condition';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { stripProductCodeDisplayPrefix } from '@/lib/product-display-code';
import { normalizeAttributes } from '@/lib/inventory-attributes';
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

const CONDITION_ATTRIBUTE_MATCH = ['condición', 'condicion', 'estado'] as const;

function normalizeConditionAttributeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function resolveConditionAttributeValue(product: ProductBadgeSource): string | null {
  const attributes = normalizeAttributes(product.attributes);
  for (const row of attributes) {
    const key = normalizeConditionAttributeKey(row.name ?? '');
    if (!key) continue;
    if (
      CONDITION_ATTRIBUTE_MATCH.some((needle) => key === needle || key.includes(needle))
    ) {
      const value = row.value?.trim();
      if (value) return value;
    }
  }
  return null;
}

function formatConditionAttributeValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^nuevo$/i.test(trimmed)) return 'Nueva';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const NUEVA_SEALED_LABEL = 'Nueva (Sellada en caja)';

function enrichNuevaConditionLabel(label: string): string {
  if (/^nueva\b/i.test(label)) return NUEVA_SEALED_LABEL;
  return label;
}

/** Condición visible bajo el título en ficha (atributo de inventario o inferencia de catálogo). */
export function resolveProductHeroConditionLabel(
  product: ProductBadgeSource & {
    description?: string | null;
    name: string;
    category?: string | null;
  },
): string | null {
  const fromAttribute = resolveConditionAttributeValue(product);
  if (fromAttribute) {
    return enrichNuevaConditionLabel(formatConditionAttributeValue(fromAttribute));
  }

  const inferred = resolveProductCardEstadoLabel(product);
  if (!inferred) return null;

  return enrichNuevaConditionLabel(inferred);
}

/** Etiqueta de stock alineada al inventario real. */
export function resolveProductStockAvailability(
  product: Product,
  outOfStock: boolean,
): ProductStockAvailability {
  const quantity = outOfStock ? 0 : Math.max(0, Math.floor(Number(product.stock) || 0));

  if (quantity <= 0) {
    return { label: 'A pedido', tone: 'unavailable', quantity: 0 };
  }

  if (quantity <= 3) {
    return {
      label: `Últimas unidades · ${quantity} unidades`,
      tone: 'low',
      quantity,
    };
  }

  return {
    label: `En stock · ${quantity} unidades`,
    tone: 'available',
    quantity,
  };
}
