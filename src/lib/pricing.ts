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
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: getEffectivePrice(product, role),
    currency: product.currency,
    image_url: product.image_url,
    stock: product.stock,
    category: product.category,
    brand: product.brand ?? null,
    created_at: product.created_at,
    price_role: priceRole,
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
