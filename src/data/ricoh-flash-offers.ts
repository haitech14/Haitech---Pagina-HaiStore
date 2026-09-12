/** Ofertas flash RICOH — datos de la franja promocional «Solo por horas». */

/** Ciclo del temporizador: se reinicia cada 12 h (00:00 y 12:00, hora de Lima). */
export const FLASH_OFFER_CYCLE_MS = 12 * 60 * 60 * 1000;
const FLASH_OFFER_EPOCH_MS = Date.parse('2026-01-01T00:00:00-05:00');

/** Próximo cierre de la ventana de 12 horas a partir de `now`. */
export function getNextFlashOfferEnd(now = Date.now()): string {
  const elapsed = Math.max(0, now - FLASH_OFFER_EPOCH_MS);
  const nextIndex = Math.floor(elapsed / FLASH_OFFER_CYCLE_MS) + 1;
  return new Date(FLASH_OFFER_EPOCH_MS + nextIndex * FLASH_OFFER_CYCLE_MS).toISOString();
}

export interface RicohFlashOfferProduct {
  id: string;
  brand: string;
  subtitle: string;
  model: string;
  pricePen: number;
  priceUsd: number;
  image: string;
  /** Slug canónico para productPath(). */
  slug: string;
  offer: boolean;
}

export const RICOH_FLASH_OFFER_PRODUCTS: readonly RicohFlashOfferProduct[] = [
  {
    id: '328f41ef-d935-4807-85d0-e1db5bdf73fb',
    brand: 'RICOH',
    subtitle: 'Impresora Multifuncional Nueva',
    model: 'RICOH IM 550F',
    pricePen: 5979,
    priceUsd: 1749,
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    slug: 'impresora-multifuncional-nueva-ricoh-im-550f-e1db5bdf73fb',
    offer: true,
  },
  {
    id: 'a9c74a93-3a15-42da-a9cf-33d59e2b1019',
    brand: 'RICOH',
    subtitle: 'Impresora Multifuncional Nueva',
    model: 'RICOH IM C4510',
    pricePen: 41379,
    priceUsd: 12099,
    image: '/products/a9c74a93-3a15-42da-a9cf-33d59e2b1019.webp',
    slug: 'impresora-multifuncional-nueva-ricoh-im-c4510-33d59e2b1019',
    offer: true,
  },
  {
    id: 'ricoh-im-c320f-a4',
    brand: 'RICOH',
    subtitle: 'Impresora Multifuncional Nueva',
    model: 'RICOH IM C320F',
    pricePen: 3419,
    priceUsd: 999,
    image: '/products/ricoh-im-c320f-2.webp',
    slug: 'impresora-multifuncional-nueva-ricoh-im-c320f-a4',
    offer: true,
  },
  {
    id: '7459b432-72a0-420a-8bff-015a0072f5ac',
    brand: 'RICOH',
    subtitle: 'Impresora Multifuncional Nueva',
    model: 'RICOH IM 6010',
    pricePen: 29919,
    priceUsd: 8749,
    image: '/products/ricoh-im-6010-spdf.webp',
    slug: 'impresora-multifuncional-nueva-ricoh-im-6010-7459b432-72a',
    offer: true,
  },
] as const;

export function formatFlashOfferPen(amount: number): string {
  return `S/ ${amount.toLocaleString('es-PE')}`;
}

export function formatFlashOfferUsd(amount: number): string {
  return `US$ ${amount.toLocaleString('en-US')}`;
}
