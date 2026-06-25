import { categories } from '@/data/categories';
import { getCatalogRows, productMatchesCategories } from '@/lib/catalog-featured';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const EQUIPMENT_SUBCATEGORIES: Record<
  string,
  Array<{ slug: string; name: string; inventoryLabels: string[] }>
> = {
  multifuncionales: [
    {
      slug: 'multifuncionales-nuevas',
      name: 'Multifuncionales Nuevas',
      inventoryLabels: ['Multifuncionales Nuevas', 'Multifuncionales, Multifuncionales Nuevas'],
    },
    {
      slug: 'multifuncionales-seminuevas',
      name: 'Multifuncionales Seminuevas',
      inventoryLabels: ['Multifuncionales Seminuevas', 'Multifuncionales, Multifuncionales Seminuevas'],
    },
    {
      slug: 'multifuncionales-remanufacturadas',
      name: 'Multifuncionales Remanufacturadas',
      inventoryLabels: [
        'Multifuncionales Remanufacturadas',
        'Multifuncionales, Multifuncionales Remanufacturadas',
      ],
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
    },
    {
      slug: 'impresoras-laser-seminuevas',
      name: 'Impresoras Láser Seminuevas',
      inventoryLabels: ['Impresoras Laser Seminuevas', 'Impresoras Láser Seminuevas'],
    },
    {
      slug: 'impresoras-laser-remanufacturadas',
      name: 'Impresoras Láser Remanufacturadas',
      inventoryLabels: ['Impresoras Laser Remanufacturadas', 'Impresoras Láser Remanufacturadas'],
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
    },
    {
      slug: 'suministros',
      name: 'Suministros',
      inventoryLabels: ['Suministros', 'Toner, Suministros'],
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
    },
  ],
  'toner-compatibles': [
    {
      slug: 'toner-compatibles',
      name: 'Tóner Compatible',
      inventoryLabels: [
        'Toner Compatible',
        'Toner, Toner Compatible',
        'Toner y Suministros, Toner Compatible',
        'Suministros, Toner Compatible',
        'Toner Compatibles',
        'Toner, Toner Compatibles',
        'Toner Compatibles HaiPrint',
        'Toner Compatibles Haitone',
      ],
    },
  ],
};

function countProductsForLabels(labels: readonly string[]): number {
  if (labels.length === 0) return 0;
  return getCatalogRows().filter((row) => productMatchesCategories(row.category, labels)).length;
}

function buildSubcategoryNodes(
  parentId: string,
  entries: Array<{ slug: string; name: string; inventoryLabels: string[] }>,
): StoreCategoryTreeNode[] {
  return entries.map((entry, index) => ({
    id: `static-${entry.slug}`,
    name: entry.name,
    slug: entry.slug,
    parentId,
    sortOrder: index,
    inventoryLabels: entry.inventoryLabels,
    image: null,
    tagline: null,
    productCount: countProductsForLabels(entry.inventoryLabels),
    children: [],
  }));
}

/** Árbol mínimo embebido cuando la API de categorías no responde. */
export function buildStaticStoreCategoryTree(): StoreCategoryTreeNode[] {
  return categories
    .filter((category) => category.inventoryCategories?.length || EQUIPMENT_SUBCATEGORIES[category.slug])
    .map((category, index) => {
      const id = `static-${category.slug}`;
      const inventoryLabels = category.inventoryCategories ?? [category.name];
      const subEntries = EQUIPMENT_SUBCATEGORIES[category.slug] ?? [];

      return {
        id,
        name: category.name,
        slug: category.slug,
        parentId: null,
        sortOrder: index,
        inventoryLabels: [...inventoryLabels],
        image: category.image ?? null,
        tagline: category.tagline ?? null,
        productCount: countProductsForLabels(inventoryLabels),
        children: buildSubcategoryNodes(id, subEntries),
      };
    });
}
