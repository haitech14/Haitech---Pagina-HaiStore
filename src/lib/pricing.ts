import { normalizeAttributes } from '@/lib/inventory-attributes';
import { publicProductAttachments } from '@/lib/inventory-attachments';
import {
  normalizeMerchandisingOptionalProducts,
  normalizeMerchandisingProductIds,
} from '@/lib/product-merchandising';
import { deriveProductSlug } from '@/lib/product-slug';
import {
  normalizeStorefrontFeatureBar,
  normalizeStorefrontHeroBullets,
} from '@/lib/product-storefront-detail';
import { normalizeVolumeRolePrices } from '@/lib/product-volume-role-prices';
import {
  ensureFullPrices,
  resolvePriceRole,
  type InventoryProduct,
  type PriceRole,
  type Product,
} from '@/types/product';

export { ensureFullPrices, resolvePriceRole };

export function getEffectivePrice(product: InventoryProduct, role: string): number {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices);
  return prices[priceRole] ?? prices.public;
}

/** Mirrors server `toPublicProduct` so optimistic cache patches keep storefront fields. */
export function toPublicProduct(product: InventoryProduct, role: string): Product {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices);
  const imageUrl = product.image_url ?? null;
  const galleryUrls = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.trim().length > 0)
    : [];

  return {
    id: product.id,
    slug: product.slug?.trim() || deriveProductSlug(product),
    code: product.code ?? null,
    name: product.name,
    description: product.description,
    price: getEffectivePrice(product, role),
    prices,
    currency: product.currency,
    image_url: imageUrl,
    gallery:
      galleryUrls.length > 0
        ? galleryUrls
        : imageUrl
          ? [imageUrl]
          : [],
    stock: product.stock,
    category: product.category,
    brand: product.brand ?? null,
    created_at: product.created_at,
    price_role: priceRole,
    sort_order: product.sort_order,
    is_featured: product.is_featured === true,
    ...(product.status != null ? { status: product.status } : {}),
    view_count: Number.isFinite(Number(product.view_count))
      ? Math.max(0, Math.floor(Number(product.view_count)))
      : 0,
    attributes: normalizeAttributes(product.attributes),
    attachments: publicProductAttachments(product),
    volume_role_prices: normalizeVolumeRolePrices(product.volume_role_prices),
    storefront_feature_bar: normalizeStorefrontFeatureBar(product.storefront_feature_bar),
    storefront_hero_bullets: normalizeStorefrontHeroBullets(product.storefront_hero_bullets),
    cross_sell_product_ids: normalizeMerchandisingProductIds(product.cross_sell_product_ids),
    upsell_product_ids: normalizeMerchandisingProductIds(product.upsell_product_ids),
    variant_product_ids: normalizeMerchandisingProductIds(product.variant_product_ids),
    cross_sell_optional_products: normalizeMerchandisingOptionalProducts(
      product.cross_sell_optional_products,
    ),
    upsell_optional_products: normalizeMerchandisingOptionalProducts(
      product.upsell_optional_products,
    ),
  };
}

export function mapInventoryForRole(products: InventoryProduct[], role: string): Product[] {
  return products.map((product) => toPublicProduct(product, role));
}

export function resolveDisplayPriceRole(
  userRole: string,
  productRole?: PriceRole,
): PriceRole {
  if (productRole) return productRole;
  return resolvePriceRole(userRole);
}
