import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const INVENTORY_INDEX_SNAPSHOT_VERSION = 1;
export const INVENTORY_INDEX_SNAPSHOT_PUBLIC_PATH = '/catalog/inventory-index.json';

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
  'created_at',
  'compare_at_price_usd',
  'is_new',
  'view_count',
  'is_featured',
  'status',
];

export function getInventoryIndexSnapshotPath() {
  if (process.env.HAISTORE_INVENTORY_INDEX_SNAPSHOT_PATH) {
    return process.env.HAISTORE_INVENTORY_INDEX_SNAPSHOT_PATH;
  }
  return path.join(__dirname, '../../public/catalog/inventory-index.json');
}

function slimProduct(raw) {
  const row = {};
  for (const field of SLIM_FIELDS) {
    if (raw[field] !== undefined) row[field] = raw[field];
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
