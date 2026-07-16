export const SITE_BRAND_NAME: string;
export const DEFAULT_SITE_TITLE: string;
export const DEFAULT_SITE_DESCRIPTION: string;
export const DEFAULT_OG_IMAGE: string;
export const STORE_SITE_TITLE: string;
export const STORE_SITE_DESCRIPTION: string;

export function truncateMetaDescription(text: string, maxLength?: number): string;
export function resolveAbsoluteImageUrl(imageUrl: string | null | undefined, siteOrigin: string): string;
export function formatProductPageTitle(product: { name?: string }): string;
export function buildProductMetaDescription(product: {
  name?: string;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
}): string;
export function buildCategoryMetaTitle(
  category: { name: string; slug?: string },
  subcategoryName?: string,
  subSlug?: string,
): string;
export function buildCategoryMetaDescription(
  category: { name: string; tagline?: string; slug?: string },
  subcategoryName?: string,
  heroSubtitle?: string,
  subSlug?: string,
): string;
export function buildProductSeoRecord(
  product: Record<string, unknown>,
  siteOrigin: string,
  breadcrumbs?: Array<{ label: string; href?: string }>,
): Record<string, unknown>;
export function buildCategorySeoRecord(
  category: { slug: string; name: string; tagline?: string; image?: string },
  siteOrigin: string,
  options?: Record<string, unknown>,
): Record<string, unknown>;
export function buildHomeSeoRecord(siteOrigin: string): Record<string, unknown>;
export function buildStoreSeoRecord(siteOrigin: string): Record<string, unknown>;
export function buildStaticPageSeoRecord(
  pathname: string,
  title: string,
  description: string,
  siteOrigin: string,
): Record<string, unknown>;
