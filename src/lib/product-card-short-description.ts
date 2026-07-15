import {
  inferProduccionTier,
  PRODUCCION_ATTR,
  resolveFormatoPapelDisplayLabel,
  resolveProductSpeedPpm,
} from '@/lib/category-catalog-filters';
import { normalizeStorefrontHeroBullets } from '@/lib/product-storefront-detail';
import type { ProductAttribute } from '@/types/product';

export type ProductCardSpecRow = {
  id: 'funciones' | 'velocidad' | 'formato' | 'produccion';
  label: string;
  value: string;
};

type ProductShortDescriptionSource = {
  name?: string;
  description?: string | null;
  category?: string | null;
  attributes?: ProductAttribute[] | null;
  storefront_hero_bullets?: unknown;
};

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function findAttributeValue(
  attributes: ProductAttribute[] | null | undefined,
  ...needles: string[]
): string | null {
  const wanted = needles.map(normalizeKey);
  for (const attr of attributes ?? []) {
    const key = normalizeKey(attr.name ?? '');
    const value = attr.value?.trim();
    if (!key || !value) continue;
    if (wanted.some((needle) => key === needle || key.includes(needle))) {
      return value;
    }
  }
  return null;
}

function parseLabeledLine(line: string): { label: string; value: string } | null {
  const match = line.match(/^([^:]{2,40}):\s*(.+)$/);
  if (!match) return null;
  const label = match[1]?.trim() ?? '';
  const value = match[2]?.trim() ?? '';
  if (!label || !value) return null;
  return { label, value };
}

function classifyLabel(label: string): ProductCardSpecRow['id'] | null {
  const key = normalizeKey(label);
  if (/funcion/.test(key)) return 'funciones';
  if (/velocidad|ppm/.test(key)) return 'velocidad';
  if (/formato|papel|tamano|tamaño|a3|a4/.test(key) && !/produccion/.test(key)) return 'formato';
  if (/produccion|volumen|paginas/.test(key)) return 'produccion';
  return null;
}

function heroBulletSpecs(product: ProductShortDescriptionSource): Partial<
  Record<ProductCardSpecRow['id'], string>
> {
  const result: Partial<Record<ProductCardSpecRow['id'], string>> = {};
  const bullets = normalizeStorefrontHeroBullets(product.storefront_hero_bullets);
  for (const bullet of bullets) {
    const text = bullet.text?.trim();
    if (!text) continue;
    const labeled = parseLabeledLine(text);
    if (labeled) {
      const id = classifyLabel(labeled.label);
      if (id && !result[id]) result[id] = labeled.value;
      continue;
    }
    const id = classifyLabel(text);
    if (id && !result[id]) {
      result[id] = text.replace(/^(funciones|velocidad|formato|producci[oó]n)\s*:?\s*/i, '').trim();
    }
  }
  return result;
}

function descriptionLineSpecs(product: ProductShortDescriptionSource): Partial<
  Record<ProductCardSpecRow['id'], string>
> {
  const result: Partial<Record<ProductCardSpecRow['id'], string>> = {};
  const lines = (product.description ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const labeled = parseLabeledLine(line);
    if (!labeled) continue;
    const id = classifyLabel(labeled.label);
    if (id && !result[id]) result[id] = labeled.value;
  }
  return result;
}

function resolveFunciones(product: ProductShortDescriptionSource): string | null {
  const fromAttr = findAttributeValue(product.attributes, 'funciones', 'funcion');
  if (fromAttr) return fromAttr;

  const haystack = `${product.name ?? ''} ${product.category ?? ''}`.toLowerCase();
  if (/multifunc|copiadora/.test(haystack)) {
    return 'Copiadora, Impresora, Escáner y fax';
  }
  return null;
}

function resolveVelocidad(product: ProductShortDescriptionSource): string | null {
  const fromAttr = findAttributeValue(product.attributes, 'velocidad', 'ppm');
  if (fromAttr) return fromAttr;
  const ppm = resolveProductSpeedPpm({
    name: product.name ?? '',
    attributes: product.attributes ?? [],
  });
  return ppm != null ? `${ppm} ppm` : null;
}

function resolveFormato(product: ProductShortDescriptionSource): string | null {
  const fromAttr = findAttributeValue(product.attributes, 'formato', 'papel', 'tamano');
  if (fromAttr) return fromAttr;
  return resolveFormatoPapelDisplayLabel({
    name: product.name ?? '',
    category: product.category ?? null,
    attributes: product.attributes ?? [],
  });
}

function resolveProduccion(product: ProductShortDescriptionSource): string | null {
  const stored = (product.attributes ?? []).find(
    (attr) => attr.name.trim() === PRODUCCION_ATTR,
  )?.value;
  if (stored?.trim()) return stored.trim();

  const generic = findAttributeValue(product.attributes, 'produccion', 'volumen');
  if (generic) return generic;

  if (/multifunc/i.test(product.category ?? '')) {
    return inferProduccionTier({
      name: product.name ?? '',
      category: product.category ?? null,
      attributes: product.attributes ?? [],
    });
  }
  return null;
}

/**
 * Filas etiquetadas para tarjetas: Funciones; Velocidad; Formato; Producción.
 * Omite valores vacíos.
 */
export function resolveProductCardSpecRows(
  product: ProductShortDescriptionSource | null | undefined,
): ProductCardSpecRow[] {
  if (!product) return [];

  const fromHero = heroBulletSpecs(product);
  const fromDescription = descriptionLineSpecs(product);

  const specs: Array<{ id: ProductCardSpecRow['id']; label: string; value: string | null }> = [
    {
      id: 'funciones',
      label: 'Funciones',
      value: fromHero.funciones ?? fromDescription.funciones ?? resolveFunciones(product),
    },
    {
      id: 'velocidad',
      label: 'Velocidad',
      value: fromHero.velocidad ?? fromDescription.velocidad ?? resolveVelocidad(product),
    },
    {
      id: 'formato',
      label: 'Formato',
      value: fromHero.formato ?? fromDescription.formato ?? resolveFormato(product),
    },
    {
      id: 'produccion',
      label: 'Producción',
      value: fromHero.produccion ?? fromDescription.produccion ?? resolveProduccion(product),
    },
  ];

  return specs
    .filter((row): row is { id: ProductCardSpecRow['id']; label: string; value: string } =>
      Boolean(row.value?.trim()),
    )
    .map((row) => ({ id: row.id, label: row.label, value: row.value.trim() }));
}

/** Texto breve plano (compat). Preferir `resolveProductCardSpecRows` en tarjetas. */
export function resolveProductCardShortDescription(
  product: ProductShortDescriptionSource | null | undefined,
): string | null {
  const rows = resolveProductCardSpecRows(product);
  if (rows.length > 0) {
    return rows.map((row) => row.value).join(' · ');
  }

  if (!product) return null;

  const bullets = normalizeStorefrontHeroBullets(product.storefront_hero_bullets);
  if (bullets.length > 0) {
    const lines = bullets.map((item) => item.text.trim()).filter(Boolean);
    if (lines.length === 1) return lines[0] ?? null;
    if (lines.length > 1) return lines.slice(0, 2).join(' · ');
  }

  const description = product.description?.trim();
  if (!description) return null;

  const firstLine = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ?? description;
}
