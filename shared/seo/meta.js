import { buildAbsoluteUrl } from '../site-origin.js';
import { categoryCanonicalPath } from './category-query.js';
import { buildProductPath } from '../product-slug.js';
import {
  buildProductMetaDescriptionSeo,
  buildProductOgProductMeta,
  formatProductPageTitleSeo,
} from './product-seo.js';

export const SITE_BRAND_NAME = 'Haitech';

export const DEFAULT_SITE_TITLE =
  'Haitech | Distribuidor Autorizado Ricoh | Fotocopiadoras e Impresoras';

export const DEFAULT_SITE_DESCRIPTION =
  'Distribuidor Autorizado Ricoh en Perú. Venta y alquiler de fotocopiadoras e impresoras, tóner y soporte técnico. Garantía y cotización online.';

export const DEFAULT_OG_IMAGE = '/categories/promonuevas-1.png';

const ROOT_CATEGORY_TITLES = {
  multifuncionales: 'Multifuncionales | Haitech',
  impresoras: 'Impresoras | Haitech',
  'toner-suministros': 'Tóner | Haitech',
  repuestos: 'Repuestos | Haitech',
  alquiler: 'Alquiler | Haitech',
  'formato-ancho': 'Formato ancho | Haitech',
  accesorios: 'Accesorios | Haitech',
  escaneres: 'Escáneres | Haitech',
  software: 'Software | Haitech',
};

const ROOT_CATEGORY_DESCRIPTIONS = {
  multifuncionales:
    'Fotocopiadoras y multifuncionales Ricoh nuevas, seminuevas y remanufacturadas. Venta y alquiler con instalación, garantía, tóner y envío a todo el Perú. Distribuidor Autorizado.',
  impresoras:
    'Impresoras láser Ricoh para oficina. Equipos nuevos y seminuevos con asesoría HaiTech, Distribuidor Autorizado Ricoh. Venta, alquiler y envío nacional.',
  'toner-suministros':
    'Tóner original y compatible Ricoh, tintas, cartuchos y suministros. Compra online con stock, asesoría técnica y envío a todo el Perú. Distribuidor Autorizado.',
  repuestos:
    'Repuestos originales y compatibles Ricoh: unidades de imagen, cilindros, fusores, rodillos y más. Stock permanente y envío nacional desde Distribuidor Autorizado.',
  alquiler:
    'Alquiler de fotocopiadoras e impresoras multifuncionales Ricoh para empresas. Planes mensuales con mantenimiento, tóner, repuestos y soporte técnico en Lima y Perú.',
  'formato-ancho':
    'Plotters y equipos de formato ancho Ricoh para producción gráfica y planos. Cotiza con Distribuidor Autorizado Ricoh en Perú.',
  accesorios:
    'Accesorios Ricoh para fotocopiadoras e impresoras: gabinetes, bandejas, finishers y complementos. Cotiza con Distribuidor Autorizado Haitech en Perú.',
  escaneres:
    'Escáneres Ricoh para digitalización de documentos y archivos. Compra con Distribuidor Autorizado Haitech en Perú: oficina y alto volumen.',
};

export const STORE_SITE_TITLE = 'Nuestros Productos | Haitech';

export const STORE_SITE_DESCRIPTION =
  'Catálogo Haitech: fotocopiadoras Ricoh, impresoras láser, tóner original y compatible, repuestos y accesorios. Distribuidor Autorizado con precios en USD, stock real y envío a todo el Perú.';

const SUBCATEGORY_TITLE_OVERRIDES = {
  'unidades-compatibles': 'Unidades compatibles | Haitech',
  'repuestos-compatibles': 'Repuestos compatibles | Haitech',
  'repuestos-originales': 'Repuestos originales | Haitech',
  'toner-originales': 'Tóner originales | Haitech',
  'toner-compatibles': 'Tóner compatibles | Haitech',
  'tintas-originales': 'Tintas originales | Haitech',
  'tintas-compatibles': 'Tintas compatibles | Haitech',
  'multifuncionales-nuevas': 'Multifuncionales nuevas | Haitech',
  'multifuncionales-seminuevas': 'Multifuncionales seminuevas | Haitech',
};

export function truncateMetaDescription(text, maxLength = 160) {
  const normalized = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  const slice = normalized.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed}…`;
}

export function resolveAbsoluteImageUrl(imageUrl, siteOrigin) {
  if (!imageUrl) return buildAbsoluteUrl(DEFAULT_OG_IMAGE, siteOrigin);
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return buildAbsoluteUrl(path, siteOrigin);
}

export function formatProductPageTitle(product) {
  return formatProductPageTitleSeo(product);
}

export function buildProductMetaDescription(product) {
  return buildProductMetaDescriptionSeo(product);
}

/**
 * @param {{ slug: string, name: string, tagline?: string }} category
 */
export function buildCategoryMetaTitle(category, subcategoryName, subSlug) {
  const slug = category.slug ?? '';
  const sub = String(subSlug ?? '').trim();
  const section = subcategoryName?.trim() || category.name;

  if (sub && SUBCATEGORY_TITLE_OVERRIDES[sub]) {
    return SUBCATEGORY_TITLE_OVERRIDES[sub];
  }

  if (sub && section) {
    return `${section} | Haitech`;
  }

  if (ROOT_CATEGORY_TITLES[slug]) {
    return ROOT_CATEGORY_TITLES[slug];
  }

  return `${section} | Haitech`;
}

export function buildCategoryMetaDescription(category, subcategoryName, heroSubtitle, subSlug) {
  const section = subcategoryName?.trim() || category.name;
  const slug = category.slug ?? '';
  const sub = String(subSlug ?? '').trim();
  const subtitle = heroSubtitle?.trim() || category.tagline?.trim();

  if (slug && ROOT_CATEGORY_DESCRIPTIONS[slug] && !sub) {
    return truncateMetaDescription(ROOT_CATEGORY_DESCRIPTIONS[slug]);
  }

  if (sub === 'unidades-compatibles') {
    return truncateMetaDescription(
      'Unidades de imagen compatibles Ricoh e Intercopy. Repuestos con stock, precio competitivo y envío a todo el Perú. Distribuidor Autorizado HaiTech.',
    );
  }

  if (sub === 'toner-compatibles' || sub === 'toner-originales') {
    return truncateMetaDescription(
      `${section}: tóner y cartuchos Ricoh con asesoría técnica. Compra online con envío nacional. Distribuidor Autorizado en Perú.`,
    );
  }

  const base = subtitle
    ? `${section}: ${subtitle}`
    : `Explora ${section} en HaiStore, Distribuidor Autorizado Ricoh. Equipos, tóner, tintas y repuestos con asesoría experta.`;
  return truncateMetaDescription(`${base} Cotiza online con envío a todo el Perú.`);
}

export function buildProductSeoRecord(product, siteOrigin, breadcrumbs = []) {
  const pathname = buildProductPath(product);
  const canonical = buildAbsoluteUrl(pathname, siteOrigin);
  const image = resolveAbsoluteImageUrl(product.image_url, siteOrigin);
  const title = formatProductPageTitleSeo(product);
  const description = buildProductMetaDescriptionSeo(product);
  const ogProduct = buildProductOgProductMeta(product);

  return {
    id: product.id,
    slug: product.slug ?? null,
    pathname,
    canonical,
    title,
    description,
    image,
    imageAlt: product.name,
    ogType: 'product',
    ogProduct,
    breadcrumbs,
  };
}

export function buildCategorySeoRecord(category, siteOrigin, options = {}) {
  const { subcategoryName, heroSubtitle, canonicalPath, subSlug } = options;
  const pathname = canonicalPath ?? categoryCanonicalPath(category.slug);

  return {
    slug: category.slug,
    pathname,
    canonical: buildAbsoluteUrl(pathname, siteOrigin),
    title: buildCategoryMetaTitle(category, subcategoryName, subSlug),
    description: buildCategoryMetaDescription(
      category,
      subcategoryName,
      heroSubtitle,
      subSlug,
    ),
    image: resolveAbsoluteImageUrl(category.image ?? DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: subcategoryName || category.name,
    ogType: 'website',
  };
}

export function buildHomeSeoRecord(siteOrigin) {
  return {
    pathname: '/',
    canonical: buildAbsoluteUrl('/', siteOrigin),
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    image: resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: 'Haitech — Distribuidor Autorizado Ricoh en Perú',
    ogType: 'website',
  };
}

export function buildStoreSeoRecord(siteOrigin) {
  return {
    pathname: '/tienda',
    canonical: buildAbsoluteUrl('/tienda', siteOrigin),
    title: STORE_SITE_TITLE,
    description: truncateMetaDescription(STORE_SITE_DESCRIPTION),
    image: resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: 'Nuestros Productos — catálogo Haitech Ricoh en Perú',
    ogType: 'website',
  };
}

export function buildStaticPageSeoRecord(pathname, title, description, siteOrigin) {
  return {
    pathname,
    canonical: buildAbsoluteUrl(pathname, siteOrigin),
    title,
    description: truncateMetaDescription(description),
    image: resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: 'Haitech — equipos Ricoh y suministros',
    ogType: 'website',
  };
}
