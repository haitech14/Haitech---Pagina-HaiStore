/**
 * Compara equipos en producción vs inventory-catalog.json (fallback estático).
 * Uso: node scripts/audit-production-catalog-gap.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CATEGORY_INVENTORY_LABELS,
  SUBCATEGORY_INVENTORY_LABELS,
} from '../shared/category-inventory-labels.js';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '../shared/inventory-product-name.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const apiBase = process.env.HAITECH_CATALOG_SYNC_URL ?? 'https://www.haitech.pe';
const jsonOut = process.argv.includes('--json');

const ACCESSORY_RE =
  /\b(cable|papel|banner|adaptador|caja de dinero|mantenimiento box|termica usb|etiquetas|cartridge|toner|tinta|cartucho|tóner|ribbon)\b/i;

const MULTIFUNCTIONAL_RE = /\b(multifuncional|multif\.?|mfp)\b/i;

function isStorefrontEquipment(product) {
  const name = String(product?.name ?? '');
  if (!/impresora/i.test(name) && !MULTIFUNCTIONAL_RE.test(name)) return false;
  if (ACCESSORY_RE.test(name)) return false;
  if (/termica|térmica|sublimaci/i.test(name)) return false;
  return true;
}

function isImpresoraLaserEquipment(product) {
  const name = String(product?.name ?? '');
  const cat = String(product?.category ?? '').toLowerCase();
  if (MULTIFUNCTIONAL_RE.test(name)) return false;
  if (!/impresora/i.test(name) && !cat.includes('impresoras laser') && !cat.includes('impresoras láser')) {
    return false;
  }
  if (ACCESSORY_RE.test(name)) return false;
  if (/termica|térmica|sublimaci/i.test(name)) return false;
  return /ricoh/i.test(name) || cat.includes('impresoras laser') || cat.includes('impresoras láser');
}

function bucketProduct(product) {
  if (productQualifiesAsSeminuevaEquipment(product) && isStorefrontEquipment(product)) {
    if (isImpresoraLaserEquipment(product)) return 'impresoras-laser-seminuevas';
    return 'multifuncionales-seminuevas';
  }
  if (productQualifiesAsNuevaEquipment(product) && isImpresoraLaserEquipment(product)) {
    return 'impresoras-laser-nuevas';
  }
  if (productQualifiesAsNuevaEquipment(product) && /multifuncional/i.test(product.name ?? '')) {
    return 'multifuncionales-nuevas';
  }
  if (/^Impresoras/i.test(String(product.category ?? '')) && isStorefrontEquipment(product)) {
    return 'impresoras-otras';
  }
  return null;
}

function severityFor(issueTypes) {
  if (issueTypes.includes('missing_from_static_catalog')) return 'alta';
  if (issueTypes.includes('no_slug_anywhere')) return 'media';
  if (issueTypes.includes('local_missing_slug')) return 'media';
  if (issueTypes.includes('category_mismatch')) return 'baja';
  return 'baja';
}

async function fetchProductionProducts() {
  const response = await fetch(`${apiBase}/api/products`);
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data : data.products ?? [];
}

function loadLocalCatalog() {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  return new Map((data.products ?? []).map((p) => [p.id, p]));
}

async function main() {
  const [prodList, localMap] = await Promise.all([fetchProductionProducts(), loadLocalCatalog()]);

  const relevantLabels = new Set([
    ...CATEGORY_INVENTORY_LABELS.multifuncionales,
    ...CATEGORY_INVENTORY_LABELS.impresoras,
    ...SUBCATEGORY_INVENTORY_LABELS['multifuncionales-seminuevas'],
    ...SUBCATEGORY_INVENTORY_LABELS['impresoras-laser-seminuevas'],
    ...SUBCATEGORY_INVENTORY_LABELS['multifuncionales-nuevas'],
    ...SUBCATEGORY_INVENTORY_LABELS['impresoras-laser-nuevas'],
  ]);

  const report = [];
  for (const product of prodList) {
    const bucket = bucketProduct(product);
    const cat = String(product.category ?? '');
    const inScope =
      bucket != null ||
      relevantLabels.has(cat) ||
      (/impresora|multifuncional/i.test(product.name ?? '') && /ricoh|canon|xerox|hp|brother/i.test(product.name ?? ''));

    if (!inScope || !isStorefrontEquipment(product)) continue;

    const local = localMap.get(product.id);
    const issues = [];
    if (!local) issues.push('missing_from_static_catalog');
    else {
      if (!local.slug && !product.slug) issues.push('no_slug_anywhere');
      else if (!local.slug && product.slug) issues.push('local_missing_slug');
      if (local.category !== product.category) issues.push('category_mismatch');
      if (!local.image_url && product.image_url) issues.push('local_missing_image');
    }

    if (issues.length === 0) continue;

    report.push({
      id: product.id,
      name: product.name,
      category: product.category,
      bucket: bucket ?? 'otros',
      issueTypes: issues,
      severity: severityFor(issues),
      inLocalInventory: local != null,
    });
  }

  report.sort(
    (a, b) =>
      (a.severity === 'alta' ? 0 : a.severity === 'media' ? 1 : 2) -
        (b.severity === 'alta' ? 0 : b.severity === 'media' ? 1 : 2) ||
      a.bucket.localeCompare(b.bucket, 'es') ||
      a.name.localeCompare(b.name, 'es'),
  );

  if (jsonOut) {
    console.log(JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2));
    return;
  }

  const byBucket = {};
  for (const row of report) {
    byBucket[row.bucket] = (byBucket[row.bucket] ?? 0) + 1;
  }

  console.log('Auditoría producción vs inventory-catalog.json\n');
  console.log(`Producción: ${prodList.length} productos | Estático: ${localMap.size}`);
  console.log(`Brechas detectadas: ${report.length}`);
  for (const [bucket, count] of Object.entries(byBucket).sort()) {
    console.log(`  · ${bucket}: ${count}`);
  }

  console.log('\nAlta severidad (falta en catálogo estático):');
  for (const row of report.filter((r) => r.severity === 'alta').slice(0, 30)) {
    console.log(`  [${row.bucket}] ${row.id} | ${row.name.slice(0, 60)}`);
  }
  const altaRest = report.filter((r) => r.severity === 'alta').length - 30;
  if (altaRest > 0) console.log(`  … y ${altaRest} más`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
