import { buildAbsoluteUrl } from '../site-origin.js';
import { buildProductPath } from '../product-slug.js';
import {
  buildProductMetaDescriptionSeo,
  buildProductOgProductMeta,
  formatProductPageTitleSeo,
} from './product-seo.js';

export const DEFAULT_SITE_TITLE = 'Haitech - Tecnología que sí hace la diferencia';

export const DEFAULT_SITE_DESCRIPTION =
  'HAITECH — Ricoh Alliance Partner. Multifuncionales, impresoras y suministros originales. Cotiza online, envío a todo el Perú y soporte técnico especializado.';

export const DEFAULT_OG_IMAGE = '/categories/promonuevas-1.png';

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
export function buildCategoryMetaTitle(category, subcategoryName) {
  const section = subcategoryName?.trim() || category.name;
  const slug = category.slug ?? '';
  if (slug === 'multifuncionales') {
    return `Multifuncionales Ricoh Nuevas en Perú | Haitech`;
  }
  if (slug === 'impresoras') {
    return `Impresoras Ricoh Láser en Perú | Haitech`;
  }
  if (slug === 'toner-suministros') {
    return `Suministros Ricoh Originales | Haitech`;
  }
  return `${section} | Comprar en Perú | Haitech`;
}

export function buildCategoryMetaDescription(category, subcategoryName, heroSubtitle) {
  const section = subcategoryName?.trim() || category.name;
  const slug = category.slug ?? '';
  const subtitle = heroSubtitle?.trim() || category.tagline?.trim();

  if (slug === 'multifuncionales') {
    return truncateMetaDescription(
      'Multifuncionales Ricoh nuevas: IM 430F, IM 550F, IM C3000 y más. Impresión, copia, escaneo y fax. Cotiza online con envío a todo el Perú.',
    );
  }
  if (slug === 'impresoras') {
    return truncateMetaDescription(
      'Impresoras láser Ricoh para oficina. Equipos nuevos y seminuevos con asesoría Haitech, Ricoh Alliance Partner. Envío a todo el Perú.',
    );
  }

  const base = subtitle
    ? `${section}: ${subtitle}`
    : `Explora ${section} en Haitech. Equipos Ricoh y suministros originales con asesoría experta.`;
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
  const { subcategoryName, heroSubtitle, canonicalPath } = options;
  const pathname =
    canonicalPath ??
    (category.slug === 'multifuncionales'
      ? `/categoria/${category.slug}?sub=all`
      : `/categoria/${category.slug}`);

  return {
    slug: category.slug,
    pathname,
    canonical: buildAbsoluteUrl(pathname, siteOrigin),
    title: buildCategoryMetaTitle(category, subcategoryName),
    description: buildCategoryMetaDescription(category, subcategoryName, heroSubtitle),
    image: resolveAbsoluteImageUrl(category.image ?? DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: subcategoryName || category.name,
    ogType: 'website',
  };
}

export function buildHomeSeoRecord(siteOrigin) {
  return {
    pathname: '/',
    canonical: buildAbsoluteUrl('/', siteOrigin),
    title: 'Haitech — Equipos Ricoh y suministros originales en Perú',
    description:
      'Ricoh Alliance Partner en Perú. Multifuncionales, impresoras láser, tóner original y repuestos. Cotiza online con envío a todo el país y soporte técnico especializado.',
    image: resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE, siteOrigin),
    imageAlt: 'Haitech — equipos Ricoh y suministros',
    ogType: 'website',
  };
}
