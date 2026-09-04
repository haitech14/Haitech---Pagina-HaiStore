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
  alternateName: ['HaiTech', 'HAITECH', 'Distribuidor Autorizado Ricoh Perú'],
  url: 'https://www.haitech.pe',
  logo: 'https://www.haitech.pe/logo.png',
  description:
    'Distribuidor Autorizado Ricoh en Perú. Venta y alquiler de fotocopiadoras, multifuncionales, impresoras, tóner, tintas y repuestos con soporte técnico especializado.',
  brand: { '@type': 'Brand', name: 'Ricoh' },
  knowsAbout: [
    'Fotocopiadoras Ricoh',
    'Impresoras láser Ricoh',
    'Tóner Ricoh',
    'Repuestos Ricoh',
    'Alquiler de fotocopiadoras',
    'Distribuidor Autorizado Ricoh',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Petit Thouars 1935',
    addressLocality: 'Lince',
    addressRegion: 'Lima',
    postalCode: '15046',
    addressCountry: 'PE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -12.0866,
    longitude: -77.0344,
  },
  telephone: ['+51-915-149-290', '+51-965-805-873'],
  email: 'ventas@haitech.pe',
  taxID: '20612146561',
  sameAs: ['https://wa.me/51915149290'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  areaServed: [
    { '@type': 'Country', name: 'Perú' },
    { '@type': 'City', name: 'Lima' },
    { '@type': 'AdministrativeArea', name: 'Lima Metropolitana' },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+51-915-149-290',
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
    name: 'HaiStore — Distribuidor Autorizado Ricoh',
    alternateName: ['HaiTech', 'RICOH Perú', 'Fotocopiadoras Ricoh Perú'],
    url: buildAbsoluteUrl('/', siteOrigin),
    description:
      'Tienda online de fotocopiadoras, impresoras, tóner y repuestos Ricoh en Perú. Distribuidor Autorizado con envío nacional.',
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
 * @param {{ name: string, description?: string, url: string, items: Array<{ name: string, url: string }> }} list
 */
export function buildItemListJsonLd(list) {
  const items = (list.items ?? []).filter((item) => item.name?.trim() && item.url?.trim());
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.name,
    description: list.description,
    url: list.url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name.trim(),
      url: item.url.trim(),
    })),
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
      ? `/categoria/${category.slug}?sub=todas`
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
