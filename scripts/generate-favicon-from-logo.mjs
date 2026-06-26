import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const source = fs.existsSync(path.join(publicDir, 'favicon-source.png'))
  ? path.join(publicDir, 'favicon-source.png')
  : path.join(publicDir, 'logo.png');
const bg = { r: 15, g: 23, b: 42, alpha: 1 };

if (!fs.existsSync(source) || fs.statSync(source).size === 0) {
  throw new Error('Falta public/favicon-source.png o public/logo.png');
}

async function renderSmall(size) {
  const resized = await sharp(source).resize({ height: size }).toBuffer();
  const meta = await sharp(resized).metadata();
  const width = Math.min(size, meta.width);

  return sharp(resized)
    .extract({ left: 0, top: 0, width, height: size })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: Math.max(0, size - width),
      background: bg,
    })
    .png()
    .toBuffer();
}

async function renderFull(size) {
  return sharp(source).resize(size, size, { fit: 'contain', background: bg }).png().toBuffer();
}

const outputs = [
  { size: 16, name: 'favicon-16x16.png', small: true },
  { size: 32, name: 'favicon-32x32.png', small: true },
  { size: 48, name: 'favicon-48x48.png', small: true },
  { size: 180, name: 'apple-touch-icon.png', small: false },
];

for (const { size, name, small } of outputs) {
  const buffer = small ? await renderSmall(size) : await renderFull(size);
  fs.writeFileSync(path.join(publicDir, name), buffer);
}

const icoPngs = await Promise.all([16, 32, 48].map((size) => renderSmall(size)));

try {
  const pngToIco = (await import('png-to-ico')).default;
  fs.writeFileSync(path.join(publicDir, 'logo.ico'), await pngToIco(icoPngs));
} catch {
  fs.writeFileSync(path.join(publicDir, 'logo.ico'), icoPngs[1]);
}

// Variante clara para footer/PDF en fondos oscuros (mismo trazo, colores invertidos).
if (source.endsWith('logo.png')) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  }
  await sharp(data, { raw: info }).png().toFile(path.join(publicDir, 'logoclaro.png'));
}

console.log('Favicons generados en public/ desde', path.basename(source));
