export type {
  PriceRole,
  UserRole,
  ProductRolePrices,
} from '@/lib/roles';

export {
  PRICE_ROLES,
  PRICE_ROLES_EDIT_ORDER,
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
  /** Posición en listados de tienda (menor = primero). */
  sort_order?: number;
  attributes?: ProductAttribute[];
}

export interface InventorySupplier {
  id: string;
  name: string;
  purchase_price_usd: number;
}

export interface InventoryWarehouse {
  id: string;
  name: string;
}

export interface ProductStockByWarehouse {
  warehouse_id: string;
  quantity: number;
}

export const PRODUCT_ATTACHMENT_KINDS = [
  'technical_sheet',
  'manual',
  'brochure',
  'other',
] as const;

export type ProductAttachmentKind = (typeof PRODUCT_ATTACHMENT_KINDS)[number];

export interface ProductAttachment {
  id: string;
  kind: ProductAttachmentKind;
  label: string;
  url: string;
  file_name?: string;
  mime_type?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface InventoryProduct extends Omit<Product, 'price' | 'price_role' | 'sort_order'> {
  /** Orden de visualización en tienda y admin (0 = primero). */
  sort_order: number;
  /** Cantidades por almacén (el total en `stock` es la suma). */
  stock_by_warehouse?: ProductStockByWarehouse[];
  /** Código interno / SKU. */
  code: string;
  /** Costo de adquisición en USD (referencia; suele ser el menor entre proveedores). */
  purchase_price_usd: number;
  /** Proveedores con precio de compra propio. */
  suppliers?: InventorySupplier[];
  /** Documentos adjuntos (ficha técnica, manual, etc.). */
  attachments?: ProductAttachment[];
  /** Especificaciones (color, velocidad, formato, etc.). */
  attributes?: ProductAttribute[];
  /** URLs de galería (la principal suele coincidir con image_url). */
  gallery: string[];
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
  created_at?: string;
  updated_at?: string;
}
