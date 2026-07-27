import type { Product } from '@/types/product';

export interface ProductInventoryVariantOption {
  id: string;
  slug: string | null;
  code: string | null;
  name: string;
  variantLabel: string;
  voltage: string;
  priceUsd: number;
  stock: number;
  isCurrent: boolean;
}

const VOLTAGE_PATTERN = /\b(110|120|220)\s*V\b/i;

/** 110V y 120V son equivalentes en el catálogo peruano. */
export function normalizeVoltageKey(voltage: string): '110' | '220' {
  const compact = voltage.replace(/\s/g, '').toUpperCase();
  if (/110|120/.test(compact)) return '110';
  return '220';
}

function readAttribute(product: Product, name: string): string | null {
  const value = product.attributes?.find(
    (row) => row.name.trim().toLowerCase() === name.toLowerCase(),
  )?.value;
  return value?.trim() ? value.trim() : null;
}

export function resolveProductVariantLabel(product: Product): string {
  const fromAttr = readAttribute(product, 'Variante');
  if (fromAttr) return fromAttr;
  const name = product.name ?? '';
  if (/ligero\s+punto|c\/l\.p/i.test(name)) return 'Ligero Punto';
  if (/cilindro|cuchilla/i.test(name)) return 'Cilindro y cuchilla nueva';
  return 'Estándar';
}

export function resolveProductVoltageLabel(product: Product): string {
  const fromAttr = readAttribute(product, 'Voltaje');
  if (fromAttr) return normalizeVoltageKey(fromAttr) === '110' ? '110V' : '220V';
  const match = (product.name ?? '').match(VOLTAGE_PATTERN);
  if (match) {
    const digits = match[1];
    return normalizeVoltageKey(`${digits}V`) === '110' ? '110V' : '220V';
  }
  return '220V';
}

export function collectLinkedVariantProductIds(product: Product): string[] {
  const ids = new Set<string>([product.id]);
  for (const id of product.variant_product_ids ?? []) {
    if (typeof id === 'string' && id.trim()) ids.add(id.trim());
  }
  return [...ids];
}

export function buildInventoryVariantOptions(
  current: Product,
  linked: Product[],
): ProductInventoryVariantOption[] {
  const byId = new Map<string, Product>();
  byId.set(current.id, current);
  for (const product of linked) {
    if (product?.id) byId.set(product.id, product);
  }

  return [...byId.values()]
    .map((product) => ({
      id: product.id,
      slug: product.slug ?? null,
      code: product.code ?? null,
      name: product.name,
      variantLabel: resolveProductVariantLabel(product),
      voltage: resolveProductVoltageLabel(product),
      priceUsd: product.price,
      stock: product.stock ?? 0,
      isCurrent: product.id === current.id,
    }))
    .sort((a, b) => {
      const variantCmp = a.variantLabel.localeCompare(b.variantLabel, 'es');
      if (variantCmp !== 0) return variantCmp;
      return a.voltage.localeCompare(b.voltage, 'es');
    });
}

export function uniqueVariantLabels(options: ProductInventoryVariantOption[]): string[] {
  return [...new Set(options.map((option) => option.variantLabel))];
}

export function uniqueVoltageLabels(options: ProductInventoryVariantOption[]): string[] {
  return [...new Set(options.map((option) => option.voltage))];
}

export function findVariantOption(
  options: ProductInventoryVariantOption[],
  variantLabel: string,
  voltage: string,
): ProductInventoryVariantOption | undefined {
  return options.find(
    (option) => option.variantLabel === variantLabel && option.voltage === voltage,
  );
}
