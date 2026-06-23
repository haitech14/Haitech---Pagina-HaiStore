import { normalizeAttributes } from '@/lib/inventory-attributes';
import { publicProductAttachments } from '@/lib/inventory-attachments';
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

export function toPublicProduct(product: InventoryProduct, role: string): Product {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices);
  const imageUrl = product.image_url ?? null;
  const galleryUrls = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.trim().length > 0)
    : [];

  return {
    id: product.id,
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
    view_count: Number.isFinite(Number(product.view_count))
      ? Math.max(0, Math.floor(Number(product.view_count)))
      : 0,
    attributes: normalizeAttributes(product.attributes),
    attachments: publicProductAttachments(product),
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
