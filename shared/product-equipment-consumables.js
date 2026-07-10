/** Consumibles compatibles con equipos (paridad con src/lib/product-equipment-consumables.ts). */

const CATEGORY_RULES = [
  {
    id: 'toner',
    label: 'Toner',
    keywords: ['toner', 'tóner', 'cartucho', 'cartridge', 'botella toner', 'waste toner', 'residual'],
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    keywords: ['accesorio'],
  },
  {
    id: 'imaging-unit',
    label: 'Unidad de Imagen',
    keywords: [
      'unidad de imagen',
      'imaging unit',
      'image unit',
      'tambor',
      'drum unit',
      'photoconductor',
      'pcu',
    ],
  },
  {
    id: 'fuser-unit',
    label: 'Unidad Fusora',
    keywords: ['unidad fusora', 'fusor', 'fuser', 'fusing unit', 'kit fusor'],
  },
  {
    id: 'transfer-unit',
    label: 'Unidad de Transferencia',
    keywords: [
      'unidad de transferencia',
      'transfer unit',
      'transfer belt',
      'banda de transferencia',
      'itb',
    ],
  },
  {
    id: 'adf',
    label: 'ADF',
    keywords: [
      'adf',
      'alimentador automatico',
      'alimentador automático',
      'document feeder',
      'doc feeder',
    ],
  },
  {
    id: 'rollers',
    label: 'Ruedas',
    keywords: ['rueda', 'rodillo', 'roller', 'pickup', 'feed roller', 'separation roller', 'pressure roller'],
  },
];

const COMPONENT_PATTERNS = [
  { pattern: /pickup|alimentaci[oó]n|feed roller/i, label: 'Rodillo de alimentación' },
  { pattern: /separation|separaci[oó]n/i, label: 'Rodillo de separación' },
  { pattern: /transfer roller|rodillo de transferencia/i, label: 'Rodillo de transferencia' },
  { pattern: /pressure|presi[oó]n/i, label: 'Rodillo de presión' },
  { pattern: /fuser|fusor/i, label: 'Módulo fusor' },
  { pattern: /belt|banda/i, label: 'Banda de transferencia' },
  { pattern: /waste|residual|botella/i, label: 'Botella residual' },
  { pattern: /developer|desarrollador/i, label: 'Unidad desarrolladora' },
  { pattern: /adf|alimentador/i, label: 'Kit ADF' },
];

function isTonerPackProduct(product) {
  const components = product?.bundle_components;
  if (Array.isArray(components) && components.length > 0) return true;
  return /\bPack x04\b/i.test(String(product?.name ?? ''));
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Conjunto/hopper de suministro de tóner (repuesto), no cartucho CMYK para Original/Compatible. */
export function isTonerSupplyAssemblyName(name) {
  const n = normalizeText(name);
  if (
    /toner\s+supply/.test(n) ||
    /toner\s+hopper/.test(n) ||
    /conjunto\s+suministro/.test(n) ||
    /supply\s+assembly/.test(n)
  ) {
    return true;
  }
  return /ass.?y/.test(n) && /toner|hopper|conjunto|suministro/.test(n);
}

export function isTonerSupplyAssemblyProduct(product) {
  return isTonerSupplyAssemblyName(product?.name ?? '');
}

function productHaystack(product) {
  const attributes = product.attributes?.map((attr) => `${attr.name} ${attr.value}`).join(' ') ?? '';
  return normalizeText(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''} ${attributes}`,
  );
}

function isPrinterEquipment(product) {
  const haystack = productHaystack(product);
  return haystack.includes('multifuncional') || haystack.includes('impresora');
}

function extractSearchKeys(equipment) {
  const keys = new Set();
  const name = equipment.name ?? '';

  const regexes = [
    /\bIM\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\bIM\s+\d{3,4}[A-Z]?\b/gi,
    /\bMP\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\b[A-Z]{1,5}\s*-?\s*\d{3,4}[A-Z]{0,4}\b/g,
    /\b[A-Z]{1,5}\d{3,4}[A-Z]{0,4}\b/g,
  ];

  for (const pattern of regexes) {
    for (const match of name.matchAll(pattern)) {
      const raw = match[0].trim();
      keys.add(normalizeText(raw));
      keys.add(raw.replace(/\s+/g, '').toLowerCase());
    }
  }

  const withoutBrand = equipment.brand
    ? name.replace(new RegExp(equipment.brand, 'i'), '').trim()
    : name.trim();
  if (withoutBrand.length >= 4) {
    keys.add(normalizeText(withoutBrand));
    keys.add(withoutBrand.replace(/\s+/g, '').toLowerCase());
  }

  keys.add(String(equipment.id ?? '').replace(/-/g, ' '));

  return [...keys].filter((key) => key.replace(/\s+/g, '').length >= 3);
}

function isAccesoriosCategory(product) {
  const category = normalizeText(product.category ?? '');
  return category.includes('accesorio');
}

function isRepuestosCategory(product) {
  const category = normalizeText(product.category ?? '');
  return (
    category.includes('repuesto') ||
    category.includes('accesorio') ||
    category.includes('suministro') ||
    category.includes('toner') ||
    category.includes('tóner')
  );
}

function isEquipmentConsumable(product) {
  const haystack = productHaystack(product);
  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }
  if (isRepuestosCategory(product)) return true;
  return CATEGORY_RULES.some((rule) =>
    rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword))),
  );
}

function consumableMatchesEquipment(consumable, keys) {
  const haystack = productHaystack(consumable);
  const compactHaystack = haystack.replace(/\s+/g, '');

  return keys.some((key) => {
    const compactKey = key.replace(/\s+/g, '');
    if (compactKey.length < 3) return false;
    return haystack.includes(key) || compactHaystack.includes(compactKey);
  });
}

function classifyConsumable(product) {
  const haystack = productHaystack(product);

  if (isAccesoriosCategory(product)) {
    return 'accesorios';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.id === 'toner' && rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      if (isTonerSupplyAssemblyProduct(product)) return 'repuestos';
      return 'toner';
    }
  }

  if (isRepuestosCategory(product) && !haystack.includes('toner') && !haystack.includes('tóner')) {
    for (const rule of CATEGORY_RULES) {
      if (rule.id !== 'toner' && rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
        return rule.id;
      }
    }
    return 'repuestos';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))) {
      return rule.id;
    }
  }
  return null;
}

function resolveComponentLabel(product) {
  const source = `${product.name} ${product.description ?? ''}`;
  for (const { pattern, label } of COMPONENT_PATTERNS) {
    if (pattern.test(source)) return label;
  }
  return undefined;
}

function toConsumableItem(product) {
  const componentLabel = resolveComponentLabel(product);
  return {
    productId: product.id,
    name: product.name,
    image: product.image_url ?? null,
    priceUsd: product.price,
    ...(product.code ? { sku: product.code } : {}),
    ...(componentLabel ? { componentLabel } : {}),
  };
}

function buildSubgroups(items) {
  const byComponent = new Map();
  for (const item of items) {
    if (!item.componentLabel) continue;
    const list = byComponent.get(item.componentLabel) ?? [];
    list.push(item);
    byComponent.set(item.componentLabel, list);
  }
  return [...byComponent.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([label, subgroupItems]) => ({ label, items: subgroupItems }));
}

export function resolveEquipmentConsumables(equipment, catalog) {
  if (!isPrinterEquipment(equipment)) return [];

  const keys = extractSearchKeys(equipment);
  const matched = catalog
    .filter((row) => row.id !== equipment.id)
    .filter(isEquipmentConsumable)
    .filter((row) => !isTonerPackProduct(row))
    .filter((row) => consumableMatchesEquipment(row, keys));

  const byCategory = new Map();

  for (const product of matched) {
    const categoryId = classifyConsumable(product);
    if (!categoryId) continue;
    const item = toConsumableItem(product);
    const list = byCategory.get(categoryId) ?? [];
    list.push(item);
    byCategory.set(categoryId, list);
  }

  const groupOrder = [
    ...CATEGORY_RULES.map((rule) => ({ id: rule.id, label: rule.label })),
    { id: 'repuestos', label: 'Repuestos' },
  ];

  return groupOrder
    .filter((entry) => byCategory.has(entry.id))
    .map((entry) => {
      const allItems = (byCategory.get(entry.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      );
      const items = allItems.filter((item) => !item.componentLabel);
      const subgroups = buildSubgroups(allItems);

      return {
        id: entry.id,
        label: entry.label,
        items,
        subgroups,
      };
    });
}
