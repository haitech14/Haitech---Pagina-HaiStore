import { MODELO_EQUIPO_ATTR } from '@/lib/category-catalog-filters';
import { extractProductYield, formatYieldLabel } from '@/lib/product-cost-per-copy';
import { resolveTonerColorLabel } from '@/lib/product-configure-toner';
import { resolveProductHeroBrand, resolveProductHeroCode } from '@/lib/product-hero-meta';
import type { ProductCardSpecRow } from '@/lib/product-card-short-description';
import type { Product, ProductAttribute } from '@/types/product';
import type { ProductSpecRow } from '@/types/product-detail';

export type SupplyProductCardSpecId =
  | 'marca'
  | 'sku'
  | 'color'
  | 'rendimiento'
  | 'compatibilidad';

export type SupplyProductCardSpecRow = {
  id: SupplyProductCardSpecId;
  label: string;
  value: string;
};

function findAttributeValue(
  attributes: ProductAttribute[] | null | undefined,
  ...needles: string[]
): string | null {
  const wanted = needles.map((needle) =>
    needle
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .trim(),
  );
  for (const attr of attributes ?? []) {
    const key = (attr.name ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .trim();
    const value = attr.value?.trim();
    if (!key || !value) continue;
    if (wanted.some((needle) => key === needle || key.includes(needle))) {
      return value;
    }
  }
  return null;
}

function resolveSupplyPresentation(product: Pick<Product, 'name' | 'category' | 'attributes'>): string {
  const tipo = findAttributeValue(product.attributes, 'tipo', 'presentacion');
  const haystack = `${tipo ?? ''} ${product.category ?? ''} ${product.name ?? ''}`.toLowerCase();
  if (/compatible|alternativo|gen[eé]rico/.test(haystack)) return 'compatible';
  return 'original';
}

/** Modelos compatibles desde atributo «Modelo de equipo» (u similares). */
export function resolveSupplyCompatibleModels(
  product: Pick<Product, 'attributes' | 'description' | 'name'>,
): string[] {
  const raw =
    findAttributeValue(
      product.attributes,
      MODELO_EQUIPO_ATTR,
      'modelo de equipo',
      'compatibilidad',
      'compatible con',
      'usar en',
    ) ?? '';

  if (!raw.trim()) return [];

  return raw
    .split(/[,;/|]+|\s+y\s+/i)
    .map((part) => part.replace(/^para\s+/i, '').trim())
    .filter((part) => part.length >= 2)
    .filter((part, index, list) => {
      const key = part.toLowerCase();
      return list.findIndex((item) => item.toLowerCase() === key) === index;
    });
}

export function resolveSupplyProductFacts(product: Product): {
  brand: string;
  sku: string;
  color: string | null;
  yieldLabel: string | null;
  yieldPages: number | null;
  compatibleModels: string[];
  presentation: string;
} {
  const brand = resolveProductHeroBrand(product) ?? product.brand?.trim() ?? 'Ricoh';
  const sku = resolveProductHeroCode(product) ?? product.code?.trim() ?? '';
  const colorAttr = findAttributeValue(product.attributes, 'color');
  const color =
    resolveTonerColorLabel(product) ??
    (colorAttr
      ? /\bblack\b|\bnegro\b|\bbk\b/i.test(colorAttr)
        ? 'Negro'
        : /\bcyan\b|\bcian\b|\bcy\b/i.test(colorAttr)
          ? 'Cyan'
          : /\bmagenta\b|\bmg\b/i.test(colorAttr)
            ? 'Magenta'
            : /\byellow\b|\bamarillo\b|\byw\b/i.test(colorAttr)
              ? 'Amarillo'
              : colorAttr
      : null) ??
    (/\bblack\b|\bnegro\b|\bbk\b/i.test(product.name)
      ? 'Negro'
      : /\bcyan\b|\bcian\b/i.test(product.name)
        ? 'Cyan'
        : /\bmagenta\b/i.test(product.name)
          ? 'Magenta'
          : /\byellow\b|\bamarillo\b/i.test(product.name)
            ? 'Amarillo'
            : null);
  const yieldInfo = extractProductYield(product);
  const yieldLabel =
    yieldInfo.pages != null || yieldInfo.label
      ? formatYieldLabel(yieldInfo.pages, yieldInfo.label)
      : null;
  const compatibleModels = resolveSupplyCompatibleModels(product);
  const presentation = resolveSupplyPresentation(product);

  return {
    brand,
    sku,
    color,
    yieldLabel: yieldLabel === '—' ? null : yieldLabel,
    yieldPages: yieldInfo.pages,
    compatibleModels,
    presentation,
  };
}

/** Filas estilo tabla de ficha (Marca · SKU · Color · Rendimiento · Compatibilidad). */
export function resolveSupplyProductCardSpecRows(product: Product): SupplyProductCardSpecRow[] {
  const facts = resolveSupplyProductFacts(product);
  const rows: Array<{ id: SupplyProductCardSpecId; label: string; value: string | null }> = [
    { id: 'marca', label: 'Marca', value: facts.brand },
    { id: 'sku', label: 'SKU', value: facts.sku || null },
    { id: 'color', label: 'Color', value: facts.color ?? 'Negro' },
    { id: 'rendimiento', label: 'Rendimiento', value: facts.yieldLabel },
  ];

  return rows
    .filter((row): row is { id: SupplyProductCardSpecId; label: string; value: string } =>
      Boolean(row.value?.trim()),
    )
    .map((row) => ({ id: row.id, label: row.label, value: row.value.trim() }));
}

/** Specs de pestaña Especificaciones con datos reales del inventario. */
export function buildResolvedSupplySpecs(product: Product): ProductSpecRow[] {
  const facts = resolveSupplyProductFacts(product);
  const tipo = findAttributeValue(product.attributes, 'tipo') ?? 'Cartucho de toner';
  const rows: ProductSpecRow[] = [
    { label: 'Marca', value: facts.brand },
  ];
  if (facts.sku) rows.push({ label: 'SKU', value: facts.sku });
  if (facts.color) rows.push({ label: 'Color', value: facts.color });
  rows.push({ label: 'Tipo', value: tipo });
  if (facts.yieldLabel) rows.push({ label: 'Rendimiento', value: facts.yieldLabel });
  if (facts.compatibleModels.length > 0) {
    rows.push({
      label: 'Compatibilidad',
      value: facts.compatibleModels.join(', '),
    });
  }
  return rows;
}

export type SupplyHeroDescriptionParts = {
  brandSku: string;
  presentation: string;
  color: string | null;
  yieldText: string | null;
};

/** Partes de la descripción al estilo catálogo de toner (para resaltar en UI). */
export function buildSupplyHeroDescriptionParts(product: Product): SupplyHeroDescriptionParts {
  const facts = resolveSupplyProductFacts(product);
  const brandSku = [facts.brand, facts.sku].filter(Boolean).join(' ');
  const yieldText = facts.yieldLabel
    ? facts.yieldLabel
        .replace(/\s*al\s*5%.*$/i, '')
        .replace(/^rinde:?\s*/i, '')
        .trim()
    : null;
  const color =
    facts.color === 'Negro' ? 'Black' : facts.color;

  return {
    brandSku: brandSku || facts.brand,
    presentation: facts.presentation,
    color,
    yieldText,
  };
}

/** Párrafo plano de descripción al estilo catálogo de toner. */
export function buildSupplyHeroDescription(product: Product): string {
  const parts = buildSupplyHeroDescriptionParts(product);
  const colorPart = parts.color ? ` de color ${parts.color}` : '';
  const yieldPart = parts.yieldText
    ? ` con rendimiento de ${parts.yieldText} de impresión`
    : '';
  return `Cartucho de Toner ${parts.brandSku} ${parts.presentation}${colorPart}${yieldPart}.`;
}

/** Adapta filas de supply al tipo de ProductCardSpecTable. */
export function supplyRowsAsProductCardSpecRows(
  rows: SupplyProductCardSpecRow[],
): ProductCardSpecRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
  }));
}
