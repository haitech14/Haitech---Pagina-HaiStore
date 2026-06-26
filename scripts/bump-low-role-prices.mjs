/**
 * Suma USD a precios por rol menores a un umbral (sin tocar compra ni proveedores).
 *
 * Uso:
 *   node scripts/bump-low-role-prices.mjs
 *   node scripts/bump-low-role-prices.mjs --dry-run
 *   node scripts/bump-low-role-prices.mjs --bumpUsd=8 --maxUsd=50
 */
import { readInventory, writeInventory } from '../server/lib/inventory-store.js';

const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'];
const LEGACY_PRICE_KEYS = ['corporativo', 'vip'];

function parseNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function bumpIfBelowThreshold(value, bumpUsd, maxUsd) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0 || num >= maxUsd) return { value: num, changed: false };
  return { value: Math.round((num + bumpUsd) * 100) / 100, changed: true };
}

function bumpRolePriceObject(prices, bumpUsd, maxUsd) {
  if (!prices || typeof prices !== 'object') return { prices, changed: false };

  const next = { ...prices };
  let changed = false;

  for (const key of [...PRICE_ROLES, ...LEGACY_PRICE_KEYS]) {
    if (!(key in next)) continue;
    const result = bumpIfBelowThreshold(next[key], bumpUsd, maxUsd);
    if (result.changed) {
      next[key] = result.value;
      changed = true;
    }
  }

  return { prices: next, changed };
}

function bumpVolumeRolePrices(volumeTiers, bumpUsd, maxUsd) {
  if (!Array.isArray(volumeTiers) || volumeTiers.length === 0) {
    return { volumeTiers, changed: false };
  }

  let changed = false;
  const next = volumeTiers.map((tier) => {
    if (!tier || typeof tier !== 'object') return tier;
    const { prices, changed: tierChanged } = bumpRolePriceObject(tier.prices, bumpUsd, maxUsd);
    if (!tierChanged) return tier;
    changed = true;
    return { ...tier, prices };
  });

  return { volumeTiers: next, changed };
}

async function main() {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    if (raw === '--dry-run') continue;
    const [key, val] = raw.split('=');
    if (key && val != null) args.set(key.replace(/^--/, ''), val);
  }

  const bumpUsd = parseNumber(args.get('bumpUsd'), 8);
  const maxUsd = parseNumber(args.get('maxUsd'), 50);
  const dryRun = process.argv.includes('--dry-run');

  const { products, deletedProductIds, warehouses } = await readInventory();

  let productsUpdated = 0;
  let rolePricesBumped = 0;
  let volumeTiersBumped = 0;
  const updatedIds = [];

  const nextProducts = products.map((product) => {
    if (!product?.id) return product;

    const copy = { ...product };
    let changed = false;

    const roleResult = bumpRolePriceObject(copy.prices, bumpUsd, maxUsd);
    if (roleResult.changed) {
      copy.prices = roleResult.prices;
      changed = true;
      rolePricesBumped += 1;
    }

    const volumeResult = bumpVolumeRolePrices(copy.volume_role_prices, bumpUsd, maxUsd);
    if (volumeResult.changed) {
      copy.volume_role_prices = volumeResult.volumeTiers;
      changed = true;
      volumeTiersBumped += 1;
    }

    if (changed) {
      const publicPrice = Number(copy.prices?.public ?? copy.price ?? 0);
      if (Number.isFinite(publicPrice) && publicPrice > 0) {
        copy.price = publicPrice;
      }
      productsUpdated += 1;
      updatedIds.push(copy.id);
    }

    return copy;
  });

  console.log(`Productos en inventario: ${products.length}`);
  console.log(
    `Umbral: precios de rol > 0 y < $${maxUsd} | Incremento: +$${bumpUsd} (sin compra/proveedores)`,
  );
  console.log(`Productos actualizados: ${productsUpdated}`);
  console.log(`  · Con precios por rol ajustados: ${rolePricesBumped}`);
  console.log(`  · Con tramos por volumen ajustados: ${volumeTiersBumped}`);

  if (dryRun) {
    console.log('\n(dry-run: no se escribió inventario)');
    return;
  }

  await writeInventory(
    {
      products: nextProducts,
      deletedProductIds,
      warehouses,
    },
    { syncProductIds: updatedIds },
  );

  console.log('\nInventario actualizado.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
