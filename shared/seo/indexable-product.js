/**
 * Productos aptos para sitemap / snapshot SEO (excluye copias y páginas thin).
 * @param {{ name?: string, slug?: string, code?: string, id?: string, description?: string, image_url?: string, gallery?: unknown[] }} product
 */
export function isIndexableCatalogProduct(product) {
  const name = String(product?.name ?? '').trim();
  if (!name) return false;

  // Copias de inventario: nombre con "(copia)" o slug/código de duplicado
  if (/\(copia\)/i.test(name)) return false;

  const slug = String(product?.slug ?? '').trim().toLowerCase();
  if (/(^|-)copia(-|$)/i.test(slug) || slug.includes('(copia)')) return false;

  const code = String(product?.code ?? '').trim().toUpperCase();
  if (/-CP\b/.test(code) || /CP\d+$/.test(code)) return false;

  const desc = String(product?.description ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const hasImage = Boolean(
    product?.image_url ||
      (Array.isArray(product?.gallery) && product.gallery.some((item) => Boolean(item))),
  );

  // Thin: sin imagen y sin descripción útil
  if (!hasImage && desc.length < 40) return false;

  return true;
}
