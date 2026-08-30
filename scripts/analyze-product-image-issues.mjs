/**
 * Audita imágenes del catálogo: sin foto, prestada, archivo faltante, duplicada, recorte raro.
 *
 * Uso:
 *   node scripts/analyze-product-image-issues.mjs
 *   node scripts/analyze-product-image-issues.mjs --csv
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { sanitizeStoredProductMedia } from '../shared/product-media-sanitize.js';
import { ownedProductMediaStems } from '../shared/product-media-filename.js';
import { DUPLICATE_MAIN_PRODUCT_IDS } from '../shared/product-media-duplicate-main-ids.js';
import {
  resolveProductCategoryStockImage,
  resolveProductModelStockImage,
} from '../shared/product-stock-images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'src/data/inventory-catalog.json');
const productsDir = path.join(root, 'public/products');
const jsonOut = path.join(root, 'data/product-image-issues-report.json');
const csvOut = path.join(root, 'data/product-image-issues-report.csv');

const writeCsv = process.argv.includes('--csv') || process.argv.includes('--all');

function pathnameOf(url) {
  return String(url ?? '').split('?')[0].split('#')[0];
}

function stemFromUrl(url) {
  const match = pathnameOf(url).match(/^\/products\/(.+)\.webp$/i);
  return match ? match[1].toLowerCase() : null;
}

function isCategoryPlaceholder(url) {
  const p = pathnameOf(url);
  return (
    p.startsWith('/categories/') ||
    p.startsWith('/promotions/') ||
    p.startsWith('/promo-cards/')
  );
}

function isBorrowedImage(product, url) {
  const p = pathnameOf(url);
  if (!p.startsWith('/products/')) return false;
  const stem = stemFromUrl(url);
  if (!stem) return false;
  const owned = ownedProductMediaStems(product);
  if (owned.has(stem)) return false;
  for (const own of owned) {
    if (!own) continue;
    if (stem.startsWith(`${own}-`) || stem.endsWith(`-${own}`) || stem.includes(`-${own}-`)) {
      return false;
    }
  }
  return true;
}

function localFileExists(url) {
  const p = pathnameOf(url);
  if (!p.startsWith('/products/')) return null;
  return fs.existsSync(path.join(productsDir, path.basename(p)));
}

function hashFile(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

async function readAspect(url) {
  const p = pathnameOf(url);
  if (!p.startsWith('/products/')) return null;
  const absolute = path.join(productsDir, path.basename(p));
  if (!fs.existsSync(absolute)) return null;
  try {
    const meta = await sharp(absolute).metadata();
    if (!meta.width || !meta.height) return null;
    return {
      width: meta.width,
      height: meta.height,
      ratio: meta.width / meta.height,
    };
  } catch {
    return null;
  }
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const products = Array.isArray(catalog.products) ? catalog.products : [];

  /** @type {Map<string, { hash: string, productIds: string[] }>} */
  const hashGroups = new Map();

  /** @type {Array<Record<string, unknown>>} */
  const rows = [];

  for (const product of products) {
    const sanitized = sanitizeStoredProductMedia(product);
    const issues = [];
    const rawUrl = typeof product.image_url === 'string' ? product.image_url.trim() : null;
    const displayUrl = sanitized.image_url ?? rawUrl;

    if (!displayUrl) {
      issues.push('sin_imagen');
    } else {
      if (isCategoryPlaceholder(displayUrl)) issues.push('placeholder_categoria');
      if (isBorrowedImage(product, displayUrl)) issues.push('imagen_prestada');
      if (DUPLICATE_MAIN_PRODUCT_IDS.has(product.id)) issues.push('duplicada_blocklist');
      if (displayUrl.startsWith('/products/') && !localFileExists(displayUrl)) {
        issues.push('archivo_faltante');
      }

      const modelStock = resolveProductModelStockImage(product);
      const catStock = resolveProductCategoryStockImage(product);
      if (modelStock && pathnameOf(displayUrl) === modelStock) issues.push('stock_modelo');
      if (catStock && pathnameOf(displayUrl) === catStock) issues.push('stock_categoria');

      const aspect = await readAspect(displayUrl);
      if (aspect) {
        if (aspect.ratio < 0.45 || aspect.ratio > 2.4) issues.push('aspecto_inusual');
        if (Math.min(aspect.width, aspect.height) < 120) issues.push('muy_pequena');
      }

      const fileOk = localFileExists(displayUrl);
      if (fileOk) {
        const hash = hashFile(path.join(productsDir, path.basename(pathnameOf(displayUrl))));
        if (!hashGroups.has(hash)) hashGroups.set(hash, { hash, productIds: [] });
        hashGroups.get(hash).productIds.push(product.id);
      }
    }

    if (issues.length === 0) continue;

    rows.push({
      id: product.id,
      code: product.code ?? '',
      name: product.name ?? '',
      category: product.category ?? '',
      brand: product.brand ?? '',
      image_url: displayUrl ?? '',
      image_stem: displayUrl ? stemFromUrl(displayUrl) ?? '' : '',
      issues: issues.join('|'),
      borrowed_from: isBorrowedImage(product, displayUrl ?? '') ? stemFromUrl(displayUrl) : '',
    });
  }

  for (const row of rows) {
    if (!row.image_url) continue;
    const p = pathnameOf(row.image_url);
    if (!p.startsWith('/products/')) continue;
    const absolute = path.join(productsDir, path.basename(p));
    if (!fs.existsSync(absolute)) continue;
    const hash = hashFile(absolute);
    const group = hashGroups.get(hash);
    if (group && group.productIds.length > 1 && !String(row.issues).includes('duplicada')) {
      row.issues = `${row.issues}|mismo_archivo_que_otros`;
      row.shared_with_count = group.productIds.length;
    }
  }

  const summary = {
    totalProducts: products.length,
    withIssues: rows.length,
    byIssue: {},
  };

  for (const row of rows) {
    for (const issue of String(row.issues).split('|')) {
      summary.byIssue[issue] = (summary.byIssue[issue] ?? 0) + 1;
    }
  }

  fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
  fs.writeFileSync(
    jsonOut,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2)}\n`,
    'utf8',
  );

  if (writeCsv) {
    const header = [
      'id',
      'code',
      'name',
      'category',
      'brand',
      'image_url',
      'image_stem',
      'issues',
      'borrowed_from',
      'shared_with_count',
    ];
    const lines = [
      header.join(','),
      ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(',')),
    ];
    fs.writeFileSync(csvOut, `${lines.join('\n')}\n`, 'utf8');
  }

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nJSON: ${path.relative(root, jsonOut)}`);
  if (writeCsv) console.log(`CSV:  ${path.relative(root, csvOut)}`);

  const borrowed = rows.filter((row) => String(row.issues).includes('imagen_prestada'));
  if (borrowed.length > 0) {
    console.log(`\n--- Imagen prestada (${borrowed.length}) ---`);
    for (const row of borrowed.slice(0, 25)) {
      console.log(`${row.code || row.id} | ${row.name}`);
      console.log(`  → ${row.image_url}`);
    }
    if (borrowed.length > 25) console.log(`  … y ${borrowed.length - 25} más`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
