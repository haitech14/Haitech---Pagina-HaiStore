import type { ProductAttribute } from '@/types/product';

export const COMMON_ATTRIBUTE_NAMES = [
  'Tecnología',
  'Color',
  'Velocidad',
  'Formato papel',
  'Impresión dúplex',
  'Alimentador (ADF)',
  'Conectividad',
  'Memoria',
  'Capacidad bandeja',
] as const;

export function createEmptyAttribute(): ProductAttribute {
  return {
    id: crypto.randomUUID(),
    name: '',
    value: '',
  };
}

export function normalizeAttributes(value: unknown): ProductAttribute[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Partial<ProductAttribute>;
      const name = typeof row.name === 'string' ? row.name.trim() : '';
      const val = typeof row.value === 'string' ? row.value.trim() : '';
      const id =
        typeof row.id === 'string' && row.id.trim().length > 0
          ? row.id.trim()
          : crypto.randomUUID();
      if (!name && !val) return null;
      return { id, name, value: val };
    })
    .filter((row): row is ProductAttribute => row != null);
}

export function formatAttributeLabel(attribute: ProductAttribute): string {
  const name = attribute.name?.trim() ?? '';
  const value = attribute.value?.trim() ?? '';
  if (name && value) return `${name}: ${value}`;
  return name || value;
}

export function buildAttributeNameCatalog(
  products: readonly { attributes?: ProductAttribute[] }[],
): string[] {
  const seen = new Set<string>(COMMON_ATTRIBUTE_NAMES);

  for (const product of products) {
    for (const attribute of product.attributes ?? []) {
      const name = attribute.name?.trim();
      if (name) seen.add(name);
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, 'es'));
}
