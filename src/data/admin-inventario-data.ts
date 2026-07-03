import type {
  AdminInventarioCategoryDistribution,
  AdminInventarioKpi,
  AdminInventarioRecord,
  AdminInventarioStockAlert,
  AdminInventarioStockStatus,
  AdminInventarioTopMovedProduct,
} from '@/types/admin-inventario';

export const ADMIN_INVENTARIO_TOTAL = 1248;

export const ADMIN_INVENTARIO_UPDATED_AT = new Date(2026, 4, 30, 11, 30);

export const ADMIN_INVENTARIO_KPIS: AdminInventarioKpi[] = [
  {
    title: 'Productos activos',
    value: '1,248',
    trend: 8.2,
    trendLabel: 'vs. mes anterior',
    icon: 'products',
    sparkline: [1080, 1105, 1120, 1150, 1175, 1190, 1210, 1248],
  },
  {
    title: 'Stock bajo',
    value: '37',
    trend: 12.5,
    trendLabel: 'vs. mes anterior',
    icon: 'low-stock',
    sparkline: [28, 30, 31, 33, 34, 35, 36, 37],
  },
  {
    title: 'Entradas del mes',
    value: '352',
    trend: 14.3,
    trendLabel: 'vs. mes anterior',
    icon: 'inbound',
    sparkline: [280, 295, 305, 318, 325, 335, 345, 352],
  },
  {
    title: 'Salidas del mes',
    value: '298',
    trend: 9.1,
    trendLabel: 'vs. mes anterior',
    icon: 'outbound',
    sparkline: [250, 258, 265, 272, 280, 286, 292, 298],
  },
];

export const ADMIN_INVENTARIO_CATEGORY_DISTRIBUTION: AdminInventarioCategoryDistribution[] = [
  { category: 'Laptops', count: 357, percent: 28.6, color: '#3B82F6' },
  { category: 'Accesorios', count: 306, percent: 24.5, color: '#8B5CF6' },
  { category: 'Impresoras', count: 271, percent: 21.7, color: '#22C55E' },
  { category: 'Monitores', count: 212, percent: 17.0, color: '#F59E0B' },
  { category: 'Otros', count: 102, percent: 8.2, color: '#94A3B8' },
];

export const ADMIN_INVENTARIO_STOCK_ALERTS: AdminInventarioStockAlert[] = [
  {
    key: 'critical',
    label: 'Stock crítico (≤ 5 unidades)',
    count: 12,
    tone: 'red',
  },
  {
    key: 'low',
    label: 'Stock bajo (≤ stock mínimo)',
    count: 25,
    tone: 'orange',
  },
  {
    key: 'depleting',
    label: 'Próximos a agotar (≤ 2 días)',
    count: 8,
    tone: 'amber',
  },
];

export const ADMIN_INVENTARIO_TOP_MOVED: AdminInventarioTopMovedProduct[] = [
  { rank: 1, name: 'Tóner Ricoh MP 3554', movements: 126, imageColor: '#0f766e' },
  { rank: 2, name: 'Mouse Logitech MX Master 3S', movements: 98, imageColor: '#1d4ed8' },
  { rank: 3, name: 'Laptop HP ProBook 450 G10', movements: 87, imageColor: '#7c3aed' },
  { rank: 4, name: 'Cable HDMI 2.1 2m', movements: 76, imageColor: '#b45309' },
  { rank: 5, name: 'Impresora Ricoh IM 460F', movements: 64, imageColor: '#be123c' },
];

const SEED_RECORDS: Omit<AdminInventarioRecord, 'id' | 'lastMovementAt'>[] = [
  {
    name: 'Laptop HP ProBook 450 G10',
    subtitle: 'Intel Core i7 · 16GB RAM',
    sku: 'LP-HP-450G10',
    barcode: '7501234567890',
    category: 'Laptops',
    stock: 34,
    minStock: 10,
    location: 'Almacén Central',
    status: 'en_stock',
    lastMovementType: 'entrada',
    imageColor: '#2563eb',
  },
  {
    name: 'Mouse Logitech MX Master 3S',
    subtitle: 'Inalámbrico · Grafito',
    sku: 'MS-LG-MX3S',
    barcode: '7501234567891',
    category: 'Accesorios',
    stock: 6,
    minStock: 15,
    location: 'Almacén Central',
    status: 'stock_bajo',
    lastMovementType: 'salida',
    imageColor: '#4f46e5',
  },
  {
    name: 'Impresora Ricoh IM 460F',
    subtitle: 'Multifuncional A4 · 60 ppm',
    sku: 'IM-RICOH-460F',
    barcode: '7501234567892',
    category: 'Impresoras',
    stock: 3,
    minStock: 5,
    location: 'Sucursal Norte',
    status: 'stock_critico',
    lastMovementType: 'salida',
    imageColor: '#dc2626',
  },
  {
    name: 'Monitor Dell UltraSharp 27"',
    subtitle: '4K UHD · USB-C',
    sku: 'MN-DL-U2723QE',
    barcode: '7501234567893',
    category: 'Monitores',
    stock: 18,
    minStock: 8,
    location: 'Almacén Central',
    status: 'en_stock',
    lastMovementType: 'entrada',
    imageColor: '#0891b2',
  },
  {
    name: 'Teclado mecánico Keychron K2',
    subtitle: 'Switch Brown · RGB',
    sku: 'KB-KC-K2',
    barcode: '7501234567894',
    category: 'Accesorios',
    stock: 0,
    minStock: 12,
    location: 'Sucursal Sur',
    status: 'stock_critico',
    lastMovementType: 'salida',
    imageColor: '#ca8a04',
  },
  {
    name: 'Tóner Ricoh MP 3554',
    subtitle: 'Original · Negro',
    sku: 'TN-RICOH-3554',
    barcode: '7501234567895',
    category: 'Impresoras',
    stock: 42,
    minStock: 20,
    location: 'Almacén Central',
    status: 'en_stock',
    lastMovementType: 'entrada',
    imageColor: '#059669',
  },
];

const CATEGORIES = ['Laptops', 'Accesorios', 'Impresoras', 'Monitores', 'Otros'] as const;
const LOCATIONS = ['Almacén Central', 'Sucursal Norte', 'Sucursal Sur'] as const;
const IMAGE_COLORS = ['#2563eb', '#4f46e5', '#0891b2', '#059669', '#ca8a04', '#be123c', '#7c3aed'];

function resolveStatus(stock: number, minStock: number): AdminInventarioStockStatus {
  if (stock <= 5) return 'stock_critico';
  if (stock <= minStock) return 'stock_bajo';
  return 'en_stock';
}

function buildRecord(index: number): AdminInventarioRecord {
  if (index < SEED_RECORDS.length) {
    const seed = SEED_RECORDS[index];
    const day = 30 - index;
    const hour = 16 - index;
    const minute = 45 - index * 5;
    return {
      id: `PRD-${10001 + index}`,
      lastMovementAt: new Date(2026, 4, Math.max(day, 1), Math.max(hour, 8), Math.max(minute, 5)),
      ...seed,
    };
  }

  const category = CATEGORIES[index % CATEGORIES.length];
  const stock = (index * 7) % 48;
  const minStock = 8 + (index % 12);
  const status = resolveStatus(stock, minStock);

  return {
    id: `PRD-${10001 + index}`,
    name: `Producto demo ${index + 1}`,
    subtitle: category,
    sku: `SKU-${String(1000 + index).padStart(5, '0')}`,
    barcode: `75012345${String(67890 + index).slice(-5)}`,
    category,
    stock,
    minStock,
    location: LOCATIONS[index % LOCATIONS.length],
    status,
    lastMovementAt: new Date(2026, 4, 1 + (index % 28), 9 + (index % 8), (index * 11) % 60),
    lastMovementType: index % 2 === 0 ? 'entrada' : 'salida',
    imageColor: IMAGE_COLORS[index % IMAGE_COLORS.length],
  };
}

export const ADMIN_INVENTARIO_RECORDS: AdminInventarioRecord[] = Array.from(
  { length: ADMIN_INVENTARIO_TOTAL },
  (_, index) => buildRecord(index),
);
