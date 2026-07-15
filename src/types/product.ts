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
import type { ProductVolumeRolePriceTier } from '@/lib/product-volume-role-prices';
import type { SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { StoredFeatureBarItem, StoredHeroBullet } from '@/types/product-storefront';

export type { SelectedEquipmentOption, ProductVolumeRolePriceTier };

export interface Product {
  id: string;
  /** Slug legible para URL y SEO (opcional; se deriva del nombre o id). */
  slug?: string | null;
  /** Código de inventario (EDP / SKU) cuando está disponible en catálogo público. */
  code?: string | null;
  name: string;
  description: string | null;
  price: number;
  /** Precios por tier (mayorista, técnico, distribuidor, público). */
  prices?: ProductRolePrices;
  currency: string;
  image_url: string | null;
  /** Galería del inventario (la principal suele coincidir con image_url). */
  gallery?: string[];
  stock: number;
  category: string | null;
  brand?: string | null;
  created_at: string;
  price_role?: PriceRole;
  /** Posición en listados de tienda (menor = primero). */
  sort_order?: number;
  /** Destacado manual en vitrina (carrusel del inicio). */
  is_featured?: boolean;
  /** Estado de publicación (`inactiva` = oculto en tienda). */
  status?: 'activa' | 'borrador' | 'inactiva';
  /** Visitas acumuladas a la ficha del producto. */
  view_count?: number;
  attributes?: ProductAttribute[];
  /** Documentos públicos (ficha técnica, manual, etc.). */
  attachments?: ProductAttachment[];
  /** Tramos de precio por cantidad y rol (opcional; sustituye descuentos globales en este producto). */
  volume_role_prices?: ProductVolumeRolePriceTier[];
  /** Barra de características personalizada en ficha de tienda (6 ítems). */
  storefront_feature_bar?: StoredFeatureBarItem[] | null;
  /** Bullets del hero personalizados en ficha de tienda. */
  storefront_hero_bullets?: StoredHeroBullet[] | null;
  /** Productos sugeridos en venta cruzada (selector de tóner / complementos). */
  cross_sell_product_ids?: string[];
  /** Productos sugeridos en upselling (carrusel «Configura tu equipo»). */
  upsell_product_ids?: string[];
  /** Productos vinculados como variantes (mismo modelo / opciones). */
  variant_product_ids?: string[];
  /** Complementos opcionales sin ficha en inventario (venta cruzada). */
  cross_sell_optional_products?: MerchandisingOptionalProduct[];
  /** Complementos opcionales sin ficha en inventario (upselling). */
  upsell_optional_products?: MerchandisingOptionalProduct[];
  /** Pack compuesto: stock y precios se derivan de los componentes. */
  bundle_components?: ProductBundleComponent[];
}

/** Producto sugerido en merchandising que no existe en el inventario. */
export interface MerchandisingOptionalProduct {
  id: string;
  name: string;
  description?: string | null;
  price_usd: number;
  image_url?: string | null;
  code?: string | null;
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
  'printer_driver',
  'firmware',
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

export interface ProductBundleComponent {
  product_id: string;
  quantity: number;
}

export interface InventoryProduct extends Omit<Product, 'price' | 'price_role' | 'sort_order'> {
  /** Orden de visualización en tienda y admin (0 = primero). */
  sort_order: number;
  is_featured?: boolean;
  view_count?: number;
  /**
   * Estado de publicación en tienda.
   * `inactiva` no se muestra en la página pública.
   */
  status?: 'activa' | 'borrador' | 'inactiva';
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
  /** Pack compuesto: stock y precios se derivan de los componentes al vender. */
  bundle_components?: ProductBundleComponent[];
  /** Venta cruzada: IDs de productos relacionados (p. ej. tóner original). */
  cross_sell_product_ids?: string[];
  /** Upselling: IDs de productos en el carrusel «Configura tu equipo». */
  upsell_product_ids?: string[];
  /** Productos vinculados como variantes (mismo modelo / opciones). */
  variant_product_ids?: string[];
  /** Venta cruzada opcional sin inventario. */
  cross_sell_optional_products?: MerchandisingOptionalProduct[];
  /** Upselling opcional sin inventario. */
  upsell_optional_products?: MerchandisingOptionalProduct[];
  /** URLs de galería (la principal suele coincidir con image_url). */
  gallery: string[];
  prices: ProductRolePrices;
  /** Tramos de precio por cantidad y rol. */
  volume_role_prices?: ProductVolumeRolePriceTier[];
  /** Última actualización del registro (p. ej. para cache-bust de imagen). */
  updated_at?: string;
}

export interface CartConfigurationLine {
  options: SelectedEquipmentOption[];
  extrasPen: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Identificador único de línea (producto + configuración opcional). */
  lineId: string;
  configuration?: CartConfigurationLine;
  /** Precio unitario USD con descuento por volumen al agregar. */
  volumeUnitPriceUsd?: number;
  /** Tipo de preparado en equipos seminuevos (solo visitantes públicos). */
  preparationType?: 'acondicionado' | 'semirepotenciado' | 'remanufacturado';
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}
