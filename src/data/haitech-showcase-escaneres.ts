import type { HaitechShopProduct } from '@/data/haitech-home-shop';

const SCANNER_FEATURES = ['escanea', 'rendimiento'] as const;

const MARKUP_USD = 200;
const EXCHANGE_RATE = 3.42;
const MARKUP_PEN = Math.round(MARKUP_USD * EXCHANGE_RATE);

type ScannerShowcaseRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  code: string;
  image: string;
  stock: number;
  /** Precio base público en soles (antes del recargo comercial). */
  basePen?: number;
};

function toShowcaseScanner(
  row: ScannerShowcaseRow,
  condition: 'nuevo' | 'seminuevo',
): HaitechShopProduct {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    code: row.code,
    stock: row.stock,
    image: row.image,
    price: row.basePen != null ? row.basePen + MARKUP_PEN : 0,
    condition,
    features: SCANNER_FEATURES,
    equipment: {
      paperSize: 'A4',
      speedPpm: '—',
      monthlyYield: '—',
    },
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['escaneres'],
    href: `/tienda/${row.slug}`,
  };
}

/** Escáneres nuevos del catálogo HaiStore (/tienda/escaneres → Nuevos). */
const HAITECH_SHOWCASE_SCANNERS_NUEVOS: readonly ScannerShowcaseRow[] = [
  {
    id: '81721240-37dd-4db7-9a0c-4ee80ffe633e',
    slug: 'escaner-nuevo-ricoh-scansnap-ix-1300-4ee80ffe633e',
    name: 'Escáner Nuevo Ricoh ScanSnap iX-1300',
    brand: 'RICOH',
    code: 'IX-1300',
    image: '/products/ricoh-scansnap-ix-1300.webp',
    stock: 0,
  },
  {
    id: '965c811a-6cfe-4ba6-a25c-78dadda32982',
    slug: 'escaner-nuevo-ricoh-scansnap-ix-1600-78dadda32982',
    name: 'Escáner Nuevo Ricoh ScanSnap iX-1600',
    brand: 'RICOH',
    code: 'IX-1600',
    image: '/products/ricoh-scansnap-ix-1600.webp',
    stock: 0,
  },
  {
    id: 'c7e1bacd-8def-4266-b979-328517923660',
    slug: 'escaner-nuevo-ricoh-scansnap-ix-2500-328517923660',
    name: 'Escáner Nuevo Ricoh ScanSnap iX-2500',
    brand: 'RICOH',
    code: 'IX-2500',
    image: '/products/ricoh-scansnap-ix-2500.webp',
    stock: 0,
  },
  {
    id: '3a2ef2e8-c295-416b-90b6-c2ec2e4fd55b',
    slug: 'escaner-nuevo-ricoh-scansnap-sv-600-c2ec2e4fd55b',
    name: 'Escáner Nuevo Ricoh ScanSnap SV-600',
    brand: 'RICOH',
    code: 'SV-600',
    image: '/products/ricoh-scansnap-sv-600.webp',
    stock: 0,
    basePen: 4773,
  },
  {
    id: '3f277125-e3ed-4479-b156-ce231f70970c',
    slug: 'escaner-nuevo-ricoh-sp-1120n-ce231f70970c',
    name: 'Escáner Nuevo Ricoh SP 1120N',
    brand: 'RICOH',
    code: 'SP-1120N',
    image: '/products/ricoh-sp-1120n.webp',
    stock: 0,
  },
  {
    id: 'b8e01d2c-0cbc-49f1-b01d-4ce57be1496c',
    slug: 'escaner-nuevo-ricoh-sp-1130n-4ce57be1496c',
    name: 'Escáner Nuevo Ricoh SP 1130N',
    brand: 'RICOH',
    code: 'SP-1130N',
    image: '/products/ricoh-sp-1130n.webp',
    stock: 0,
  },
  {
    id: '4f6b624d-5241-4303-9a62-dec7a47364f6',
    slug: 'escaner-nuevo-ricoh-fi-70f-dec7a47364f6',
    name: 'Escáner Nuevo Ricoh fi-70F',
    brand: 'RICOH',
    code: 'FI-70F',
    image: '/products/ricoh-fi-70f.webp',
    stock: 0,
    basePen: 2037,
  },
  {
    id: 'dbe29df7-3195-4f26-8f84-2cd9f1504ceb',
    slug: 'escaner-nuevo-ricoh-fi-800r-2cd9f1504ceb',
    name: 'Escáner Nuevo Ricoh fi-800R',
    brand: 'RICOH',
    code: 'FI-800R',
    image: '/products/ricoh-fi-800r.webp',
    stock: 0,
    basePen: 2810,
  },
  {
    id: 'e0ed6538-555f-4e32-ac42-1ea05f659aec',
    slug: 'escaner-nuevo-ricoh-fi-8040-1ea05f659aec',
    name: 'Escáner Nuevo Ricoh fi-8040',
    brand: 'RICOH',
    code: 'FI-8040',
    image: '/products/ricoh-fi-8040.webp',
    stock: 0,
    basePen: 3149,
  },
  {
    id: 'b7a08fda-17f7-416f-af3f-6cd60976d91d',
    slug: 'escaner-nuevo-ricoh-fi-8150-6cd60976d91d',
    name: 'Escáner Nuevo Ricoh fi-8150',
    brand: 'RICOH',
    code: 'FI-8150',
    image: '/products/ricoh-fi-8150.webp',
    stock: 0,
    basePen: 4582,
  },
  {
    id: '41125a96-f6ea-4c8a-b76b-95b372236905',
    slug: 'escaner-nuevo-ricoh-fi-8170-95b372236905',
    name: 'Escáner Nuevo Ricoh fi-8170',
    brand: 'RICOH',
    code: 'FI-8170',
    image: '/products/ricoh-fi-8170.webp',
    stock: 0,
    basePen: 5091,
  },
  {
    id: '248a9189-ce2a-4985-ac1d-a5e84609fd9d',
    slug: 'escaner-nuevo-ricoh-fi-8190-a5e84609fd9d',
    name: 'Escáner Nuevo Ricoh fi-8190',
    brand: 'RICOH',
    code: 'FI-8190',
    image: '/products/ricoh-fi-8190.webp',
    stock: 0,
    basePen: 8526,
  },
  {
    id: '53d83aa4-c8ea-45d8-b67a-4c4596366120',
    slug: 'escaner-nuevo-ricoh-fi-8190n-4c4596366120',
    name: 'Escáner Nuevo Ricoh fi-8190N',
    brand: 'RICOH',
    code: 'FI-8190N',
    image: '/products/ricoh-fi-8190n.webp',
    stock: 0,
  },
  {
    id: '90d4e8c3-9055-4393-a8f7-f631999dfa89',
    slug: 'escaner-nuevo-ricoh-fi-8250-f631999dfa89',
    name: 'Escáner Nuevo Ricoh fi-8250',
    brand: 'RICOH',
    code: 'FI-8250',
    image: '/products/ricoh-fi-8250.webp',
    stock: 0,
  },
  {
    id: 'bae35f26-5e4c-471d-9956-f23265f11134',
    slug: 'escaner-nuevo-ricoh-fi-8270-f23265f11134',
    name: 'Escáner Nuevo Ricoh fi-8270',
    brand: 'RICOH',
    code: 'FI-8270',
    image: '/products/ricoh-fi-8270.webp',
    stock: 0,
    basePen: 7956,
  },
  {
    id: '03499158-6d76-4021-8c8e-b76d964bd8c2',
    slug: 'escaner-nuevo-ricoh-fi-8270-copia-b76d964bd8c2',
    name: 'Escáner Nuevo Ricoh fi-8290',
    brand: 'RICOH',
    code: 'FI-8290',
    image: '/products/ricoh-fi-8290.webp',
    stock: 0,
    basePen: 11288,
  },
  {
    id: 'e0aa08ce-5a60-4182-8b3d-859e175ae144',
    slug: 'escaner-nuevo-ricoh-fi-8290-copia-859e175ae144',
    name: 'Escáner Nuevo Ricoh fi-7480',
    brand: 'RICOH',
    code: 'FI-7480',
    image: '/products/ricoh-fi-7480.webp',
    stock: 0,
  },
  {
    id: '1c185cef-a7ee-4c05-8222-b2877cdc049e',
    slug: 'escaner-nuevo-ricoh-fi-7480-copia-b2877cdc049e',
    name: 'Escáner Nuevo Ricoh fi-8820',
    brand: 'RICOH',
    code: 'FI-8820',
    image: '/products/ricoh-fi-8820.webp',
    stock: 0,
    basePen: 34493,
  },
  {
    id: '12a0ba0f-1e30-4e4d-93e9-db1d38063ed6',
    slug: 'escaner-nuevo-ricoh-fi-8820-copia-db1d38063ed6',
    name: 'Escáner Nuevo Ricoh fi-8930',
    brand: 'RICOH',
    code: 'FI-8930',
    image: '/products/ricoh-fi-8930.webp',
    stock: 0,
  },
  {
    id: '1d3b405d-14e1-4ec6-9b7b-10266bafff76',
    slug: 'escaner-nuevo-ricoh-fi-7600-copia-10266bafff76',
    name: 'Escáner Nuevo Ricoh fi-8920',
    brand: 'RICOH',
    code: 'FI-8920',
    image: '/products/ricoh-fi-8920.webp',
    stock: 0,
  },
  {
    id: '0c04aced-a45b-493c-9944-0e35caa1b281',
    slug: 'escaner-nuevo-ricoh-fi-7480-copia-0e35caa1b281',
    name: 'Escáner Nuevo Ricoh fi-7600',
    brand: 'RICOH',
    code: 'FI-7600',
    image: '/products/ricoh-fi-7600.webp',
    stock: 0,
    basePen: 18839,
  },
  {
    id: 'a60d94d2-7c9a-4a74-acfc-d3804d329bd9',
    slug: 'escaner-nuevo-ricoh-fi-7700-d3804d329bd9',
    name: 'Escáner Nuevo Ricoh fi-7700',
    brand: 'RICOH',
    code: 'FI-7700',
    image: '/products/ricoh-fi-7700.webp',
    stock: 0,
  },
  {
    id: '29de9fe7-fff9-4555-ab83-dbe5f74f40dc',
    slug: 'escaner-nuevo-ricoh-fi-7600-copia-dbe5f74f40dc',
    name: 'Escáner Nuevo Ricoh fi-8950',
    brand: 'RICOH',
    code: 'FI-8950',
    image: '/products/ricoh-fi-8950.webp',
    stock: 0,
  },
  {
    id: 'b1b0852f-7092-46dd-ba4c-4dade9d48325',
    slug: 'escaner-nuevo-ricoh-fi-8950-copia-4dade9d48325',
    name: 'Escáner Nuevo Canon imageFORMULA P-208II',
    brand: 'CANON',
    code: 'P-208II',
    image: '/products/canon-imageformula-p-208ii.webp',
    stock: 0,
  },
];

/** Escáner seminuevo Fujitsu fi-7160Z. */
const HAITECH_SHOWCASE_SCANNER_SEMINUEVO: ScannerShowcaseRow = {
  id: 'semi-fujitsu-fi-7160z',
  slug: 'escaner-seminuevo-fujitsu-fi-7160z',
  name: 'Escáner Seminuevo Fujitsu fi-7160Z',
  brand: 'FUJITSU',
  code: 'FI-7160Z',
  image: '/products/ricoh-fi-8040.webp',
  stock: 1,
};

/** Pool vitrina Escáneres (/tienda/escaneres). */
export const HAITECH_SHOWCASE_ESCANERES: readonly HaitechShopProduct[] = [
  ...HAITECH_SHOWCASE_SCANNERS_NUEVOS.map((row) => toShowcaseScanner(row, 'nuevo')),
  toShowcaseScanner(HAITECH_SHOWCASE_SCANNER_SEMINUEVO, 'seminuevo'),
];
