/**
 * Genera sitemap.xml (índice) + sitemaps parciales en public/.
 * Parte productos en bloques de 2.500; el índice se usa siempre para escalar
 * por encima de 5.000 URLs sin cambiar robots.txt.
 */
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory } from '../server/lib/inventory-store.js';
import { resolveSiteOrigin } from '../shared/site-origin.js';
import { buildProductPath } from '../shared/product-slug.js';
import { collectCategoryTreeUrls } from '../shared/seo/category-tree-urls.js';
import { LANDING_CATEGORY_SEO } from '../shared/seo/landing-categories.js';
import { SERVICE_SEO_ROUTES } from '../shared/seo/service-routes.js';
import { STATIC_SEO_ROUTES } from '../shared/seo/static-routes.js';
import { isIndexableCatalogProduct } from '../shared/seo/indexable-product.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_INDEX_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const CATEGORY_TREE_PATH = path.join(__dirname, '../public/catalog/store-categories-tree.json');
const SEO_MANIFEST_PATH = path.join(__dirname, '../public/catalog/seo-snapshot/manifest.json');

const LANDING_SLUGS = new Set(LANDING_CATEGORY_SEO.map((category) => category.slug));
const PRODUCT_CHUNK_SIZE = 2500;

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(siteOrigin, pathname, lastmod, priority) {
  const loc = `${siteOrigin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function wrapUrlset(entries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
}

function wrapIndex(siteOrigin, files, today) {
  const items = files.map(
    (file) => `  <sitemap>
    <loc>${escapeXml(`${siteOrigin}/${file}`)}</loc>
    <lastmod>${escapeXml(today)}</lastmod>
  </sitemap>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join('\n')}
</sitemapindex>
`;
}

function resolveProductPriority(product) {
  const category = String(product.category ?? '').toLowerCase();
  if (product.is_featured) return '0.9';
  if (category.includes('nuevas') || category.includes('nuevos')) return '0.9';
  if (category.includes('multifuncional') || category.includes('impresora')) return '0.85';
  return '0.8';
}

function resolveCategoryPriority(rootSlug, subSlug) {
  if (!subSlug || subSlug === 'all') return '0.9';
  if (rootSlug === 'repuestos') return '0.85';
  return '0.85';
}

function loadCategoryTreeUrls() {
  if (!existsSync(CATEGORY_TREE_PATH)) return [];

  try {
    const payload = JSON.parse(readFileSync(CATEGORY_TREE_PATH, 'utf8'));
    return collectCategoryTreeUrls(payload.tree ?? []);
  } catch {
    return [];
  }
}

/** Rutas de producto desde snapshot SEO cuando no hay inventario local (CI / deploy parcial). */
function loadProductPathsFromSeoSnapshot() {
  if (!existsSync(SEO_MANIFEST_PATH)) return [];

  try {
    const manifest = JSON.parse(readFileSync(SEO_MANIFEST_PATH, 'utf8'));
    const routes = manifest.routes ?? {};
    const paths = [];

    for (const [pathname, ref] of Object.entries(routes)) {
      if (ref?.type !== 'product' || ref.redirectTo) continue;
      if (!pathname.startsWith('/tienda/') || pathname === '/tienda') continue;
      paths.push(pathname);
    }

    return paths;
  } catch {
    return [];
  }
}

function chunk(items, size) {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages.length > 0 ? pages : [[]];
}

async function pruneStaleProductSitemaps(keepCount) {
  let entries;
  try {
    entries = await readdir(PUBLIC_DIR);
  } catch {
    return;
  }

  for (const name of entries) {
    const match = name.match(/^sitemap-products-(\d+)\.xml$/);
    if (!match) continue;
    if (Number(match[1]) <= keepCount) continue;
    try {
      await unlink(path.join(PUBLIC_DIR, name));
    } catch {
      /* archivo bloqueado */
    }
  }
}

async function main() {
  const siteOrigin = resolveSiteOrigin(process.env);
  const inventoryPath = getInventoryPath();
  const today = new Date().toISOString().slice(0, 10);
  const coreUrls = [urlEntry(siteOrigin, '/', today, '1.0')];
  const seenPaths = new Set(['/']);
  const seenProductPaths = new Set();
  const productUrls = [];

  const addCoreUrl = (pathname, priority) => {
    if (seenPaths.has(pathname)) return;
    seenPaths.add(pathname);
    coreUrls.push(urlEntry(siteOrigin, pathname, today, priority));
  };

  addCoreUrl('/tienda', '0.95');

  for (const entry of loadCategoryTreeUrls()) {
    if (!LANDING_SLUGS.has(entry.rootSlug)) continue;
    if (entry.rootSlug === 'software') continue;
    addCoreUrl(entry.pathname, resolveCategoryPriority(entry.rootSlug, entry.subSlug));
  }

  for (const route of SERVICE_SEO_ROUTES) {
    addCoreUrl(route.pathname, route.pathname === '/servicios' ? '0.9' : '0.85');
  }

  for (const route of STATIC_SEO_ROUTES) {
    const path = route.pathname;
    let priority = '0.85';
    if (path === '/distribuidor-autorizado-ricoh' || path === '/fotocopiadoras-peru' || path === '/fotocopiadoras-ricoh') {
      priority = '0.95';
    } else if (path.startsWith('/guias') || path.startsWith('/modelos')) {
      priority = '0.7';
    } else if (path === '/alquiler-fotocopiadoras-lima' || path === '/toner-ricoh') {
      priority = '0.9';
    }
    addCoreUrl(path, priority);
  }

  if (existsSync(inventoryPath)) {
    const { products } = await readInventory();
    for (const product of products) {
      if (!isIndexableCatalogProduct(product)) continue;
      const productPath = buildProductPath(product);
      if (seenProductPaths.has(productPath)) continue;
      seenProductPaths.add(productPath);

      const lastmod = product.updated_at?.slice(0, 10) ?? product.created_at?.slice(0, 10) ?? today;
      productUrls.push(urlEntry(siteOrigin, productPath, lastmod, resolveProductPriority(product)));
    }
  } else {
    console.warn(`[generate:sitemap] Sin inventario en ${inventoryPath}; usando snapshot SEO.`);
    for (const productPath of loadProductPathsFromSeoSnapshot()) {
      if (seenProductPaths.has(productPath)) continue;
      seenProductPaths.add(productPath);
      productUrls.push(urlEntry(siteOrigin, productPath, today, '0.8'));
    }
  }

  await mkdir(PUBLIC_DIR, { recursive: true });
  await writeFile(path.join(PUBLIC_DIR, 'sitemap-core.xml'), wrapUrlset(coreUrls), 'utf8');

  const productChunks = chunk(productUrls, PRODUCT_CHUNK_SIZE);
  const indexFiles = ['sitemap-core.xml'];

  for (let index = 0; index < productChunks.length; index += 1) {
    const fileName = `sitemap-products-${index + 1}.xml`;
    await writeFile(path.join(PUBLIC_DIR, fileName), wrapUrlset(productChunks[index]), 'utf8');
    indexFiles.push(fileName);
  }

  await pruneStaleProductSitemaps(productChunks.length);
  await writeFile(OUTPUT_INDEX_PATH, wrapIndex(siteOrigin, indexFiles, today), 'utf8');

  const total = coreUrls.length + productUrls.length;
  console.log(
    `✓ Sitemap index en ${OUTPUT_INDEX_PATH} (${total} URLs · ${productUrls.length} productos en ${productChunks.length} archivo(s))`,
  );
}

main().catch((error) => {
  console.warn('[generate:sitemap] omitido:', error instanceof Error ? error.message : error);
  process.exit(0);
});
