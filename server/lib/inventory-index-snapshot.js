import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const INVENTORY_INDEX_SNAPSHOT_VERSION = 1;
export const INVENTORY_INDEX_SNAPSHOT_PUBLIC_PATH = '/catalog/inventory-index.json';

/** Campos de listado storefront. Sin created_at/view_count (detalle vía API). */
const SLIM_FIELDS = [
  'id',
  'slug',
  'name',
  'code',
  'description',
  'price',
  'prices',
  'currency',
  'image_url',
  'gallery',
  'stock',
  'category',
  'brand',
  'attributes',
  'sort_order',
  'compare_at_price_usd',
  'is_new',
  'is_featured',
  'status',
];

/** Búsqueda client-side: texto útil sin arrastrar descripciones largas. */
const DESCRIPTION_MAX_CHARS = 160;
/** Hover de tarjeta: bastan 2 URLs; el grid usa image_url. */
const GALLERY_MAX_URLS = 2;
/** Atributos admin / ruido que no alimentan facetas storefront. */
const ATTR_NAMES_OMIT = new Set(['proveedor', 'traducción', 'traduccion']);

export function getInventoryIndexSnapshotPath() {
  if (process.env.HAISTORE_INVENTORY_INDEX_SNAPSHOT_PATH) {
    return process.env.HAISTORE_INVENTORY_INDEX_SNAPSHOT_PATH;
  }
  return path.join(__dirname, '../../public/catalog/inventory-index.json');
}

function truncateDescription(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed.length <= DESCRIPTION_MAX_CHARS) return trimmed;
  return `${trimmed.slice(0, DESCRIPTION_MAX_CHARS).trimEnd()}…`;
}

function slimGallery(value) {
  if (!Array.isArray(value)) return value;
  const urls = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const url = item.trim();
    if (!url) continue;
    urls.push(url);
    if (urls.length >= GALLERY_MAX_URLS) break;
  }
  return urls;
}

function normalizeAttrNameKey(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Solo { name, value } para filtros/cards; sin UUID id ni attrs admin. */
function slimAttributes(value) {
  if (!Array.isArray(value)) return value;
  const out = [];
  for (const attr of value) {
    if (!attr || typeof attr !== 'object') continue;
    const name = typeof attr.name === 'string' ? attr.name.trim() : '';
    const attrValue = typeof attr.value === 'string' ? attr.value.trim() : attr.value;
    if (!name) continue;
    if (ATTR_NAMES_OMIT.has(normalizeAttrNameKey(name))) continue;
    if (attrValue == null || attrValue === '') continue;
    out.push({ name, value: attrValue });
  }
  return out;
}

function slimProduct(raw) {
  const row = {};
  for (const field of SLIM_FIELDS) {
    if (raw[field] === undefined) continue;
    if (field === 'description') {
      row[field] = truncateDescription(raw[field]);
      continue;
    }
    if (field === 'gallery') {
      row[field] = slimGallery(raw[field]);
      continue;
    }
    if (field === 'attributes') {
      row[field] = slimAttributes(raw[field]);
      continue;
    }
    row[field] = raw[field];
  }
  return row;
}

/**
 * Escribe snapshot slim del inventario para el cliente (Vite/CDN).
 * @param {unknown[]} products
 */
export async function writeInventoryIndexSnapshot(products, meta = {}) {
  const filePath = getInventoryIndexSnapshotPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const payload = {
    version: INVENTORY_INDEX_SNAPSHOT_VERSION,
    generatedAt: new Date().toISOString(),
    products: products.map(slimProduct),
    ...meta,
  };

  const body = `${JSON.stringify(payload)}\n`;
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, body, 'utf8');
  try {
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EEXIST')) {
      try {
        await fs.copyFile(tmpPath, filePath);
        await fs.unlink(tmpPath).catch(() => {});
      } catch {
        await fs.unlink(tmpPath).catch(() => {});
        await fs.writeFile(filePath, body, 'utf8');
      }
    } else {
      await fs.unlink(tmpPath).catch(() => {});
      await fs.writeFile(filePath, body, 'utf8');
    }
  }

  return { filePath, productCount: payload.products.length };
}

/**
 * @param {unknown[]} products
 */
export async function regenerateInventoryIndexSnapshotFromProducts(products) {
  return writeInventoryIndexSnapshot(products);
}

export async function regenerateInventoryIndexSnapshotQuiet(products) {
  if (!Array.isArray(products) || products.length === 0) return null;
  try {
    return await regenerateInventoryIndexSnapshotFromProducts(products);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[inventory-index-snapshot] no se pudo regenerar:', message);
    return null;
  }
}
