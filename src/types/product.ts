export type {
  PriceRole,
  UserRole,
  ProductRolePrices,
} from '@/lib/roles';

export {
  PRICE_ROLES,
  PRICE_ROLE_LABELS,
  USER_ROLE_LABELS,
  isPriceRole,
  isUserRole,
  resolvePriceRole,
  createEmptyPrices,
  ensureFullPrices,
} from '@/lib/roles';

import type { PriceRole, ProductRolePrices } from '@/lib/roles';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  stock: number;
  category: string | null;
  brand?: string | null;
  created_at: string;
  price_role?: PriceRole;
}

export interface InventoryProduct extends Omit<Product, 'price' | 'price_role'> {
  prices: ProductRolePrices;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  updated_at?: string;
}
