/**
 * SKUs de preparación/voltaje vinculados a un equipo base (p. ej. Cilindro y cuchilla,
 * Ligero Punto). No deben listarse en el buscador: se eligen en la ficha del equipo.
 */

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

/** True si el producto es una opción de variante (no el SKU base Estándar). */
export function isEquipmentVariantSkuForSearch(product) {
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
