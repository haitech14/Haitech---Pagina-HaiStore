import { readInventory, toPublicProductList } from './inventory-store.js';
import { getHomeApiCache } from './home-api-cache.js';
import { withResolvedMedia } from './product-catalog.js';
import { resolveProductImageUrl } from './product-image-url.js';
import {
  filterStoreProductsForHomeSection,
  getConditionsForCatalogFamily,
  productMatchesCatalogFamily,
  productMatchesCategoryFilter,
  toFeaturedProduct,
} from '../../shared/home-catalog-filter.js';
import { isProductVisibleOnStorefront } from '../../shared/product-catalog-status.js';

/** Etiquetas estáticas por slug (paridad con src/data/categories.ts). */
const SECTION_INVENTORY_LABELS = {
  multifuncionales: [
    'Multifuncionales',
    'Multifuncionales Nuevas',
    'Multifuncionales, Multifuncionales Nuevas',
    'Multifuncionales Seminuevas',
    'Multifuncionales, Multifuncionales Seminuevas',
    'Multifuncionales Remanufacturadas',
    'Multifuncionales, Multifuncionales Remanufacturadas',
  ],
  impresoras: [
    'Impresoras',
    'Impresoras Laser Nuevas',
    'Impresoras Láser Nuevas',
    'Impresoras, Impresoras Laser Nuevas',
    'Impresoras, Impresoras Láser Nuevas',
  ],
  'toner-suministros': [
    'Toner y Suministros',
    'Toner',
    'Toner Original',
    'Toner, Toner Original',
    'Toner Compatible',
    'Toner y Suministros, Toner Compatible',
    'Toner, Toner Compatible',
    'Toner Remanufacturado',
    'Toner, Toner Remanufacturado',
    'Suministros',
    'Toner y suministros',
    'Tóner y Suministros',
  ],
  repuestos: [
    'Repuestos',
    'Repuestos Originales',
    'Repuestos, Repuestos Originales',
    'Repuestos Compatibles',
    'Repuestos, Repuestos Compatibles',
    'Unidades Compatibles',
    'Unidad Compatible',
    'Repuestos Compatibles, Unidades Compatibles',
    'Repuestos, Repuestos Compatibles, Unidades Compatibles',
  ],
};

const VALID_SECTION_IDS = new Set(Object.keys(SECTION_INVENTORY_LABELS));

function resolveSectionLabels(sectionId) {
  return SECTION_INVENTORY_LABELS[sectionId] ?? [];
}

function inventoryProductRelevantForSection(product, sectionId) {
  const categoryLabels = resolveSectionLabels(sectionId);
  return (
    productMatchesCatalogFamily(product, sectionId) ||
    categoryLabels.some((label) => productMatchesCategoryFilter(product, label))
  );
}

function filterInventoryForHomeSections(products, sectionIds) {
  return products.filter(
    (product) =>
      isProductVisibleOnStorefront(product) &&
      sectionIds.some((sectionId) => inventoryProductRelevantForSection(product, sectionId)),
  );
}

function sectionHasProducts(productsByCondition, sectionId) {
  const conditions = getConditionsForCatalogFamily(sectionId);
  return conditions.some((condition) => (productsByCondition[condition] ?? []).length > 0);
}

function buildSectionPayload(sectionId, publicProducts, limit) {
  const categoryLabels = resolveSectionLabels(sectionId);
  const conditions = getConditionsForCatalogFamily(sectionId);

  const productsByCondition = {};
  for (const condition of conditions) {
    const filtered = filterStoreProductsForHomeSection(
      publicProducts,
      sectionId,
      categoryLabels,
      condition,
      limit,
    );
    productsByCondition[condition] = filtered.map((product) => {
      const imageUrl = resolveProductImageUrl(product) ?? product.image_url ?? null;
      return toFeaturedProduct(product, imageUrl);
    });
  }

  return { id: sectionId, productsByCondition };
}

export function buildHomeCatalogSectionsFromProducts(
  products,
  role = 'public',
  sectionIds = [],
  limit = 10,
  warehouses,
) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 24);
  const requested = sectionIds.filter((id) => VALID_SECTION_IDS.has(id));
  if (requested.length === 0) {
    return { sections: [] };
  }

  const relevantProducts = filterInventoryForHomeSections(products, requested);
  const publicProducts = relevantProducts.map((product) =>
    toPublicProductList(withResolvedMedia(product), role, warehouses),
  );

  const sections = requested
    .map((sectionId) => buildSectionPayload(sectionId, publicProducts, safeLimit))
    .filter(({ id, productsByCondition }) => sectionHasProducts(productsByCondition, id));

  return { sections };
}

async function listHomeCatalogSectionsUncached({
  role = 'public',
  sectionIds = [],
  limit = 10,
} = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 24);
  const requested = sectionIds.filter((id) => VALID_SECTION_IDS.has(id));
  if (requested.length === 0) {
    return { sections: [] };
  }

  const { products, warehouses } = await readInventory();
  return buildHomeCatalogSectionsFromProducts(products, role, requested, safeLimit, warehouses);
}
/**
 * Productos por sección y condición para la home (sin descargar todo el catálogo al cliente).
 */
export async function listHomeCatalogSections(options = {}) {
  const { role = 'public', sectionIds = [], limit = 10 } = options;
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 24);
  const requested = sectionIds.filter((id) => VALID_SECTION_IDS.has(id));
  if (requested.length === 0) {
    return { sections: [] };
  }

  const cacheKey = `sections:${role}:${requested.join(',')}:${safeLimit}`;
  return getHomeApiCache(cacheKey, () =>
    listHomeCatalogSectionsUncached({ role, sectionIds: requested, limit: safeLimit }),
  );
}
