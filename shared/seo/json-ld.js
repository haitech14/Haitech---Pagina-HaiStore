import { buildAbsoluteUrl } from '../site-origin.js';
import { buildProductPath } from '../product-slug.js';
import {
  extractProductModel,
  priceValidUntilSeo,
  resolveProductHeroBrandSeo,
  resolveProductHeroCodeSeo,
  resolveSchemaItemCondition,
} from './product-seo.js';

const ORGANIZATION = {
  '@type': 'Organization',
  name: 'Haitech',
  url: 'https://www.haitech.pe',
  logo: 'https://www.haitech.pe/Logo%20Haitech.png',
};

function availabilityUrl(stock) {
  return Number(stock) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

function buildOffer(product, siteOrigin, url) {
  const priceUsd = Number(product.price ?? product.prices?.public ?? 0);
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const validUntil = priceValidUntilSeo(90);

  const base = {
    '@type': 'Offer',
    url,
    availability: availabilityUrl(stock),
    seller: ORGANIZATION,
    itemCondition: resolveSchemaItemCondition(product),
    priceValidUntil: validUntil,
  };

  if (priceUsd <= 0) return base;

  return {
    ...base,
    priceCurrency: product.currency ?? 'USD',
    price: priceUsd.toFixed(2),
  };
}

/**
 * @param {Array<{ label: string, href?: string }>} breadcrumbs
 */
export function buildBreadcrumbJsonLd(breadcrumbs, siteOrigin) {
  const items = breadcrumbs
    .filter((crumb) => crumb.label?.trim())
    .map((crumb, index) => {
      const entry = {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label.trim(),
      };
      if (crumb.href) {
        entry.item = buildAbsoluteUrl(crumb.href, siteOrigin);
      }
      return entry;
    });

  if (items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function buildProductJsonLd(product, siteOrigin, breadcrumbs = [], options = {}) {
  const pathname = buildProductPath(product);
  const url = buildAbsoluteUrl(pathname, siteOrigin);
  const images = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery
    : product.image_url
      ? [product.image_url]
      : [];

  const absoluteImages = images
    .map((image) => {
      if (!image) return null;
      if (/^https?:\/\//i.test(image)) return image;
      return buildAbsoluteUrl(image.startsWith('/') ? image : `/${image}`, siteOrigin);
    })
    .filter(Boolean);

  const description = String(product.description ?? product.name ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const model = extractProductModel(product);
  const brandName = resolveProductHeroBrandSeo(product) ?? product.brand ?? 'Ricoh';
  const sku = resolveProductHeroCodeSeo(product) ?? product.code ?? product.id;

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: description || product.name,
    sku,
    image: absoluteImages.length > 0 ? absoluteImages : undefined,
    brand: { '@type': 'Brand', name: brandName },
    offers: buildOffer(product, siteOrigin, url),
  };

  if (model) {
    payload.mpn = model;
    payload.model = model;
  }

  const { rating, reviewCount } = options;
  if (
    typeof rating === 'number' &&
    rating > 0 &&
    typeof reviewCount === 'number' &&
    reviewCount > 0
  ) {
    payload.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: String(Math.floor(reviewCount)),
      bestRating: '5',
      worstRating: '1',
    };
  }

  const breadcrumbLd = buildBreadcrumbJsonLd(breadcrumbs, siteOrigin);
  return breadcrumbLd ? [payload, breadcrumbLd] : [payload];
}

export function buildWebsiteJsonLd(siteOrigin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Haitech',
    url: buildAbsoluteUrl('/', siteOrigin),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${buildAbsoluteUrl('/categoria/multifuncionales', siteOrigin)}?buscar={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationJsonLd(siteOrigin) {
  return {
    '@context': 'https://schema.org',
    ...ORGANIZATION,
    url: buildAbsoluteUrl('/', siteOrigin),
    logo: buildAbsoluteUrl('/logo.png', siteOrigin),
  };
}

/**
 * @param {{ slug: string, name: string, tagline?: string }} category
 * @param {Array<{ name: string, url: string }>} topProducts
 */
export function buildCategoryCollectionJsonLd(category, siteOrigin, topProducts = []) {
  const pathname =
    category.slug === 'multifuncionales'
      ? `/categoria/${category.slug}?sub=all`
      : `/categoria/${category.slug}`;
  const url = buildAbsoluteUrl(pathname, siteOrigin);

  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: category.tagline ?? category.name,
      url,
    },
  ];

  if (topProducts.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${category.name} — Haitech`,
      itemListElement: topProducts.slice(0, 10).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    });
  }

  return blocks;
}

export function buildHomeJsonLd(siteOrigin) {
  return [buildWebsiteJsonLd(siteOrigin), buildOrganizationJsonLd(siteOrigin)];
}
