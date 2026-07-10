import { CATEGORY_COMPATIBLE_TONER } from '../../shared/compatible-toner.js';
import { normalizeProductInput } from './inventory-store.js';
import { roundSalePriceToNinety } from './toner-products-excel.js';

/** Equipo MP C407 (seminueva) en inventario. */
export const MPC407_EQUIPMENT_PRODUCT_ID = '92070b52-ac0d-4bc1-94d3-d51e69091bb4';

/** Equipo IM C320F (color A4) en inventario. */
export const IMC320F_EQUIPMENT_PRODUCT_ID = '481dbc77-436b-464d-b76f-930f7d79f4ff';

/** Tóneres CMYK Intercopy compatibles con MP C306/C406/C307/C407. */
export const MPC407_COMPATIBLE_TONER_IDS = [
  'intercopy-mp-c306-cyan',
  'intercopy-mp-c306-magenta',
  'intercopy-mp-c306-yellow',
  'intercopy-mp-c306-negro',
];

/** Tóneres CMYK compatibles con IM C320F (Cyan / Magenta / Amarillo / Negro). */
export const IMC320F_COMPATIBLE_TONER_IDS = [
  'compat-im-c320f-cyan',
  'compat-im-c320f-magenta',
  'compat-im-c320f-yellow',
  'compat-im-c320f-negro',
];

const MPC407_COMPATIBLE_TONER_PRICE_USD = 39.9;
const IMC320F_COMPATIBLE_TONER_PRICE_USD = 39.9;

const MPC407_COMPATIBLE_TONER_META = {
  'intercopy-mp-c306-cyan': {
    color: 'Cyan',
    name: 'Toner cartucho compatible RICOH MP C407 — Cyan',
  },
  'intercopy-mp-c306-magenta': {
    color: 'Magenta',
    name: 'Toner cartucho compatible RICOH MP C407 — Magenta',
  },
  'intercopy-mp-c306-yellow': {
    color: 'Amarillo',
    name: 'Toner cartucho compatible RICOH MP C407 — Amarillo',
  },
  'intercopy-mp-c306-negro': {
    color: 'Negro',
    name: 'Toner cartucho compatible RICOH MP C407 — Negro',
  },
};

const IMC320F_COMPATIBLE_TONER_META = {
  'compat-im-c320f-cyan': {
    color: 'Cyan',
    code: '901050',
    name: 'Toner cartucho compatible RICOH IM C320F — Cyan',
  },
  'compat-im-c320f-magenta': {
    color: 'Magenta',
    code: '901051',
    name: 'Toner cartucho compatible RICOH IM C320F — Magenta',
  },
  'compat-im-c320f-yellow': {
    color: 'Amarillo',
    code: '901052',
    name: 'Toner cartucho compatible RICOH IM C320F — Amarillo',
  },
  'compat-im-c320f-negro': {
    color: 'Negro',
    code: '901053',
    name: 'Toner cartucho compatible RICOH IM C320F — Negro',
  },
};

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
  ...IMC320F_COMPATIBLE_TONER_IDS.map((tonerId) => {
    const meta = IMC320F_COMPATIBLE_TONER_META[tonerId];
    return {
      id: tonerId,
      code: meta.code,
      name: meta.name,
      description: `${meta.name} — Print Cartridge IM C320 (OEM 842726–842729)`,
      category: CATEGORY_COMPATIBLE_TONER,
      brand: '',
      image_url: null,
      gallery: [],
      attributes: [
        { name: 'Modelo de equipo', value: 'IM C320F / IM C320' },
        { name: 'Rendimiento (5%)', value: meta.color === 'Negro' ? '16,000' : '10,000' },
        { name: 'Color', value: meta.color },
      ],
      prices: {
        public: roundSalePriceToNinety(IMC320F_COMPATIBLE_TONER_PRICE_USD),
        tecnico: roundSalePriceToNinety(33.5),
        mayorista: roundSalePriceToNinety(31.9),
        distribuidor: roundSalePriceToNinety(29.5),
      },
      purchase_price_usd: 22.9,
      suppliers: [{ name: 'MICAMERB', purchase_price_usd: 22.9 }],
      equipmentIds: [IMC320F_EQUIPMENT_PRODUCT_ID],
      supplyType: 'compatible',
    };
  }),
];

/** Vincula tóneres ya existentes en inventario con equipos (sin reescribir el producto). */
export const KNOWN_EQUIPMENT_TONER_CROSS_SELL = [
  {
    equipmentId: 'bfb264b8-70dc-4ad4-9686-2df02df8c75e',
    tonerIds: ['408284', 'compat-tc-m-320f-haiprint'],
  },
  {
    equipmentId: MPC407_EQUIPMENT_PRODUCT_ID,
    tonerIds: [
      '842092',
      '842093',
      '842094',
      '842091',
      ...MPC407_COMPATIBLE_TONER_IDS,
    ],
  },
  {
    equipmentId: IMC320F_EQUIPMENT_PRODUCT_ID,
    tonerIds: [
      '842718',
      '842719',
      '842720',
      '842725',
      ...IMC320F_COMPATIBLE_TONER_IDS,
    ],
  },
];

/**
 * Crea o actualiza los 4 tóneres CMYK IM C320F (precios, nombres, color).
 * Nota: OneDrive a veces revierte `server/data/inventory.json` — volver a correr
 * `node scripts/seed-known-equipment-toners.mjs` si desaparecen.
 * @param {Array<Record<string, unknown>>} products
 */
export function ensureImC320FCompatibleTonerProducts(products) {
  const byId = new Map(products.map((product) => [product.id, { ...product }]));
  let created = 0;
  let updated = 0;

  const publicPrice = roundSalePriceToNinety(IMC320F_COMPATIBLE_TONER_PRICE_USD);
  const prices = {
    public: publicPrice,
    tecnico: roundSalePriceToNinety(33.5),
    mayorista: roundSalePriceToNinety(31.9),
    distribuidor: roundSalePriceToNinety(29.5),
  };

  for (const tonerId of IMC320F_COMPATIBLE_TONER_IDS) {
    const meta = IMC320F_COMPATIBLE_TONER_META[tonerId];
    const existing = byId.get(tonerId);
    const attributes = Array.isArray(existing?.attributes)
      ? existing.attributes.map((attr) => ({ ...attr }))
      : [];

    const upsertAttr = (name, value) => {
      const found = attributes.find(
        (attr) => String(attr?.name ?? '').trim().toLowerCase() === name.toLowerCase(),
      );
      if (found) {
        found.value = value;
      } else {
        attributes.push({ id: `${name.toLowerCase()}-${tonerId}`, name, value });
      }
    };

    upsertAttr('Color', meta.color);
    upsertAttr('Modelo de equipo', 'IM C320F / IM C320');
    upsertAttr('Rendimiento (5%)', meta.color === 'Negro' ? '16,000' : '10,000');

    const next = normalizeProductInput(
      {
        ...(existing ?? {}),
        id: tonerId,
        code: meta.code,
        name: meta.name,
        description: `${meta.name} — Print Cartridge IM C320 (OEM 842726–842729)`,
        category: existing?.category || CATEGORY_COMPATIBLE_TONER,
        brand: existing?.brand ?? '',
        image_url: null,
        gallery: [],
        prices,
        purchase_price_usd:
          Number(existing?.purchase_price_usd) > 0 ? existing.purchase_price_usd : 22.9,
        suppliers: existing?.suppliers ?? [{ name: 'MICAMERB', purchase_price_usd: 22.9 }],
        attributes,
      },
      existing,
    );

    byId.set(tonerId, next);
    if (existing) updated += 1;
    else created += 1;
  }

  return {
    products: [...byId.values()],
    created,
    updated,
  };
}

/**
 * Actualiza precios/nombres de los 4 tóneres CMYK MP C407 y quita imágenes demo de pack.
 * @param {Array<Record<string, unknown>>} products
 */
export function ensureMpC407CompatibleTonerProducts(products) {
  const byId = new Map(products.map((product) => [product.id, { ...product }]));
  let updated = 0;

  const publicPrice = roundSalePriceToNinety(MPC407_COMPATIBLE_TONER_PRICE_USD);
  const prices = {
    public: publicPrice,
    tecnico: roundSalePriceToNinety(33.5),
    mayorista: roundSalePriceToNinety(31.9),
    distribuidor: roundSalePriceToNinety(29.5),
  };

  for (const tonerId of MPC407_COMPATIBLE_TONER_IDS) {
    const existing = byId.get(tonerId);
    if (!existing) continue;

    const meta = MPC407_COMPATIBLE_TONER_META[tonerId];
    const attributes = Array.isArray(existing.attributes)
      ? existing.attributes.map((attr) => ({ ...attr }))
      : [];
    const colorAttr = attributes.find(
      (attr) => String(attr?.name ?? '').trim().toLowerCase() === 'color',
    );
    if (colorAttr) {
      colorAttr.value = meta.color;
    } else {
      attributes.push({ id: `color-${tonerId}`, name: 'Color', value: meta.color });
    }

    const next = normalizeProductInput(
      {
        ...existing,
        name: meta.name,
        description: `${meta.name} — MP C306/C406, MP C307/C407`,
        category: existing.category || CATEGORY_COMPATIBLE_TONER,
        // Sin imagen demo de pack/bundle: la UI muestra «Sin imagen» hasta subir foto real.
        image_url: null,
        gallery: [],
        prices,
        purchase_price_usd:
          Number(existing.purchase_price_usd) > 0 ? existing.purchase_price_usd : 22.9,
        attributes,
      },
      existing,
    );

    byId.set(tonerId, next);
    updated += 1;
  }

  // El pack x04 no debe usarse como tarjeta única de cross-sell / demo.
  const pack = byId.get('toner-pack-mp-c306-pack04');
  if (pack) {
    byId.set('toner-pack-mp-c306-pack04', {
      ...pack,
      image_url: null,
      gallery: [],
    });
  }

  return {
    products: [...byId.values()],
    updated,
  };
}

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
