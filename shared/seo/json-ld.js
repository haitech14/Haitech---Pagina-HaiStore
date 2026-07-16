import { buildAbsoluteUrl } from '../site-origin.js';
import { buildProductPath } from '../product-slug.js';
import { HOME_FAQ_SEO_ITEMS } from './home-faq-data.js';
import {
  extractProductModel,
  priceValidUntilSeo,
  resolveProductHeroBrandSeo,
  resolveProductHeroCodeSeo,
  resolveSchemaItemCondition,
} from './product-seo.js';

const ORGANIZATION_CORE = {
  '@type': ['Organization', 'LocalBusiness'],
  name: 'HaiStore',
  legalName: 'NBN TECNOLOGIA TOTAL S.A.C.',
  alternateName: ['HaiTech', 'HAITECH'],
  url: 'https://www.haitech.pe',
  logo: 'https://www.haitech.pe/logo.png',
  description:
    'Distribuidor Autorizado Ricoh en Perú. Venta y alquiler de fotocopiadoras, multifuncionales, impresoras, tóner, tintas y repuestos con soporte técnico especializado.',
  brand: { '@type': 'Brand', name: 'Ricoh' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Petit Thouars 1935',
    addressLocality: 'Lince',
    addressRegion: 'Lima',
    addressCountry: 'PE',
  },
  telephone: ['+51-926-224-243', '+51-965-805-873'],
  email: 'ventas@nbntecnologia.com',
  taxID: '20612146561',
  areaServed: { '@type': 'Country', name: 'Perú' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+51-926-224-243',
      contactType: 'sales',
      areaServed: 'PE',
      availableLanguage: ['Spanish'],
    },
    {
      '@type': 'ContactPoint',
      telephone: '+51-965-805-873',
      contactType: 'customer support',
      areaServed: 'PE',
      availableLanguage: ['Spanish'],
    },
  ],
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
    seller: { '@type': 'Organization', name: 'HaiStore' },
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
    name: 'HaiStore',
    url: buildAbsoluteUrl('/', siteOrigin),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${buildAbsoluteUrl('/tienda', siteOrigin)}?buscar={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationJsonLd(siteOrigin) {
  return {
    '@context': 'https://schema.org',
    ...ORGANIZATION_CORE,
    url: buildAbsoluteUrl('/', siteOrigin),
    logo: buildAbsoluteUrl('/logo.png', siteOrigin),
  };
}

/**
 * @param {Array<{ question: string, answer: string }>} [items]
 */
export function buildFaqPageJsonLd(items = HOME_FAQ_SEO_ITEMS) {
  const mainEntity = (items ?? [])
    .filter((item) => item.question?.trim() && item.answer?.trim())
    .map((item) => ({
      '@type': 'Question',
      name: item.question.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.trim(),
      },
    }));

  if (mainEntity.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

/**
 * @param {{ pathname: string, serviceName: string, serviceType: string, description?: string }} service
 */
export function buildServiceJsonLd(service, siteOrigin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.serviceName,
    serviceType: service.serviceType,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'HaiStore',
      url: buildAbsoluteUrl('/', siteOrigin),
    },
    areaServed: { '@type': 'Country', name: 'Perú' },
    url: buildAbsoluteUrl(service.pathname, siteOrigin),
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
      name: `${category.name} — HaiStore`,
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

export function buildStoreJsonLd(siteOrigin) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Tienda online — fotocopiadoras, impresoras y suministros Ricoh',
      description:
        'Catálogo completo HaiStore: fotocopiadoras y multifuncionales Ricoh, impresoras, tóner, tintas, repuestos y accesorios. Venta y alquiler con envío a todo el Perú.',
      url: buildAbsoluteUrl('/tienda', siteOrigin),
      isPartOf: {
        '@type': 'WebSite',
        name: 'HaiStore',
        url: buildAbsoluteUrl('/', siteOrigin),
      },
    },
    buildOrganizationJsonLd(siteOrigin),
  ];
}

/**
 * @param {{ pathname: string, pageName: string, description?: string }} page
 */
export function buildWebPageJsonLd(page, siteOrigin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.pageName,
    description: page.description,
    url: buildAbsoluteUrl(page.pathname, siteOrigin),
    isPartOf: {
      '@type': 'WebSite',
      name: 'HaiStore',
      url: buildAbsoluteUrl('/', siteOrigin),
    },
    about: buildOrganizationJsonLd(siteOrigin),
  };
}

export function buildHomeJsonLd(siteOrigin) {
  const blocks = [buildWebsiteJsonLd(siteOrigin), buildOrganizationJsonLd(siteOrigin)];
  const faq = buildFaqPageJsonLd();
  if (faq) blocks.push(faq);
  return blocks;
}
