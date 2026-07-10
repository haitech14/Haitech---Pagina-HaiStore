import { CATEGORY_COMPATIBLE_TONER } from '../../shared/compatible-toner.js';
import { normalizeProductInput } from './inventory-store.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

/** Tóneres vinculados a equipos Ricoh A4 (IDs usados en equipment-config-catalog). */
export const KNOWN_EQUIPMENT_TONER_SEEDS = [
  {
    id: '419078',
    code: '419078',
    name: 'Toner Cartucho Original RICOH IM 430F (Rend 14,500)',
    description:
      'Cartucho original negro — Rend 14,500 páginas al 5% — IM-430F / P-502 / IM-430F TL',
    category: 'Toner Original',
    brand: 'Ricoh',
    image_url: '/products/toner-419078.webp',
    gallery: ['/products/toner-419078.webp'],
    attributes: [
      { name: 'Modelo de equipo', value: 'IM-430F / P-502' },
      { name: 'Rendimiento (5%)', value: '14,500' },
      { name: 'Color', value: 'Negro' },
    ],
    prices: {
      public: roundSalePriceToNinety(82.5),
      tecnico: roundSalePriceToNinety(69.5),
      mayorista: roundSalePriceToNinety(66.5),
      distribuidor: roundSalePriceToNinety(61.5),
    },
    purchase_price_usd: 52.9,
    suppliers: [{ name: 'Proveedor Ricoh del Peru', purchase_price_usd: 52.9 }],
    equipmentIds: ['ricoh-im-430f', '189620fe-a5e5-4526-a399-8aa6a308bd1d'],
  },
  {
    id: '418480',
    code: '418480',
    name: 'Toner Cartucho Original RICOH IM 550F / IM 600F (Rend 40,000)',
    description:
      'Cartucho original negro alto rendimiento — Rend 40,000 páginas al 5% — IM-550F / IM-600F / P-800 / P-801',
    category: 'Toner Original',
    brand: 'Ricoh',
    image_url: '/products/toner-418480.webp',
    gallery: [
      '/products/toner-418480.webp',
      '/products/toner-418480-2.webp',
      '/products/toner-418480-3.webp',
    ],
    attributes: [
      { name: 'Modelo de equipo', value: 'IM-550F / IM-600F / P-800 / P-801' },
      { name: 'Rendimiento (5%)', value: '40,000' },
      { name: 'Color', value: 'Negro' },
    ],
    prices: {
      public: roundSalePriceToNinety(132.5),
      tecnico: roundSalePriceToNinety(112.5),
      mayorista: roundSalePriceToNinety(107.5),
      distribuidor: roundSalePriceToNinety(99.5),
    },
    purchase_price_usd: 84.9,
    suppliers: [{ name: 'Proveedor Ricoh del Peru', purchase_price_usd: 84.9 }],
    equipmentIds: ['328f41ef-d935-4807-85d0-e1db5bdf73fb', '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2'],
  },
  {
    id: 'compat-tc-im-550-intercopy',
    code: 'TC-IM-550-INTERCOPY',
    name: 'Tóner compatible RICOH IM 550 / IM 600',
    description: 'Tóner compatible negro — Rendimiento según modelo — IM-550F / IM-600F',
    category: CATEGORY_COMPATIBLE_TONER,
    brand: '',
    image_url: '/categories/toner-suministros.png',
    gallery: ['/categories/toner-suministros.png'],
    attributes: [
      { name: 'Modelo de equipo', value: 'IM-550F / IM-600F' },
      { name: 'Color', value: 'Negro' },
    ],
    prices: {
      public: roundSalePriceToNinety(39.5),
      tecnico: roundSalePriceToNinety(33.5),
      mayorista: roundSalePriceToNinety(31.9),
      distribuidor: roundSalePriceToNinety(29.5),
    },
    purchase_price_usd: 22.9,
    suppliers: [{ name: 'MICAMERB', purchase_price_usd: 22.9 }],
    equipmentIds: ['328f41ef-d935-4807-85d0-e1db5bdf73fb', '2fcc5ac8-cdb3-47f4-b5eb-51b4c98fe9d2'],
    supplyType: 'compatible',
  },
  {
    id: 'compat-tc-m-320f-haiprint',
    code: '901033',
    name: 'Toner cartucho compatible RICOH M 320F / SP 3710 / P-311',
    description: 'Tóner compatible negro — Rendimiento según modelo — M-320F / SP-3710 / P-311',
    category: CATEGORY_COMPATIBLE_TONER,
    brand: '',
    image_url: '/categories/toner-suministros.png',
    gallery: ['/categories/toner-suministros.png'],
    attributes: [
      { name: 'Modelo de equipo', value: 'M-320F / SP-3710 / P-311' },
      { name: 'Color', value: 'Negro' },
    ],
    prices: {
      public: roundSalePriceToNinety(39.5),
      tecnico: roundSalePriceToNinety(33.5),
      mayorista: roundSalePriceToNinety(31.9),
      distribuidor: roundSalePriceToNinety(29.5),
    },
    purchase_price_usd: 22.9,
    suppliers: [{ name: 'MICAMERB', purchase_price_usd: 22.9 }],
    equipmentIds: ['bfb264b8-70dc-4ad4-9686-2df02df8c75e'],
    supplyType: 'compatible',
  },
];

/** Vincula tóneres ya existentes en inventario con equipos (sin reescribir el producto). */
export const KNOWN_EQUIPMENT_TONER_CROSS_SELL = [
  {
    equipmentId: 'bfb264b8-70dc-4ad4-9686-2df02df8c75e',
    tonerIds: ['408284', 'compat-tc-m-320f-haiprint'],
  },
];

/**
 * @param {typeof KNOWN_EQUIPMENT_TONER_SEEDS[number]} seed
 * @param {Record<string, unknown> | undefined} existing
 */
function seedToProduct(seed, existing) {
  const { equipmentIds: _equipmentIds, supplyType: _supplyType, ...productFields } = seed;
  return normalizeProductInput(
    {
      ...productFields,
      currency: 'USD',
      stock: existing?.stock ?? 0,
      stock_by_warehouse: existing?.stock_by_warehouse,
      created_at: existing?.created_at ?? new Date().toISOString(),
      sort_order: existing?.sort_order,
      view_count: existing?.view_count,
      cross_sell_product_ids: existing?.cross_sell_product_ids ?? [],
      upsell_product_ids: existing?.upsell_product_ids ?? [],
    },
    existing,
  );
}

/**
 * Fusiona tóneres de equipo conocidos en el inventario (crea o actualiza por id).
 * @param {Array<Record<string, unknown>>} products
 */
export function mergeKnownEquipmentTonerProducts(products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  let created = 0;
  let updated = 0;

  for (const seed of KNOWN_EQUIPMENT_TONER_SEEDS) {
    const existing = byId.get(seed.id);
    const merged = seedToProduct(seed, existing);
    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
    byId.set(seed.id, merged);
  }

  return {
    products: [...byId.values()],
    created,
    updated,
  };
}

/**
 * Añade tóneres conocidos a cross_sell_product_ids de equipos vinculados.
 * @param {Array<Record<string, unknown>>} products
 */
export function wireEquipmentTonerCrossSell(products) {
  const byId = new Map(products.map((product) => [product.id, { ...product }]));
  let wired = 0;

  for (const seed of KNOWN_EQUIPMENT_TONER_SEEDS) {
    for (const equipmentId of seed.equipmentIds ?? []) {
      const equipment = byId.get(equipmentId);
      if (!equipment) continue;

      const current = Array.isArray(equipment.cross_sell_product_ids)
        ? [...equipment.cross_sell_product_ids]
        : [];

      if (!current.includes(seed.id)) {
        current.unshift(seed.id);
        equipment.cross_sell_product_ids = current;
        wired += 1;
      }

      byId.set(equipmentId, equipment);
    }
  }

  for (const link of KNOWN_EQUIPMENT_TONER_CROSS_SELL) {
    const equipment = byId.get(link.equipmentId);
    if (!equipment) continue;

    const current = Array.isArray(equipment.cross_sell_product_ids)
      ? [...equipment.cross_sell_product_ids]
      : [];

    let changed = false;
    for (const tonerId of link.tonerIds ?? []) {
      if (!tonerId || current.includes(tonerId)) continue;
      current.unshift(tonerId);
      changed = true;
    }

    if (changed) {
      equipment.cross_sell_product_ids = current;
      wired += 1;
      byId.set(link.equipmentId, equipment);
    }
  }

  return {
    products: [...byId.values()],
    wired,
  };
}
