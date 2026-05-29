import type { InventoryProduct } from '@/types/product';
import { ensureFullPrices } from '@/lib/roles';

function p(publicPrice: number, mayorista: number, distribuidor: number) {
  return ensureFullPrices({ public: publicPrice, mayorista, distribuidor });
}

/** Inventario local de respaldo cuando el API admin no está disponible. */
export const inventoryFallback: InventoryProduct[] = [
  {
    id: 'ricoh-im-c3000',
    name: 'RICOH IM C3000',
    description: 'Multifuncional a color láser A3 para oficinas exigentes.',
    currency: 'USD',
    stock: 8,
    category: 'Multifuncionales',
    brand: 'Ricoh',
    image_url: null,
    created_at: '2025-01-10T00:00:00.000Z',
    prices: p(2499, 2199, 1949),
  },
  {
    id: 'ricoh-sp-330dn',
    name: 'RICOH SP 330DN',
    description: 'Impresora monocromática compacta con duplex automático.',
    currency: 'USD',
    stock: 15,
    category: 'Impresoras',
    brand: 'Ricoh',
    image_url: null,
    created_at: '2025-01-09T00:00:00.000Z',
    prices: p(389, 342, 303),
  },
  {
    id: 'konica-bizhub-c300i',
    name: 'Konica Minolta bizhub C300i',
    description: 'Multifuncional inteligente con conectividad cloud.',
    currency: 'USD',
    stock: 5,
    category: 'Multifuncionales',
    brand: 'Konica Minolta',
    image_url: null,
    created_at: '2025-01-08T00:00:00.000Z',
    prices: p(3199, 2815, 2495),
  },
  {
    id: 'canon-lbp226dw',
    name: 'Canon imageCLASS LBP226dw',
    description: 'Impresora láser Wi-Fi con impresión dúplex.',
    currency: 'USD',
    stock: 22,
    category: 'Impresoras',
    brand: 'Canon',
    image_url: null,
    created_at: '2025-01-06T00:00:00.000Z',
    prices: p(279, 246, 218),
  },
  {
    id: 'hp-toner-58a',
    name: 'HP 58A Tóner Original',
    description: 'Cartucho de tóner negro original HP 58A.',
    currency: 'USD',
    stock: 45,
    category: 'Tóner y Suministros',
    brand: 'HP',
    image_url: null,
    created_at: '2025-01-02T00:00:00.000Z',
    prices: p(89, 78, 69),
  },
];
