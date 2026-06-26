import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

import { readInventory } from './inventory-store.js';
import { listProducts } from './product-catalog.js';
import { seedProducts } from './seed-products.js';

import {
  CATEGORY_COMPATIBLE_TONER,
  CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY,
  CATEGORY_COMPATIBLE_TONER_LEGACY,
  COMPATIBLE_TONER_SUBCATEGORY_ID,
  COMPATIBLE_TONER_SUBCATEGORY_SLUG,
} from '../../shared/compatible-toner.js';
import { applyEquipmentSubcategorySlugFilter } from '../../shared/category-inventory-labels.js';
import {
  isPrinterEquipmentProduct,
  productMatchesCategoryFilter,
} from '../../shared/home-catalog-filter.js';
import { LANDING_CATEGORY } from '../../shared/landing-categories.js';
import { getStoreCategoriesPath } from './server-paths.js';

const BUNDLED_STORE_CATEGORIES_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../data/store-categories.json',
);

function categoriesPath() {
  return getStoreCategoriesPath();
}

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-multifuncionales',
    name: 'Multifuncionales',
    slug: 'multifuncionales',
    parentId: null,
    sortOrder: 0,
    inventoryLabels: ['Multifuncionales', 'Multifuncionales Nuevas'],
    image: '/categories/multifuncionales.png',
    tagline: 'Imprime, escanea y copia en un solo equipo',
  },
  {
    id: 'cat-impresoras',
    name: 'Impresoras',
    slug: 'impresoras',
    parentId: null,
    sortOrder: 1,
    inventoryLabels: ['Impresoras'],
    image: '/categories/impresoras.png',
    tagline: 'Láser, inkjet y soluciones de impresión',
  },
  {
    id: 'cat-toner',
    name: 'Suministros',
    slug: 'toner-suministros',
    parentId: null,
    sortOrder: 2,
    inventoryLabels: ['Suministros', 'Toner y Suministros', 'Toner y suministros', 'Tóner y Suministros', 'Toner'],
    image: '/categories/toner-suministros.png',
    tagline: 'Consumibles originales y compatibles',
  },
  {
    id: 'cat-toner-originales',
    name: 'Toner Originales',
    slug: 'toner-originales',
    parentId: 'cat-toner',
    sortOrder: 0,
    inventoryLabels: [
      'Toner Original',
      'Toner Originales',
      'Toner, Toner Original',
      'Toner, Toner Originales',
      'Toner y Suministros, Toner Original',
      'Tóner y Suministros, Toner Original',
      'Suministros, Toner Original',
      'Suministros, Toner Originales',
    ],
    image: '/categories/accesorios-impresoras.png',
    tagline: 'Cartuchos originales para tu equipo',
  },
  {
    id: COMPATIBLE_TONER_SUBCATEGORY_ID,
    name: 'Toner Compatible',
    slug: COMPATIBLE_TONER_SUBCATEGORY_SLUG,
    parentId: 'cat-toner',
    sortOrder: 1,
    inventoryLabels: [CATEGORY_COMPATIBLE_TONER],
    image: '/categories/toner-suministros.png',
    tagline: 'Cartuchos y recargas compatibles',
  },
  {
    id: 'cat-toner-remanufacturado',
    name: 'Toner Remanufacturado',
    slug: 'toner-remanufacturado',
    parentId: 'cat-toner',
    sortOrder: 2,
    inventoryLabels: [
      'Toner Remanufacturado',
      'Toner Remanufacturados',
      'Toner, Toner Remanufacturado',
      'Toner, Toner Remanufacturados',
      'Suministros, Toner Remanufacturado',
      'Toner y Suministros, Toner Remanufacturado',
    ],
    image: '/categories/toner-suministros.png',
    tagline: 'Alternativas remanufacturadas',
  },
  {
    id: 'cat-toner-recarga',
    name: 'Toner Recarga',
    slug: 'toner-recarga',
    parentId: 'cat-toner',
    sortOrder: 3,
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
    tagline: 'Servicios y recargas de toner',
  },
  {
    id: 'cat-tintas-originales',
    name: 'Tintas Originales',
    slug: 'tintas-originales',
    parentId: 'cat-toner',
    sortOrder: 10,
    inventoryLabels: ['Tintas Originales', 'Tinta Original', 'Tinta, Tinta Original', 'Tintas', 'Tinta'],
    image: '/categories/toner-suministros.png',
    tagline: 'Tintas originales para impresoras',
  },
  {
    id: 'cat-tintas-compatibles',
    name: 'Tintas Compatibles',
    slug: 'tintas-compatibles',
    parentId: 'cat-toner',
    sortOrder: 11,
    inventoryLabels: ['Tintas Compatibles', 'Tinta Compatible', 'Tinta, Tinta Compatible', 'Tintas'],
    image: '/categories/toner-suministros.png',
    tagline: 'Tintas compatibles y alternativas',
  },
  {
    id: 'cat-repuestos',
    name: 'Repuestos',
    slug: 'repuestos',
    parentId: null,
    sortOrder: 3,
    inventoryLabels: ['Repuestos'],
    image: '/categories/repuestos.png',
    tagline: 'Partes y componentes para impresoras',
  },
  {
    id: 'cat-servicio-tecnico',
    name: 'Servicio Técnico',
    slug: 'servicio-tecnico',
    parentId: null,
    sortOrder: 4,
    inventoryLabels: ['Servicio Técnico', 'Servicio tecnico'],
    image: '/categories/servicio-tecnico.png',
    tagline: 'Mantenimiento, instalación y soporte especializado',
  },
];

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return [...new Set(labels.map((label) => String(label).trim()).filter(Boolean))];
}

function normalizeCategory(raw, existing) {
  const name = String(raw.name ?? existing?.name ?? '').trim();
  const slug = slugify(raw.slug ?? name ?? existing?.slug) || randomUUID().slice(0, 8);
  return {
    id: existing?.id ?? raw.id ?? randomUUID(),
    name,
    slug,
    parentId: raw.parentId === undefined ? (existing?.parentId ?? null) : raw.parentId,
    sortOrder: Number(raw.sortOrder ?? existing?.sortOrder ?? 0),
    inventoryLabels: normalizeLabels(raw.inventoryLabels ?? existing?.inventoryLabels ?? [name]),
    image: raw.image ?? existing?.image ?? null,
    tagline: raw.tagline ?? existing?.tagline ?? null,
  };
}

async function ensureCategoriesFile() {
  try {
    await fs.access(categoriesPath());
    return;
  } catch {
    // noop — crear abajo
  }

  await fs.mkdir(path.dirname(categoriesPath()), { recursive: true });

  try {
    const bundled = await fs.readFile(BUNDLED_STORE_CATEGORIES_PATH, 'utf8');
    await fs.writeFile(categoriesPath(), bundled);
    return;
  } catch {
    await fs.writeFile(
      categoriesPath(),
      JSON.stringify({ categories: DEFAULT_CATEGORIES }, null, 2),
    );
  }
}

function migrateRemoveRentalCategories(categories) {
  const filtered = categories.filter((row) => row.id !== 'cat-alquiler' && row.parentId !== 'cat-alquiler');
  return filtered.length !== categories.length ? filtered : categories;
}

const SUPPLY_CATEGORY_IDS = [
  'cat-toner',
  'cat-toner-originales',
  COMPATIBLE_TONER_SUBCATEGORY_ID,
  'cat-toner-remanufacturado',
  'cat-toner-recarga',
  'cat-tintas-originales',
  'cat-tintas-compatibles',
];

function mergeMissingSupplyCategories(categories) {
  const byId = new Map(categories.map((row) => [row.id, row]));
  let changed = false;

  for (const seed of DEFAULT_CATEGORIES) {
    if (!SUPPLY_CATEGORY_IDS.includes(seed.id)) continue;
    if (byId.has(seed.id)) continue;
    byId.set(seed.id, normalizeCategory(seed));
    changed = true;
  }

  return changed ? [...byId.values()] : categories;
}

function migrateTonerCategoryDisplayNames(categories) {
  let changed = false;

  const updated = categories.map((row) => {
    if (row.id === 'cat-toner') {
      const labels = new Set(row.inventoryLabels ?? []);
      labels.add(LANDING_CATEGORY.toner);
      labels.add('Toner y Suministros');
      labels.add('Toner y suministros');
      labels.add('Tóner y Suministros');
      labels.add('Toner');
      const next = {
        ...row,
        name: LANDING_CATEGORY.toner,
        inventoryLabels: [...labels],
      };
      if (row.name !== next.name || JSON.stringify(row.inventoryLabels ?? []) !== JSON.stringify(next.inventoryLabels)) {
        changed = true;
      }
      return next;
    }

    if (
      row.id === COMPATIBLE_TONER_SUBCATEGORY_ID ||
      row.slug === COMPATIBLE_TONER_SUBCATEGORY_SLUG
    ) {
      const next = {
        ...row,
        name: LANDING_CATEGORY.tonerCompatible,
      };
      if (row.name !== next.name) changed = true;
      return next;
    }

    if (row.id === 'cat-toner-originales' || row.slug === 'toner-originales') {
      const labels = new Set(row.inventoryLabels ?? []);
      labels.add('Suministros, Toner Originales');
      labels.add('Suministros, Toner Original');
      labels.add('Toner, Toner Originales');
      labels.add('Toner, Toner Original');
      const next = {
        ...row,
        inventoryLabels: [...labels],
      };
      if (JSON.stringify(row.inventoryLabels ?? []) !== JSON.stringify(next.inventoryLabels)) {
        changed = true;
      }
      return next;
    }

    return row;
  });

  return changed ? updated : categories;
}

function migrateCompatibleTonerSubcategory(categories) {
  let changed = false;

  const updated = categories.map((row) => {
    const isCompatiblesNode =
      row.id === COMPATIBLE_TONER_SUBCATEGORY_ID ||
      row.slug === COMPATIBLE_TONER_SUBCATEGORY_SLUG ||
      (row.inventoryLabels ?? []).includes(CATEGORY_COMPATIBLE_TONER_LEGACY) ||
      (row.inventoryLabels ?? []).includes(CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY);

    if (!isCompatiblesNode) return row;

    const labels = new Set(row.inventoryLabels ?? []);
    labels.delete(CATEGORY_COMPATIBLE_TONER_LEGACY);
    labels.delete(CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY);
    labels.add(CATEGORY_COMPATIBLE_TONER);

    const next = {
      ...row,
      name: LANDING_CATEGORY.tonerCompatible,
      parentId: 'cat-toner',
      inventoryLabels: [...labels],
    };

    if (
      row.name !== next.name ||
      JSON.stringify(row.inventoryLabels ?? []) !== JSON.stringify(next.inventoryLabels)
    ) {
      changed = true;
    }

    return next;
  });

  const parentIndex = updated.findIndex((row) => row.id === 'cat-toner');
  if (parentIndex >= 0) {
    const parent = updated[parentIndex];
    const labels = new Set(parent.inventoryLabels ?? []);
    const beforeSize = labels.size;
    labels.delete(CATEGORY_COMPATIBLE_TONER_LEGACY);
    labels.delete(CATEGORY_COMPATIBLE_TONER_HAITONE_LEGACY);
    labels.add(CATEGORY_COMPATIBLE_TONER);
    if (labels.size !== beforeSize || labels.has(CATEGORY_COMPATIBLE_TONER_LEGACY) === false) {
      changed = true;
    }
    updated[parentIndex] = {
      ...parent,
      inventoryLabels: [...labels],
    };
  }

  return changed ? updated : categories;
}

function migrateSplitTonerRemanufacturadoAndRecarga(categories) {
  let changed = false;

  const byId = new Map(categories.map((row) => [row.id, row]));
  const legacy = byId.get('cat-toner-remanufacturado-recargas');
  if (!legacy) return categories;

  byId.delete('cat-toner-remanufacturado-recargas');
  changed = true;

  // Asegurar que existen los nodos nuevos (seeded por DEFAULT_CATEGORIES, pero por si acaso).
  if (!byId.has('cat-toner-remanufacturado')) {
    byId.set('cat-toner-remanufacturado', normalizeCategory(DEFAULT_CATEGORIES.find((c) => c.id === 'cat-toner-remanufacturado') ?? {
      id: 'cat-toner-remanufacturado',
      name: 'Toner Remanufacturado',
      slug: 'toner-remanufacturado',
      parentId: 'cat-toner',
      sortOrder: 2,
      inventoryLabels: legacy.inventoryLabels ?? [],
      image: '/categories/toner-suministros.png',
      tagline: 'Alternativas remanufacturadas',
    }));
  }
  if (!byId.has('cat-toner-recarga')) {
    byId.set('cat-toner-recarga', normalizeCategory(DEFAULT_CATEGORIES.find((c) => c.id === 'cat-toner-recarga') ?? {
      id: 'cat-toner-recarga',
      name: 'Toner Recarga',
      slug: 'toner-recarga',
      parentId: 'cat-toner',
      sortOrder: 3,
      inventoryLabels: legacy.inventoryLabels ?? [],
      image: '/categories/toner-suministros.png',
      tagline: 'Servicios y recargas de toner',
    }));
  }

  return [...byId.values()];
}

function mergeMissingRepuestosCompatiblesCategory(categories) {
  const exists =
    categories.some((row) => row.id === 'cat-repuestos-compatibles') ||
    categories.some((row) => row.slug === 'repuestos-compatibles');
  if (exists) return categories;

  return [
    ...categories,
    normalizeCategory({
      id: 'cat-repuestos-compatibles',
      name: 'Repuestos Compatibles',
      slug: 'repuestos-compatibles',
      parentId: 'cat-repuestos',
      sortOrder: 1,
      inventoryLabels: ['Repuestos Compatibles', 'Repuesto Compatible', 'Repuestos, Repuestos Compatibles'],
      image: '/categories/repuestos.png',
      tagline: 'Partes y componentes compatibles',
    }),
  ];
}

function mergeMissingUnidadesCompatiblesSubcategory(categories) {
  const exists =
    categories.some((row) => row.id === 'cat-unidades-compatibles') ||
    categories.some((row) => row.slug === 'unidades-compatibles');
  if (exists) return categories;

  const parentExists =
    categories.some((row) => row.id === 'cat-repuestos-compatibles') ||
    categories.some((row) => row.slug === 'repuestos-compatibles');

  const withParent = parentExists ? categories : mergeMissingRepuestosCompatiblesCategory(categories);
  const siblings = withParent.filter((row) => row.parentId === 'cat-repuestos-compatibles');

  return [
    ...withParent,
    normalizeCategory({
      id: 'cat-unidades-compatibles',
      name: 'Unidades Compatibles',
      slug: 'unidades-compatibles',
      parentId: 'cat-repuestos-compatibles',
      sortOrder: siblings.length,
      inventoryLabels: [
        'Unidades Compatibles',
        'Unidad Compatible',
        'Repuestos Compatibles, Unidades Compatibles',
        'Repuestos, Repuestos Compatibles, Unidades Compatibles',
      ],
      image: '/categories/repuestos.png',
      tagline: 'Unidades de imagen compatibles',
    }),
  ];
}

const PIZARRAS_INTERACTIVAS_LABEL = 'Pizarras Interactivas';

function mergeSolucionesColaboracionPizarraLabels(categories) {
  const index = categories.findIndex(
    (row) => row.slug === 'soluciones-colaboracion' || row.id === 'cat-soluciones-colaboracion',
  );
  if (index < 0) return categories;

  const row = categories[index];
  const labels = new Set(row.inventoryLabels ?? []);
  if (labels.has(PIZARRAS_INTERACTIVAS_LABEL)) return categories;

  labels.add(PIZARRAS_INTERACTIVAS_LABEL);
  const next = [...categories];
  next[index] = normalizeCategory({
    ...row,
    inventoryLabels: [...labels],
  });
  return next;
}

function mergeMissingCilindrosCompatiblesSubcategory(categories) {
  const exists =
    categories.some((row) => row.id === 'cat-cilindros-compatibles') ||
    categories.some((row) => row.slug === 'cilindros');
  if (exists) return categories;

  const parentExists =
    categories.some((row) => row.id === 'cat-repuestos-compatibles') ||
    categories.some((row) => row.slug === 'repuestos-compatibles');

  const withParent = parentExists ? categories : mergeMissingRepuestosCompatiblesCategory(categories);
  const siblings = withParent.filter((row) => row.parentId === 'cat-repuestos-compatibles');

  return [
    ...withParent,
    normalizeCategory({
      id: 'cat-cilindros-compatibles',
      name: 'Cilindros',
      slug: 'cilindros',
      parentId: 'cat-repuestos-compatibles',
      sortOrder: siblings.length,
      inventoryLabels: [
        'Cilindros',
        'Cilindro Compatible',
        'Repuestos Compatibles, Cilindros',
        'Repuestos, Repuestos Compatibles, Cilindros',
      ],
      image: '/categories/repuestos.png',
      tagline: 'Cilindros OPC compatibles Fuji',
    }),
  ];
}

export async function readStoreCategories() {
  await ensureCategoriesFile();
  const raw = await fs.readFile(categoriesPath(), 'utf-8');
  const data = JSON.parse(raw);
  let categories = (data.categories ?? []).map((row) => normalizeCategory(row));
  let needsWrite = false;

  const rentalsRemoved = migrateRemoveRentalCategories(categories);
  if (rentalsRemoved !== categories) {
    categories = rentalsRemoved;
    needsWrite = true;
  }

  const supplyMerged = mergeMissingSupplyCategories(categories);
  if (supplyMerged !== categories) {
    categories = supplyMerged;
    needsWrite = true;
  }

  const repuestosCompat = mergeMissingRepuestosCompatiblesCategory(categories);
  if (repuestosCompat !== categories) {
    categories = repuestosCompat;
    needsWrite = true;
  }

  const unidadesCompat = mergeMissingUnidadesCompatiblesSubcategory(categories);
  if (unidadesCompat !== categories) {
    categories = unidadesCompat;
    needsWrite = true;
  }

  const cilindrosCompat = mergeMissingCilindrosCompatiblesSubcategory(categories);
  if (cilindrosCompat !== categories) {
    categories = cilindrosCompat;
    needsWrite = true;
  }

  const pizarraLabels = mergeSolucionesColaboracionPizarraLabels(categories);
  if (pizarraLabels !== categories) {
    categories = pizarraLabels;
    needsWrite = true;
  }

  const migrated = migrateCompatibleTonerSubcategory(categories);
  if (migrated !== categories) {
    categories = migrated;
    needsWrite = true;
  }

  const splitLegacy = migrateSplitTonerRemanufacturadoAndRecarga(categories);
  if (splitLegacy !== categories) {
    categories = splitLegacy;
    needsWrite = true;
  }

  const renamed = migrateTonerCategoryDisplayNames(categories);
  if (renamed !== categories) {
    categories = renamed;
    needsWrite = true;
  }

  if (needsWrite) {
    await writeStoreCategories(categories);
  }

  return categories;
}

export async function writeStoreCategories(categories) {
  const normalized = categories.map((row) => normalizeCategory(row));
  await fs.mkdir(path.dirname(categoriesPath()), { recursive: true });
  await fs.writeFile(categoriesPath(), JSON.stringify({ categories: normalized }, null, 2));
  invalidateStoreCategoriesTreeCache();
  return normalized;
}

function normalizeInventoryCategory(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function countProductsForLeafCategory(category, products, repuestosFamily) {
  const labels = (category.inventoryLabels ?? [])
    .map((label) => String(label).trim())
    .filter(Boolean);
  const effectiveLabels = labels.length > 0 ? labels : [category.name];

  let matched = products.filter((product) => {
    if (repuestosFamily && isPrinterEquipmentProduct(product)) return false;
    return effectiveLabels.some((label) => productMatchesCategoryFilter(product, label));
  });

  matched = applyEquipmentSubcategorySlugFilter(matched, category.slug);
  return matched.length;
}

function syncNodeProductCounts(node, products, repuestosFamily) {
  const inRepuestosFamily = repuestosFamily || node.slug === 'repuestos';
  const children = (node.children ?? []).map((child) =>
    syncNodeProductCounts(child, products, inRepuestosFamily),
  );

  const productCount =
    children.length > 0
      ? children.reduce((sum, child) => sum + (child.productCount ?? 0), 0)
      : countProductsForLeafCategory(node, products, inRepuestosFamily);

  return { ...node, children, productCount };
}

function buildTree(categories, products) {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const byParent = new Map();

  for (const category of sorted) {
    const key = category.parentId ?? 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push({ ...category });
  }

  const attachChildren = (parentId) => {
    const list = byParent.get(parentId ?? 'root') ?? [];
    return list.map((node) => ({
      ...node,
      children: attachChildren(node.id),
    }));
  };

  const tree = attachChildren(null);
  return tree.map((node) => syncNodeProductCounts(node, products, node.slug === 'repuestos'));
}

const CATEGORIES_TREE_CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {import('../../src/types/store-category.js').StoreCategoryTreeNode[] | null} */
let categoriesTreeCache = null;
let categoriesTreeCacheAt = 0;

export function invalidateStoreCategoriesTreeCache() {
  categoriesTreeCache = null;
  categoriesTreeCacheAt = 0;
}

export async function readStoreCategoriesTree() {
  const now = Date.now();
  if (categoriesTreeCache && now - categoriesTreeCacheAt < CATEGORIES_TREE_CACHE_TTL_MS) {
    return categoriesTreeCache;
  }

  const categories = await readStoreCategories();
  const products = await listProducts({ role: 'public', adminView: false });
  const tree = buildTree(categories, products);
  categoriesTreeCache = tree;
  categoriesTreeCacheAt = now;
  return tree;
}

function validateParent(categories, categoryId, parentId) {
  if (!parentId) return true;
  if (parentId === categoryId) return false;
  let cursor = parentId;
  while (cursor) {
    if (cursor === categoryId) return false;
    const parent = categories.find((row) => row.id === cursor);
    cursor = parent?.parentId ?? null;
  }
  return true;
}

export async function createStoreCategory(input) {
  const categories = await readStoreCategories();
  const siblings = categories.filter((row) => row.parentId === (input.parentId ?? null));
  const category = normalizeCategory({
    ...input,
    sortOrder: input.sortOrder ?? siblings.length,
  });

  if (!validateParent(categories, category.id, category.parentId)) {
    throw new Error('La categoría padre no es válida');
  }

  categories.push(category);
  await writeStoreCategories(categories);
  return category;
}

export async function updateStoreCategory(id, input) {
  const categories = await readStoreCategories();
  const index = categories.findIndex((row) => row.id === id);
  if (index === -1) throw new Error('Categoría no encontrada');

  const parentId = input.parentId === undefined ? categories[index].parentId : input.parentId;
  if (!validateParent(categories, id, parentId)) {
    throw new Error('No se puede asignar esa categoría padre');
  }

  categories[index] = normalizeCategory({ ...categories[index], ...input, parentId }, categories[index]);
  await writeStoreCategories(categories);
  return categories[index];
}

export async function deleteStoreCategory(id) {
  const categories = await readStoreCategories();
  const hasChildren = categories.some((row) => row.parentId === id);
  if (hasChildren) {
    throw new Error('Elimina primero las subcategorías');
  }

  const next = categories.filter((row) => row.id !== id);
  if (next.length === categories.length) throw new Error('Categoría no encontrada');
  await writeStoreCategories(next);
  return { ok: true };
}

export async function reorderStoreCategories(items) {
  const categories = await readStoreCategories();
  const byId = new Map(categories.map((row) => [row.id, { ...row }]));

  for (const item of items) {
    const current = byId.get(item.id);
    if (!current) continue;
    const parentId = item.parentId ?? null;
    if (!validateParent([...byId.values()], item.id, parentId)) {
      throw new Error('Orden inválido: referencia circular');
    }
    current.parentId = parentId;
    current.sortOrder = Number(item.sortOrder ?? 0);
    byId.set(item.id, current);
  }

  const next = [...byId.values()];
  await writeStoreCategories(next);
  return next;
}

function findCategoryForLabel(categories, label) {
  const norm = normalizeInventoryCategory(label);
  return categories.find((row) =>
    (row.inventoryLabels ?? []).some((entry) => normalizeInventoryCategory(entry) === norm),
  );
}

export async function syncCategoriesFromInventory() {
  let categories = await readStoreCategories();
  const { products } = await readInventory();
  const inventoryCategories = new Map();

  for (const product of products) {
    const label = product.category?.trim();
    if (!label) continue;
    inventoryCategories.set(label, (inventoryCategories.get(label) ?? 0) + 1);
  }

  for (const [label, count] of inventoryCategories) {
    if (count <= 0) continue;
    const existing = findCategoryForLabel(categories, label);
    if (existing) {
      const labels = new Set(existing.inventoryLabels ?? []);
      labels.add(label);
      existing.inventoryLabels = [...labels];
      continue;
    }

    const parentGuess = categories.find((row) => {
      if (!row.parentId) {
        return label.toLowerCase().includes(row.name.toLowerCase().slice(0, 4));
      }
      return false;
    });

    categories.push(
      normalizeCategory({
        name: label,
        slug: slugify(label),
        parentId: parentGuess?.id ?? null,
        sortOrder: categories.filter((row) => row.parentId === (parentGuess?.id ?? null)).length,
        inventoryLabels: [label],
      }),
    );
  }

  for (const seed of seedProducts) {
    const label = seed.category?.trim();
    if (!label || findCategoryForLabel(categories, label)) continue;
    categories.push(
      normalizeCategory({
        name: label,
        slug: slugify(label),
        parentId: null,
        sortOrder: categories.filter((row) => !row.parentId).length,
        inventoryLabels: [label],
      }),
    );
  }

  await writeStoreCategories(categories);
  return readStoreCategoriesTree();
}
