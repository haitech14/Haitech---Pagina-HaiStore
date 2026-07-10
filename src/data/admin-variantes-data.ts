import type {
  AdminCatalogVariant,
  AdminProductOptionsKpi,
  AdminVariantesKpi,
  AdminVariantesStatusDistribution,
  AdminVariantesStockBar,
  AdminVariantesTopCombinations,
  AdminVarianteStatus,
} from '@/types/admin-variantes';
import { VARIANTE_STATUS_LABELS } from '@/lib/admin-variantes-utils';

export const ADMIN_VARIANTES_UPDATED_AT = new Date('2026-07-10T00:00:00.000Z');

const STATUS_COLORS: Record<AdminVarianteStatus, string> = {
  activa: '#22C55E',
  stock_bajo: '#F97316',
  agotada: '#EF4444',
  inactiva: '#94A3B8',
};

export const ADMIN_CATALOG_VARIANTS: AdminCatalogVariant[] = [
  {
    id: 'var-001',
    createdAt: '2026-07-01T09:15:00',
    baseProductId: 'prod-laptop-pro-14',
    baseProductName: 'Laptop Pro 14',
    baseProductImage: '/products/03b408ff-0b06-4ec5-90ed-94dcb40fd67c.webp',
    variantLabel: '16GB / 512GB',
    sku: 'LP14-16-512',
    pricePen: 4899,
    stock: 48,
    stockCapacity: 120,
    warehouse: 'Lima Centro',
    category: 'Laptops',
    updatedAt: '2026-07-07T16:42:00',
    updatedBy: 'María G.',
    status: 'activa',
  },
  {
    id: 'var-002',
    createdAt: '2026-07-01T09:18:00',
    baseProductId: 'prod-laptop-pro-14',
    baseProductName: 'Laptop Pro 14',
    baseProductImage: '/products/03b408ff-0b06-4ec5-90ed-94dcb40fd67c.webp',
    variantLabel: '32GB / 1TB',
    sku: 'LP14-32-1TB',
    pricePen: 5799,
    stock: 22,
    stockCapacity: 80,
    warehouse: 'Lima Centro',
    category: 'Laptops',
    updatedAt: '2026-07-06T11:20:00',
    updatedBy: 'Sistema',
    status: 'activa',
  },
  {
    id: 'var-003',
    createdAt: '2026-06-28T14:05:00',
    baseProductId: 'prod-mouse-inalambrico',
    baseProductName: 'Mouse inalámbrico',
    baseProductImage: '/products/06fdba17-ae3d-4bd0-8206-1de6b868a8b9.webp',
    variantLabel: 'Negro',
    sku: 'MSW-BLK',
    pricePen: 89,
    stock: 340,
    stockCapacity: 500,
    warehouse: 'Lima Sur',
    category: 'Periféricos',
    updatedAt: '2026-07-05T09:10:00',
    updatedBy: 'Carlos R.',
    status: 'activa',
  },
  {
    id: 'var-004',
    createdAt: '2026-06-28T14:08:00',
    baseProductId: 'prod-mouse-inalambrico',
    baseProductName: 'Mouse inalámbrico',
    baseProductImage: '/products/06fdba17-ae3d-4bd0-8206-1de6b868a8b9.webp',
    variantLabel: 'Blanco',
    sku: 'MSW-WHT',
    pricePen: 89,
    stock: 8,
    stockCapacity: 200,
    warehouse: 'Lima Sur',
    category: 'Periféricos',
    updatedAt: '2026-07-04T15:30:00',
    updatedBy: 'María G.',
    status: 'stock_bajo',
  },
  {
    id: 'var-005',
    createdAt: '2026-06-25T10:00:00',
    baseProductId: 'prod-teclado-mecanico',
    baseProductName: 'Teclado Mecánico',
    baseProductImage: '/products/07f8da66-9ecf-427b-b92e-d31edd4989c3.webp',
    variantLabel: 'Switch rojo / ES',
    sku: 'TKM-RED-ES',
    pricePen: 349,
    stock: 0,
    stockCapacity: 150,
    warehouse: 'Arequipa',
    category: 'Periféricos',
    updatedAt: '2026-07-03T08:00:00',
    updatedBy: 'Sistema',
    status: 'agotada',
  },
  {
    id: 'var-006',
    createdAt: '2026-06-25T10:05:00',
    baseProductId: 'prod-teclado-mecanico',
    baseProductName: 'Teclado Mecánico',
    baseProductImage: '/products/07f8da66-9ecf-427b-b92e-d31edd4989c3.webp',
    variantLabel: 'Switch azul / ES',
    sku: 'TKM-BLU-ES',
    pricePen: 349,
    stock: 64,
    stockCapacity: 150,
    warehouse: 'Arequipa',
    category: 'Periféricos',
    updatedAt: '2026-07-07T12:15:00',
    updatedBy: 'Luis P.',
    status: 'activa',
  },
  {
    id: 'var-007',
    createdAt: '2026-06-20T11:30:00',
    baseProductId: 'prod-monitor-27',
    baseProductName: 'Monitor 27" 4K',
    baseProductImage: '/products/0aea108a-acd2-4ddd-af29-b2265097813c.webp',
    variantLabel: 'Sin soporte / HDMI',
    sku: 'MN27-4K-HDMI',
    pricePen: 1299,
    stock: 18,
    stockCapacity: 60,
    warehouse: 'Lima Centro',
    category: 'Monitores',
    updatedAt: '2026-07-06T17:00:00',
    updatedBy: 'María G.',
    status: 'activa',
  },
  {
    id: 'var-008',
    createdAt: '2026-06-20T11:35:00',
    baseProductId: 'prod-monitor-27',
    baseProductName: 'Monitor 27" 4K',
    baseProductImage: '/products/0aea108a-acd2-4ddd-af29-b2265097813c.webp',
    variantLabel: 'Con soporte / USB-C',
    sku: 'MN27-4K-USBC',
    pricePen: 1449,
    stock: 5,
    stockCapacity: 40,
    warehouse: 'Lima Centro',
    category: 'Monitores',
    updatedAt: '2026-07-05T10:45:00',
    updatedBy: 'Carlos R.',
    status: 'stock_bajo',
  },
  {
    id: 'var-009',
    createdAt: '2026-06-15T08:20:00',
    baseProductId: 'prod-toner-hp',
    baseProductName: 'Tóner HP LaserJet',
    baseProductImage: '/products/toner-418480.webp',
    variantLabel: 'CF410A Negro',
    sku: 'TN-HP-410A',
    pricePen: 289,
    stock: 156,
    stockCapacity: 300,
    warehouse: 'Lima Norte',
    category: 'Consumibles',
    updatedAt: '2026-07-08T08:30:00',
    updatedBy: 'Sistema',
    status: 'activa',
  },
  {
    id: 'var-010',
    createdAt: '2026-06-15T08:25:00',
    baseProductId: 'prod-toner-hp',
    baseProductName: 'Tóner HP LaserJet',
    baseProductImage: '/products/toner-418480.webp',
    variantLabel: 'CF411A Cian',
    sku: 'TN-HP-411A',
    pricePen: 319,
    stock: 0,
    stockCapacity: 200,
    warehouse: 'Lima Norte',
    category: 'Consumibles',
    updatedAt: '2026-07-02T14:00:00',
    updatedBy: 'Luis P.',
    status: 'agotada',
  },
  {
    id: 'var-011',
    createdAt: '2026-05-30T16:00:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'WiFi',
    sku: 'IMP-MF-WIFI',
    pricePen: 1899,
    stock: 12,
    stockCapacity: 35,
    warehouse: 'Lima Centro',
    category: 'Impresoras',
    updatedAt: '2026-07-01T11:00:00',
    updatedBy: 'María G.',
    status: 'activa',
  },
  {
    id: 'var-012',
    createdAt: '2026-05-30T16:05:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Ethernet',
    sku: 'IMP-MF-ETH',
    pricePen: 1799,
    stock: 0,
    stockCapacity: 25,
    warehouse: 'Lima Centro',
    category: 'Impresoras',
    updatedAt: '2026-06-28T09:30:00',
    updatedBy: 'Sistema',
    status: 'inactiva',
  },
  {
    id: 'var-013',
    createdAt: '2026-07-09T10:00:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Acondicionada',
    sku: 'IMP-MF-ACOND',
    pricePen: 1699,
    stock: 14,
    stockCapacity: 40,
    warehouse: 'Lima Centro',
    category: 'Impresoras',
    updatedAt: '2026-07-09T14:20:00',
    updatedBy: 'Sistema',
    status: 'activa',
  },
  {
    id: 'var-014',
    createdAt: '2026-07-09T10:05:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Reponteciada',
    sku: 'IMP-MF-REPON',
    pricePen: 1999,
    stock: 9,
    stockCapacity: 30,
    warehouse: 'Lima Centro',
    category: 'Impresoras',
    updatedAt: '2026-07-09T14:25:00',
    updatedBy: 'María G.',
    status: 'activa',
  },
  {
    id: 'var-015',
    createdAt: '2026-07-09T10:10:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Remanufacturada',
    sku: 'IMP-MF-REMAN',
    pricePen: 1499,
    stock: 6,
    stockCapacity: 25,
    warehouse: 'Lima Norte',
    category: 'Impresoras',
    updatedAt: '2026-07-09T14:30:00',
    updatedBy: 'Sistema',
    status: 'stock_bajo',
  },
  {
    id: 'var-016',
    createdAt: '2026-07-09T10:15:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Con Gabinete',
    sku: 'IMP-MF-GAB',
    pricePen: 2199,
    stock: 11,
    stockCapacity: 20,
    warehouse: 'Lima Centro',
    category: 'Impresoras',
    updatedAt: '2026-07-09T14:35:00',
    updatedBy: 'Carlos R.',
    status: 'activa',
  },
  {
    id: 'var-017',
    createdAt: '2026-07-09T10:20:00',
    baseProductId: 'prod-impresora-multifuncional',
    baseProductName: 'Impresora Multifuncional',
    baseProductImage: '/products/12402a94-70d2-4d3b-8953-bf29f119fbf4.webp',
    variantLabel: 'Con Casetera adicional',
    sku: 'IMP-MF-CASET',
    pricePen: 2099,
    stock: 7,
    stockCapacity: 18,
    warehouse: 'Arequipa',
    category: 'Impresoras',
    updatedAt: '2026-07-09T14:40:00',
    updatedBy: 'Luis P.',
    status: 'stock_bajo',
  },
];

function buildVariantesKpis(variants: readonly AdminCatalogVariant[]): AdminVariantesKpi[] {
  const active = variants.filter((variant) => variant.status === 'activa').length;
  const productsWithVariants = new Set(variants.map((variant) => variant.baseProductId)).size;
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const outOfStock = variants.filter((variant) => variant.status === 'agotada').length;

  return [
    {
      title: 'Variantes activas',
      value: String(active),
      icon: 'active',
      trendLabel: 'en catálogo',
      sparkline: [active],
    },
    {
      title: 'Productos con variantes',
      value: String(productsWithVariants),
      icon: 'products',
      trendLabel: 'productos base',
      sparkline: [productsWithVariants],
    },
    {
      title: 'Stock total',
      value: totalStock.toLocaleString('es-PE'),
      icon: 'stock',
      trendLabel: 'unidades en almacén',
      sparkline: [totalStock],
    },
    {
      title: 'Variantes agotadas',
      value: String(outOfStock),
      icon: 'out_of_stock',
      trendLabel: 'sin stock',
      sparkline: [outOfStock],
    },
  ];
}

function buildStatusDistribution(
  variants: readonly AdminCatalogVariant[],
): AdminVariantesStatusDistribution[] {
  const totals = new Map<AdminVarianteStatus, number>();

  for (const variant of variants) {
    totals.set(variant.status, (totals.get(variant.status) ?? 0) + 1);
  }

  const total = variants.length || 1;

  return (['activa', 'stock_bajo', 'agotada', 'inactiva'] as const)
    .filter((status) => (totals.get(status) ?? 0) > 0)
    .map((status) => {
      const count = totals.get(status) ?? 0;
      return {
        status,
        label: VARIANTE_STATUS_LABELS[status],
        count,
        percent: Math.round((count / total) * 100),
        color: STATUS_COLORS[status],
      };
    });
}

function buildStockBars(variants: readonly AdminCatalogVariant[]): AdminVariantesStockBar[] {
  return [...variants]
    .sort((a, b) => b.stock / Math.max(b.stockCapacity, 1) - a.stock / Math.max(a.stockCapacity, 1))
    .slice(0, 5)
    .map((variant) => ({
      variantId: variant.id,
      label: `${variant.baseProductName} · ${variant.variantLabel}`,
      stock: variant.stock,
      capacity: variant.stockCapacity,
      percent: Math.round((variant.stock / Math.max(variant.stockCapacity, 1)) * 100),
    }));
}

function buildTopCombinations(
  variants: readonly AdminCatalogVariant[],
): AdminVariantesTopCombinations[] {
  const counts = new Map<string, number>();

  for (const variant of variants) {
    counts.set(variant.baseProductName, (counts.get(variant.baseProductName) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
    .slice(0, 5)
    .map(([productName, variantCount], index) => ({
      rank: index + 1,
      productName,
      variantCount,
    }));
}

export const ADMIN_VARIANTES_KPIS = buildVariantesKpis(ADMIN_CATALOG_VARIANTS);

export const ADMIN_PRODUCT_OPTIONS_KPIS: AdminProductOptionsKpi[] = [
  {
    title: 'Opciones configuradas',
    value: '—',
    icon: 'total',
    trendLabel: 'desde inventario',
    sparkline: [12, 18, 22, 28, 32, 38, 42, 48],
  },
  {
    title: 'Cross-sell',
    value: '—',
    icon: 'cross_sell',
    trendLabel: 'productos vinculados',
    sparkline: [4, 6, 8, 10, 12, 14, 16, 18],
  },
  {
    title: 'Upsell',
    value: '—',
    icon: 'upsell',
    trendLabel: 'en configurador',
    sparkline: [3, 5, 7, 9, 11, 13, 15, 17],
  },
  {
    title: 'Sin inventario',
    value: '—',
    icon: 'optional',
    trendLabel: 'opcionales manuales',
    sparkline: [1, 2, 2, 3, 4, 4, 5, 6],
  },
];

export const ADMIN_VARIANTES_STATUS_DISTRIBUTION = buildStatusDistribution(ADMIN_CATALOG_VARIANTS);
export const ADMIN_VARIANTES_STOCK_BARS = buildStockBars(ADMIN_CATALOG_VARIANTS);
export const ADMIN_VARIANTES_TOP_COMBINATIONS = buildTopCombinations(ADMIN_CATALOG_VARIANTS);
