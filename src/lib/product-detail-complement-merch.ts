import {
  ESTABILIZADOR_2KVA_PRODUCT_ID,
  ROUTER_WIFI_PRODUCT_ID,
} from '@/lib/equipment-config-catalog';
import type { EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

export interface ComplementMerchSpec {
  id: string;
  name: string;
  productId?: string;
  priceUsd?: number;
  fallbackImage: string;
  matchName?: RegExp;
}

export const COMPLEMENT_MERCH_SPECS: ComplementMerchSpec[] = [
  {
    id: 'estabilizador-solido-2000w',
    name: 'Estabilizador Sólido 2000 watts',
    productId: ESTABILIZADOR_2KVA_PRODUCT_ID,
    priceUsd: 150,
    fallbackImage: '/categories/accesorios-impresoras.png',
    matchName: /estabilizador.*2000|s[oó]lido\s*2000/i,
  },
  {
    id: 'router-wifi',
    name: 'Router Wifi',
    productId: ROUTER_WIFI_PRODUCT_ID,
    fallbackImage: '/categories/soluciones-negocio.png',
    matchName: /router\s*wi-?fi/i,
  },
  {
    id: 'guillotina-a3',
    name: 'Guillotina A3',
    productId: '4b-gu-gta3-negro',
    fallbackImage: '/products/4b-gu-gta3-negro.webp',
    matchName: /guillotina[\s\S]*\bA3\b/i,
  },
  {
    id: 'guillotina-b4',
    name: 'Guillotina B4',
    fallbackImage: '/products/4b-gu-gta4-negro.webp',
    matchName: /guillotina[\s\S]*\bB4\b/i,
  },
  {
    id: 'enmicadora-a4',
    name: 'Enmicadora A4',
    fallbackImage: '/products/4b-office-emameta3led.webp',
    matchName: /enmicadora[\s\S]*\bA4\b/i,
  },
  {
    id: 'enmicadora-a3',
    name: 'Enmicadora A3',
    productId: '4b-em-emameta3led',
    fallbackImage: '/products/4b-office-emameta3led.webp',
    matchName: /enmicadora[\s\S]*\bA3\b/i,
  },
  {
    id: 'espiraladora',
    name: 'Espiraladora',
    productId: '4b-esp-esp12hj',
    fallbackImage: '/products/4b-office-esp12hj.webp',
    matchName: /espiraladora/i,
  },
];

export const COMPLEMENT_MERCH_CATALOG_IDS = [
  ...new Set(
    COMPLEMENT_MERCH_SPECS.map((spec) => spec.productId).filter(
      (id): id is string => Boolean(id),
    ),
  ),
];

function optionImage(
  steps: readonly EquipmentConfigStep[] | undefined,
  optionId: string,
): string | null {
  if (!steps) return null;
  for (const step of steps) {
    const option = step.options.find((entry) => entry.id === optionId);
    const image = option?.image?.trim();
    if (image) return image;
  }
  return null;
}

function findCatalogProduct(spec: ComplementMerchSpec, catalogById: Map<string, Product>): Product | undefined {
  if (spec.productId) {
    const byId = catalogById.get(spec.productId);
    if (byId) return byId;
  }
  if (!spec.matchName) return undefined;
  for (const row of catalogById.values()) {
    if (spec.matchName.test(row.name)) return row;
  }
  return undefined;
}

function syntheticComplementProduct(spec: ComplementMerchSpec, image: string | null): Product {
  return {
    id: `complement-merch-${spec.id}`,
    name: spec.name,
    description: spec.name,
    price: spec.priceUsd ?? 0,
    currency: 'USD',
    image_url: image,
    stock: 0,
    category: 'Equipos de Oficina',
    created_at: new Date().toISOString(),
  };
}

export function resolveComplementMerchProducts(
  catalog: readonly Product[],
  steps?: readonly EquipmentConfigStep[],
): Product[] {
  const catalogById = new Map(catalog.map((row) => [row.id, row]));
  const stabilizerImage = optionImage(steps, 'estabilizador-2000w');
  const routerImage = optionImage(steps, 'router-wifi');

  return COMPLEMENT_MERCH_SPECS.map((spec) => {
    const real = findCatalogProduct(spec, catalogById);
    const fallbackImage =
      (spec.id === 'estabilizador-solido-2000w' ? stabilizerImage : null) ||
      (spec.id === 'router-wifi' ? routerImage : null) ||
      spec.fallbackImage;

    if (!real) {
      return syntheticComplementProduct(spec, fallbackImage);
    }

    const price =
      spec.priceUsd != null && spec.priceUsd > 0
        ? spec.priceUsd
        : real.price;

    return {
      ...real,
      name: spec.name,
      price,
      image_url: real.image_url?.trim() || fallbackImage,
    };
  });
}
