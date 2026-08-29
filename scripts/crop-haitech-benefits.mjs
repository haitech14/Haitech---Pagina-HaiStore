import sharp from 'sharp';
import path from 'node:path';

const src = path.join(process.cwd(), 'public/haitech-home/benefits/section-full.png');
const outDir = path.join(process.cwd(), 'public/haitech-home/benefits');

/** Referencia de diseño original (2172×724). */
const REF_WIDTH = 2172;
const REF_HEIGHT = 724;

const cardIcons = [
  { id: 'icon-asesor', left: 148, top: 302, width: 156, height: 136 },
  { id: 'icon-distribuidor', left: 470, top: 302, width: 156, height: 136 },
  { id: 'icon-envio', left: 792, top: 302, width: 156, height: 136 },
  { id: 'icon-soporte', left: 1114, top: 302, width: 156, height: 136 },
  { id: 'icon-garantia', left: 1436, top: 302, width: 156, height: 136 },
  { id: 'icon-contraentrega', left: 1758, top: 302, width: 156, height: 136 },
];

const backgrounds = [
  { id: 'bg-printer-left', left: 0, top: 0, width: 400, height: 724 },
  { id: 'bg-ricoh-logo', left: 1810, top: 0, width: 362, height: 185 },
  { id: 'bg-parts-right', left: 1810, top: 468, width: 362, height: 256 },
];

function scaleCrop(crop, width, height) {
  const sx = width / REF_WIDTH;
  const sy = height / REF_HEIGHT;
  return {
    left: Math.round(crop.left * sx),
    top: Math.round(crop.top * sy),
    width: Math.max(1, Math.round(crop.width * sx)),
    height: Math.max(1, Math.round(crop.height * sy)),
  };
}

const meta = await sharp(src).metadata();
const { width, height } = meta;
if (!width || !height) {
  throw new Error(`No se pudo leer dimensiones de ${src}`);
}

console.log(`Recortando desde ${width}×${height} (ref ${REF_WIDTH}×${REF_HEIGHT})`);

for (const crop of [...backgrounds, ...cardIcons]) {
  const target = path.join(outDir, `${crop.id}.png`);
  const area = scaleCrop(crop, width, height);
  await sharp(src).extract(area).png({ compressionLevel: 9 }).toFile(target);
  console.log('Wrote', target, area);
}

await sharp(src).webp({ quality: 88 }).toFile(path.join(outDir, 'section-full.webp'));
console.log('Wrote section-full.webp');
