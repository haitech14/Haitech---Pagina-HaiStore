export type InventoryBulkStockMode = 'set' | 'add';

export type InventoryBulkCategoryMode = 'set' | 'add' | 'remove';

/** Prefijo / sufijo / insertar / duplicar fragmento / quitar / reemplazar. */
export type InventoryBulkNameMode =
  | 'append'
  | 'prepend'
  | 'insert'
  | 'duplicate'
  | 'remove'
  | 'replace';

export type InventoryBulkCodeMode = InventoryBulkNameMode;

export type InventoryBulkAttributeMode = 'add' | 'set' | 'remove';

export interface InventoryBulkPatch {
  /** Reemplazo simple (compatibilidad). Preferir categoryMode + categories. */
  category?: string;
  categoryMode?: InventoryBulkCategoryMode;
  categories?: string[];

  nameMode?: InventoryBulkNameMode;
  nameText?: string;
  nameReplaceWith?: string;
  /** Para insert: texto ancla tras el cual insertar (vacío = mitad del nombre). */
  nameInsertAfter?: string;

  codeMode?: InventoryBulkCodeMode;
  codeText?: string;
  codeReplaceWith?: string;
  codeInsertAfter?: string;

  attributeMode?: InventoryBulkAttributeMode;
  attribute?: { name: string; value: string };
  attributeName?: string;

  stockMode?: InventoryBulkStockMode;
  stock?: number;
  /** Porcentaje aplicado a todos los precios por rol (ej. 10 = +10 %). */
  pricePercent?: number;
  /** Porcentaje sobre precio de compra. */
  purchasePricePercent?: number;

  /** URL de imagen principal (álbum o /products/…) aplicada a todos los ids. */
  image_url?: string;
}
