/**
 * Genera public/sitemap.xml en build.
 */
import 'dotenv/config';
import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getInventoryPath } from '../server/lib/server-paths.js';
import { readInventory } from '../server/lib/inventory-store.js';
import { resolveSiteOrigin } from '../shared/site-origin.js';
import { buildProductPath } from '../shared/product-slug.js';
import { LANDING_CATEGORY_SEO } from '../shared/seo/landing-categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

const CATEGORY_SUB_PATHS = {
  multifuncionales: ['sub=all', 'sub=nuevas', 'sub=seminuevas', 'sub=remanufacturadas'],
  impresoras: ['sub=all', 'sub=nuevas', 'sub=seminuevas'],
  'toner-suministros': ['sub=toner-originales', 'sub=toner-remanufacturado', 'sub=toner-recarga'],
};

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

function resolveProductPriority(product) {
  const category = String(product.category ?? '').toLowerCase();
  if (product.is_featured) return '0.9';
  if (category.includes('nuevas') || category.includes('nuevos')) return '0.9';
  if (category.includes('multifuncional') || category.includes('impresora')) return '0.85';
  return '0.8';
}

async function main() {
  const siteOrigin = resolveSiteOrigin(process.env);
  const inventoryPath = getInventoryPath();
  const today = new Date().toISOString().slice(0, 10);
  const urls = [urlEntry(siteOrigin, '/', today, '1.0')];
  const seenProductPaths = new Set();

  for (const category of LANDING_CATEGORY_SEO) {
    const basePath =
      category.slug === 'multifuncionales'
        ? `/categoria/${category.slug}?sub=all`
        : `/categoria/${category.slug}`;
    urls.push(urlEntry(siteOrigin, basePath, today, '0.9'));

    const subQueries = CATEGORY_SUB_PATHS[category.slug];
    if (subQueries) {
      for (const query of subQueries) {
        if (query === 'sub=all') continue;
        urls.push(
          urlEntry(siteOrigin, `/categoria/${category.slug}?${query}`, today, '0.85'),
        );
      }
    }
  }

  if (existsSync(inventoryPath)) {
    const { products } = await readInventory();
    for (const product of products) {
      const productPath = buildProductPath(product);
      if (seenProductPaths.has(productPath)) continue;
      seenProductPaths.add(productPath);

      const lastmod = product.updated_at?.slice(0, 10) ?? product.created_at?.slice(0, 10) ?? today;
      urls.push(urlEntry(siteOrigin, productPath, lastmod, resolveProductPriority(product)));
    }
  } else {
    console.warn(`[generate:sitemap] Sin inventario en ${inventoryPath}; sitemap solo con categorías.`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, xml, 'utf8');
  console.log(`✓ Sitemap escrito en ${OUTPUT_PATH} (${urls.length} URLs)`);
}

main().catch((error) => {
  console.warn('[generate:sitemap] omitido:', error instanceof Error ? error.message : error);
  process.exit(0);
});
