/**
 * Productos de inventario que pertenecen al catálogo /software y no deben listarse en /tienda.
 * Detección por categoría de inventario (preferida) y slug de respaldo.
 */

import { LANDING_CATEGORY } from './landing-categories.js';

const SOFTWARE_ROOT = normalizeCategoryName(LANDING_CATEGORY.software);

/** Subcategorías de inventario mapeadas a Software (ver shared/landing-categories.js). */
const SOFTWARE_CHILD_LABELS = new Set(
  [
    LANDING_CATEGORY.antivirus,
    LANDING_CATEGORY.inteligenciaArtificial,
    'Gestión Documental',
    'Automatización de Procesos',
    'Impresión y Captura',
    'Integración Ricoh',
    'Software Empresarial',
  ].map(normalizeCategoryName),
);

/** Slugs del catálogo /software por si el inventario no trae categoría Software. */
const SOFTWARE_CATALOG_SLUGS = new Set([
  'ricoh-smart-flow-connector',
  'docuware-cloud',
  'ricoh-streamline-nx',
  'ricoh-remote-enterprise',
  'ricoh-globalscan-nx',
  'ricoh-intelligent-process-automation',
  'haisupport',
  'haisales',
  'rapifac',
  'keyfacil',
  'kommo-crm',
  'eset-nod32-licencia-12-meses',
  'chatgpt-pro-perfil-1-mes',
  'chatgpt-plus-perfil-1-mes',
  'chatgpt-plus-perfil-3-meses',
  'chatgpt-plus-cuenta-completa-1-mes',
  'gemini-pro-perfil-1-anio',
  'gemini-pro-cuenta-completa-1-anio',
  'super-grok-perfil-1-mes',
  'super-grok-cuenta-completa',
  'microsoft-365-cuenta-completa-1-anio',
  'microsoft-365-perfil-1-anio',
  'windows-10-11-licencia-permanente',
  'turnitin-reporte-plagio-ia',
  'nordvpn-surfshark-vpn-1-mes',
]);

function normalizeCategoryName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function productCategoryTags(product) {
  const raw = String(product?.category ?? '').trim();
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [raw];
}

function matchesSoftwareCatalogSlug(product) {
  const slug = String(product?.slug ?? '').trim().toLowerCase();
  if (slug && SOFTWARE_CATALOG_SLUGS.has(slug)) return true;

  const id = String(product?.id ?? '').trim().toLowerCase();
  return id.length > 0 && SOFTWARE_CATALOG_SLUGS.has(id);
}

/**
 * @param {Pick<{ category?: string | null; slug?: string | null; id?: string | null }, 'category' | 'slug' | 'id'> | null | undefined} product
 */
export function isStoreSoftwareLicenseProduct(product) {
  if (!product) return false;

  const tags = productCategoryTags(product);
  if (tags.length > 0) {
    const normalizedTags = tags.map(normalizeCategoryName);
    if (normalizedTags.includes(SOFTWARE_ROOT)) return true;
    if (normalizedTags.some((tag) => SOFTWARE_CHILD_LABELS.has(tag))) return true;
  } else {
    const fullCategory = normalizeCategoryName(product.category);
    if (fullCategory === SOFTWARE_ROOT || SOFTWARE_CHILD_LABELS.has(fullCategory)) {
      return true;
    }
  }

  return matchesSoftwareCatalogSlug(product);
}

/**
 * @template {{ category?: string | null; slug?: string | null; id?: string | null }} T
 * @param {readonly T[]} products
 * @returns {T[]}
 */
export function excludeStoreSoftwareProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return [];
  return products.filter((product) => !isStoreSoftwareLicenseProduct(product));
}
