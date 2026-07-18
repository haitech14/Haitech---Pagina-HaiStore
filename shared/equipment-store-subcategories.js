/**
 * Subcategorías de equipo que deben existir en el árbol de tienda
 * (snapshot público + enrich cliente), aunque la DB las tenga vacías.
 */

/** @typedef {{ slug: string, name: string, inventoryLabels: string[], image?: string|null }} EquipmentSubEntry */

/** @type {Record<string, EquipmentSubEntry[]>} */
export const EQUIPMENT_STORE_SUBCATEGORIES = {
  multifuncionales: [
    {
      slug: 'multifuncionales-nuevas',
      name: 'Multifuncionales Nuevas',
      inventoryLabels: ['Multifuncionales Nuevas', 'Multifuncionales, Multifuncionales Nuevas'],
      image: '/categories/subcategories/equipo-nuevo.png',
    },
    {
      slug: 'multifuncionales-seminuevas',
      name: 'Multifuncionales Seminuevas',
      inventoryLabels: ['Multifuncionales Seminuevas', 'Multifuncionales, Multifuncionales Seminuevas'],
      image: '/categories/subcategories/equipo-seminuevo.png',
    },
    {
      slug: 'multifuncionales-remanufacturadas',
      name: 'Multifuncionales Remanufacturadas',
      inventoryLabels: [
        'Multifuncionales Remanufacturadas',
        'Multifuncionales, Multifuncionales Remanufacturadas',
      ],
      image: '/categories/subcategories/equipo-remanufacturado.png',
    },
  ],
  impresoras: [
    {
      slug: 'impresoras-laser-nuevas',
      name: 'Impresoras Láser Nuevas',
      inventoryLabels: [
        'Impresoras Laser Nuevas',
        'Impresoras Láser Nuevas',
        'Impresoras, Impresoras Laser Nuevas',
        'Impresoras, Impresoras Láser Nuevas',
      ],
      image: '/categories/subcategories/equipo-nuevo.png',
    },
    {
      slug: 'impresoras-laser-seminuevas',
      name: 'Impresoras Láser Seminuevas',
      inventoryLabels: ['Impresoras Laser Seminuevas', 'Impresoras Láser Seminuevas'],
      image: '/categories/subcategories/equipo-seminuevo.png',
    },
    {
      slug: 'impresoras-laser-remanufacturadas',
      name: 'Impresoras Láser Remanufacturadas',
      inventoryLabels: ['Impresoras Laser Remanufacturadas', 'Impresoras Láser Remanufacturadas'],
      image: '/categories/subcategories/equipo-remanufacturado.png',
    },
    {
      slug: 'impresoras-termicas',
      name: 'Impresoras Térmicas',
      inventoryLabels: [
        'Impresoras Térmicas',
        'Impresoras Termicas',
        'Impresoras, Impresoras Térmicas',
        'Impresoras, Impresoras Termicas',
      ],
      image: '/home/category-chips/equipment/impresora-termica.webp',
    },
  ],
  'toner-suministros': [
    {
      slug: 'toner-originales',
      name: 'Toner Originales',
      inventoryLabels: [
        'Suministros, Toner Originales',
        'Suministros, Toner Original',
        'Toner Original',
        'Toner, Toner Original',
        'Toner, Toner Originales',
        'Toner y Suministros, Toner Original',
        'Tóner y Suministros, Toner Original',
      ],
      image: '/categories/accesorios-impresoras.png',
    },
    {
      slug: 'suministros',
      name: 'Suministros',
      inventoryLabels: ['Suministros', 'Toner, Suministros'],
      image: '/categories/toner-suministros.png',
    },
    {
      slug: 'toner-compatibles',
      name: 'Tóner Compatible',
      inventoryLabels: [
        'Toner Compatible',
        'Suministros, Toner Compatible',
        'Toner, Toner Compatible',
        'Toner Compatibles',
        'Toner, Toner Compatibles',
        'Toner Compatibles HaiPrint',
        'Toner Compatibles Haitone',
      ],
      image: '/categories/toner-suministros.png',
    },
    {
      slug: 'tintas-originales',
      name: 'Tintas Originales',
      inventoryLabels: ['Tintas Originales', 'Tinta Original', 'Tinta, Tinta Original', 'Tintas', 'Tinta'],
    },
    {
      slug: 'tintas-compatibles',
      name: 'Tintas Compatibles',
      inventoryLabels: ['Tintas Compatibles', 'Tinta Compatible', 'Tinta, Tinta Compatible', 'Tintas'],
    },
    {
      slug: 'toner-remanufacturado',
      name: 'Toner Remanufacturado',
      inventoryLabels: [
        'Toner Remanufacturado',
        'Toner Remanufacturados',
        'Toner, Toner Remanufacturado',
        'Toner, Toner Remanufacturados',
        'Suministros, Toner Remanufacturado',
        'Toner y Suministros, Toner Remanufacturado',
      ],
      image: '/categories/toner-suministros.png',
    },
    {
      slug: 'toner-recarga',
      name: 'Toner Recarga',
      inventoryLabels: [
        'Toner Recargas',
        'Recargas',
        'Recarga',
        'Toner, Recargas',
        'Toner, Recarga',
        'Suministros, Recarga',
        'Suministros, Toner Recarga',
        'Toner y Suministros, Recarga',
        'Toner y Suministros, Toner Recarga',
      ],
      image: '/categories/toner-suministros.png',
    },
  ],
  escaneres: [
    {
      slug: 'escaneres-nuevos',
      name: 'Escáneres Nuevos',
      inventoryLabels: [
        'Escáneres Nuevos',
        'Escáneres, Escáneres Nuevos',
        'Escaneres Nuevos',
        'Escaner',
        'Escáner',
      ],
    },
  ],
  'equipos-de-oficina': [
    {
      slug: 'espiraladoras',
      name: 'Espiraladoras',
      inventoryLabels: ['Espiraladoras', 'Espiraladora', 'Equipos de Oficina, Espiraladoras'],
    },
    {
      slug: 'anilladoras',
      name: 'Anilladoras',
      inventoryLabels: ['Anilladoras', 'Anilladora', 'Equipos de Oficina, Anilladoras'],
    },
    {
      slug: 'enmicadoras',
      name: 'Enmicadoras',
      inventoryLabels: ['Enmicadoras', 'Enmicadora', 'Equipos de Oficina, Enmicadora'],
    },
    {
      slug: 'guillotinas',
      name: 'Guillotinas',
      inventoryLabels: ['Guillotinas', 'Guillotina', 'Equipos de Oficina, Guillotina'],
    },
  ],
};

/**
 * Fusiona hijos de equipo faltantes en el árbol (sin pisar hijos existentes).
 * @param {Array<{ id?: string, slug?: string, children?: any[], productCount?: number }>} tree
 * @param {readonly string[]} [removedSlugs]
 */
export function enrichEquipmentStoreSubcategories(tree, removedSlugs = []) {
  if (!Array.isArray(tree) || tree.length === 0) return tree ?? [];
  const removed = new Set(removedSlugs);

  function enrichNode(node) {
    const children = (node.children ?? []).map(enrichNode);
    const staticSubs = EQUIPMENT_STORE_SUBCATEGORIES[node.slug] ?? [];
    if (staticSubs.length === 0) {
      return { ...node, children };
    }

    const existingSlugs = new Set(children.map((child) => child.slug));
    const missing = staticSubs.filter(
      (entry) => !existingSlugs.has(entry.slug) && !removed.has(entry.slug),
    );
    if (missing.length === 0) {
      return { ...node, children };
    }

    const extras = missing.map((entry, index) => ({
      id: `static-${entry.slug}`,
      name: entry.name,
      slug: entry.slug,
      parentId: node.id ?? null,
      sortOrder: children.length + index,
      inventoryLabels: entry.inventoryLabels,
      image: entry.image ?? null,
      tagline: null,
      productCount: 0,
      children: [],
    }));

    const merged = [...children, ...extras];
    const productCount =
      typeof node.productCount === 'number' && node.productCount > 0
        ? node.productCount
        : merged.reduce((sum, child) => sum + (child.productCount ?? 0), 0);

    return { ...node, children: merged, productCount };
  }

  return tree.map(enrichNode);
}
