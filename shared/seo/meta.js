import { buildAbsoluteUrl } from '../site-origin.js';
import { buildProductPath } from '../product-slug.js';
import {
  buildProductMetaDescriptionSeo,
  buildProductOgProductMeta,
  formatProductPageTitleSeo,
} from './product-seo.js';

export const SITE_BRAND_NAME = 'HaiStore';

export const DEFAULT_SITE_TITLE =
  'HaiStore - Fotocopiadoras e Impresoras Ricoh | Distribuidor Autorizado';

export const DEFAULT_SITE_DESCRIPTION =
  'Distribuidor Autorizado Ricoh en Perú. Venta y alquiler de fotocopiadoras, multifuncionales, impresoras, tóner, tintas y repuestos. Envío a todo el país y soporte técnico.';

export const DEFAULT_OG_IMAGE = '/categories/promonuevas-1.png';

const ROOT_CATEGORY_TITLES = {
  multifuncionales: 'Fotocopiadoras y Multifuncionales Ricoh | Venta | HaiStore',
  impresoras: 'Impresoras Láser Ricoh | Venta en Perú | HaiStore',
  'toner-suministros': 'Tóner, Tintas y Suministros Ricoh | HaiStore',
  repuestos: 'Repuestos Ricoh Originales y Compatibles | HaiStore',
  alquiler: 'Alquiler de Fotocopiadoras e Impresoras Ricoh | HaiStore',
  'formato-ancho': 'Plotters y Formato Ancho Ricoh | HaiStore',
  accesorios: 'Accesorios para Impresoras Ricoh | HaiStore',
  escaneres: 'Escáneres Ricoh | Digitalización | HaiStore',
  software: 'Software de Gestión Documental | HaiStore',
};

const ROOT_CATEGORY_DESCRIPTIONS = {
  multifuncionales:
    'Fotocopiadoras y multifuncionales Ricoh nuevas, seminuevas y remanufacturadas. Venta con instalación, garantía y envío a todo el Perú. Distribuidor Autorizado.',
  impresoras:
    'Impresoras láser Ricoh para oficina. Equipos nuevos y seminuevos con asesoría HaiTech, Distribuidor Autorizado Ricoh. Venta y envío nacional.',
  'toner-suministros':
    'Tóner original y compatible, tintas, cartuchos y suministros Ricoh. Compra online con stock, asesoría técnica y envío a todo el Perú.',
  repuestos:
    'Repuestos originales y compatibles Ricoh: unidades de imagen, cilindros, fusores, rodillos y más. Distribuidor Autorizado con envío nacional.',
  alquiler:
    'Alquiler de fotocopiadoras e impresoras multifuncionales Ricoh para empresas. Planes mensuales con mantenimiento, tóner y soporte técnico.',
  'formato-ancho':
    'Plotters y equipos de formato ancho Ricoh para producción gráfica y planos. Cotiza con Distribuidor Autorizado Ricoh en Perú.',
};

const SUBCATEGORY_TITLE_OVERRIDES = {
  'unidades-compatibles': 'Unidades Compatibles Ricoh | Repuestos | HaiStore',
  'repuestos-compatibles': 'Repuestos Compatibles Ricoh | HaiStore',
  'repuestos-originales': 'Repuestos Originales Ricoh | HaiStore',
  'toner-originales': 'Tóner Original Ricoh | Suministros | HaiStore',
  'toner-compatibles': 'Tóner Compatible Ricoh | HaiStore',
  'tintas-originales': 'Tintas Originales Ricoh | HaiStore',
  'tintas-compatibles': 'Tintas Compatibles | HaiStore',
  'multifuncionales-nuevas': 'Multifuncionales Ricoh Nuevas | Venta | HaiStore',
  'multifuncionales-seminuevas': 'Multifuncionales Ricoh Seminuevas | HaiStore',
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
    return `${section} Ricoh | ${category.name} | HaiStore`;
  }

  if (ROOT_CATEGORY_TITLES[slug]) {
    return ROOT_CATEGORY_TITLES[slug];
  }

  return `${section} | Comprar en Perú | HaiStore`;
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
  const pathname =
    canonicalPath ??
    (category.slug === 'multifuncionales'
      ? `/categoria/${category.slug}?sub=all`
      : `/categoria/${category.slug}`);

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
    imageAlt: 'HaiStore — Distribuidor Autorizado Ricoh en Perú',
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
    imageAlt: 'HaiStore — equipos Ricoh y suministros',
    ogType: 'website',
  };
}
