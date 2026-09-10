/**
 * Stubs de vitrina (remanufacturadas) sin fila de inventario.
 * El API los materializa automáticamente la primera vez que se piden.
 */
import { deriveProductSlug } from './product-slug.js';

const REMAN_PUBLIC_MARKUP_USD = 100;

/** @typedef {{
 *   id: string;
 *   name: string;
 *   brand?: string;
 *   code?: string;
 *   stock?: number;
 *   image: string;
 *   tecnicoUsd: number;
 *   category?: string;
 *   speedPpm?: string;
 *   paperSize?: string;
 *   scannerType?: string;
 *   monthlyYield?: string;
 * }} ShowcaseEquipmentStub */

/** @type {readonly ShowcaseEquipmentStub[]} */
export const SHOWCASE_EQUIPMENT_STUBS = [
  {
    id: 'im-430f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 430F',
    brand: 'RICOH',
    code: '418491',
    stock: 4,
    image: '/products/ricoh-im-430f.webp',
    tecnicoUsd: 799,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '43 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '20.000 pág/mes',
  },
  {
    id: 'mp-402-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 402',
    brand: 'RICOH',
    code: 'MP402-RM',
    stock: 6,
    image: '/products/393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce.webp',
    tecnicoUsd: 699,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '40 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '10.000 pág/mes',
  },
  {
    id: 'mp-401-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 401',
    brand: 'RICOH',
    code: 'MP401-RM',
    stock: 5,
    image: '/products/ricoh-mp-401-c-unidad-de-imagen-220v.webp',
    tecnicoUsd: 599,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '35 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '8.000 pág/mes',
  },
  {
    id: 'mp-301-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 301',
    brand: 'RICOH',
    code: 'MP301-RM',
    stock: 5,
    image: '/products/b-n-ricoh-mp-301.webp',
    tecnicoUsd: 499,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '30 ppm',
    paperSize: 'A4',
    scannerType: 'ARDF',
    monthlyYield: '6.000 pág/mes',
  },
  {
    id: 'sp-4510dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 4510DN',
    brand: 'RICOH',
    code: 'SP4510DN-RM',
    stock: 5,
    image: '/products/452b7860-4bc7-4b89-ba43-41e94158686d.webp',
    tecnicoUsd: 499,
    category: 'Impresoras, Impresoras Remanufacturadas',
    speedPpm: '40 ppm',
    paperSize: 'A4',
    monthlyYield: '10.000 pág/mes',
  },
  {
    id: 'sp-4520dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 4520DN',
    brand: 'RICOH',
    code: 'SP4520DN-RM',
    stock: 4,
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    tecnicoUsd: 499,
    category: 'Impresoras, Impresoras Remanufacturadas',
    speedPpm: '40 ppm',
    paperSize: 'A4',
    monthlyYield: '8.000 pág/mes',
  },
  {
    id: 'sp-377dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 377DN',
    brand: 'RICOH',
    code: 'SP377DN-RM',
    stock: 5,
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    tecnicoUsd: 499,
    category: 'Impresoras, Impresoras Remanufacturadas',
    speedPpm: '28 ppm',
    paperSize: 'A4',
    monthlyYield: '4.000 pág/mes',
  },
  {
    id: 'sp-3710dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 3710DN',
    brand: 'RICOH',
    code: 'SP3710DN-RM',
    stock: 3,
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    tecnicoUsd: 499,
    category: 'Impresoras, Impresoras Remanufacturadas',
    speedPpm: '32 ppm',
    paperSize: 'A4',
    monthlyYield: '6.000 pág/mes',
  },
  {
    id: 'p-502-reman',
    name: 'Impresora Remanufacturada RICOH P 502',
    brand: 'RICOH',
    code: 'P502-RM',
    stock: 4,
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    tecnicoUsd: 599,
    category: 'Impresoras, Impresoras Remanufacturadas',
    speedPpm: '43 ppm',
    paperSize: 'A4',
    monthlyYield: '8.000 pág/mes',
  },
  {
    id: 'im-550f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 550F',
    brand: 'RICOH',
    code: '418460',
    stock: 4,
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    tecnicoUsd: 899,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '55 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '35.000 pág/mes',
  },
  {
    id: 'im-600f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 600F',
    brand: 'RICOH',
    code: '418464',
    stock: 3,
    image: '/products/ricoh-im-600f-110v.webp',
    tecnicoUsd: 949,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '60 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '40.000 pág/mes',
  },
  {
    id: 'mp-501-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 501',
    brand: 'RICOH',
    code: 'MP501-RM',
    stock: 4,
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    tecnicoUsd: 749,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '55 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '15.000 pág/mes',
  },
  {
    id: 'mp-6055-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 6055',
    brand: 'RICOH',
    code: 'MP6055-RM',
    stock: 2,
    image: '/products/ricoh-mp-6055-220v.webp',
    tecnicoUsd: 1499,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '60 ppm',
    paperSize: 'A3',
    scannerType: 'SPDF',
    monthlyYield: '25.000 pág/mes',
  },
  {
    id: 'im-c400f-reman',
    name: 'Multifuncional Remanufacturada color RICOH IM C400F',
    brand: 'RICOH',
    code: 'IMC400F-RM',
    stock: 2,
    image: '/products/color-ricoh-im-c400f-120v.webp',
    tecnicoUsd: 1519,
    category: 'Multifuncionales, Multifuncionales Remanufacturadas',
    speedPpm: '25 ppm',
    paperSize: 'A4',
    scannerType: 'SPDF',
    monthlyYield: '10.000 pág/mes',
  },
];

function normalizeLookup(key) {
  return String(key ?? '')
    .trim()
    .toLowerCase();
}

/** @param {string | null | undefined} lookupKey */
export function findShowcaseEquipmentStub(lookupKey) {
  const lower = normalizeLookup(lookupKey);
  if (!lower) return undefined;
  return SHOWCASE_EQUIPMENT_STUBS.find((stub) => {
    if (stub.id.toLowerCase() === lower) return true;
    if (stub.code && stub.code.toLowerCase() === lower) return true;
    const slug = deriveProductSlug({ id: stub.id, name: stub.name });
    return slug.toLowerCase() === lower;
  });
}

/** @param {ShowcaseEquipmentStub} stub */
export function showcaseStubToInventoryProduct(stub) {
  const tecnicoUsd = Number(stub.tecnicoUsd) || 0;
  const publicUsd = tecnicoUsd > 0 ? tecnicoUsd + REMAN_PUBLIC_MARKUP_USD : 0;
  const stock = Math.max(0, Math.floor(Number(stub.stock) || 0));
  const image = String(stub.image ?? '').trim() || null;
  const attributes = [];
  if (stub.speedPpm) attributes.push({ name: 'Velocidad', value: stub.speedPpm });
  if (stub.paperSize) attributes.push({ name: 'Formato', value: stub.paperSize });
  if (stub.scannerType) attributes.push({ name: 'Alimentador', value: stub.scannerType });
  if (stub.monthlyYield) attributes.push({ name: 'Volumen mensual', value: stub.monthlyYield });
  attributes.push({ name: 'Condición', value: 'Remanufacturada' });

  return {
    id: stub.id,
    code: stub.code ?? stub.id.toUpperCase().replace(/-/g, ''),
    slug: deriveProductSlug({ id: stub.id, name: stub.name }),
    name: stub.name,
    description: `${stub.name}. Equipo remanufacturado disponible en HaiStore.`,
    currency: 'USD',
    stock,
    stock_by_warehouse: stock > 0 ? [{ warehouse_id: 'principal', quantity: stock }] : [],
    category: stub.category ?? 'Multifuncionales, Multifuncionales Remanufacturadas',
    brand: stub.brand ?? 'RICOH',
    image_url: image,
    gallery: image ? [image] : [],
    purchase_price_usd: 0,
    suppliers: [],
    attachments: [],
    attributes,
    created_at: new Date().toISOString(),
    sort_order: 0,
    status: 'activa',
    prices: {
      public: publicUsd,
      tecnico: tecnicoUsd,
      corporativo: publicUsd,
      corporativo2: publicUsd,
    },
  };
}
