import type { Product } from '@/types/product';

export interface FeaturedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  isNew?: boolean;
  rating: number;
  reviews: number;
  image: string;
}

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'sony-wh1000xm5',
    name: 'Sony WH-1000XM5',
    category: 'Audio',
    price: 299.99,
    oldPrice: 349.99,
    discount: 15,
    rating: 5,
    reviews: 128,
    image: '/products/sony-wh1000xm5.png',
  },
  {
    id: 'macbook-air-m13',
    name: 'MacBook Air M3 13"',
    category: 'Laptops',
    price: 1099.0,
    isNew: true,
    rating: 5,
    reviews: 86,
    image: '/products/macbook-air-m13.png',
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro 256GB',
    category: 'Smartphones',
    price: 1099.0,
    oldPrice: 1229.0,
    discount: 10,
    rating: 5,
    reviews: 203,
    image: '/products/iphone-15-pro.png',
  },
  {
    id: 'apple-watch-9',
    name: 'Apple Watch Series 9',
    category: 'Smartwatches',
    price: 399.0,
    isNew: true,
    rating: 4,
    reviews: 64,
    image: '/products/apple-watch-9.png',
  },
  {
    id: 'galaxy-buds2-pro',
    name: 'Samsung Galaxy Buds2 Pro',
    category: 'Audio',
    price: 159.99,
    oldPrice: 199.99,
    discount: 20,
    rating: 4,
    reviews: 97,
    image: '/products/galaxy-buds2-pro.png',
  },
  {
    id: 'mochila-techpro',
    name: 'Mochila TechPro',
    category: 'Accesorios',
    price: 49.99,
    rating: 4,
    reviews: 41,
    image: '/products/mochila-techpro.png',
  },
];

export function getFeaturedProductById(id: string): FeaturedProduct | undefined {
  return featuredProducts.find((product) => product.id === id);
}

export function featuredToProduct(featured: FeaturedProduct): Product {
  return {
    id: featured.id,
    name: featured.name,
    description: null,
    price: featured.price,
    currency: 'USD',
    image_url: featured.image,
    stock: 10,
    category: featured.category,
    created_at: new Date().toISOString(),
  };
}
