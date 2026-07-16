import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  SITE_BRAND_NAME,
  resolveAbsoluteImageUrl,
} from '../../shared/seo/meta.js';
import { buildAbsoluteUrl, SITE_ORIGIN } from '@/lib/site-url';

export {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  SITE_BRAND_NAME,
  DEFAULT_OG_IMAGE,
  buildProductMetaDescription,
  buildCategoryMetaDescription,
  buildCategoryMetaTitle,
  formatProductPageTitle,
  truncateMetaDescription,
  resolveAbsoluteImageUrl,
} from '../../shared/seo/meta.js';

export {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  buildCategoryCollectionJsonLd,
  buildHomeJsonLd,
  buildFaqPageJsonLd,
  buildServiceJsonLd,
  buildStoreJsonLd,
  buildWebPageJsonLd,
} from '../../shared/seo/json-ld.js';

export {
  buildProductMetaDescriptionSeo,
  buildProductOgProductMeta,
  buildProductSeoBodyParagraph,
  extractProductModel,
  formatProductPageTitleSeo,
  suggestProductSlug,
} from '../../shared/seo/product-seo.js';

export type SeoRobotsDirective = 'index,follow' | 'noindex,follow' | 'noindex,nofollow';

export interface OgProductMeta {
  priceAmount: string | null;
  priceCurrency: string;
  priceAmountPen: string | null;
  availability: string;
  brand: string;
  retailerItemId: string;
}

export interface PageSeoConfig {
  title: string;
  description?: string;
  canonical?: string;
  image?: string | null;
  imageAlt?: string;
  ogType?: 'website' | 'product' | 'article';
  robots?: SeoRobotsDirective;
  ogProduct?: OgProductMeta;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const DEFAULT_PAGE_SEO: PageSeoConfig = {
  title: DEFAULT_SITE_TITLE,
  description: DEFAULT_SITE_DESCRIPTION,
  canonical: buildAbsoluteUrl('/'),
  image: resolveAbsoluteImageUrl(DEFAULT_OG_IMAGE, SITE_ORIGIN),
  imageAlt: 'Haitech — equipos Ricoh y suministros',
  ogType: 'website',
  robots: 'index,follow',
};

const MANAGED_SELECTOR =
  'meta[data-seo-managed], link[data-seo-managed], script[data-seo-jsonld]';

function upsertMeta(
  parent: HTMLHeadElement,
  key: 'name' | 'property',
  value: string,
  content: string,
) {
  const selector = `meta[${key}="${value}"][data-seo-managed]`;
  let element = parent.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(key, value);
    element.setAttribute('data-seo-managed', 'true');
    parent.appendChild(element);
  }
  element.content = content;
}

function upsertLink(parent: HTMLHeadElement, rel: string, href: string) {
  const selector = `link[rel="${rel}"][data-seo-managed]`;
  let element = parent.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    element.setAttribute('data-seo-managed', 'true');
    parent.appendChild(element);
  }
  element.href = href;
}

function removeManagedJsonLd(parent: HTMLHeadElement) {
  parent.querySelectorAll('script[data-seo-jsonld]').forEach((node) => node.remove());
}

function applyJsonLd(
  parent: HTMLHeadElement,
  jsonLd?: PageSeoConfig['jsonLd'],
) {
  removeManagedJsonLd(parent);
  if (!jsonLd) return;

  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  for (const block of blocks) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', 'true');
    script.textContent = JSON.stringify(block);
    parent.appendChild(script);
  }
}

export function applyPageSeo(config: PageSeoConfig) {
  if (typeof document === 'undefined') return;

  const head = document.head;
  const merged: PageSeoConfig = {
    title: config.title,
    description: config.description ?? DEFAULT_PAGE_SEO.description ?? '',
    canonical: config.canonical ?? DEFAULT_PAGE_SEO.canonical ?? buildAbsoluteUrl('/'),
    image: config.image ?? DEFAULT_PAGE_SEO.image ?? null,
    imageAlt: config.imageAlt ?? DEFAULT_PAGE_SEO.imageAlt ?? SITE_BRAND_NAME,
    ogType: config.ogType ?? DEFAULT_PAGE_SEO.ogType ?? 'website',
    robots: config.robots ?? DEFAULT_PAGE_SEO.robots ?? 'index,follow',
    ...(config.ogProduct ? { ogProduct: config.ogProduct } : {}),
    ...(config.jsonLd ? { jsonLd: config.jsonLd } : {}),
  };

  document.title = merged.title;

  if (merged.description) {
    upsertMeta(head, 'name', 'description', merged.description);
  }

  if (merged.canonical) {
    upsertLink(head, 'canonical', merged.canonical);
  }

  upsertMeta(head, 'property', 'og:title', merged.title);
  if (merged.description) {
    upsertMeta(head, 'property', 'og:description', merged.description);
  }
  if (merged.canonical) {
    upsertMeta(head, 'property', 'og:url', merged.canonical);
  }
  upsertMeta(head, 'property', 'og:type', merged.ogType ?? 'website');
  upsertMeta(head, 'property', 'og:locale', 'es_PE');
  upsertMeta(head, 'property', 'og:site_name', SITE_BRAND_NAME);

  if (merged.image) {
    upsertMeta(head, 'property', 'og:image', merged.image);
    if (merged.imageAlt) {
      upsertMeta(head, 'property', 'og:image:alt', merged.imageAlt);
    }
  }

  upsertMeta(head, 'name', 'twitter:card', 'summary_large_image');
  upsertMeta(head, 'name', 'twitter:title', merged.title);
  if (merged.description) {
    upsertMeta(head, 'name', 'twitter:description', merged.description);
  }
  if (merged.image) {
    upsertMeta(head, 'name', 'twitter:image', merged.image);
  }

  if (merged.robots) {
    upsertMeta(head, 'name', 'robots', merged.robots);
  }

  if (merged.ogProduct) {
    const og = merged.ogProduct;
    if (og.priceAmount) {
      upsertMeta(head, 'property', 'product:price:amount', og.priceAmount);
    }
    if (og.priceCurrency) {
      upsertMeta(head, 'property', 'product:price:currency', og.priceCurrency);
    }
    if (og.priceAmountPen) {
      upsertMeta(head, 'property', 'product:pretax_price:amount', og.priceAmountPen);
    }
    if (og.availability) {
      upsertMeta(head, 'property', 'product:availability', og.availability);
    }
    if (og.brand) {
      upsertMeta(head, 'property', 'product:brand', og.brand);
    }
    if (og.retailerItemId) {
      upsertMeta(head, 'property', 'product:retailer_item_id', og.retailerItemId);
    }
  }

  applyJsonLd(head, merged.jsonLd);
}

export function resetPageSeo() {
  if (typeof document === 'undefined') return;
  document.head.querySelectorAll(MANAGED_SELECTOR).forEach((node) => node.remove());
  applyPageSeo(DEFAULT_PAGE_SEO);
}
