import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';

export type HomePromoBannerMobileFocus = 'left' | 'center';

export type HomePromoBanner = {
  id: string;
  src: string;
  href: string;
  title: string;
  imageAlt: string;
  width: number;
  height: number;
  mobileFocus: HomePromoBannerMobileFocus;
  backgroundClass: string;
};

/** Banners promocionales del home: Distribuidor RICOH + Explora equipos. */
export const HOME_PROMO_BANNERS: readonly HomePromoBanner[] = [
  {
    id: 'ricoh-distributor',
    src: '/home/home-ricoh-distributor-banner.png?v=4',
    href: `${HOME_LANDING_LINKS.allProducts}?q=ricoh`,
    title: 'Somos Distribuidor Autorizado RICOH',
    imageAlt:
      'Somos Distribuidor Autorizado RICOH. Equipos originales, garantía oficial y soporte certificado. Multifuncionales, impresoras, plotters y consumibles.',
    width: 2084,
    height: 408,
    mobileFocus: 'center',
    backgroundClass: 'bg-[#E30613]',
  },
  {
    id: 'equipos',
    src: '/home/home-equipos-banner-cropped.png?v=2',
    href: HOME_LANDING_LINKS.allProducts,
    title: 'Explora nuestros equipos',
    imageAlt:
      'Explora nuestros equipos. Soluciones de impresión que se adaptan a las necesidades de tu negocio. Ir a la Tienda.',
    width: 2059,
    height: 528,
    mobileFocus: 'left',
    backgroundClass: 'bg-[#1A1A1A]',
  },
] as const;
