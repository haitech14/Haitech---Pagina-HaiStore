/** @typedef {{
 *   id: string;
 *   name: string;
 *   description?: string | null;
 *   price_usd: number;
 *   image_url?: string | null;
 *   code?: string | null;
 * }} MerchandisingOptionalProduct */

/**
 * @param {unknown} value
 * @returns {MerchandisingOptionalProduct[]}
 */
export function normalizeMerchandisingOptionalProducts(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  /** @type {MerchandisingOptionalProduct[]} */
  const items = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const raw = /** @type {Record<string, unknown>} */ (entry);
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    const priceUsd = Number(raw.price_usd);
    if (!id || !name || !Number.isFinite(priceUsd) || priceUsd <= 0) continue;
    if (seen.has(id)) continue;
    seen.add(id);

    const description =
      typeof raw.description === 'string' ? raw.description.trim() || null : null;
    const imageUrl =
      typeof raw.image_url === 'string' ? raw.image_url.trim() || null : null;
    const code = typeof raw.code === 'string' ? raw.code.trim() || null : null;

    items.push({
      id,
      name,
      price_usd: Math.round(priceUsd * 100) / 100,
      ...(description ? { description } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(code ? { code } : {}),
    });
  }

  return items;
}

export function createMerchandisingOptionalProductId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return `opt-${crypto.randomUUID()}`;
    } catch {
      /* HTTP por IP / contexto no seguro */
    }
  }
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
