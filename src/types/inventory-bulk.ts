export type InventoryBulkStockMode = 'set' | 'add';

export type InventoryBulkCategoryMode = 'set' | 'add' | 'remove';

export type InventoryBulkNameMode = 'append' | 'prepend' | 'remove' | 'replace';

export type InventoryBulkAttributeMode = 'add' | 'set' | 'remove';

export interface InventoryBulkPatch {
  /** Reemplazo simple (compatibilidad). Preferir categoryMode + categories. */
  category?: string;
  categoryMode?: InventoryBulkCategoryMode;
  categories?: string[];

  nameMode?: InventoryBulkNameMode;
  nameText?: string;
  nameReplaceWith?: string;

  attributeMode?: InventoryBulkAttributeMode;
  attribute?: { name: string; value: string };
  attributeName?: string;

  stockMode?: InventoryBulkStockMode;
  stock?: number;
  /** Porcentaje aplicado a todos los precios por rol (ej. 10 = +10 %). */
  pricePercent?: number;
  /** Porcentaje sobre precio de compra. */
  purchasePricePercent?: number;
}
