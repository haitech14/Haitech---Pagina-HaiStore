import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

import { seedProducts } from './seed-products.js';
import { ensureFullPrices, resolvePriceRole } from './roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INVENTORY_PATH = path.join(__dirname, '../data/inventory.json');

async function ensureInventoryFile() {
  try {
    await fs.access(INVENTORY_PATH);
  } catch {
    await fs.mkdir(path.dirname(INVENTORY_PATH), { recursive: true });
    await fs.writeFile(INVENTORY_PATH, JSON.stringify({ products: seedProducts }, null, 2));
  }
}

function migrateProductPrices(product) {
  return {
    ...product,
    prices: ensureFullPrices(product.prices ?? { public: product.price ?? 0 }),
  };
}

export async function readInventory() {
  await ensureInventoryFile();
  const raw = await fs.readFile(INVENTORY_PATH, 'utf-8');
  const data = JSON.parse(raw);
  data.products = (data.products ?? []).map(migrateProductPrices);
  return data;
}

export async function writeInventory(data) {
  const normalized = {
    products: (data.products ?? []).map((product) => ({
      ...product,
      prices: ensureFullPrices(product.prices),
    })),
  };
  await fs.mkdir(path.dirname(INVENTORY_PATH), { recursive: true });
  await fs.writeFile(INVENTORY_PATH, JSON.stringify(normalized, null, 2));
}

export { resolvePriceRole };

export function getEffectivePrice(product, role) {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices ?? { public: product.price ?? 0 });
  return prices[priceRole] ?? prices.public ?? 0;
}

export function toPublicProduct(product, role) {
  const priceRole = resolvePriceRole(role);
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    price: getEffectivePrice(product, role),
    currency: product.currency ?? 'USD',
    image_url: product.image_url ?? null,
    stock: product.stock ?? 0,
    category: product.category ?? null,
    brand: product.brand ?? null,
    created_at: product.created_at,
    price_role: priceRole,
  };
}

export function normalizeProductInput(body, existing) {
  const basePublic = Number(
    body.prices?.public ?? body.price ?? existing?.prices?.public ?? 0,
  );
  const prices = ensureFullPrices({
    public: basePublic,
    corporativo: body.prices?.corporativo ?? existing?.prices?.corporativo,
    tecnico: body.prices?.tecnico ?? existing?.prices?.tecnico,
    mayorista: body.prices?.mayorista ?? existing?.prices?.mayorista,
    distribuidor: body.prices?.distribuidor ?? existing?.prices?.distribuidor,
    vip: body.prices?.vip ?? existing?.prices?.vip,
  });

  return {
    id: existing?.id ?? body.id ?? randomUUID(),
    name: String(body.name ?? existing?.name ?? '').trim(),
    description: body.description ?? existing?.description ?? null,
    currency: body.currency ?? existing?.currency ?? 'USD',
    stock: Number(body.stock ?? existing?.stock ?? 0),
    category: body.category ?? existing?.category ?? null,
    brand: body.brand ?? existing?.brand ?? null,
    image_url: body.image_url ?? existing?.image_url ?? null,
    created_at: existing?.created_at ?? new Date().toISOString(),
    prices,
  };
}
