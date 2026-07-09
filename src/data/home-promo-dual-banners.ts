/** Fila de 2 banners promocionales (sprite horizontal). */
export const HOME_PROMO_DUAL_BANNERS_ROW_IMAGE = '/hero/promo-dual-banners-row.png';

export interface HomePromoDualBanner {
  id: string;
  href: string;
  imageAlt: string;
  /** Posición horizontal en el sprite (`0%`, `100%` para 2 columnas). */
  backgroundPositionX: string;
}

export const homePromoDualBanners: HomePromoDualBanner[] = [
  {
    id: 'epson-l4360',
    href: '/categoria/impresoras',
    imageAlt: 'Impresora Epson L4360 — A solo S/ 819 online. Comprar ya.',
    backgroundPositionX: '0%',
  },
  {
    id: 'samsung-f330',
    href: '/categoria/monitores',
    imageAlt: 'Monitor Samsung F330 — A solo S/ 259 online. Comprar ya.',
    backgroundPositionX: '100%',
  },
];
