import { ESTABILIZADOR_2KVA_PRODUCT_ID } from '@/lib/equipment-config-catalog';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { toPublicProduct } from '@/lib/pricing';
import type { Product } from '@/types/product';

export const CHECKOUT_ADDON_KINDS = ['estabilizador', 'garantia-extendida'] as const;

export type CheckoutMultifuncionalAddonKind = (typeof CHECKOUT_ADDON_KINDS)[number];

export const CHECKOUT_ADDON_LABELS: Record<CheckoutMultifuncionalAddonKind, string> = {
  estabilizador: 'Estabilizador sólido',
  'garantia-extendida': 'Garantía extendida',
};

const CATALOG_PRODUCT_IDS: Record<CheckoutMultifuncionalAddonKind, string> = {
  estabilizador: ESTABILIZADOR_2KVA_PRODUCT_ID,
  'garantia-extendida': 'combo-garantia-extendida-im430f',
};

const FALLBACK_ADDON_PRODUCTS: Record<CheckoutMultifuncionalAddonKind, Product> = {
  estabilizador: {
    id: 'checkout-addon-estabilizador-solido',
    slug: 'estabilizador-solido',
    name: 'Estabilizador sólido 2 KVA',
    description: 'Protección eléctrica para multifuncional Ricoh.',
    price: 446.82,
    currency: 'USD',
    image_url: '/categories/accesorios-impresoras.png',
    gallery: [],
    stock: 999,
    category: 'Accesorios',
    brand: 'RICOH',
    created_at: '1970-01-01T00:00:00.000Z',
    code: 'ESTAB-2KVA',
  },
  'garantia-extendida': {
    id: 'checkout-addon-garantia-extendida',
    slug: 'garantia-extendida-2y',
    name: 'Garantía extendida 2 años',
    description: 'Cobertura adicional 2 años y/o 100,000 páginas.',
    price: 200,
    currency: 'USD',
    image_url: '/products/combo-garantia-extendida.webp',
    gallery: [],
    stock: 999,
    category: 'Servicios',
    brand: 'RICOH',
    created_at: '1970-01-01T00:00:00.000Z',
    code: 'GAR-EXT-2Y',
  },
};

export function buildCheckoutAddonLineId(
  parentLineId: string,
  kind: CheckoutMultifuncionalAddonKind,
): string {
  return `${parentLineId}::checkout-addon::${kind}`;
}

export function parseCheckoutAddonLineId(
  lineId: string,
): { parentLineId: string; kind: CheckoutMultifuncionalAddonKind } | null {
  const match = lineId.match(/^(.*)::checkout-addon::(estabilizador|garantia-extendida)$/);
  if (!match) return null;
  return {
    parentLineId: match[1],
    kind: match[2] as CheckoutMultifuncionalAddonKind,
  };
}

function resolveCatalogAddonProduct(catalogId: string, fallback: Product): Product {
  const row = getCatalogProductById(catalogId);
  if (!row) return fallback;
  return toPublicProduct(normalizeInventoryProduct(row), 'public');
}

export function resolveCheckoutMultifuncionalAddonProduct(
  kind: CheckoutMultifuncionalAddonKind,
): Product {
  const catalogId = CATALOG_PRODUCT_IDS[kind];
  const fallback = FALLBACK_ADDON_PRODUCTS[kind];
  if (catalogId === fallback.id || catalogId.startsWith('checkout-addon-')) {
    return fallback;
  }
  return resolveCatalogAddonProduct(catalogId, fallback);
}

export function findCheckoutAddonLineIds(
  parentLineId: string,
  cartLineIds: Iterable<string>,
): string[] {
  const suffix = `::checkout-addon::`;
  const prefix = `${parentLineId}${suffix}`;
  return [...cartLineIds].filter((lineId) => lineId.startsWith(prefix));
}
