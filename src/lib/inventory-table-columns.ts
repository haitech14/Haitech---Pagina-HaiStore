import { PRICE_ROLE_LABELS, PRICE_ROLES_EDIT_ORDER, type PriceRole } from '@/types/product';

export type InventoryColumnId =
  | 'media'
  | 'code'
  | 'product'
  | 'brand'
  | 'gramaje'
  | 'description'
  | 'installation'
  | 'attributes'
  | 'category'
  | 'stock'
  | 'purchase'
  | `price_${PriceRole}`
  | 'actions';

export type InventoryReorderableColumnId = Exclude<InventoryColumnId, 'actions'>;

const PRICE_COLUMN_IDS = PRICE_ROLES_EDIT_ORDER.map((role) => `price_${role}` as const);

/** Columnas de precio en orden: compra → mayorista → técnico → distribuidor → público. */
export const INVENTORY_PRICE_COLUMN_ORDER: readonly InventoryReorderableColumnId[] = [
  'purchase',
  ...PRICE_COLUMN_IDS,
];

export const DEFAULT_INVENTORY_COLUMN_ORDER: InventoryReorderableColumnId[] = [
  'code',
  'category',
  'product',
  'brand',
  'gramaje',
  'description',
  'installation',
  'media',
  'stock',
  'attributes',
  ...INVENTORY_PRICE_COLUMN_ORDER,
];

const STORAGE_KEY = 'haistore-inventory-column-order-v8';
const LEGACY_STORAGE_KEY = 'haistore-inventory-column-order-v7';

const COLUMN_LABELS: Record<InventoryReorderableColumnId, string> = {
  media: 'Imágenes',
  code: 'Código',
  product: 'Título',
  brand: 'Marca',
  gramaje: 'Gramaje',
  description: 'Descripción',
  installation: 'Instalación',
  attributes: 'Atributos',
  category: 'Categoría',
  stock: 'Stock',
  purchase: 'Compra',
  ...Object.fromEntries(
    PRICE_ROLES_EDIT_ORDER.map((role) => [`price_${role}`, PRICE_ROLE_LABELS[role]] as const),
  ) as Record<`price_${PriceRole}`, string>,
};

export function getInventoryColumnLabel(columnId: InventoryColumnId): string {
  if (columnId === 'actions') return 'Acciones';
  return COLUMN_LABELS[columnId];
}

export function isInventoryPriceColumn(
  columnId: InventoryReorderableColumnId,
): columnId is 'purchase' | `price_${PriceRole}` {
  return columnId === 'purchase' || columnId.startsWith('price_');
}

const COLUMN_CELL_CLASS: Record<InventoryReorderableColumnId, string> = {
  media: 'w-[5.5rem] min-w-[5.5rem] max-w-[5.5rem]',
  code: 'w-[5rem] min-w-[5rem] max-w-[5.5rem]',
  product: 'min-w-[12rem] max-w-[16rem] w-[16rem]',
  brand: 'w-[6rem] min-w-[6rem] max-w-[8rem]',
  gramaje: 'w-[5.5rem] min-w-[5.5rem] max-w-[7rem]',
  description: 'min-w-[14rem] max-w-[20rem] w-[18rem]',
  installation: 'min-w-[14rem] max-w-[22rem] w-[20rem]',
  attributes: 'w-[9.5rem] min-w-[9.5rem] max-w-[11rem]',
  category: 'w-[8rem] min-w-[8rem] max-w-[9.5rem]',
  stock: 'w-[4.5rem] min-w-[4.5rem] text-center',
  purchase: 'w-[6.5rem] min-w-[6.5rem] text-right',
  price_mayorista: 'w-[6.5rem] min-w-[6.5rem] text-right',
  price_tecnico: 'w-[6.5rem] min-w-[6.5rem] text-right',
  price_distribuidor: 'w-[6.5rem] min-w-[6.5rem] text-right',
  price_public: 'w-[6.5rem] min-w-[6.5rem] text-right',
};

/** Clases de ancho y alineación para `<th>` y `<td>` del inventario. */
export function getInventoryColumnCellClass(columnId: InventoryReorderableColumnId): string {
  return COLUMN_CELL_CLASS[columnId] ?? '';
}

export const INVENTORY_ACTIONS_COLUMN_CLASS =
  'sticky right-0 z-10 w-[7.5rem] min-w-[7.5rem] bg-background shadow-[-6px_0_10px_-6px_hsl(var(--border))]';

function isValidColumnId(value: string): value is InventoryReorderableColumnId {
  return (DEFAULT_INVENTORY_COLUMN_ORDER as string[]).includes(value);
}

/** Convierte ids de columnas antiguas (foto/galería, subcategoría) al esquema fusionado. */
function migrateLegacyColumnId(value: string): InventoryReorderableColumnId | null {
  if (value === 'photo' || value === 'gallery') return 'media';
  if (value === 'subcategory') return null;
  return isValidColumnId(value) ? value : null;
}

function dedupeColumnOrder(
  ids: InventoryReorderableColumnId[],
): InventoryReorderableColumnId[] {
  const seen = new Set<InventoryReorderableColumnId>();
  return ids.filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** Reordena columnas guardadas para respetar el orden de precios actual. */
function normalizeColumnOrder(
  saved: InventoryReorderableColumnId[],
): InventoryReorderableColumnId[] {
  const nonPrice = saved.filter((id) => !isInventoryPriceColumn(id));
  const pricePresent = INVENTORY_PRICE_COLUMN_ORDER.filter((id) => saved.includes(id));
  const missingPrice = INVENTORY_PRICE_COLUMN_ORDER.filter((id) => !pricePresent.includes(id));
  const missingNonPrice = DEFAULT_INVENTORY_COLUMN_ORDER.filter(
    (id) => !isInventoryPriceColumn(id) && !nonPrice.includes(id),
  );

  return [...nonPrice, ...missingNonPrice, ...pricePresent, ...missingPrice];
}

function parseStoredColumnOrder(raw: string | null): InventoryReorderableColumnId[] | null {
  if (!raw) return null;

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return null;

  const saved = dedupeColumnOrder(
    parsed
      .filter((id): id is string => typeof id === 'string')
      .map((id) => migrateLegacyColumnId(id))
      .filter((id): id is InventoryReorderableColumnId => id != null),
  );

  if (saved.length === 0) return null;

  return normalizeColumnOrder(saved);
}

export function loadInventoryColumnOrder(): InventoryReorderableColumnId[] {
  if (typeof window === 'undefined') return [...DEFAULT_INVENTORY_COLUMN_ORDER];

  try {
    const fromCurrent = parseStoredColumnOrder(window.localStorage.getItem(STORAGE_KEY));
    if (fromCurrent) return fromCurrent;

    const fromLegacy = parseStoredColumnOrder(window.localStorage.getItem(LEGACY_STORAGE_KEY));
    if (fromLegacy) return fromLegacy;

    return [...DEFAULT_INVENTORY_COLUMN_ORDER];
  } catch {
    return [...DEFAULT_INVENTORY_COLUMN_ORDER];
  }
}

export function saveInventoryColumnOrder(order: InventoryReorderableColumnId[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function reorderInventoryColumns(
  order: InventoryReorderableColumnId[],
  draggedId: InventoryReorderableColumnId,
  targetId: InventoryReorderableColumnId,
): InventoryReorderableColumnId[] {
  const fromIndex = order.indexOf(draggedId);
  const toIndex = order.indexOf(targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return order;

  const next = [...order];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}
