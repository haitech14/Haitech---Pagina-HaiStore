import type { FeaturedProduct } from '@/data/featured-products';
import type { CompareProductItem } from '@/lib/compare-product';
import type { Product } from '@/types/product';

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  image: string | null;
}

export function featuredToWishlistItem(product: FeaturedProduct): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    price: product.price,
    image: product.image || null,
  };
}

export function productToWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    price: product.price,
    image: product.image_url,
  };
}

export function compareToWishlistItem(product: CompareProductItem): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    price: product.price,
    image: product.image,
  };
}
