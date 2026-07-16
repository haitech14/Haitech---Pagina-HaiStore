/**
 * Alinea precios/stock/nombres de SEMINUEVOS con la lista comercial (Excel).
 * - No modifica equipos NUEVOS.
 * - Técnico = precio lista; Corporativo (prices.public) = Técnico +300 B/N / +400 Color, termina en 9.
 * - preparation_prices: repotenciado +200/+300; remanufacturado +250/+300 desde Acondicionado, termina en 9.
 *
 * Uso: node scripts/align-seminuevos-lista-precios.mjs
 */
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { productQualifiesAsNuevaEquipment, productQualifiesAsSeminuevaEquipment } from '../shared/inventory-product-name.js';
import { normalizePreparationPrices } from '../shared/seminueva-preparation-prices.js';
import { ensureFullPrices } from '../server/lib/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INVENTORY_PATH = path.join(ROOT, 'server', 'data', 'inventory.json');

/** Redondea hacia arriba al número que termina en 9. */
function endIn9(value) {
  const n = Math.ceil(Number(value) || 0);
  if (n <= 0) return 0;
  return Math.ceil(n / 10) * 10 - 1;
}

function isColorProduct(product) {
  const attrs = Array.isArray(product.attributes) ? product.attributes : [];
  for (const a of attrs) {
    const name = String(a.name || a.label || '').toLowerCase();
    const val = String(a.value || '').toLowerCase();
    if (name.includes('color') && (val.includes('color') || val === 'cmyk')) return true;
    if (name.includes('color') && (val.includes('b/n') || val.includes('mono'))) return false;
  }
  const blob = `${product.name || ''} ${product.code || ''}`.toUpperCase();
  if (/\bIM\s*C|\bMP\s*C|\bM\s*C|\bSP\s*C|\bCOLOR\b/.test(blob)) return true;
  if (/\bB\/N\b|\bMONOCROM/.test(blob)) return false;
  return Boolean(product._forceColor);
}

function corporativoFromTecnico(tecnico, isColor) {
  return endIn9(tecnico + (isColor ? 400 : 300));
}

function bumpRolePrices(base, surcharge) {
  const src = ensureFullPrices(base);
  return ensureFullPrices({
    public: endIn9(src.public + surcharge),
    tecnico: endIn9(src.tecnico + surcharge),
    mayorista: endIn9(src.mayorista + surcharge),
    distribuidor: endIn9(src.distribuidor + surcharge),
  });
}

function upsertAttr(product, name, value) {
  if (!value) return;
  const attrs = Array.isArray(product.attributes) ? [...product.attributes] : [];
  const idx = attrs.findIndex((a) => String(a.name || '').toLowerCase() === name.toLowerCase());
  const next = { id: idx >= 0 ? attrs[idx].id : randomUUID(), name, value: String(value) };
  if (idx >= 0) attrs[idx] = { ...attrs[idx], ...next };
  else attrs.push(next);
  product.attributes = attrs;
}

function buildDisplayName({ baseTitle, notes, voltage, isColor, kind }) {
  const bits = [];
  if (kind === 'equipment') {
    bits.push(isColor ? 'Impresora Multifuncional Color Seminueva' : 'Impresora Multifuncional B/N Seminueva');
  } else if (kind === 'printer') {
    bits.push(isColor ? 'Impresora Láser Color Seminueva' : 'Impresora Láser B/N Seminueva');
  } else if (kind === 'plotter') {
    bits.push('Plotter Seminuevo');
  } else if (kind === 'accessory') {
    bits.push('Accesorio');
  } else if (kind === 'pc') {
    bits.push('Computadora Seminueva');
  } else if (kind === 'laptop') {
    bits.push('Laptop Seminueva');
  } else if (kind === 'monitor') {
    bits.push('Monitor Seminuevo');
  } else {
    bits.push('Producto Seminuevo');
  }
  if (kind === 'pc' || kind === 'laptop' || kind === 'monitor') {
    return `${bits[0]} ${baseTitle}${notes ? ` (${notes})` : ''}`.replace(/\s+/g, ' ').trim();
  }
  let name = `${bits[0]} RICOH ${baseTitle}`;
  if (notes) name += ` (${notes})`;
  return name.replace(/\s+/g, ' ').trim();
}

/**
 * Filas de la lista. matchKeys: patrones contra name+code (sin tocar Nuevas).
 * createIfMissing: crear seminuevo si no hay match.
 */
const LIST_ROWS = [
  // B/N equipos
  { key: 'm320f', stock: 9, tecnico: 119, model: 'M 320F', notes: 'falta guía ADF', isColor: false, formato: 'A4', kind: 'equipment', match: [/M\s*320F/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'im430', stock: 8, tecnico: 329, model: 'IM 430F', notes: 'U. Imagen nueva P502', isColor: false, formato: 'A4', kind: 'equipment', match: [/IM\s*430F?/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'im550-clp', stock: 6, tecnico: 369, model: 'IM 550F', notes: 'C/L.P.', isColor: false, formato: 'A4', kind: 'equipment', match: [/IM\s*550F?/i], preferCode: /CP908Y|550/i, category: 'Multifuncionales, Multifuncionales Seminuevas', allowSecond: true },
  { key: 'im550', stock: 3, tecnico: 490, model: 'IM 550F', notes: 'Cilindro y cuchilla nueva', isColor: false, formato: 'A4', kind: 'equipment', match: [/IM\s*550F?/i], category: 'Multifuncionales, Multifuncionales Seminuevas', createIfMissing: true },
  { key: 'im600', stock: 5, tecnico: 439, model: 'IM 600F', notes: '120 Y 220', isColor: false, formato: 'A4', kind: 'equipment', match: [/IM\s*600F?/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'im2500', stock: 1, tecnico: 679, model: 'IM 2500', notes: '', isColor: false, formato: 'A3', kind: 'equipment', match: [/IM\s*2500/i], category: 'Multifuncionales, Multifuncionales Seminuevas', createIfMissing: true },
  { key: 'im4000', stock: 1, tecnico: 1100, model: 'IM 4000', notes: '120v', isColor: false, formato: 'A3', kind: 'equipment', match: [/IM\s*4000/i], category: 'Multifuncionales, Multifuncionales Seminuevas', createIfMissing: true },
  { key: 'im7000', stock: 1, tecnico: 2649, model: 'IM 7000', notes: '', isColor: false, formato: 'A3', kind: 'equipment', match: [/IM\s*7000/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'sp4510', stock: 10, tecnico: 119, model: 'SP 4510SF', notes: 'U. Imagen 120v', isColor: false, formato: 'A4', kind: 'equipment', match: [/SP\s*4510/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mp402', stock: 11, tecnico: 139, model: 'MP 402', notes: 'U. Imagen 4500', isColor: false, formato: 'A4', kind: 'equipment', match: [/MP\s*402/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mp501', stock: 1, tecnico: 249, model: 'MP 501', notes: '', isColor: false, formato: 'A4', kind: 'equipment', match: [/MP\s*501/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mp3055', stock: 1, tecnico: 549, model: 'MP 3055', notes: '', isColor: false, formato: 'A3', kind: 'equipment', match: [/MP\s*3055/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mp4055', stock: 1, tecnico: 649, model: 'MP 4055', notes: '', isColor: false, formato: 'A3', kind: 'equipment', match: [/MP\s*4055/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mp5055', stock: 3, tecnico: 759, model: 'MP 5055', notes: '', isColor: false, formato: 'A3', kind: 'equipment', match: [/MP\s*5055/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'sp4520', stock: 2, tecnico: 99, model: 'SP 4520DN', notes: 'U. Imagen nueva', isColor: false, formato: 'A4', kind: 'printer', match: [/SP\s*4520/i], category: 'Impresoras Laser Seminuevas', createIfMissing: true },
  { key: 'sp5300', stock: 6, tecnico: 179, model: 'SP 5300DN', notes: '', isColor: false, formato: 'A4', kind: 'printer', match: [/SP\s*5300/i], category: 'Impresoras Laser Seminuevas', createIfMissing: true },
  { key: 'sp377', stock: 18, tecnico: 59, model: 'SP 377DN', notes: 'Monocromático', isColor: false, formato: 'A4', kind: 'printer', match: [/SP\s*377/i], category: 'Impresoras Laser Seminuevas', createIfMissing: true },
  { key: 'mueble-mp501', stock: 5, tecnico: 29, model: 'Mueble MP 501 Metal', notes: '', isColor: false, formato: '', kind: 'accessory', match: [/Mueble.*MP\s*501/i], category: 'Accesorios', createIfMissing: true },
  { key: 'cass-im550', stock: 19, tecnico: 18, model: 'Cassetera 2 IM 550', notes: '2x30', isColor: false, formato: '', kind: 'accessory', match: [/Cassetera.*IM\s*550/i], category: 'Accesorios', createIfMissing: true },
  { key: 'cw2200', stock: 1, tecnico: 2499, model: 'MP CW2200', notes: '120v', isColor: false, formato: 'Ancho', kind: 'plotter', match: [/CW\s*2200|MPCW2200/i], category: 'Formato Ancho Seminuevos', createIfMissing: true },

  // Color
  { key: 'imc400', stock: 4, tecnico: 429, model: 'IM C400F', notes: '120V', isColor: true, formato: 'A4', kind: 'equipment', match: [/IM\s*C\s*400/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'imc2000', stock: 2, tecnico: 689, model: 'IM C2000', notes: '', isColor: true, formato: 'A3', kind: 'equipment', match: [/IM\s*C\s*2000/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'imc2000b', stock: 2, tecnico: 719, model: 'IM C2000', notes: 'Cilindro cuchilla, rod. Carga', isColor: true, formato: 'A3', kind: 'equipment', match: [/IM\s*C\s*2500/i], category: 'Multifuncionales, Multifuncionales Seminuevas', createIfMissing: true, altMatch: [/IM\s*C\s*2000/i] },
  { key: 'imc3000', stock: 2, tecnico: 799, model: 'IM C3000', notes: '', isColor: true, formato: 'A3', kind: 'equipment', match: [/IM\s*C\s*3000/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'imc4500', stock: 2, tecnico: 1149, model: 'IM C4500', notes: '120V', isColor: true, formato: 'A3', kind: 'equipment', match: [/IM\s*C\s*4500/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mpc2004', stock: 2, tecnico: 699, model: 'MP C2004', notes: 'inc. Rod. Limp. carga, cilindro 120 y 220 V', isColor: true, formato: 'A3', kind: 'equipment', match: [/MP\s*C\s*2004/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mpc3004', stock: 3, tecnico: 669, model: 'MP C3004', notes: '', isColor: true, formato: 'A3', kind: 'equipment', match: [/MP\s*C\s*3004/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mc251', stock: 4, tecnico: 159, model: 'M C251FW / M C250FW', notes: '', isColor: true, formato: 'A4', kind: 'equipment', match: [/M\s*C\s*251|M\s*C\s*250/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'mpc307', stock: 1, tecnico: 319, model: 'MP C307', notes: '', isColor: true, formato: 'A4', kind: 'equipment', match: [/MP\s*C\s*307/i], category: 'Multifuncionales, Multifuncionales Seminuevas' },
  { key: 'spc352sp', stock: 5, tecnico: 119, model: 'SP C352SF', notes: '', isColor: true, formato: 'A4', kind: 'equipment', match: [/SP\s*C\s*352\s*S/i], category: 'Multifuncionales, Multifuncionales Seminuevas', createIfMissing: true },
  { key: 'spc352dn', stock: 2, tecnico: 99, model: 'SP C352DN', notes: '', isColor: true, formato: 'A4', kind: 'printer', match: [/SP\s*C\s*352\s*DN/i], category: 'Impresoras Laser Seminuevas', createIfMissing: true },
  { key: 'spc840', stock: 8, tecnico: 359, model: 'SP C840DN', notes: '', isColor: true, formato: 'A4', kind: 'printer', match: [/SP\s*C\s*840/i], category: 'Impresoras Laser Seminuevas' },

  // IT / accesorios
  { key: 'laptop-dell', stock: 2, tecnico: 189, model: 'Laptop DELL Core i5 6ta', notes: 'teclado nuevo', isColor: false, formato: '', kind: 'laptop', match: [/Laptop.*DELL|DELL.*i5.*6/i], category: 'Computadoras y Laptop', createIfMissing: true, skipPrep: true },
  { key: 'pc-7040', stock: 52, tecnico: 129, model: 'PC Optiplex i5 7040 8GB 6ta 1T', notes: 'USB 6', isColor: false, formato: '', kind: 'pc', match: [/Optiplex.*7040|i5\s*7040/i], category: 'Computadoras y Laptop', createIfMissing: true, skipPrep: true },
  { key: 'pc-micro', stock: 25, tecnico: 175, model: 'PC Optiplex Micro i5 3070 8GB 9na 500GB', notes: '1T USB 6', isColor: false, formato: '', kind: 'pc', match: [/Optiplex.*Micro|i5\s*3070/i], category: 'Computadoras y Laptop', createIfMissing: true, skipPrep: true },
  { key: 'monitor-dell', stock: 38, tecnico: 39, model: 'Monitor DELL 18.5', notes: '', isColor: false, formato: '', kind: 'monitor', match: [/Monitor.*DELL.*18|DELL\s*18\.5/i], category: 'Monitores', createIfMissing: true, skipPrep: true },
];

function blobOf(p) {
  return `${p.name || ''} ${p.code || ''} ${p.slug || ''}`;
}

function findSemiMatch(products, row, usedIds) {
  const patterns = [...(row.match || []), ...(row.altMatch || [])];
  const cands = products.filter((p) => {
    if (usedIds.has(p.id)) return false;
    if (productQualifiesAsNuevaEquipment(p)) return false;
    const cat = String(p.category || '');
    if (/repuesto|t[oó]ner|suministro/i.test(cat) || /^repuesto-/i.test(String(p.id || ''))) return false;
    if (!productQualifiesAsSeminuevaEquipment(p)) {
      if (!['accessory', 'pc', 'laptop', 'monitor'].includes(row.kind)) return false;
    }
    const blob = blobOf(p);
    return patterns.some((re) => re.test(blob));
  });

  // Prefer explicit seminuevas for equipment
  cands.sort((a, b) => {
    const as = productQualifiesAsSeminuevaEquipment(a) ? 1 : 0;
    const bs = productQualifiesAsSeminuevaEquipment(b) ? 1 : 0;
    if (bs !== as) return bs - as;
    if (row.preferCode) {
      const ap = row.preferCode.test(String(a.code || '')) ? 1 : 0;
      const bp = row.preferCode.test(String(b.code || '')) ? 1 : 0;
      if (bp !== ap) return bp - ap;
    }
    // Closer tecnico price
    const at = Math.abs(Number(a.prices?.tecnico || a.price || 0) - row.tecnico);
    const bt = Math.abs(Number(b.prices?.tecnico || b.price || 0) - row.tecnico);
    return at - bt;
  });

  return cands[0] || null;
}

function applyPrices(product, row) {
  const color = row.isColor || isColorProduct({ ...product, _forceColor: row.isColor });
  const tecnico = row.tecnico;
  const publicPrice = corporativoFromTecnico(tecnico, color);
  const base = ensureFullPrices({
    public: publicPrice,
    tecnico,
    mayorista: tecnico,
    distribuidor: tecnico,
  });
  product.prices = base;
  product.price = base.public;

  if (row.skipPrep) {
    delete product.preparation_prices;
    return;
  }

  const repSurcharge = color ? 300 : 200;
  const remSurcharge = color ? 300 : 250;
  product.preparation_prices = normalizePreparationPrices({
    semirepotenciado: bumpRolePrices(base, repSurcharge),
    remanufacturado: bumpRolePrices(base, remSurcharge),
  });
}

function applyMeta(product, row) {
  product.stock = row.stock;
  if (row.category) product.category = row.category;
  product.brand = product.brand || (row.kind === 'laptop' || row.kind === 'pc' || row.kind === 'monitor' ? 'DELL' : 'Ricoh');
  product.status = product.status || 'activa';
  product.currency = 'USD';

  const titleModel = row.model.replace(/^RICOH\s+/i, '');
  if (['equipment', 'printer', 'plotter'].includes(row.kind) || row.kind === 'accessory') {
    product.name = buildDisplayName({
      baseTitle: titleModel,
      notes: row.notes,
      voltage: /120|220/i.test(row.notes) ? '' : '',
      isColor: row.isColor,
      kind: row.kind,
    });
  } else {
    product.name = buildDisplayName({
      baseTitle: titleModel,
      notes: row.notes,
      isColor: false,
      kind: row.kind,
    });
  }

  upsertAttr(product, 'Color', row.isColor ? 'Color' : 'B/N');
  if (row.formato) upsertAttr(product, 'Formato papel', row.formato);
  if (row.notes) upsertAttr(product, 'Detalle lista', row.notes);
}

function createProduct(row) {
  const id = randomUUID();
  const code = `LISTA-${row.key.toUpperCase()}-SN`;
  const product = {
    id,
    slug: `seminuevo-${row.key}-${id.slice(0, 8)}`,
    code,
    name: '',
    description: row.notes ? `Seminuevo — ${row.notes}` : 'Seminuevo alineado a lista comercial',
    price: 0,
    prices: ensureFullPrices({}),
    currency: 'USD',
    image_url: null,
    gallery: [],
    stock: row.stock,
    category: row.category,
    brand: row.kind === 'laptop' || row.kind === 'pc' || row.kind === 'monitor' ? 'DELL' : 'Ricoh',
    attributes: [],
    sort_order: 9000,
    status: 'activa',
    created_at: new Date().toISOString(),
    is_featured: false,
  };
  applyMeta(product, row);
  applyPrices(product, row);
  return product;
}

function main() {
  const raw = fs.readFileSync(INVENTORY_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.products)) throw new Error('inventory.json sin products[]');

  const usedIds = new Set();
  const report = [];
  let updated = 0;
  let created = 0;
  let skippedNuevos = 0;

  for (const row of LIST_ROWS) {
    let product = findSemiMatch(data.products, row, usedIds);

    if (product && productQualifiesAsNuevaEquipment(product)) {
      skippedNuevos += 1;
      product = null;
    }

    if (!product && row.createIfMissing) {
      product = createProduct(row);
      data.products.push(product);
      created += 1;
      usedIds.add(product.id);
      report.push({ action: 'CREATE', key: row.key, id: product.id, name: product.name, tecnico: row.tecnico, stock: row.stock });
      continue;
    }

    if (!product) {
      report.push({ action: 'MISS', key: row.key, model: row.model });
      continue;
    }

    usedIds.add(product.id);
    applyMeta(product, row);
    applyPrices(product, row);
    updated += 1;
    report.push({
      action: 'UPDATE',
      key: row.key,
      id: product.id,
      name: product.name,
      tecnico: product.prices.tecnico,
      corporativo: product.prices.public,
      stock: product.stock,
      prep: Boolean(product.preparation_prices),
    });
  }

  const backup = `${INVENTORY_PATH}.bak-lista-${Date.now()}`;
  fs.writeFileSync(backup, raw);
  fs.writeFileSync(INVENTORY_PATH, `${JSON.stringify(data, null, 2)}\n`);

  console.log(JSON.stringify({ backup, updated, created, skippedNuevos, miss: report.filter((r) => r.action === 'MISS'), sample: report.slice(0, 12) }, null, 2));
  console.log(`Total report rows: ${report.length}`);
}

main();
