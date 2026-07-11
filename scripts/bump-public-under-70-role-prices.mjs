/**
 * Suma USD a todos los precios de venta cuando el precio público es < umbral.
 * Escribe en src/data/inventory-catalog.json (canónico) y server/data/inventory.json.
 * No toca compra (purchase_price_usd ni proveedores).
 *
 * Uso:
 *   node scripts/bump-public-under-70-role-prices.mjs
 *   node scripts/bump-public-under-70-role-prices.mjs --dry-run
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { readInventory, writeInventory } from '../server/lib/inventory-store.js';
import { getCompanySettingsPath } from '../server/lib/server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src', 'data', 'inventory-catalog.json');

const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'];
const LEGACY_PRICE_KEYS = ['corporativo', 'vip', 'sale'];

function parseNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function roundPenCharm99(pen) {
  if (!Number.isFinite(pen) || pen <= 0) return 0;
  const centavos = Math.round(pen * 100);
  const quotient = Math.floor(centavos / 10);
  const candidates = [
    (quotient - 1) * 10 + 9,
    quotient * 10 + 9,
    (quotient + 1) * 10 + 9,
  ].filter((value) => value >= 9);
  let best = candidates[0] ?? 9;
  let bestDistance = Math.abs(centavos - best);
  for (const candidate of candidates) {
    const distance = Math.abs(centavos - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best / 100;
}

function usdToPenCharm(usd, exchangeRate) {
  if (!Number.isFinite(usd) || usd <= 0 || exchangeRate <= 0) return 0;
  return roundPenCharm99(usd * exchangeRate);
}

async function loadExchangeRate() {
  try {
    const raw = await fs.readFile(getCompanySettingsPath(), 'utf8');
    const rate = parseNumber(JSON.parse(raw).usdToPenExchangeRate, 3.45);
    return rate > 0 ? rate : 3.45;
  } catch {
    return 3.45;
  }
}

function getPublicUsd(product, exchangeRate) {
  const prices = product?.prices ?? {};
  const rawPublic = Number(prices.public ?? product.price ?? 0);
  if (!Number.isFinite(rawPublic) || rawPublic <= 0) return null;

  const currency = String(product.currency ?? 'USD').trim().toUpperCase();
  if (currency === 'PEN') {
    return Math.round((rawPublic / exchangeRate) * 100) / 100;
  }
  return rawPublic;
}

function bumpUsd(value, bumpAmount) {
  const num = Number(value);
  if (!Number.isFinite(num)) return { value: num, changed: false };
  const next = Math.max(0, Math.round((num + bumpAmount) * 100) / 100);
  return { value: next, changed: next !== num };
}

function bumpSaleRolePrices(prices, bumpAmount) {
  if (!prices || typeof prices !== 'object') return { prices, changed: false };

  const next = { ...prices };
  let changed = false;

  for (const key of [...PRICE_ROLES, ...LEGACY_PRICE_KEYS]) {
    if (!(key in next)) continue;
    const result = bumpUsd(next[key], bumpAmount);
    if (result.changed) {
      next[key] = result.value;
      changed = true;
    }
  }

  return { prices: next, changed };
}

function bumpVolumeRolePrices(volumeTiers, bumpAmount) {
  if (!Array.isArray(volumeTiers) || volumeTiers.length === 0) {
    return { volumeTiers, changed: false };
  }

  let changed = false;
  const next = volumeTiers.map((tier) => {
    if (!tier || typeof tier !== 'object') return tier;
    const roleResult = bumpSaleRolePrices(tier.prices, bumpAmount);
    if (!roleResult.changed) return tier;
    changed = true;
    return { ...tier, prices: roleResult.prices };
  });

  return { volumeTiers: next, changed };
}

function applyBumpToProduct(product, bumpAmount, maxPublicUsd, exchangeRate) {
  const publicUsd = getPublicUsd(product, exchangeRate);
  if (publicUsd == null || publicUsd >= maxPublicUsd) {
    return { product, changed: false, publicUsd };
  }

  const copy = { ...product };
  let changed = false;

  const roleResult = bumpSaleRolePrices(copy.prices, bumpAmount);
  if (roleResult.changed) {
    copy.prices = roleResult.prices;
    changed = true;
  }

  const volumeResult = bumpVolumeRolePrices(copy.volume_role_prices, bumpAmount);
  if (volumeResult.changed) {
    copy.volume_role_prices = volumeResult.volumeTiers;
    changed = true;
  }

  const publicPrice = Number(copy.prices?.public ?? copy.price ?? 0);
  if (Number.isFinite(publicPrice) && publicPrice > 0) {
    const nextPrice = publicPrice;
    if (copy.price !== nextPrice) {
      copy.price = nextPrice;
      changed = true;
    }
  }

  return { product: copy, changed, publicUsd };
}

function snapshotProduct(product, exchangeRate) {
  const prices = product?.prices ?? {};
  const publicUsd = Number(prices.public ?? product.price ?? 0);
  return {
    id: product.id,
    code: product.code ?? '',
    name: String(product.name ?? '').slice(0, 80),
    purchase: Number(product.purchase_price_usd ?? 0),
    prices: {
      public: Number(prices.public ?? 0),
      tecnico: Number(prices.tecnico ?? 0),
      mayorista: Number(prices.mayorista ?? 0),
      distribuidor: Number(prices.distribuidor ?? 0),
    },
    penPublic: usdToPenCharm(publicUsd, exchangeRate),
  };
}

async function main() {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    if (raw === '--dry-run') continue;
    const [key, val] = raw.split('=');
    if (key && val != null) args.set(key.replace(/^--/, ''), val);
  }

  const bumpAmount = parseNumber(args.get('bumpUsd'), 9.9);
  const maxPublicUsd = parseNumber(args.get('maxPublicUsd'), 70);
  const dryRun = process.argv.includes('--dry-run');

  const exchangeRate = await loadExchangeRate();
  const { products: inventoryProducts, deletedProductIds, warehouses } = await readInventory();
  const catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  const catalogProducts = catalog.products ?? [];

  const updatedById = new Map();
  const examples = [];

  const nextInventoryProducts = inventoryProducts.map((product) => {
    const before = snapshotProduct(product, exchangeRate);
    const { product: next, changed, publicUsd } = applyBumpToProduct(
      product,
      bumpAmount,
      maxPublicUsd,
      exchangeRate,
    );
    if (!changed) return product;

    updatedById.set(product.id, next);
    if (examples.length < 5) {
      examples.push({
        before,
        after: snapshotProduct(next, exchangeRate),
        publicUsd,
      });
    }
    return next;
  });

  const nextCatalogProducts = catalogProducts.map((product) => {
    const bumped = updatedById.get(product.id);
    if (bumped) return bumped;

    const { product: next, changed } = applyBumpToProduct(
      product,
      bumpAmount,
      maxPublicUsd,
      exchangeRate,
    );
    return changed ? next : product;
  });

  const catalogUpdated = nextCatalogProducts.filter((product, index) => {
    return JSON.stringify(product) !== JSON.stringify(catalogProducts[index]);
  }).length;

  console.log(`Inventario servidor: ${inventoryProducts.length} productos`);
  console.log(`Catálogo versionado: ${catalogProducts.length} productos`);
  console.log(`TC venta (company-settings): ${exchangeRate}`);
  console.log(
    `Criterio: precio público < $${maxPublicUsd} USD | Incremento: +$${bumpAmount} en roles de venta (sin compra)`,
  );
  console.log(`Productos actualizados (inventario): ${updatedById.size}`);
  console.log(`Productos actualizados (catálogo): ${catalogUpdated}`);

  if (examples.length > 0) {
    console.log('\nEjemplos before/after:');
    for (const row of examples.slice(0, 3)) {
      console.log(`\n• ${row.before.code || row.before.id} — ${row.before.name}`);
      console.log(`  Público USD: $${row.before.prices.public} → $${row.after.prices.public}`);
      console.log(`  Técnico USD: $${row.before.prices.tecnico} → $${row.after.prices.tecnico}`);
      console.log(
        `  PEN público (usdToPenCharm): S/ ${row.before.penPublic} → S/ ${row.after.penPublic}`,
      );
      console.log(`  Compra USD (sin cambio): $${row.before.purchase}`);
    }
  }

  if (dryRun) {
    console.log('\n(dry-run: no se escribieron archivos)');
    return;
  }

  await fs.writeFile(
    catalogPath,
    `${JSON.stringify({ ...catalog, products: nextCatalogProducts }, null, 2)}\n`,
    'utf8',
  );
  console.log(`\n✓ Catálogo escrito en ${catalogPath}`);

  await writeInventory(
    {
      products: nextInventoryProducts,
      deletedProductIds,
      warehouses,
    },
    { syncProductIds: [...updatedById.keys()] },
  );
  console.log('✓ Inventario servidor actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
