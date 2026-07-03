import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const source = path.join(publicDir, 'logo.png');
const bg = { r: 0, g: 0, b: 0, alpha: 1 };

if (!fs.existsSync(source) || fs.statSync(source).size === 0) {
  throw new Error('Falta public/logo.png');
}

async function renderIcon(size) {
  const logo = await sharp(source)
    .resize(size, size, { fit: 'contain', background: bg })
    .png()
    .toBuffer();
  return logo;
}

const outputs = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

for (const { size, name } of outputs) {
  fs.writeFileSync(path.join(publicDir, name), await renderIcon(size));
}

const icoPngs = await Promise.all([16, 32, 48].map((size) => renderIcon(size)));

try {
  const pngToIco = (await import('png-to-ico')).default;
  fs.writeFileSync(path.join(publicDir, 'logo.ico'), await pngToIco(icoPngs));
} catch {
  fs.writeFileSync(path.join(publicDir, 'logo.ico'), icoPngs[1]);
}

const favicon32 = icoPngs[1];
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <image width="32" height="32" href="data:image/png;base64,${favicon32.toString('base64')}"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

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
