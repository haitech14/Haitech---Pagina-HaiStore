import { productMediaCanonicalKey } from './product-media-dedupe.js';

/**
 * Normaliza la URL de un medio para comparar duplicados.
 * Fusiona variantes responsive (-256/-512/-1024) en la misma clave.
 * @param {unknown} url
 */
export function normalizeMediaAlbumUrlKey(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('youtube:')) {
    return trimmed.toLowerCase();
  }

  let pathname = trimmed;
  try {
    const parsed = new URL(trimmed, 'https://album.local');
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    pathname = trimmed.split('?')[0].split('#')[0];
  }

  const productKey = productMediaCanonicalKey(pathname);
  if (productKey.startsWith('/products/')) {
    return productKey;
  }

  return pathname.toLowerCase();
}

function isResponsiveVariantUrl(url) {
  return /\/products\/.+-(?:256|512|768|1024|1280|1920)\.(webp|png|jpe?g)(?:$|\?)/i.test(
    String(url),
  );
}

/** Menor = preferido al elegir la URL canónica del grupo. */
function mediaUrlRank(url) {
  if (isResponsiveVariantUrl(url)) return 20;
  if (String(url).includes('?')) return 5;
  if (/\.webp$/i.test(String(url))) return 0;
  if (/\.(png|jpe?g)$/i.test(String(url))) return 2;
  return 3;
}

function pickCanonicalUrl(items) {
  let best = items[0];
  let bestRank = mediaUrlRank(best?.url);
  for (const item of items) {
    const rank = mediaUrlRank(item.url);
    if (rank < bestRank) {
      best = item;
      bestRank = rank;
    }
  }
  return best.url;
}

function pickCanonicalName(items) {
  const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sorted[0]?.name ?? 'Sin nombre';
}

function pickPreferredItem(items) {
  // Preferir ítem real del álbum frente a vista de inventario.
  const fromAlbum = items.find((item) => !String(item.id).startsWith('inventory:'));
  if (fromAlbum) return fromAlbum;
  const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sorted[0];
}

/**
 * Agrupa ítems con la misma imagen (URL canónica / variantes) en uno solo.
 * @template {Record<string, unknown> & { id: string; url: string; kind: string; name: string; created_at: string }} T
 * @param {readonly T[]} items
 * @returns {Array<T & { duplicateCount: number; mergedIds: string[] }>}
 */
export function dedupeMediaAlbumItems(items) {
  /** @type {Map<string, T[]>} */
  const groups = new Map();

  for (const item of items) {
    const contentKey =
      typeof item.content_hash === 'string' && item.content_hash.length > 0
        ? `hash:${item.content_hash}`
        : null;
    const key = contentKey ?? `${item.kind}:${normalizeMediaAlbumUrlKey(item.url)}`;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }

  const deduped = [];

  for (const group of groups.values()) {
    const canonical = pickPreferredItem(group);
    deduped.push({
      ...canonical,
      url: pickCanonicalUrl(group),
      name: pickCanonicalName(group),
      duplicateCount: group.length,
      mergedIds: group.map((entry) => entry.id),
    });
  }

  return deduped.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
