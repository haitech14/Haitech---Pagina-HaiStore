/**
 * Genera variantes WebP optimizadas para assets estáticos de la home.
 * Uso: node scripts/optimize-public-images.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = path.join(process.cwd(), 'public');

/** @param {string} filePath */
function kb(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return Math.round((fs.statSync(filePath).size / 1024) * 10) / 10;
}

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} width
 * @param {{ quality?: number }} [options]
 */
async function writeWebp(inputPath, outputPath, width, options = {}) {
  const { quality = 82 } = options;
  await sharp(inputPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outputPath);
}

/**
 * @param {string} inputPath
 * @param {Array<{ suffix: string; width: number }>} variants
 */
async function generateVariants(inputPath, variants) {
  if (!fs.existsSync(inputPath)) {
    console.warn(`  ⚠ No encontrado: ${inputPath}`);
    return;
  }

  const parsed = path.parse(inputPath);
  const baseOut = path.join(parsed.dir, parsed.name);

  for (const { suffix, width } of variants) {
    const out = `${baseOut}${suffix}.webp`;
    await writeWebp(inputPath, out, width);
    console.log(`  ✓ ${path.relative(PUBLIC, out)} (${kb(out)} KB)`);
  }
}

async function optimizeHero() {
  console.log('\n— Hero banner —');
  const hero = path.join(PUBLIC, 'categories', 'banner2.png');
  await generateVariants(hero, [
    { suffix: '-768', width: 768 },
    { suffix: '-1280', width: 1280 },
    { suffix: '-1920', width: 1920 },
  ]);
}

async function optimizeCategories() {
  console.log('\n— Categorías —');
  const dir = path.join(PUBLIC, 'categories');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !f.includes('banner'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [
      { suffix: '-256', width: 256 },
      { suffix: '-512', width: 512 },
    ]);
  }
}

async function optimizeClients() {
  console.log('\n— Logos clientes —');
  const dir = path.join(PUBLIC, 'clients');
  if (!fs.existsSync(dir)) return;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png') && f.startsWith('client-'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-200', width: 200 }]);
  }
}

async function optimizeRecommendations() {
  console.log('\n— Testimonios —');
  const dir = path.join(PUBLIC, 'clients', 'recommendations');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-400', width: 400 }]);
  }
}

async function optimizeBrands() {
  console.log('\n— Marcas —');
  const dir = path.join(PUBLIC, 'brands');
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const file of files) {
    console.log(`  ${file}`);
    await generateVariants(path.join(dir, file), [{ suffix: '-160', width: 160 }]);
  }
}

console.log('Optimizando imágenes públicas…');
await optimizeHero();
await optimizeCategories();
await optimizeClients();
await optimizeRecommendations();
await optimizeBrands();
console.log('\nListo.');
