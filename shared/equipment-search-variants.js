/**
 * SKUs de preparación/voltaje vinculados a un equipo base (p. ej. Cilindro y cuchilla,
 * Ligero Punto). No deben listarse en el buscador: se eligen en la ficha del equipo.
 */

/** Hijos de IM 550F seminueva: se venden desde la ficha Estándar 220V. */
export const IM550F_CHILD_VARIANT_IDS = new Set([
  '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2',
  'a4be1850-48ac-40fd-8962-14c00bec5e59',
  '1f34bfe4-95be-45c4-be3e-37a740fee9b9',
  '9a955212-f712-4a2e-acf7-f03b059f7c98',
  'a334ef53-4cb1-4207-9df8-7492c3123290',
]);

function readAttribute(product, name) {
  const attrs = product?.attributes;
  if (!Array.isArray(attrs)) return null;
  const target = String(name).trim().toLowerCase();
  const row = attrs.find((item) => String(item?.name ?? '').trim().toLowerCase() === target);
  const value = String(row?.value ?? '').trim();
  return value || null;
}

function normalizeVariantKey(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();
}

/** Stubs de lista (código LISTA-…): no son fichas de vitrina ni del buscador. */
export function isListaCatalogStubProduct(product) {
  return /^LISTA-/i.test(String(product?.code ?? '').trim());
}

/** True si el producto es una opción de variante (no el SKU base Estándar). */
export function isIm550fChildVariantSku(product) {
  const id = String(product?.id ?? '').trim();
  if (id && IM550F_CHILD_VARIANT_IDS.has(id)) return true;
  const name = String(product?.name ?? '');
  return /\bim\s*550f\b/i.test(name) && /(ligero\s*punto|cilindro)/i.test(name);
}

export function isEquipmentVariantSkuForSearch(product) {
  if (isListaCatalogStubProduct(product)) return true;
  if (isIm550fChildVariantSku(product)) return true;
  const fromAttr = readAttribute(product, 'Variante');
  if (!fromAttr) return false;
  const key = normalizeVariantKey(fromAttr);
  return key.length > 0 && key !== 'estandar';
}

/** IDs referenciados como variantes hijas desde `variant_product_ids`. */
export function collectReferencedVariantProductIds(products) {
  const ids = new Set();
  for (const product of products ?? []) {
    const linked = product?.variant_product_ids;
    if (!Array.isArray(linked)) continue;
    for (const id of linked) {
      if (typeof id === 'string' && id.trim()) ids.add(id.trim());
    }
  }
  return ids;
}

/**
 * Quita SKUs de variante del listado de búsqueda.
 * @param {unknown[]} list — resultados ya filtrados por query
 * @param {unknown[]} [catalog=list] — catálogo completo para resolver vínculos
 */
export function excludeEquipmentVariantSkusFromSearch(list, catalog = list) {
  const referenced = collectReferencedVariantProductIds(catalog);
  return (list ?? []).filter(
    (product) =>
      product &&
      !isEquipmentVariantSkuForSearch(product) &&
      !referenced.has(String(product.id ?? '')),
  );
}
