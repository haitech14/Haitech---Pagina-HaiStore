export function buildBreadcrumbJsonLd(
  breadcrumbs: Array<{ label: string; href?: string }>,
  siteOrigin: string,
): Record<string, unknown> | null;
export function buildProductJsonLd(
  product: import('./product-seo.js').ProductSeoInput,
  siteOrigin: string,
  breadcrumbs?: Array<{ label: string; href?: string }>,
  options?: { rating?: number; reviewCount?: number },
): Array<Record<string, unknown>>;
export function buildWebsiteJsonLd(siteOrigin: string): Record<string, unknown>;
export function buildOrganizationJsonLd(siteOrigin: string): Record<string, unknown>;
export function buildCategoryCollectionJsonLd(
  category: { slug: string; name: string; tagline?: string },
  siteOrigin: string,
  topProducts?: Array<{ name: string; url: string }>,
): Array<Record<string, unknown>>;
export function buildStoreJsonLd(siteOrigin: string): Array<Record<string, unknown>>;
export function buildWebPageJsonLd(
  page: { pathname: string; pageName: string; description?: string },
  siteOrigin: string,
): Record<string, unknown>;
export function buildHomeJsonLd(siteOrigin: string): Array<Record<string, unknown>>;
export function buildFaqPageJsonLd(
  items?: Array<{ question: string; answer: string }>,
): Record<string, unknown> | null;
export function buildServiceJsonLd(
  service: {
    pathname: string;
    serviceName: string;
    serviceType: string;
    description?: string;
  },
  siteOrigin: string,
): Record<string, unknown>;
