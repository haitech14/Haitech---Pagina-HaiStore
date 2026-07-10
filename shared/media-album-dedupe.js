/**
 * Normaliza la URL de un medio para comparar duplicados (misma ruta = misma imagen).
 * @param {unknown} url
 */
export function normalizeMediaAlbumUrlKey(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('youtube:')) {
    return trimmed.toLowerCase();
  }

  try {
    const parsed = new URL(trimmed, 'https://album.local');
    return decodeURIComponent(parsed.pathname).toLowerCase();
  } catch {
    return trimmed.toLowerCase().split('?')[0].split('#')[0];
  }
}

function pickCanonicalUrl(items) {
  const withoutQuery = items.find((item) => !String(item.url).includes('?'));
  return (withoutQuery ?? items[0]).url;
}

function pickCanonicalName(items) {
  const sorted = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sorted[0]?.name ?? 'Sin nombre';
}

/**
 * Agrupa ítems con la misma URL (y tipo) en uno solo que apunta a la imagen canónica.
 * @template {Record<string, unknown> & { id: string; url: string; kind: string; name: string; created_at: string }} T
 * @param {readonly T[]} items
 * @returns {Array<T & { duplicateCount: number; mergedIds: string[] }>}
 */
export function dedupeMediaAlbumItems(items) {
  /** @type {Map<string, T[]>} */
  const groups = new Map();

  for (const item of items) {
    const key = `${item.kind}:${normalizeMediaAlbumUrlKey(item.url)}`;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }

  const deduped = [];

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const canonical = sorted[0];
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
