import { isHomeCarouselExcludedProduct } from './home-excluded-products.js';

/** Orden de modelos en la fila «Lo más destacado» (IM 430F/550F/600F primero). */
export const HOME_HIGHLIGHTED_MODEL_PATTERNS = [
  /\bim\s*430\s*f\b/i,
  /\bim\s*550\s*f\b/i,
  /\bim\s*600\s*f\b/i,
  /\bim\s*5000\b/i,
  /\bim\s*c320\s*f\b/i,
  /\bp\s*c600\b/i,
  /\bm\s*c320\s*fw\b/i,
];

export const HOME_HIGHLIGHTED_ROW_SIZE = 5;
export const MIN_HOME_FEATURED = 3;

function isSeminuevaProduct(product) {
  return /\bseminueva\b/i.test(String(product?.name ?? ''));
}

function isNuevaMultifuncional(product) {
  const category = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  return (
    (category.includes('multifuncionales nuevas') || /\bnueva\b/i.test(name)) &&
    !isSeminuevaProduct(product)
  );
}

function hasInventoryImage(product) {
  if (typeof product?.image_url === 'string' && product.image_url.trim()) return true;
  return Array.isArray(product?.gallery) && product.gallery.some((url) => String(url ?? '').trim());
}

/** Mayor = mejor candidato para vitrina (nuevas con foto de inventario). */
export function scoreHomeHighlightCandidate(product) {
  let score = 0;
  if (isNuevaMultifuncional(product)) score += 100;
  if (hasInventoryImage(product)) score += 50;
  if (isSeminuevaProduct(product)) score -= 200;
  return score;
}

export function findProductForHighlightPattern(products, pattern, usedIds) {
  const candidates = products.filter(
    (product) =>
      !usedIds.has(product.id) && pattern.test(`${product.name ?? ''} ${product.code ?? ''}`),
  );
  if (candidates.length === 0) return undefined;

  return [...candidates].sort(
    (a, b) => scoreHomeHighlightCandidate(b) - scoreHomeHighlightCandidate(a),
  )[0];
}

export function resolveHomeHighlightedRowProducts(
  inCategory,
  rowSize = HOME_HIGHLIGHTED_ROW_SIZE,
) {
  const candidates = (inCategory ?? []).filter((product) => !isHomeCarouselExcludedProduct(product));
  if (candidates.length === 0) return [];

  const usedIds = new Set();
  const ordered = [];

  for (const pattern of HOME_HIGHLIGHTED_MODEL_PATTERNS) {
    const match = findProductForHighlightPattern(candidates, pattern, usedIds);
    if (!match) continue;
    usedIds.add(match.id);
    ordered.push(match);
  }

  if (ordered.length < rowSize) {
    const remaining = candidates
      .filter((product) => !usedIds.has(product.id))
      .sort((a, b) => scoreHomeHighlightCandidate(b) - scoreHomeHighlightCandidate(a));

    for (const product of remaining) {
      if (ordered.length >= rowSize) break;
      usedIds.add(product.id);
      ordered.push(product);
    }
  }

  return ordered.slice(0, rowSize);
}
