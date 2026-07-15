/** Anchos de variantes responsive generadas en build (no confundir con `-2`, `-3` de galería). */
const RESPONSIVE_WIDTH_SUFFIX = /-(256|512|768|1024|1280|1920)\.(webp|png|jpe?g)$/i;

/**
 * Clave canónica para fusionar duplicados (misma imagen en distintas resoluciones).
 * @param {string} url
 */
export function productMediaCanonicalKey(url) {
  const trimmed = String(url ?? '').trim();
  if (!trimmed) return '';

  const path = trimmed.split('?')[0].split('#')[0];

  if (path.startsWith('/products/') && RESPONSIVE_WIDTH_SUFFIX.test(path)) {
    return path.replace(RESPONSIVE_WIDTH_SUFFIX, '.webp').toLowerCase();
  }

  return path.toLowerCase();
}

/** @param {string} url */
function isResponsiveVariantUrl(url) {
  return url.startsWith('/products/') && RESPONSIVE_WIDTH_SUFFIX.test(url);
}

/** Menor = preferido al fusionar. */
function mediaUrlRank(url) {
  if (isResponsiveVariantUrl(url)) return 20;
  if (/\.webp$/i.test(url)) return 0;
  if (/\.(png|jpe?g)$/i.test(url)) return 5;
  return 3;
}

/**
 * Fusiona URLs duplicadas (misma ruta, variantes `-256`/`-512`, mismo stem).
 * Conserva el orden original y la mejor calidad disponible.
 * @param {readonly string[]} urls
 * @returns {string[]}
 */
export function mergeDuplicateProductMediaUrls(urls) {
  /** @type {Map<string, string>} */
  const bestByKey = new Map();

  for (const raw of urls) {
    const url = typeof raw === 'string' ? raw.trim() : '';
    if (!url) continue;

    const key = productMediaCanonicalKey(url) || url.toLowerCase();
    const existing = bestByKey.get(key);
    if (!existing || mediaUrlRank(url) < mediaUrlRank(existing)) {
      bestByKey.set(key, url);
    }
  }

  const seen = new Set();
  /** @type {string[]} */
  const result = [];

  for (const raw of urls) {
    const url = typeof raw === 'string' ? raw.trim() : '';
    if (!url) continue;

    const key = productMediaCanonicalKey(url) || url.toLowerCase();
    const chosen = bestByKey.get(key);
    if (!chosen || seen.has(chosen)) continue;
    seen.add(chosen);
    result.push(chosen);
  }

  return result;
}
