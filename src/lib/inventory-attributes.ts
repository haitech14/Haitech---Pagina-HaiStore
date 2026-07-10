import { randomId } from '@/lib/random-id';
import type { ProductAttribute } from '@/types/product';

export const COMMON_ATTRIBUTE_NAMES = [
  'Tecnología',
  'Color',
  'Velocidad',
  'Formato',
  'Formato papel',
  'Condición',
  'Generación',
  'Año de Fabricación',
  'Producción',
  'Volumen mensual',
  'Impresión dúplex',
  'Alimentador (ADF)',
  'Conectividad',
  'Memoria',
  'Capacidad bandeja',
] as const;

/** Valores sugeridos por nombre de atributo (listas desplegables). */
export const ATTRIBUTE_PRESET_VALUES: Record<string, readonly string[]> = {
  Color: ['Color', 'B/N'],
  Formato: ['A4', 'A3'],
  'Formato papel': ['A4', 'A3'],
  Condición: [
    'Nueva',
    'Seminueva',
    'Remanufacturada',
    'Original',
    'Compatible',
    'Recarga',
  ],
  Generación: ['Linea IM', 'Linea Smart'],
  'Año de Fabricación': ['2024', '2026', '2022', '2014', '2016', '2020'],
  Producción: [
    'Basico (>5000 páginas)',
    'Mediano (15,000 páginas aprox)',
    'Alta Producción (50,000 páginas aprox)',
    'Producción (200,000 a 500,000 páginas aprox)',
  ],
  'Alimentador (ADF)': ['Estándar', 'Doble Scan'],
  'Impresión dúplex': ['Sí', 'No', 'Automático'],
  Tecnología: ['Láser', 'Inkjet', 'Plotter'],
  Conectividad: ['USB', 'Ethernet', 'Wi-Fi', 'Wi-Fi Direct'],
};

export const ATTRIBUTE_CUSTOM_OPTION = '__custom__';

export function createEmptyAttribute(): ProductAttribute {
  return {
    id: randomId(),
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
          : randomId();
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

export function getAttributeValueOptions(
  attributeName: string,
  products: readonly { attributes?: ProductAttribute[] }[],
): string[] {
  const name = attributeName.trim();
  if (!name) return [];

  const seen = new Set<string>(ATTRIBUTE_PRESET_VALUES[name] ?? []);

  for (const product of products) {
    for (const attribute of product.attributes ?? []) {
      if (attribute.name?.trim() === name && attribute.value?.trim()) {
        seen.add(attribute.value.trim());
      }
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, 'es'));
}

export function getProductAttributeValue(
  attributes: ProductAttribute[] | undefined,
  attributeName: string,
): string {
  const name = attributeName.trim();
  if (!name) return '';
  return attributes?.find((attribute) => attribute.name?.trim() === name)?.value?.trim() ?? '';
}

export function upsertProductAttribute(
  attributes: ProductAttribute[] | undefined,
  attributeName: string,
  value: string,
): ProductAttribute[] {
  const name = attributeName.trim();
  const trimmedValue = value.trim();
  const list = normalizeAttributes(attributes);

  if (!name) return list;

  const index = list.findIndex((attribute) => attribute.name.trim() === name);
  if (!trimmedValue) {
    if (index === -1) return list;
    return list.filter((_, itemIndex) => itemIndex !== index);
  }

  if (index === -1) {
    return [...list, { id: randomId(), name, value: trimmedValue }];
  }

  return list.map((attribute, itemIndex) =>
    itemIndex === index ? { ...attribute, name, value: trimmedValue } : attribute,
  );
}

export function mergeSelectOptions(
  options: readonly string[],
  currentValue: string,
): string[] {
  const value = currentValue.trim();
  if (!value || options.includes(value)) return [...options];
  return [...options, value];
}
