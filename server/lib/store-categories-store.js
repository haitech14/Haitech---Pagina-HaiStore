import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { readInventory } from './inventory-store.js';
import { seedProducts } from './seed-products.js';

import { getStoreCategoriesPath } from './server-paths.js';

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
    inventoryLabels: ['Multifuncionales'],
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
    name: 'Toner y Suministros',
    slug: 'toner-suministros',
    parentId: null,
    sortOrder: 2,
    inventoryLabels: ['Toner y suministros', 'Tóner y Suministros'],
    image: '/categories/toner-suministros.png',
    tagline: 'Consumibles originales y compatibles',
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
  } catch {
    await fs.mkdir(path.dirname(categoriesPath()), { recursive: true });
    await fs.writeFile(
      categoriesPath(),
      JSON.stringify({ categories: DEFAULT_CATEGORIES }, null, 2),
    );
  }
}

export async function readStoreCategories() {
  await ensureCategoriesFile();
  const raw = await fs.readFile(categoriesPath(), 'utf-8');
  const data = JSON.parse(raw);
  return (data.categories ?? []).map((row) => normalizeCategory(row));
}

export async function writeStoreCategories(categories) {
  const normalized = categories.map((row) => normalizeCategory(row));
  await fs.mkdir(path.dirname(categoriesPath()), { recursive: true });
  await fs.writeFile(categoriesPath(), JSON.stringify({ categories: normalized }, null, 2));
  return normalized;
}

function normalizeInventoryCategory(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function productMatchesLabels(productCategory, labels) {
  const norm = normalizeInventoryCategory(productCategory);
  return labels.some((label) => normalizeInventoryCategory(label) === norm);
}

function countProductsForCategory(category, products, allCategories) {
  const labels = new Set(category.inventoryLabels ?? []);
  const childIds = allCategories.filter((row) => row.parentId === category.id).map((row) => row.id);

  const collectLabels = (id) => {
    const node = allCategories.find((row) => row.id === id);
    if (!node) return;
    for (const label of node.inventoryLabels ?? []) labels.add(label);
    for (const child of allCategories.filter((row) => row.parentId === id)) {
      collectLabels(child.id);
    }
  };

  for (const childId of childIds) collectLabels(childId);

  return products.filter((product) => productMatchesLabels(product.category, [...labels])).length;
}

function buildTree(categories, products) {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const byParent = new Map();

  for (const category of sorted) {
    const key = category.parentId ?? 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push({
      ...category,
      productCount: countProductsForCategory(category, products, sorted),
    });
  }

  const attachChildren = (parentId) => {
    const list = byParent.get(parentId ?? 'root') ?? [];
    return list.map((node) => ({
      ...node,
      children: attachChildren(node.id),
    }));
  };

  return attachChildren(null);
}

export async function readStoreCategoriesTree() {
  const categories = await readStoreCategories();
  const { products } = await readInventory();
  return buildTree(categories, products);
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
