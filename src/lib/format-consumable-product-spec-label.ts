import {
  inferProductConditionFromText,
  isPrinterEquipmentProduct,
  productMatchesCatalogFamily,
  productMatchesCondition,
  type CatalogFamilySlug,
} from '@/lib/product-condition';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import type { Product } from '@/types/product';

const CONSUMABLE_TYPE_LABELS = {
  cartucho: 'Cartucho',
  toner: 'Tóner',
  tinta: 'Tinta',
  repuesto: 'Repuesto',
} as const;

type ConsumableCommercialType = keyof typeof CONSUMABLE_TYPE_LABELS;

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function productHaystack(product: ProductBadgeSource): string {
  const attributeText = (product.attributes ?? [])
    .map((attribute) => `${attribute.name ?? ''} ${attribute.value ?? ''}`)
    .join(' ');

  return normalizeText(
    `${product.category} ${product.name} ${product.brand ?? ''} ${product.code ?? ''} ${attributeText}`,
  );
}

function asProduct(product: ProductBadgeSource): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? null,
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
    price: 0,
    currency: 'USD',
    image_url: null,
    stock: 0,
    description: null,
    created_at: '',
  };
}

export function isConsumableProductForCardSpec(product: ProductBadgeSource): boolean {
  const row = asProduct(product);

  if (productMatchesCatalogFamily(row, 'toner-suministros')) return true;
  if (productMatchesCatalogFamily(row, 'repuestos') && !isPrinterEquipmentProduct(row)) {
    return true;
  }

  const haystack = productHaystack(product);
  if (
    haystack.includes('toner') ||
    haystack.includes('cartucho') ||
    haystack.includes('suministro') ||
    haystack.includes('consumible') ||
    haystack.includes('repuesto') ||
    haystack.includes('cilindro') ||
    haystack.includes('tambor') ||
    haystack.includes('fusor') ||
    haystack.includes('rodillo') ||
    haystack.includes('tinta')
  ) {
    return !isPrinterProduct(product);
  }

  return false;
}

function inferConsumableCatalogFamily(product: ProductBadgeSource): CatalogFamilySlug | null {
  const row = asProduct(product);

  if (productMatchesCatalogFamily(row, 'repuestos') && !isPrinterEquipmentProduct(row)) {
    return 'repuestos';
  }
  if (productMatchesCatalogFamily(row, 'toner-suministros')) {
    return 'toner-suministros';
  }

  return null;
}

function inferConsumableCommercialType(product: ProductBadgeSource): ConsumableCommercialType {
  const haystack = productHaystack(product);
  const row = asProduct(product);

  if (haystack.includes('cartucho') || haystack.includes('print cartridge')) {
    return 'cartucho';
  }

  if (
    haystack.includes('tinta') ||
    haystack.includes('inkjet') ||
    (haystack.includes('ink') && !haystack.includes('toner'))
  ) {
    return 'tinta';
  }

  if (
    productMatchesCatalogFamily(row, 'repuestos') ||
    haystack.includes('repuesto') ||
    haystack.includes('tambor') ||
    haystack.includes('fusor') ||
    haystack.includes('rodillo')
  ) {
    return 'repuesto';
  }

  return 'toner';
}

function hasRecargaKeyword(haystack: string): boolean {
  return (
    haystack.includes('recarga') ||
    haystack.includes('refill') ||
    haystack.includes('relleno')
  );
}

/** Etiqueta de condición comercial cuando hay señales en categoría o nombre. */
export function resolveConsumableEstadoLabel(product: ProductBadgeSource): string | null {
  const haystack = productHaystack(product);

  if (hasRecargaKeyword(haystack)) {
    return 'Recarga';
  }

  const row = asProduct(product);
  const family = inferConsumableCatalogFamily(product);

  if (productMatchesCondition(row, 'remanufacturados', family)) {
    return 'Remanufacturado';
  }

  if (productMatchesCondition(row, 'compatibles', family)) {
    return 'Compatible';
  }

  if (productMatchesCondition(row, 'originales', family)) {
    return 'Original';
  }

  const categoryHint = product.category ? inferProductConditionFromText(product.category) : null;
  if (categoryHint === 'remanufacturados') return 'Remanufacturado';
  if (categoryHint === 'compatibles') return 'Compatible';
  if (categoryHint === 'originales') return 'Original';

  return null;
}

function inferConsumableConditionLabel(product: ProductBadgeSource): string {
  return resolveConsumableEstadoLabel(product) ?? 'Original';
}

/** Línea compacta para consumibles: "Cartucho · Original", "Tóner · Compatible", etc. */
export function formatConsumableProductSpecLabel(product: ProductBadgeSource): string | null {
  if (!isConsumableProductForCardSpec(product)) return null;

  const typeLabel = CONSUMABLE_TYPE_LABELS[inferConsumableCommercialType(product)];
  const conditionLabel = inferConsumableConditionLabel(product);

  return `${typeLabel} · ${conditionLabel}`;
}
