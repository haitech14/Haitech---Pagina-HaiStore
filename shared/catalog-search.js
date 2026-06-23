import { normalizeCatalogSearchText } from './catalog-search-normalize.js';
import { isPrinterEquipmentProduct } from './home-catalog-filter.js';

export { normalizeCatalogSearchText };

const KNOWN_BRANDS = [
  'ricoh',
  'hp',
  'kyocera',
  'canon',
  'xerox',
  'konica',
  'minolta',
  'brother',
  'epson',
  'lexmark',
  'samsung',
  'pantum',
];

const EQUIPMENT_MODEL_PATTERN =
  /\b(im|mp|sp|aficio|taskalfa|ecosys|bizhub|imagepress|workcentre|versalink)\s*[\w]*\d/i;

export function compactSearchText(value) {
  return normalizeCatalogSearchText(value).replace(/\s+/g, '');
}

export function productSearchHaystack(product) {
  const attributes = Array.isArray(product.attributes) ? product.attributes : [];
  return [
    product.name,
    product.code,
    product.description,
    product.brand,
    product.category,
    ...attributes.map((attr) => `${attr?.name ?? ''} ${attr?.value ?? ''}`),
  ]
    .filter(Boolean)
    .join(' ');
}

function searchTerms(query) {
  return normalizeCatalogSearchText(query).split(/\s+/).filter(Boolean);
}

function levenshtein(a, b) {
  const rows = b.length + 1;
  const cols = a.length + 1;
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < cols; j += 1) matrix[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[rows - 1][cols - 1];
}

function similarityRatio(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function fuzzySubstringScore(needle, haystackCompact) {
  if (!needle || !haystackCompact) return 0;
  if (haystackCompact.includes(needle)) return 1;

  const needleLen = needle.length;
  let best = 0;
  const minLen = Math.max(3, needleLen - 1);
  const maxLen = Math.min(haystackCompact.length, needleLen + 1);

  for (let start = 0; start < haystackCompact.length; start += 1) {
    for (let len = minLen; len <= maxLen && start + len <= haystackCompact.length; len += 1) {
      const slice = haystackCompact.slice(start, start + len);
      const score = similarityRatio(needle, slice);
      if (score > best) best = score;
      if (best >= 0.98) return best;
    }
  }

  return best;
}

function extractModelTokens(compactText) {
  const matches = compactText.match(/[a-z]*\d+[a-z0-9]*/gi) ?? [];
  return matches.map((token) => token.toLowerCase());
}

/** Evita que «305» coincida con «3050» (p. ej. RTX 3050). */
function numericTermMatchesModelToken(term, token) {
  if (!term || !token || !/^\d+$/.test(term)) return false;
  if (token === term) return true;

  if (token.startsWith(term)) {
    const next = token.charAt(term.length);
    return !next || !/\d/.test(next);
  }

  if (term.startsWith(token) && token.length >= 3) return true;

  const idx = token.indexOf(term);
  if (idx === -1) return false;
  const before = idx > 0 ? token.charAt(idx - 1) : '';
  const after = token.charAt(idx + term.length);
  if (before && /\d/.test(before)) return false;
  if (after && /\d/.test(after)) return false;
  return true;
}

function termMatchesHaystack(
  term,
  haystack,
  haystackCompact,
  modelTokens = null,
  { allowFuzzy = true } = {},
) {
  if (!term) return true;

  const isNumericTerm = /^\d+$/.test(term);

  if (!isNumericTerm && (haystack.includes(term) || haystackCompact.includes(term))) {
    return true;
  }

  if (/\d/.test(term)) {
    const tokens = modelTokens ?? extractModelTokens(haystackCompact);
    for (const token of tokens) {
      if (isNumericTerm) {
        if (numericTermMatchesModelToken(term, token)) return true;
        continue;
      }
      if (token.includes(term) || term.includes(token)) {
        if (Math.min(token.length, term.length) >= 3) return true;
      }
      if (token.startsWith(term) || term.startsWith(token)) {
        if (Math.min(token.length, term.length) >= 3) return true;
      }
    }
  }

  if (!isNumericTerm && (haystack.includes(term) || haystackCompact.includes(term))) {
    return true;
  }

  if (!allowFuzzy) return false;

  if (term.length >= 4) {
    return fuzzySubstringScore(term, haystackCompact) >= 0.82;
  }

  return false;
}

function getNamePrimarySegment(name) {
  const normalized = normalizeCatalogSearchText(name);
  const separators = ['—', ' - ', ' · ', ' | '];
  let cut = normalized.length;
  for (const separator of separators) {
    const index = normalized.indexOf(separator);
    if (index !== -1 && index < cut) cut = index;
  }
  return normalized.slice(0, cut).trim();
}

function isNumericModelSearchQuery(query) {
  const compact = compactSearchText(query);
  const terms = searchTerms(query);
  if (/^\d{2,}[a-z0-9]*$/i.test(compact)) return true;
  if (terms.length === 1 && /^\d{2,}[a-z0-9]*$/i.test(terms[0])) return true;
  return false;
}

function looksLikeEquipmentModelSearch(query) {
  const normalized = normalizeCatalogSearchText(query);
  const compact = compactSearchText(query);
  const terms = searchTerms(query);
  const hasBrand =
    terms.some((term) => KNOWN_BRANDS.includes(term)) ||
    KNOWN_BRANDS.some((brand) => normalized.includes(brand));
  const hasModelToken =
    terms.some((term) => /\d/.test(term)) ||
    EQUIPMENT_MODEL_PATTERN.test(query) ||
    /\d{2,}[a-z]?/.test(compact);
  return (
    (hasBrand && hasModelToken) ||
    EQUIPMENT_MODEL_PATTERN.test(normalized) ||
    isNumericModelSearchQuery(query)
  );
}

function isUnrelatedCategoryForPrinterModelSearch(product) {
  const haystack = normalizeCatalogSearchText(
    `${product.category ?? ''} ${product.name ?? ''} ${product.brand ?? ''}`,
  );
  return /computadora|laptop|notebook|\bnb\b|vga|tarjeta de video|rtx|gamer|tarjeta grafica|grafica/.test(
    haystack,
  );
}

function productHasNumericModelTokenMatch(product, compactQuery) {
  if (!/^\d+$/.test(compactQuery)) return false;
  const nameCompact = compactSearchText(product.name ?? '');
  const tokens = extractModelTokens(nameCompact);
  return tokens.some((token) => numericTermMatchesModelToken(compactQuery, token));
}

function isConsumableOrPartProduct(product) {
  const haystack = normalizeCatalogSearchText(
    `${product.category ?? ''} ${product.name ?? ''}`,
  );
  return (
    /repuesto|accesorio|consumible|toner|t[oó]ner|suministro|filtro|rodillo|unidad|cartucho/.test(
      haystack,
    ) && !isPrinterEquipmentProduct(product)
  );
}

function countTermsMatched(terms, text, compact, { allowFuzzy = true } = {}) {
  if (terms.length === 0) return 0;
  const modelTokens = /\d/.test(terms.join('')) ? extractModelTokens(compact) : null;
  return terms.filter((term) =>
    termMatchesHaystack(term, text, compact, modelTokens, { allowFuzzy }),
  ).length;
}

/**
 * Puntuación de relevancia (mayor = mejor coincidencia).
 * Prioriza equipos/fotocopiadoras, coincidencias exactas en nombre/código y términos en el titular.
 */
export function scoreProductSearchRelevance(product, query) {
  const normalizedQuery = normalizeCatalogSearchText(query);
  const compactQuery = compactSearchText(query);
  const terms = searchTerms(query);
  if (terms.length === 0 || compactQuery.length < 3) return 0;

  const equipmentIntent = looksLikeEquipmentModelSearch(query);
  const numericModelSearch = isNumericModelSearchQuery(query);

  const name = normalizeCatalogSearchText(product.name ?? '');
  const primaryName = getNamePrimarySegment(product.name ?? '');
  const code = normalizeCatalogSearchText(product.code ?? '');
  const brand = normalizeCatalogSearchText(product.brand ?? '');
  const category = normalizeCatalogSearchText(product.category ?? '');
  const { haystack, haystackCompact } = resolveProductHaystackFields(product);
  const nameCompact = compactSearchText(name);
  const primaryCompact = compactSearchText(primaryName);

  let score = 0;

  if (code && code === compactQuery) score += 120_000;
  else if (code && (code.includes(compactQuery) || compactQuery.includes(code))) score += 60_000;

  if (primaryCompact === compactQuery || nameCompact === compactQuery) score += 90_000;
  else if (primaryCompact.startsWith(compactQuery) || nameCompact.startsWith(compactQuery)) {
    score += 70_000;
  } else if (primaryName.includes(normalizedQuery) || name.includes(normalizedQuery)) {
    score += 45_000;
  } else if (primaryCompact.includes(compactQuery) || nameCompact.includes(compactQuery)) {
    score += 35_000;
  }

  const primaryTermRatio = countTermsMatched(terms, primaryName, primaryCompact) / terms.length;
  const nameTermRatio = countTermsMatched(terms, name, nameCompact) / terms.length;
  const haystackTermRatio = countTermsMatched(terms, haystack, haystackCompact) / terms.length;

  score += Math.round(primaryTermRatio * 25_000);
  score += Math.round(nameTermRatio * 12_000);
  score += Math.round(haystackTermRatio * 4_000);

  if (brand && terms.includes(brand)) score += 8_000;
  if (brand && compactQuery.includes(brand)) score += 4_000;

  if (isPrinterEquipmentProduct(product)) {
    score += equipmentIntent ? 35_000 : 12_000;
  }

  if (category.includes('multifuncional') || category.includes('impresora')) {
    score += equipmentIntent ? 10_000 : 6_000;
  }

  if (category.includes('multifuncionales nuevas') || category.includes('impresoras laser nuevas')) {
    score += equipmentIntent ? 12_000 : 4_000;
  }

  if (numericModelSearch && isPrinterEquipmentProduct(product)) {
    if (productHasNumericModelTokenMatch(product, compactQuery)) {
      score += 55_000;
    }
    if (primaryCompact.includes(compactQuery) || nameCompact.includes(compactQuery)) {
      score += 20_000;
    }
  }

  if (equipmentIntent && isConsumableOrPartProduct(product)) {
    score -= numericModelSearch ? 45_000 : 28_000;
  }

  if (numericModelSearch && isUnrelatedCategoryForPrinterModelSearch(product)) {
    score -= 90_000;
  }

  const termsOnlyAfterSeparator =
    primaryTermRatio < 0.5 &&
    nameTermRatio >= 1 &&
    primaryName.length > 0 &&
    primaryName.length < name.length * 0.45;
  if (termsOnlyAfterSeparator) score -= 22_000;

  if (name.length > normalizedQuery.length * 2.8 && primaryTermRatio < 0.34) {
    score -= 8_000;
  }

  if (product.stock > 0) score += 400;

  return score;
}

const productHaystackCache = new Map();

export function clearProductSearchHaystackCache() {
  productHaystackCache.clear();
}

function resolveProductHaystackFields(product) {
  const id = product?.id;
  if (typeof id === 'string' && id.length > 0) {
    const cached = productHaystackCache.get(id);
    if (cached) return cached;
  }

  const rawHaystack = productSearchHaystack(product);
  const haystack = normalizeCatalogSearchText(rawHaystack);
  const haystackCompact = compactSearchText(haystack);
  const modelTokens = extractModelTokens(haystackCompact);
  const fields = { haystack, haystackCompact, modelTokens };

  if (typeof id === 'string' && id.length > 0) {
    productHaystackCache.set(id, fields);
  }

  return fields;
}

export function compareProductSearchRelevance(a, b, query) {
  const scoreDiff = scoreProductSearchRelevance(b, query) - scoreProductSearchRelevance(a, query);
  if (scoreDiff !== 0) return scoreDiff;
  return (a.name ?? '').localeCompare(b.name ?? '', 'es');
}

function partitionSearchResultsByEquipmentIntent(products, query) {
  if (!looksLikeEquipmentModelSearch(query)) return null;

  const equipment = [];
  const rest = [];
  for (const product of products) {
    if (isPrinterEquipmentProduct(product)) {
      equipment.push(product);
    } else {
      rest.push(product);
    }
  }

  if (equipment.length === 0) return null;

  return {
    equipment: sortScoredProductsByRelevance(equipment, query),
    rest: sortScoredProductsByRelevance(rest, query),
  };
}

function sortScoredProductsByRelevance(products, query) {
  if (products.length <= 1) return [...products];

  const scored = products.map((product) => ({
    product,
    score: scoreProductSearchRelevance(product, query),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.product.name ?? '').localeCompare(b.product.name ?? '', 'es');
  });

  return scored.map((entry) => entry.product);
}

export function sortProductsBySearchRelevance(products, query) {
  const partitioned = partitionSearchResultsByEquipmentIntent(products, query);
  if (partitioned) {
    return [...partitioned.equipment, ...partitioned.rest];
  }
  return sortScoredProductsByRelevance(products, query);
}

/** Devuelve los mejores `limit` resultados sin ordenar el resto del array. */
export function takeTopProductsBySearchRelevance(products, query, limit) {
  const safeLimit = Math.max(Number(limit) || 1, 1);
  const sorted = sortProductsBySearchRelevance(products, query);
  return sorted.slice(0, safeLimit);
}

export function productMatchesSearchQuery(product, query) {
  const normalizedQuery = normalizeCatalogSearchText(query);
  const compactQuery = compactSearchText(query);
  if (compactQuery.length < 3) return false;

  const terms = searchTerms(query);
  if (terms.length === 0) return false;

  const { haystack, haystackCompact, modelTokens } = resolveProductHaystackFields(product);

  const hasNumericOnlyTerms = terms.length > 0 && terms.every((term) => /^\d+$/.test(term));
  if (
    !hasNumericOnlyTerms &&
    (haystack.includes(normalizedQuery) || haystackCompact.includes(compactQuery))
  ) {
    return true;
  }

  return terms.every((term) =>
    termMatchesHaystack(term, haystack, haystackCompact, modelTokens, { allowFuzzy: false }),
  );
}
