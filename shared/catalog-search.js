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

/** mp2501, mpc407, mp c407 220v — optional series letter between prefix and digits. */
const EQUIPMENT_MODEL_PREFIX_PATTERN =
  /(?:^|[^a-z])(mp|im|sp|aficio)\s*([a-z]?)(\d{3,5})\s*(\d{3})?(?:v)?(?=[^a-z]|$)/gi;

function extractEquipmentModelTokens(text) {
  const tokens = new Set();
  for (const match of String(text ?? '').matchAll(EQUIPMENT_MODEL_PREFIX_PATTERN)) {
    const [, prefix, seriesLetter, modelDigits, voltageDigits] = match;
    const prefixLower = prefix.toLowerCase();
    const series = (seriesLetter || '').toLowerCase();
    tokens.add(`${prefixLower}${series}${modelDigits}`);
    if (series) tokens.add(`${series}${modelDigits}`);
    tokens.add(modelDigits);
    if (voltageDigits) {
      tokens.add(`${prefixLower}${series}${modelDigits}${voltageDigits}`);
    }
  }
  return [...tokens];
}

/**
 * Extrae tokens de modelo desde texto con espacios y desde compacto.
 * Importante: no tokenizar solo el haystack compacto — al pegar palabras,
 * `mp c407 220v` vira un solo token y `407` deja de coincidir con `c407`.
 */
function extractModelTokens(text, compactText = null) {
  const spaced = String(text ?? '');
  const compact = compactText ?? spaced.replace(/\s+/g, '');
  const tokens = new Set(extractEquipmentModelTokens(spaced));
  for (const token of extractEquipmentModelTokens(compact)) tokens.add(token);

  for (const word of spaced.split(/\s+/)) {
    if (!word || !/\d/.test(word)) continue;
    const cleaned = word.replace(/[^a-z0-9]+/gi, '').toLowerCase();
    if (!cleaned || cleaned.length > 24) continue;
    tokens.add(cleaned);
    for (const match of cleaned.match(/[a-z]*\d+[a-z0-9]*/gi) ?? []) {
      tokens.add(match.toLowerCase());
    }
  }

  // Islas cortas en compacto (evita tragar todo el haystack como un solo token).
  for (const match of compact.matchAll(/[a-z]{0,6}\d{3,5}(?:(?:220|110|100|240)v?|v)?/gi)) {
    const island = match[0].toLowerCase();
    if (island.length >= 3 && island.length <= 16) tokens.add(island);
  }

  return [...tokens];
}

function isEquipmentVoltageSuffix(restDigits) {
  return /^(?:220|110|100|240)(?:v)?$/i.test(restDigits);
}

/** Evita que «305» coincida con «3050» (p. ej. RTX 3050). */
function numericPartMatches(termDigits, tokenDigits) {
  if (!termDigits || !tokenDigits) return false;
  if (termDigits === tokenDigits) return true;

  if (tokenDigits.startsWith(termDigits)) {
    const rest = tokenDigits.slice(termDigits.length);
    if (!rest) return true;
    if (!/\d/.test(rest.charAt(0))) return true;
    return isEquipmentVoltageSuffix(rest);
  }

  if (termDigits.startsWith(tokenDigits) && tokenDigits.length >= 3) return true;

  const idx = tokenDigits.indexOf(termDigits);
  if (idx === -1) return false;
  const before = idx > 0 ? tokenDigits.charAt(idx - 1) : '';
  const after = tokenDigits.charAt(idx + termDigits.length);
  if (before && /\d/.test(before)) return false;
  if (after && /\d/.test(after)) return false;
  return true;
}

function numericTermMatchesModelToken(term, token) {
  if (!term || !token || !/^\d+$/.test(term)) return false;
  if (token === term) return true;

  const strippedLeading = token.replace(/^[a-z]+/i, '');
  if (numericPartMatches(term, strippedLeading)) return true;
  if (numericPartMatches(term, strippedLeading.replace(/v$/i, ''))) return true;

  // Subcadenas numéricas dentro de tokens alfanuméricos (p. ej. 407 ⊂ c407 / mpc407).
  if (/[a-z]/i.test(token)) {
    for (const digits of token.match(/\d+/g) ?? []) {
      if (numericPartMatches(term, digits)) return true;
    }
  }

  return false;
}

/** Evita que «c6000» coincida con el token numérico «600» o «6000» sin prefijo de letras. */
function alphanumModelTermMatchesToken(term, token) {
  if (!term || !token) return false;
  if (term === token) return true;

  const termMatch = term.match(/^([a-z]{1,4})(\d.*)$/i);
  const tokenMatch = token.match(/^([a-z]{1,4})(\d.*)$/i);

  if (termMatch && tokenMatch) {
    if (termMatch[1] !== tokenMatch[1]) return false;
    return numericPartMatches(termMatch[2], tokenMatch[2]);
  }

  if (termMatch && !tokenMatch) {
    return false;
  }

  if (!termMatch && tokenMatch) {
    return numericTermMatchesModelToken(term, token);
  }

  if (term.includes(token) || token.includes(term)) {
    const minLen = Math.min(term.length, token.length);
    if (minLen < 3) return false;
    if (term.length > token.length && /^\d+$/.test(token)) return false;
    return true;
  }

  return false;
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

  if (isModelLikeSearchTerm(term) && compactIncludesBoundedModelTerm(haystackCompact, term)) {
    return true;
  }

  if (/\d/.test(term)) {
    const tokens = modelTokens ?? extractModelTokens(haystack, haystackCompact);
    for (const token of tokens) {
      if (isNumericTerm) {
        if (numericTermMatchesModelToken(term, token)) return true;
        continue;
      }
      if (isModelLikeSearchTerm(term)) {
        if (alphanumModelTermMatchesToken(term, token)) return true;
        continue;
      }
      if (token.includes(term) || term.includes(token)) {
        if (Math.min(token.length, term.length) >= 3) {
          if (term.length > token.length && /^\d+$/.test(token)) continue;
          return true;
        }
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
  const name = normalizeCatalogSearchText(product.name ?? '');
  const tokens = extractModelTokens(name, compactSearchText(name));
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

function buildModelQueryCompact(query) {
  const terms = searchTerms(query).filter((term) => !KNOWN_BRANDS.includes(term));
  const compact = compactSearchText(terms.join(''));
  return /\d/.test(compact) && compact.length >= 3 ? compact : '';
}

function requiresStrictModelMatch(query) {
  if (!looksLikeEquipmentModelSearch(query)) return false;
  const modelQueryCompact = buildModelQueryCompact(query);
  return modelQueryCompact.length >= 4;
}

function productHasStrongModelMatch(product, query) {
  const modelQueryCompact = buildModelQueryCompact(query);
  if (!modelQueryCompact) return true;

  if (scoreModelQueryMatch(product, modelQueryCompact) > 0) return true;

  const nameCompact = compactSearchText(product.name ?? '');
  const primaryCompact = compactSearchText(getNamePrimarySegment(product.name ?? ''));
  const { haystackCompact } = resolveProductHaystackFields(product);

  if (
    compactIncludesBoundedModelTerm(nameCompact, modelQueryCompact) ||
    compactIncludesBoundedModelTerm(primaryCompact, modelQueryCompact) ||
    compactIncludesBoundedModelTerm(haystackCompact, modelQueryCompact)
  ) {
    return true;
  }

  if (nameCompact.startsWith(modelQueryCompact) || primaryCompact.startsWith(modelQueryCompact)) {
    return true;
  }

  return false;
}

function compactIncludesBoundedModelTerm(haystackCompact, term) {
  if (!term || !haystackCompact.includes(term)) return false;

  let index = haystackCompact.indexOf(term);
  while (index !== -1) {
    const before = index > 0 ? haystackCompact.charAt(index - 1) : '';
    if (!before || !/[a-z]/.test(before)) return true;
    index = haystackCompact.indexOf(term, index + 1);
  }

  return false;
}

function isModelLikeSearchTerm(term) {
  return /^[a-z]{1,4}\d+[a-z0-9]*$/i.test(term) || /^\d+[a-z][a-z0-9]*$/i.test(term);
}

function scoreModelQueryMatch(product, modelQueryCompact) {
  if (!modelQueryCompact || modelQueryCompact.length < 3) return 0;

  const nameCompact = compactSearchText(product.name ?? '');
  const primaryCompact = compactSearchText(getNamePrimarySegment(product.name ?? ''));
  const haystackCompact = compactSearchText(productSearchHaystack(product));

  if (
    primaryCompact.includes(modelQueryCompact) ||
    nameCompact.includes(modelQueryCompact) ||
    haystackCompact.includes(modelQueryCompact)
  ) {
    return 85_000;
  }

  const numericPart = modelQueryCompact.replace(/\D/g, '');
  if (numericPart.length >= 3 && /[a-z]/i.test(modelQueryCompact)) {
    if (
      productHasNumericModelTokenMatch(product, numericPart) &&
      !nameCompact.includes(modelQueryCompact)
    ) {
      return -48_000;
    }
  }

  if (compactIncludesBoundedModelTerm(nameCompact, modelQueryCompact)) {
    return 28_000;
  }

  if (compactIncludesBoundedModelTerm(haystackCompact, modelQueryCompact)) {
    return 12_000;
  }

  return 0;
}

function isTonerInventoryCategory(category) {
  const normalized = normalizeCatalogSearchText(category);
  return (
    /(toner|t[oó]ner|suministro|consumible|cartucho)/.test(normalized) &&
    !/repuesto|refacci[oó]n|pieza|partes/.test(normalized)
  );
}

function isRepuestoInventoryCategory(category, nameHaystack) {
  const normalized = normalizeCatalogSearchText(category);
  return (
    /repuesto|refacci[oó]n|pieza|partes/.test(normalized) ||
    /repuesto|refacci[oó]n|pieza|partes/.test(nameHaystack)
  );
}

function isOriginalInventoryProduct(product) {
  const haystack = normalizeCatalogSearchText(
    `${product.category ?? ''} ${product.name ?? ''} ${product.brand ?? ''}`,
  );
  if (/(compatible|compatibl|alternativ|gen[eé]ric|remanufactur|seminueva)/.test(haystack)) {
    return false;
  }
  return /(original|genuin|oem|oficial|nueva|nuevo)/.test(haystack);
}

function isCompatibleInventoryProduct(product) {
  const haystack = normalizeCatalogSearchText(`${product.category ?? ''} ${product.name ?? ''}`);
  return /(compatible|compatibl|alternativ|gen[eé]ric|remanufactur|seminueva)/.test(haystack);
}

/**
 * Prioridad de categoría en resultados de búsqueda (menor = más arriba).
 * Equipos → tóner original → tóner compatible → repuestos original → repuestos compatible → accesorios.
 */
export function getProductSearchCategoryRank(product) {
  const category = normalizeCatalogSearchText(product.category ?? '');
  const nameHaystack = normalizeCatalogSearchText(`${product.category ?? ''} ${product.name ?? ''}`);

  if (/multifuncion/.test(category)) return 0;
  if (/impresor/.test(category)) return 1;
  if (
    /(formato ancho|plotter|copiadora|esc[aá]ner|scanner|\bequipo\b)/.test(category) ||
    isPrinterEquipmentProduct(product)
  ) {
    return 2;
  }

  if (isTonerInventoryCategory(category) || isTonerInventoryCategory(nameHaystack)) {
    if (isOriginalInventoryProduct(product)) return 3;
    if (isCompatibleInventoryProduct(product)) return 4;
    return 5;
  }

  if (isRepuestoInventoryCategory(category, nameHaystack)) {
    if (isCompatibleInventoryProduct(product)) return 7;
    return 6;
  }

  if (/accesorio|cable|adaptador|bandeja|cassette|charola/.test(category)) return 8;

  return 9;
}

const TONER_SEARCH_SIBLING_RANKS = new Set([3, 4, 5]);
const REPUESTO_SEARCH_SIBLING_RANKS = new Set([6, 7]);
const MAX_COLOR_SIBLINGS_PER_GROUP = 4;
const COLOR_SUFFIX_PATTERN = /\s+(negro|black|cyan|magenta|amarillo|yellow)\s*$/i;
const REND_PAGES_SUFFIX_PATTERN = /\s+\(\s*[\d.,]+\s*p[aá]ginas\s+al\s+5%\s*\)\s*$/i;
const REND_LEGACY_SUFFIX_PATTERN = /\s+\(\s*rend[^)]*\)\s*$/i;

/**
 * Clave para agrupar variantes de color del mismo consumible (tóner / repuesto).
 * @param {import('../src/types/product').Product | { name?: string | null }} product
 */
export function getConsumableSiblingGroupKey(product) {
  const name = normalizeCatalogSearchText(product.name ?? '');
  if (!name) return '';

  return name
    .replace(REND_PAGES_SUFFIX_PATTERN, '')
    .replace(REND_LEGACY_SUFFIX_PATTERN, '')
    .replace(COLOR_SUFFIX_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function shouldExpandColorSiblings(rank) {
  return TONER_SEARCH_SIBLING_RANKS.has(rank) || REPUESTO_SEARCH_SIBLING_RANKS.has(rank);
}

function getConsumableSiblingClusterKey(product) {
  const rank = getProductSearchCategoryRank(product);
  const category = normalizeCatalogSearchText(product.category ?? '');
  const groupKey = getConsumableSiblingGroupKey(product);
  if (!shouldExpandColorSiblings(rank) || !groupKey) return '';
  return `${rank}::${category}::${groupKey}`;
}

/**
 * Agrupa variantes de color del conjunto completo de coincidencias.
 * @param {import('../src/types/product').Product[]} products
 * @param {string} query
 */
function buildSearchResultPicks(products, query) {
  /** @type {Map<string, import('../src/types/product').Product[]>} */
  const clusters = new Map();
  /** @type {import('../src/types/product').Product[]} */
  const singles = [];

  for (const product of products) {
    const clusterKey = getConsumableSiblingClusterKey(product);
    if (!clusterKey) {
      singles.push(product);
      continue;
    }
    const bucket = clusters.get(clusterKey) ?? [];
    bucket.push(product);
    clusters.set(clusterKey, bucket);
  }

  /** @type {Array<{ rank: number; score: number; products: import('../src/types/product').Product[] }>} */
  const picks = [];

  for (const members of clusters.values()) {
    const ordered = sortScoredProductsByRelevance(members, query).slice(
      0,
      MAX_COLOR_SIBLINGS_PER_GROUP,
    );
    const lead = ordered[0];
    if (!lead) continue;
    picks.push({
      rank: getProductSearchCategoryRank(lead),
      score: scoreProductSearchRelevance(lead, query),
      products: ordered,
    });
  }

  for (const product of singles) {
    picks.push({
      rank: getProductSearchCategoryRank(product),
      score: scoreProductSearchRelevance(product, query),
      products: [product],
    });
  }

  picks.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (b.score !== a.score) return b.score - a.score;
    return (a.products[0]?.name ?? '').localeCompare(b.products[0]?.name ?? '', 'es');
  });

  return picks;
}

/**
 * @param {import('../src/types/product').Product[]} result
 * @param {Set<string>} usedIds
 * @param {import('../src/types/product').Product[]} products
 * @param {number} safeLimit
 */
function appendUniqueProducts(result, usedIds, products, safeLimit) {
  for (const product of products) {
    if (result.length >= safeLimit) break;
    const id = String(product.id ?? '');
    if (id && usedIds.has(id)) continue;
    result.push(product);
    if (id) usedIds.add(id);
  }
}

function compareSearchResultEntries(a, b, query) {
  const scoreDiff = scoreProductSearchRelevance(b, query) - scoreProductSearchRelevance(a, query);
  if (Math.abs(scoreDiff) >= 12_000) return scoreDiff;

  const rankDiff = getProductSearchCategoryRank(a) - getProductSearchCategoryRank(b);
  if (rankDiff !== 0) return rankDiff;

  if (scoreDiff !== 0) return scoreDiff;
  return (a.name ?? '').localeCompare(b.name ?? '', 'es');
}

function countTermsMatched(terms, text, compact, { allowFuzzy = true } = {}) {
  if (terms.length === 0) return 0;
  const modelTokens = /\d/.test(terms.join('')) ? extractModelTokens(text, compact) : null;
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
    score -= numericModelSearch ? 55_000 : 38_000;
  }

  const modelQueryCompact = buildModelQueryCompact(query);
  if (modelQueryCompact) {
    score += scoreModelQueryMatch(product, modelQueryCompact);
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

/** Precalcula haystacks de búsqueda para todo el catálogo (una vez al arranque). */
export function prewarmProductSearchHaystacks(products) {
  if (!Array.isArray(products)) return;
  for (const product of products) {
    resolveProductHaystackFields(product);
  }
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
  const modelTokens = extractModelTokens(haystack, haystackCompact);
  const fields = { haystack, haystackCompact, modelTokens };

  if (typeof id === 'string' && id.length > 0) {
    productHaystackCache.set(id, fields);
  }

  return fields;
}

export function compareProductSearchRelevance(a, b, query) {
  return compareSearchResultEntries(a, b, query);
}

function partitionSearchResultsByEquipmentIntent(products, query) {
  if (!looksLikeEquipmentModelSearch(query)) return null;

  const equipment = [];
  const rest = [];
  for (const product of products) {
    if (isPrinterEquipmentProduct(product) || getProductSearchCategoryRank(product) <= 2) {
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

  return [...products].sort((a, b) => compareSearchResultEntries(a, b, query));
}

export function sortProductsBySearchRelevance(products, query) {
  const partitioned = partitionSearchResultsByEquipmentIntent(products, query);
  if (partitioned) {
    return [...partitioned.equipment, ...partitioned.rest];
  }
  return sortScoredProductsByRelevance(products, query);
}

/** Devuelve los mejores `limit` resultados priorizando precisión, categoría y variantes de color. */
export function takeTopProductsBySearchRelevance(products, query, limit) {
  const safeLimit = Math.max(Number(limit) || 1, 1);
  const sorted = sortProductsBySearchRelevance(products, query);
  if (sorted.length <= safeLimit) {
    return sorted;
  }

  const picks = buildSearchResultPicks(sorted, query);
  const result = [];
  const usedIds = new Set();
  const ranksRepresented = new Set();

  for (const pick of picks) {
    if (result.length >= safeLimit) break;
    if (ranksRepresented.has(pick.rank)) continue;
    ranksRepresented.add(pick.rank);
    appendUniqueProducts(result, usedIds, pick.products, safeLimit);
  }

  for (const pick of picks) {
    if (result.length >= safeLimit) break;
    appendUniqueProducts(result, usedIds, pick.products, safeLimit);
  }

  return result;
}

export function productMatchesSearchQuery(product, query) {
  const normalizedQuery = normalizeCatalogSearchText(query);
  const compactQuery = compactSearchText(query);
  if (compactQuery.length < 3) return false;

  const terms = searchTerms(query);
  if (terms.length === 0) return false;

  const { haystack, haystackCompact, modelTokens } = resolveProductHaystackFields(product);

  const isCodeLikeQuery =
    terms.length === 1 &&
    compactQuery.length >= 6 &&
    /[a-z]/i.test(compactQuery) &&
    /\d/.test(compactQuery);

  // Cuando el usuario escribe un SKU/código alfanumérico (p. ej. PMD0CZ450K),
  // la intención suele ser coincidencia exacta por `code` (o `id`), no por modelo/serie.
  if (isCodeLikeQuery) {
    const codeCompact = compactSearchText(String(product?.code ?? ''));
    if (codeCompact && codeCompact === compactQuery) return true;
    const idCompact = compactSearchText(String(product?.id ?? ''));
    if (idCompact && idCompact === compactQuery) return true;
    return false;
  }

  const hasNumericOnlyTerms = terms.length > 0 && terms.every((term) => /^\d+$/.test(term));
  // Cuando el usuario busca un código numérico largo (p. ej. SKU 842093),
  // evitamos coincidencias por prefijo/subtoken (p. ej. "842093" -> "8420").
  // En ese caso, la intención suele ser coincidencia exacta por código.
  if (hasNumericOnlyTerms && compactQuery.length >= 5) {
    const codeCompact = compactSearchText(String(product?.code ?? ''));
    if (codeCompact && codeCompact.includes(compactQuery)) return true;
    const idCompact = compactSearchText(String(product?.id ?? ''));
    if (idCompact && idCompact === compactQuery) return true;
    return false;
  }

  if (
    hasNumericOnlyTerms &&
    requiresStrictModelMatch(query) &&
    productHasStrongModelMatch(product, query)
  ) {
    return true;
  }

  if (
    !hasNumericOnlyTerms &&
    (haystack.includes(normalizedQuery) || haystackCompact.includes(compactQuery))
  ) {
    return (
      !requiresStrictModelMatch(query) || productHasStrongModelMatch(product, query)
    );
  }

  const termsMatch = terms.every((term) =>
    termMatchesHaystack(term, haystack, haystackCompact, modelTokens, { allowFuzzy: false }),
  );
  if (!termsMatch) return false;

  return !requiresStrictModelMatch(query) || productHasStrongModelMatch(product, query);
}
