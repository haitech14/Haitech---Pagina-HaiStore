import { sanitizeProductId } from './product-stock-images.js';

/** Palabras de catálogo que no aportan al nombre de archivo del modelo. */
const NAME_BOILERPLATE =
  /\b(impresora|multifuncional|fotocopiadora|scanner|esc[aá]ner|equipo|nueva|nuevo|nuevas|semi[\s-]*nueva|semi[\s-]*nuevo|reacondicionada|reacondicionado|usada|usado|refurbished|compatible|original|toner|t[oó]ner|cartucho)\b/gi;

/**
 * Stem de archivo a partir del modelo (p. ej. `ricoh-im-c6500`).
 * @param {{ id?: string; name?: string; brand?: string | null; code?: string | null; attributes?: Array<{ name?: string; value?: string }> }} product
 * @returns {string}
 */
export function deriveProductMediaModelStem(product) {
  const brand = String(product?.brand ?? '').trim();
  const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
  const modeloAttr = attrs
    .find((row) => /^modelo$/i.test(String(row?.name ?? '').trim()))
    ?.value?.trim();

  let raw = '';
  if (modeloAttr) {
    raw = brand ? `${brand} ${modeloAttr}` : modeloAttr;
  } else {
    // "(copia)" / "(copy)" en el nombre de un duplicado no debe cambiar el stem,
    // o sanitize trataría la imagen del origen como ajena y la borraría.
    const cleaned = String(product?.name ?? '')
      .replace(/\s*\((?:copia|copy|copie)\)\s*$/i, '')
      .replace(NAME_BOILERPLATE, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    raw = cleaned || String(product?.code ?? '').trim() || String(product?.id ?? 'product');
  }

  let stem = sanitizeProductId(raw);
  const brandStem = sanitizeProductId(brand);
  if (brandStem && stem && !stem.includes(brandStem) && stem.length < 48) {
    stem = sanitizeProductId(`${brandStem}-${stem}`);
  }

  if (!stem || stem.length < 2) {
    stem = sanitizeProductId(product?.code) || sanitizeProductId(product?.id) || 'product';
  }

  if (stem.length > 72) {
    stem = stem.slice(0, 72).replace(/-+$/g, '');
  }

  return stem || 'product';
}

/**
 * Ruta pública `/products/{modelo}.webp` (o `-2`, `-3` para galería).
 * @param {{ id?: string; name?: string; brand?: string | null; code?: string | null; attributes?: Array<{ name?: string; value?: string }> }} product
 * @param {number} [index]
 * @returns {string}
 */
export function publicProductMediaPathForProduct(product, index = 0) {
  const base = deriveProductMediaModelStem(product);
  const suffix = index > 0 ? `-${index + 1}` : '';
  return `/products/${base}${suffix}.webp`;
}

/**
 * Stems de archivo que “pertenecen” al producto (modelo, id, código).
 * @param {{ id?: string; name?: string; brand?: string | null; code?: string | null; attributes?: Array<{ name?: string; value?: string }> }} product
 * @returns {Set<string>}
 */
export function ownedProductMediaStems(product) {
  const stems = new Set();
  const id = sanitizeProductId(product?.id);
  if (id) stems.add(id);

  const model = deriveProductMediaModelStem(product);
  if (model) stems.add(model);

  const code = sanitizeProductId(product?.code);
  if (code) {
    stems.add(code);
    stems.add(`toner-${code}`);
  }

  return stems;
}
