import { readInventory, toPublicProduct } from './inventory-store.js';
import { withResolvedMedia } from './product-catalog.js';

/** Etiquetas de inventario por slug de categoría (home destacados). */
const CATEGORY_LABELS = {
  multifuncionales: ['Multifuncionales', 'Multifuncionales Nuevas'],
};

const HOME_HIGHLIGHTED_MODEL_PATTERNS = [
  /\bim\s*5000\b/i,
  /\bim\s*c320\s*f\b/i,
  /\bp\s*c600\b/i,
  /\bm\s*c320\s*fw\b/i,
  /\bim\s*600\s*f\b/i,
  /\bim\s*430\s*f\b/i,
];

const HOME_HIGHLIGHTED_ROW_SIZE = 6;
const MIN_HOME_FEATURED = 3;

function productMatchesCategoryLabels(product, labels) {
  const category = String(product.category ?? '').toLowerCase();
  if (!category) return false;
  return labels.some((label) => category.includes(label.toLowerCase()));
}

function filterInStockForLabels(products, labels) {
  return products.filter(
    (product) =>
      product.stock > 0 &&
      product.price > 0 &&
      productMatchesCategoryLabels(product, labels),
  );
}

function resolveHomeHighlightedRowProducts(inCategory) {
  if (inCategory.length === 0) return [];

  const usedIds = new Set();
  const ordered = [];

  for (const pattern of HOME_HIGHLIGHTED_MODEL_PATTERNS) {
    const match = inCategory.find(
      (product) =>
        !usedIds.has(product.id) &&
        pattern.test(`${product.name} ${product.code ?? ''}`),
    );
    if (match) {
      usedIds.add(match.id);
      ordered.push(match);
    }
  }

  if (ordered.length < HOME_HIGHLIGHTED_ROW_SIZE) {
    for (const product of inCategory) {
      if (ordered.length >= HOME_HIGHLIGHTED_ROW_SIZE) break;
      if (usedIds.has(product.id)) continue;
      usedIds.add(product.id);
      ordered.push(product);
    }
  }

  return ordered.slice(0, HOME_HIGHLIGHTED_ROW_SIZE);
}

function toHomeFeaturedPayload(product) {
  return product;
}

/**
 * Productos destacados para la home (fila fija de multifuncionales en stock).
 */
export async function listHomeFeaturedProducts({
  role = 'public',
  categorySlug = 'multifuncionales',
  limit = HOME_HIGHLIGHTED_ROW_SIZE,
} = {}) {
  const labels = CATEGORY_LABELS[categorySlug] ?? CATEGORY_LABELS.multifuncionales;
  const safeLimit = Math.min(Math.max(Number(limit) || HOME_HIGHLIGHTED_ROW_SIZE, 1), 12);

  const { products } = await readInventory();
  const publicProducts = products
    .map((product) => toPublicProduct(withResolvedMedia(product), role));

  const inCategory = filterInStockForLabels(publicProducts, labels);
  if (inCategory.length < MIN_HOME_FEATURED) {
    return [];
  }

  const highlighted = resolveHomeHighlightedRowProducts(inCategory);
  return highlighted.slice(0, safeLimit).map(toHomeFeaturedPayload);
}
