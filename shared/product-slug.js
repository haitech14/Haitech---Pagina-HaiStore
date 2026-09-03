/**
 * Slugs legibles para fichas de producto.
 * Si no hay slug en DB, se deriva del id o del nombre.
 */

const SLUG_MAX_LENGTH = 80;

export function slugifyProductText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

function looksLikeSlug(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(normalized);
}

function isUuidLikeId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(id ?? '').trim(),
  );
}

/**
 * Slugs que no ayudan a Google (id numérico, UUID o igual al SKU crudo).
 * @param {string} slug
 * @param {{ id?: string }} [product]
 */
export function isWeakCatalogSlug(slug, product) {
  const normalized = String(slug ?? '').trim().toLowerCase();
  if (!normalized) return true;
  if (isUuidLikeId(normalized)) return true;
  if (/^[0-9]+$/.test(normalized)) return true;
  const id = String(product?.id ?? '').trim().toLowerCase();
  if (id && normalized === id) return true;
  return false;
}

function resolveKindToken(product) {
  const haystack = `${product?.category ?? ''} ${product?.name ?? ''}`.toLowerCase();
  if (/toner|tóner|cartucho/.test(haystack)) return 'toner';
  if (/\btinta/.test(haystack)) return 'tinta';
  if (/repuesto|unidad de imagen|cilindro|fusor|drum|fuser|rodillo/.test(haystack)) {
    return 'repuesto';
  }
  if (/fotocopi|multifunc/.test(haystack)) return 'fotocopiadora';
  if (/impresora|plotter/.test(haystack)) return 'impresora';
  return null;
}

function resolveBrandToken(product) {
  const brand = slugifyProductText(product?.brand);
  if (brand && brand !== 'generico' && brand !== 'generic') return brand;
  if (/\bricoh\b/i.test(`${product?.name ?? ''} ${product?.brand ?? ''} ${product?.category ?? ''}`)) {
    return 'ricoh';
  }
  return null;
}

function resolveCodeToken(product) {
  const fromCode = slugifyProductText(product?.code);
  if (fromCode) return fromCode.slice(0, 24);

  const id = String(product?.id ?? '').trim();
  if (id && !isUuidLikeId(id) && looksLikeSlug(id) && id.length <= 24) {
    return slugifyProductText(id);
  }
  return null;
}

function buildSemanticSlug(product) {
  const fromName = slugifyProductText(product?.name);
  const kind = resolveKindToken(product);
  const brand = resolveBrandToken(product);
  const code = resolveCodeToken(product);
  const id = String(product?.id ?? '').trim();

  const nameHasKeywords =
    Boolean(fromName) &&
    ((kind && fromName.includes(kind)) || (brand && fromName.includes(brand)));

  if (nameHasKeywords && fromName.length >= 8) {
    if (code && !fromName.includes(code)) {
      return `${fromName}-${code}`.slice(0, SLUG_MAX_LENGTH);
    }
    return fromName.slice(0, SLUG_MAX_LENGTH);
  }

  const tokens = [kind, brand, code].filter(Boolean);
  if (tokens.length >= 2) {
    return slugifyProductText(tokens.join('-')).slice(0, SLUG_MAX_LENGTH);
  }

  if (fromName) {
    const idSuffix = slugifyProductText(id).slice(-12);
    if (!idSuffix || fromName.endsWith(idSuffix)) return fromName;
    return `${fromName}-${idSuffix}`.slice(0, SLUG_MAX_LENGTH);
  }

  return slugifyProductText(id || 'producto') || 'producto';
}

/**
 * Genera un slug candidato sin comprobar colisiones en el catálogo.
 * Ignora slugs débiles (solo números / UUID / igual al id) para URLs tipo toner-ricoh-408213.
 * @param {{ id?: string, name?: string, slug?: string | null, brand?: string, category?: string, code?: string }} product
 */
export function proposeProductSlug(product) {
  const explicit = String(product?.slug ?? '').trim();
  if (explicit && !isWeakCatalogSlug(explicit, product)) {
    return explicit.toLowerCase();
  }

  return buildSemanticSlug(product);
}

/**
 * @param {{ id?: string, name?: string, slug?: string | null }} product
 */
export function deriveProductSlug(product) {
  return proposeProductSlug(product);
}

function isLikelyCopyProduct(product) {
  return /\(copia\)/i.test(String(product?.name ?? ''));
}

function allocateUniqueSlug(product, used) {
  let candidate = proposeProductSlug({ ...product, slug: null });
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }

  const base = slugifyProductText(product.name) || slugifyProductText(product.id) || 'producto';
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  candidate = `${base}-${suffix}`.slice(0, SLUG_MAX_LENGTH);
  used.add(candidate);
  return candidate;
}

/**
 * Asigna slugs únicos y persistibles.
 * En colisiones conserva el slug en el producto «canónico» (sin «(copia)», más antiguo)
 * y reasigna solo a los duplicados.
 * @param {Array<{ id?: string, name?: string, slug?: string | null, created_at?: string }>} products
 */
export function assignUniqueProductSlugs(products) {
  if (!Array.isArray(products)) return { products: [], assigned: 0, unchanged: 0, total: 0 };

  const byId = new Map(products.map((product) => [product.id, { ...product }]));
  const groups = new Map();

  for (const product of byId.values()) {
    const slug = String(product.slug ?? '').trim().toLowerCase();
    const key =
      slug && !isWeakCatalogSlug(slug, product) ? slug : `__missing__:${product.id}`;
    const list = groups.get(key) ?? [];
    list.push(product);
    groups.set(key, list);
  }

  const used = new Set();
  let assigned = 0;
  let unchanged = 0;

  for (const [key, group] of groups) {
    if (key.startsWith('__missing__:')) {
      for (const product of group) {
        const nextSlug = allocateUniqueSlug(product, used);
        byId.set(product.id, { ...product, slug: nextSlug });
        assigned += 1;
      }
      continue;
    }

    if (group.length === 1) {
      const product = group[0];
      used.add(key);
      unchanged += 1;
      byId.set(product.id, product);
      continue;
    }

    // Colisión: conservar slug en el canónico (original / más antiguo).
    const ranked = [...group].sort((a, b) => {
      const copyDiff = Number(isLikelyCopyProduct(a)) - Number(isLikelyCopyProduct(b));
      if (copyDiff !== 0) return copyDiff;
      return String(a.created_at ?? '').localeCompare(String(b.created_at ?? ''));
    });

    const keeper = ranked[0];
    used.add(key);
    unchanged += 1;
    byId.set(keeper.id, keeper);

    for (const product of ranked.slice(1)) {
      const nextSlug = allocateUniqueSlug(product, used);
      byId.set(product.id, { ...product, slug: nextSlug });
      assigned += 1;
    }
  }

  // Preservar orden original del array de entrada.
  const next = products.map((product) => byId.get(product.id) ?? product);
  return { products: next, assigned, unchanged, total: next.length };
}

/**
 * @param {{ id?: string, slug?: string | null, name?: string }} product
 */
export function buildProductPath(product) {
  const slug = deriveProductSlug(product);
  return `/tienda/${encodeURIComponent(slug)}`;
}

/** Ruta antigua de ficha; usar solo para redirects de compatibilidad. */
export function buildLegacyProductPath(product) {
  const slug = deriveProductSlug(product);
  return `/tienda/producto/${encodeURIComponent(slug)}`;
}

/**
 * @param {Array<{ id?: string, slug?: string | null, name?: string }>} products
 * @param {string} lookupKey
 */
export function findProductBySlugOrId(products, lookupKey) {
  const normalized = String(lookupKey ?? '').trim();
  if (!normalized || !Array.isArray(products)) return undefined;

  const lower = normalized.toLowerCase();

  let found = products.find((product) => String(product.id ?? '').toLowerCase() === lower);
  if (found) return found;

  found = products.find((product) => String(product.slug ?? '').trim().toLowerCase() === lower);
  if (found) return found;

  found = products.find((product) => deriveProductSlug(product).toLowerCase() === lower);
  return found;
}
