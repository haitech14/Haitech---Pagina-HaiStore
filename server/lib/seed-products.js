import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '../../src/data/inventory-catalog.json');

/** Catálogo maestro sincronizado con `data/inventory-catalog.json`. */
export function loadCatalogProducts() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const data = JSON.parse(raw);
  return data.products ?? [];
}

export const seedProducts = loadCatalogProducts();
