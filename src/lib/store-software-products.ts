import type { Product } from '@/types/product';

function normalizeCategoryName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

const SOFTWARE_ROOT = normalizeCategoryName('Software');

const SOFTWARE_CHILD_LABELS = new Set(
  [
    'Antivirus',
    'Inteligencia Artificial',
    'Gestión Documental',
    'Automatización de Procesos',
    'Impresión y Captura',
    'Integración Ricoh',
    'Software Empresarial',
  ].map(normalizeCategoryName),
);

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

function productCategoryTags(product: Pick<Product, 'category'>): string[] {
  const raw = String(product.category ?? '').trim();
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [raw];
}

function matchesSoftwareCatalogSlug(product: Pick<Product, 'slug' | 'id'>): boolean {
  const slug = String(product.slug ?? '').trim().toLowerCase();
  if (slug && SOFTWARE_CATALOG_SLUGS.has(slug)) return true;

  const id = String(product.id ?? '').trim().toLowerCase();
  return id.length > 0 && SOFTWARE_CATALOG_SLUGS.has(id);
}

export function isStoreSoftwareLicenseProduct(
  product: Pick<Product, 'category' | 'slug' | 'id'> | null | undefined,
): boolean {
  if (!product) return false;

  const tags = productCategoryTags(product);
  if (tags.length > 0) {
    const normalizedTags = tags.map(normalizeCategoryName);
    if (normalizedTags.includes(SOFTWARE_ROOT)) return true;
    if (normalizedTags.some((tag) => SOFTWARE_CHILD_LABELS.has(tag))) return true;
  } else {
    const fullCategory = normalizeCategoryName(String(product.category ?? ''));
    if (fullCategory === SOFTWARE_ROOT || SOFTWARE_CHILD_LABELS.has(fullCategory)) {
      return true;
    }
  }

  return matchesSoftwareCatalogSlug(product);
}

export function excludeStoreSoftwareProducts<T extends Pick<Product, 'category' | 'slug' | 'id'>>(
  products: readonly T[],
): T[] {
  if (!products.length) return [];
  return products.filter((product) => !isStoreSoftwareLicenseProduct(product));
}

export function filterStoreCatalogProducts(products: readonly Product[]): Product[] {
  return excludeStoreSoftwareProducts(products);
}
